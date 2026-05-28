import { useState } from "react";
import { Activity, Cpu, Server, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConnectionConfig } from "@/types/chat";

interface Props {
  onConnect: (config: ConnectionConfig) => void;
  isConnecting?: boolean;
  initial?: Partial<ConnectionConfig>;
}

export function ConnectionScreen({ onConnect, isConnecting, initial }: Props) {
  const [username, setUsername] = useState(initial?.username ?? "");
  const [room, setRoom] = useState(initial?.room ?? "general");
  const [port, setPort] = useState<string>(initial?.port?.toString() ?? "8000");
  const [touched, setTouched] = useState(false);

  const portNum = Number(port);
  const portValid = Number.isFinite(portNum) && portNum > 0 && portNum < 65536;
  const valid = username.trim().length > 0 && room.trim().length > 0 && portValid;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onConnect({ username: username.trim(), room: room.trim(), port: portNum });
  }

  return (
    <div className="bg-app-radial relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Brand panel */}
        <div className="hidden flex-col gap-6 lg:flex">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Infraestrutura de chat distribuída
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">
            Chat
            <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Cerberus
            </span>
          </h1>
          <p className="max-w-md text-base text-muted-foreground">
            Uma plataforma de comunicação distribuída em tempo real 
            projetada para demonstrar sincronização entre múltiplos 
            servidores, propagação instantânea de mensagens e escalabilidade de infraestrutura.
             Conecte diferentes instâncias, 
             entre em salas compartilhadas e acompanhe o fluxo realtime acontecendo através de uma arquitetura distribuída moderna.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Feature icon={<Server className="h-4 w-4" />} title="Multi-server" desc="ws://host:port/ws/{room}" />
            <Feature icon={<Activity className="h-4 w-4" />} title="Live stream" desc="Pub/Sub fan-out" />
            <Feature icon={<Cpu className="h-4 w-4" />} title="Stateful rooms" desc="Histórico" />
          </div>
        </div>

        {/* Form card */}
        <div className="relative">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/40 via-fuchsia-500/20 to-cyan-400/30 opacity-60 blur-xl" />
          <form
            onSubmit={submit}
            className="glass relative overflow-hidden rounded-2xl border border-white/10 p-7 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">New connection</p>
                  <p className="text-xs text-muted-foreground">Join a distributed room</p>
                </div>
              </div>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                ws
              </span>
            </div>

            <div className="space-y-4">
              <Field
                id="username"
                label="Nome de usuário"
                hint="Como devem te chamar"
                error={touched && !username.trim() ? "Required" : undefined}
              >
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome"
                  autoFocus
                  className="h-11 border-white/10 bg-white/[0.03]"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="room"
                  label="Sala"
                  hint="Canal"
                  error={touched && !room.trim() ? "Required" : undefined}
                >
                  <Input
                    id="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Sala"
                    className="h-11 border-white/10 bg-white/[0.03]"
                  />
                </Field>

                <Field
                  id="port"
                  label="Porta do servidor"
                  hint="Backend"
                  error={touched && !portValid ? "1–65535" : undefined}
                >
                  <Input
                    id="port"
                    inputMode="numeric"
                    value={port}
                    onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="8000"
                    className="h-11 border-white/10 bg-white/[0.03] font-mono"
                  />
                </Field>
              </div>

              <div className="rounded-lg border border-white/5 bg-black/20 p-3 font-mono text-xs text-muted-foreground">
                <span className="text-cyan-300">ws://</span>localhost
                <span className="text-cyan-300">:</span>
                {portValid ? port : "—"}
                <span className="text-cyan-300">/ws/</span>
                {room || "—"}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isConnecting}
              className="mt-6 h-11 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 transition hover:from-indigo-400 hover:via-violet-400 hover:to-fuchsia-400"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                "Connect"
              )}
            </Button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Pressione <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> para se conectar.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-foreground">
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        {error ? (
          <span className="text-[11px] text-destructive">{error}</span>
        ) : hint ? (
          <span className="text-[11px] text-muted-foreground/70">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}