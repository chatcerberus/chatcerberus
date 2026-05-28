import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.02]">
            <span className="font-mono text-sm text-muted-foreground">/ws</span>
          </div>
          <p className="text-sm font-medium">Waiting for messages…</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Send the first message to broadcast across every connected node.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={endRef} />
    </div>
  );
}