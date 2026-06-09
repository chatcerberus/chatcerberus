import type { ConnectionStatus } from "@/types/chat";
import { cn } from "@/lib/utils";

const MAP: Record<ConnectionStatus, { label: string; dot: string; text: string; bg: string }> = {
  idle: { label: "Idle", dot: "bg-zinc-400", text: "text-zinc-300", bg: "bg-zinc-400/10" },
  connecting: { label: "Connecting", dot: "bg-amber-400", text: "text-amber-200", bg: "bg-amber-400/10" },
  open: { label: "Live", dot: "bg-emerald-400", text: "text-emerald-200", bg: "bg-emerald-400/10" },
  reconnecting: { label: "Reconnecting", dot: "bg-amber-400", text: "text-amber-200", bg: "bg-amber-400/10" },
  closed: { label: "Offline", dot: "bg-zinc-400", text: "text-zinc-300", bg: "bg-zinc-400/10" },
  error: { label: "Error", dot: "bg-rose-400", text: "text-rose-200", bg: "bg-rose-400/10" },
};

export function StatusPill({ status }: { status: ConnectionStatus }) {
  const m = MAP[status];
  const pulse = status === "open" || status === "connecting" || status === "reconnecting";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium",
        m.bg,
        m.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot, pulse && "animate-pulse-dot")} />
      {m.label}
    </span>
  );
}