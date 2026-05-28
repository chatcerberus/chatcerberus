import { Hash, LogOut, Server, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConnectionConfig, ConnectionStatus } from "@/types/chat";
import { StatusPill } from "./StatusPill";
import { serverColor } from "@/lib/serverColor";
import { cn } from "@/lib/utils";

interface Props {
  config: ConnectionConfig;
  status: ConnectionStatus;
  servers: string[];
  onDisconnect: () => void;
}

export function ChatHeader({ config, status, servers, onDisconnect }: Props) {
  return (
    <header className="glass sticky top-0 z-10 border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-md shadow-fuchsia-500/20">
            <span className="font-mono text-sm font-bold text-white">C</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">ChatCerberus</p>
            <p className="text-[11px] text-muted-foreground">Chat em realtime</p>
          </div>
        </div>

        <div className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />

        <div className="flex flex-1 flex-wrap items-center gap-2 text-xs">
          <Chip icon={<Hash className="h-3 w-3" />} label={config.room} />
          <Chip icon={<User className="h-3 w-3" />} label={config.username} />
          <Chip icon={<Server className="h-3 w-3" />} label={`localhost:${config.port}`} mono />
        </div>

        <div className="flex items-center gap-2">
          {servers.length > 0 && (
            <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 md:flex">
              <span className="text-[11px] text-muted-foreground">Nodes</span>
              <div className="flex -space-x-1.5">
                {servers.slice(0, 6).map((s) => {
                  const c = serverColor(s);
                  return (
                    <span
                      key={s}
                      title={s}
                      className={cn(
                        "inline-block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                        c.dot,
                      )}
                    />
                  );
                })}
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">×{servers.length}</span>
            </div>
          )}
          <StatusPill status={status} />
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

function Chip({ icon, label, mono }: { icon: React.ReactNode; label: string; mono?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-muted-foreground">
      <span className="text-foreground/70">{icon}</span>
      <span className={cn("text-foreground", mono && "font-mono text-[11px]")}>{label}</span>
    </span>
  );
}