import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConnectionScreen } from "@/components/connection/ConnectionScreen";
import { ChatScreen } from "@/components/chat/ChatScreen";
import type { ConnectionConfig } from "@/types/chat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChatCerberus — Distributed Realtime Chat" },
      {
        name: "description",
        content:
          "Realtime console for ChatCerberus: connect to any FastAPI WebSocket node and watch distributed rooms light up.",
      },
      { property: "og:title", content: "ChatCerberus — Distributed Realtime Chat" },
      {
        property: "og:description",
        content: "Connect across servers, join rooms and watch distributed messages flow in realtime.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [config, setConfig] = useState<ConnectionConfig | null>(null);

  if (!config) {
    return <ConnectionScreen onConnect={setConfig} />;
  }

  return <ChatScreen config={config} onDisconnect={() => setConfig(null)} />;
}
