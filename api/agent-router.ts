import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { agents } from "@db/schema";

// Agent configurations matching SUTRADHAR architecture
const DEFAULT_AGENTS = [
  {
    name: "cloud-orchestrator",
    model: "llama-3.3-70b-versatile",
    provider: "groq",
    role: "orchestrator",
    status: "idle" as const,
    vramUsage: 0,
  },
  {
    name: "cloud-vision",
    model: "llama-3.2-90b-vision",
    provider: "groq",
    role: "vision",
    status: "idle" as const,
    vramUsage: 0,
  },
  {
    name: "agent-1",
    model: "qwen2.5vl:7b",
    provider: "ollama",
    role: "heavy",
    status: "idle" as const,
    vramUsage: 5.5,
  },
  {
    name: "agent-2",
    model: "qwen2.5-coder:3b",
    provider: "ollama",
    role: "fast",
    status: "idle" as const,
    vramUsage: 2.0,
  },
  {
    name: "agent-3",
    model: "qwen2.5-coder:3b",
    provider: "ollama",
    role: "fast",
    status: "idle" as const,
    vramUsage: 2.0,
  },
  {
    name: "gemini-fallback",
    model: "gemini-2.0-flash",
    provider: "google",
    role: "fallback",
    status: "idle" as const,
    vramUsage: 0,
  },
];

export const agentRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const existing = await db.select().from(agents);

    if (existing.length === 0) {
      // Seed default agents
      await db.insert(agents).values(DEFAULT_AGENTS);
      return await db.select().from(agents);
    }

    return existing;
  }),

  getTelemetry: publicQuery.query(async () => {
    const db = getDb();
    const allAgents = await db.select().from(agents);

    const totalVram = allAgents.reduce((sum, a) => sum + (a.vramUsage || 0), 0);
    const activeAgents = allAgents.filter((a) => a.status === "busy").length;
    const idleAgents = allAgents.filter((a) => a.status === "idle").length;
    const errorAgents = allAgents.filter((a) => a.status === "error").length;

    return {
      totalVram,
      vramLimit: 12.0,
      activeAgents,
      idleAgents,
      errorAgents,
      totalAgents: allAgents.length,
      agents: allAgents,
    };
  }),

  updateStatus: publicQuery
    .input(
      z.object({
        agentId: z.number(),
        status: z.enum(["idle", "busy", "error"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(agents)
        .set({ status: input.status })
        .where(eq(agents.id, input.agentId));
      return { success: true };
    }),
});
