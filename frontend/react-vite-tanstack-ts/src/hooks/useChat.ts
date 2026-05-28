import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatSocket, parseInboundMessage } from "@/services/socket";
import type { ChatMessage, ConnectionConfig, ConnectionStatus } from "@/types/chat";

let messageCounter = 0;
const nextId = () => `${Date.now().toString(36)}-${(messageCounter++).toString(36)}`;

export interface UseChatResult {
  status: ConnectionStatus;
  messages: ChatMessage[];
  servers: string[];
  send: (text: string) => void;
  disconnect: () => void;
  reconnectAttempt: number | null;
}

export function useChat(config: ConnectionConfig | null): UseChatResult {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reconnectAttempt, setReconnectAttempt] = useState<number | null>(null);
  const socketRef = useRef<ChatSocket | null>(null);

  const pushMessage = useCallback((m: Omit<ChatMessage, "id" | "timestamp"> & Partial<Pick<ChatMessage, "id" | "timestamp">>) => {
    setMessages((prev) => [
      ...prev,
      { id: m.id ?? nextId(), timestamp: m.timestamp ?? Date.now(), ...m } as ChatMessage,
    ]);
  }, []);

  useEffect(() => {
    if (!config) return;
    setMessages([]);
    setStatus("connecting");
    const socket = new ChatSocket({ config, autoReconnect: true });
    socketRef.current = socket;

    const off = socket.on((event) => {
      switch (event.type) {
        case "open":
          setStatus("open");
          setReconnectAttempt(null);
          pushMessage({
            kind: "system",
            content: `Connected to ${socket.url}`,
          });
          break;
        case "message": {
          const parsed = parseInboundMessage(event.data);
          const isSelf = parsed.username === config.username;
          pushMessage({
            kind: isSelf ? "self" : "chat",
            serverId: parsed.serverId,
            username: parsed.username,
            content: parsed.content,
            raw: event.data,
          });
          break;
        }
        case "error":
          setStatus("error");
          toast.error("Connection error", { description: event.error });
          break;
        case "close":
          setStatus((prev) => (prev === "reconnecting" ? "reconnecting" : "closed"));
          pushMessage({
            kind: "system",
            content: `Disconnected (code ${event.code}${event.reason ? `, ${event.reason}` : ""}).`,
          });
          break;
        case "reconnecting":
          setStatus("reconnecting");
          setReconnectAttempt(event.attempt);
          pushMessage({
            kind: "system",
            content: `Reconnecting… attempt ${event.attempt} in ${Math.round(event.delayMs / 1000)}s`,
          });
          break;
      }
    });

    socket.connect();

    return () => {
      off();
      socket.close();
      socketRef.current = null;
      setStatus("idle");
      setReconnectAttempt(null);
    };
  }, [config, pushMessage]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const ok = socketRef.current?.send(trimmed);
      if (!ok) {
        toast.error("Not connected", { description: "Wait for the socket to reopen." });
      }
    },
    [],
  );

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    setStatus("idle");
  }, []);

  const servers = useMemo(() => {
    const set = new Set<string>();
    for (const m of messages) if (m.serverId) set.add(m.serverId);
    return [...set];
  }, [messages]);

  return { status, messages, servers, send, disconnect, reconnectAttempt };
}