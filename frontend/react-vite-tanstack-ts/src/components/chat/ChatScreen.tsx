import { useChat } from "@/hooks/useChat";
import type { ConnectionConfig } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface Props {
  config: ConnectionConfig;
  onDisconnect: () => void;
}

export function ChatScreen({ config, onDisconnect }: Props) {
  const { status, messages, servers, send, disconnect } = useChat(config);

  const handleDisconnect = () => {
    disconnect();
    onDisconnect();
  };

  const disabled = status !== "open";
  const placeholder =
    status === "connecting"
      ? "Connecting to socket…"
      : status === "reconnecting"
        ? "Reconnecting…"
        : status === "open"
          ? `Message #${config.room}`
          : "Disconnected";

  return (
    <div className="bg-app-radial flex min-h-screen flex-col">
      <ChatHeader
        config={config}
        status={status}
        servers={servers}
        onDisconnect={handleDisconnect}
      />
      <main className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </main>
      <MessageInput onSend={send} disabled={disabled} placeholder={placeholder} />
    </div>
  );
}