import type { ConnectionConfig } from "@/types/chat";

export type SocketEvent =
  | { type: "open" }
  | { type: "close"; code: number; reason: string; wasClean: boolean }
  | { type: "error"; error: string }
  | { type: "message"; data: string }
  | { type: "reconnecting"; attempt: number; delayMs: number };

export type SocketListener = (event: SocketEvent) => void;

export interface ChatSocketOptions {
  config: ConnectionConfig;
  /** Auto-reconnect with exponential backoff. */
  autoReconnect?: boolean;
  maxRetries?: number;
}

export class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<SocketListener>();
  private retries = 0;
  private reconnectTimer: number | null = null;
  private manualClose = false;

  constructor(private readonly opts: ChatSocketOptions) {}

  get url(): string {
    const { host = "localhost", port, room } = this.opts.config;
    const safeRoom = encodeURIComponent(room);
    return `ws://${host}:${port}/ws/${safeRoom}`;
  }

  on(listener: SocketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  connect(): void {
    this.manualClose = false;
    this.openSocket();
  }

  send(content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    const payload = `${this.opts.config.username}: ${content}`;
    this.ws.send(payload);
    return true;
  }

  close(): void {
    this.manualClose = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private openSocket(): void {
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch (err) {
      this.emit({ type: "error", error: (err as Error).message });
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.retries = 0;
      this.emit({ type: "open" });
    };
    ws.onmessage = (e) => this.emit({ type: "message", data: String(e.data) });
    ws.onerror = () => this.emit({ type: "error", error: "WebSocket error" });
    ws.onclose = (e) => {
      this.emit({
        type: "close",
        code: e.code,
        reason: e.reason,
        wasClean: e.wasClean,
      });
      if (!this.manualClose) this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.opts.autoReconnect === false) return;
    const max = this.opts.maxRetries ?? 8;
    if (this.retries >= max) return;
    this.retries += 1;
    const delayMs = Math.min(1000 * 2 ** (this.retries - 1), 10_000);
    this.emit({ type: "reconnecting", attempt: this.retries, delayMs });
    this.reconnectTimer = window.setTimeout(() => this.openSocket(), delayMs);
  }

  private emit(event: SocketEvent): void {
    for (const l of this.listeners) l(event);
  }
}

export function parseInboundMessage(raw: string): {
  serverId?: string;
  username?: string;
  content: string;
} {
  const match = raw.match(/^\s*\[([^\]]+)\]\s*([^:]+?)\s*:\s*([\s\S]*)$/);
  if (match) {
    return { serverId: match[1].trim(), username: match[2].trim(), content: match[3] };
  }
  const noServer = raw.match(/^\s*([^:]+?)\s*:\s*([\s\S]*)$/);
  if (noServer) return { username: noServer[1].trim(), content: noServer[2] };
  return { content: raw };
}