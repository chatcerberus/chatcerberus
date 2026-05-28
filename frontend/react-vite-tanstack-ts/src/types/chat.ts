export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed"
  | "error";

export interface ConnectionConfig {
  username: string;
  room: string;
  port: number;
  host?: string;
}

export type MessageKind = "chat" | "system" | "error" | "self";

export interface ChatMessage {
  id: string;
  kind: MessageKind;
  serverId?: string;
  username?: string;
  content: string;
  timestamp: number;
  raw?: string;
}