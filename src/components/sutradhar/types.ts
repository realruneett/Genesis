export type ChatMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string | null;
  createdAt: Date;
};

export type ConsoleMode = "ORCHESTRATE" | "CHAT" | "CODEX";

export type Agent = {
  id: number;
  name: string;
  model: string | null;
  provider: string | null;
  role: string | null;
  status: "idle" | "busy" | "error";
  vramUsage: number | null;
};

export type UnifiedUser = {
  id: number;
  name: string | null;
  role: "user" | "admin";
  authType: "oauth" | "local";
  avatar?: string | null;
};
