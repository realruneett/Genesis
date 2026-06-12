import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { chatRouter } from "./chat-router";
import { agentRouter } from "./agent-router";
import { modelRouter } from "./model-router";
import { memoryRouter } from "./memory-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  chat: chatRouter,
  agent: agentRouter,
  model: modelRouter,
  memory: memoryRouter,
});

export type AppRouter = typeof appRouter;
