import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !disabled;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="glass sticky bottom-0 border-t border-white/10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-4xl items-end gap-2 px-4 py-3 sm:px-6"
      >
        <div
          className={cn(
            "relative flex w-full items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20",
            disabled && "opacity-60",
          )}
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder ?? "Type a message…"}
            rows={1}
            className="max-h-40 min-h-[28px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!canSend}
            className={cn(
              "h-8 gap-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20 transition",
              !canSend && "from-zinc-700 to-zinc-700 shadow-none",
            )}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </form>
      <p className="pb-2 text-center font-mono text-[10px] text-muted-foreground/60">
        Enter para enviar · Shift+Enter para nova linha
      </p>
    </div>
  );
}