import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { serverColor } from "@/lib/serverColor";
import type { ChatMessage } from "@/types/chat";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const color = useMemo(() => serverColor(message.serverId), [message.serverId]);

  if (message.kind === "system" || message.kind === "error") {
    const isError = message.kind === "error";
    return (
      <div className="animate-msg-in flex justify-center py-1">
        <div
          className={cn(
            "rounded-full border px-3 py-1 text-[11px]",
            isError
              ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
              : "border-white/10 bg-white/[0.03] text-muted-foreground",
          )}
        >
          {message.content}
        </div>
      </div>
    );
  }

  const isSelf = message.kind === "self";

  return (
    <div className={cn("animate-msg-in flex w-full gap-3", isSelf && "flex-row-reverse")}>
      <div
        className={cn(
          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ring-1",
          isSelf
            ? "from-indigo-500 to-fuchsia-500 ring-fuchsia-400/30"
            : "from-zinc-700 to-zinc-800 ring-white/10",
        )}
      >
        {initials(message.username)}
      </div>

      <div className={cn("flex max-w-[78%] flex-col", isSelf && "items-end")}>
        <div
          className={cn(
            "mb-1 flex items-center gap-2 text-[11px]",
            isSelf && "flex-row-reverse",
          )}
        >
          <span className="font-medium text-foreground/90">{message.username ?? "anon"}</span>
          {message.serverId && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                color.text,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", color.dot)} />
              {message.serverId}
            </span>
          )}
          <span className="text-muted-foreground/70">{formatTime(message.timestamp)}</span>
        </div>

        <div
          className={cn(
            "relative whitespace-pre-wrap break-words rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed",
            isSelf
              ? "rounded-tr-md bg-gradient-to-br from-indigo-500/90 to-fuchsia-500/90 text-white border-white/10 shadow-lg shadow-fuchsia-500/10"
              : cn(
                  "rounded-tl-md bg-card/70 text-foreground border-white/10 ring-1 ring-inset",
                  color.ring,
                ),
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}