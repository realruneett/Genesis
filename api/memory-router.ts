import { z } from "zod";
import { eq, desc, like, or } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { memoryEntries } from "@db/schema";

// Sample memory data for demo
const SAMPLE_MEMORY = [
  {
    content: "FastAPI JWT auth implementation using RS256 algorithm with 15-minute token expiry. Used python-jose library.",
    type: "success" as const,
    capability: "authentication",
    metadata: { duration: "13.2s", agents: [1, 2, 3], date: "2025-06-10" },
  },
  {
    content: "Error: ImportError - cannot import name 'HTTPBearer' from 'fastapi'. Resolution: Import from fastapi.security, not fastapi directly.",
    type: "error" as const,
    capability: "code_execution",
    metadata: { error_class: "ImportError", agent: 1, resolved: true },
  },
  {
    content: "Docker container networking setup with custom bridge. Services: web (port 8080), db (port 3306), redis (port 6379). Used docker-compose with health checks.",
    type: "success" as const,
    capability: "infrastructure",
    metadata: { duration: "8.5s", agents: [2, 3] },
  },
  {
    content: "React Three Fiber fluid simulation background effect. Uses ping-pong framebuffer approach for 2D fluid dynamics. Resolution: 512x512 for performance.",
    type: "success" as const,
    capability: "frontend",
    metadata: { duration: "22.1s", agents: [1, 2] },
  },
  {
    content: "WebSocket streaming for real-time chat tokens. Event bus pattern with pub/sub. Sub-millisecond delivery via asyncio queues.",
    type: "success" as const,
    capability: "realtime",
    metadata: { duration: "5.3s", agents: [2] },
  },
  {
    content: "Error: RateLimitError - Groq API rate limit exceeded (30 RPM). Resolution: Implemented exponential backoff with jitter. Fallback to Gemini on failure.",
    type: "error" as const,
    capability: "api_integration",
    metadata: { error_class: "RateLimitError", provider: "groq", resolved: true },
  },
  {
    content: "tRPC router setup with Zod validation. End-to-end type safety between frontend and backend. Drizzle ORM for type-safe database queries.",
    type: "success" as const,
    capability: "backend",
    metadata: { duration: "11.7s", agents: [1, 2, 3] },
  },
  {
    content: "ChromaDB vector search integration for semantic memory. Embedding model: all-MiniLM-L6-v2. Retrieves 5 most similar past experiences per query.",
    type: "success" as const,
    capability: "memory",
    metadata: { duration: "7.2s", agents: [1] },
  },
];

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  const db = getDb();
  const existing = await db.select().from(memoryEntries).limit(1);
  if (existing.length === 0) {
    await db.insert(memoryEntries).values(SAMPLE_MEMORY);
  }
  seeded = true;
}

export const memoryRouter = createRouter({
  search: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      await ensureSeeded();
      const db = getDb();

      // Simple text-based search for demo (in production, use vector similarity)
      const results = await db
        .select()
        .from(memoryEntries)
        .where(
          or(
            like(memoryEntries.content, `%${input.query}%`),
            like(memoryEntries.capability, `%${input.query}%`)
          )
        )
        .limit(input.limit);

      return results.map((r) => ({
        ...r,
        similarity: Math.random() * 0.5 + 0.5, // Mock similarity score
      }));
    }),

  store: publicQuery
    .input(
      z.object({
        content: z.string().min(1),
        type: z.enum(["task", "error", "success"]).default("task"),
        capability: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(memoryEntries).values({
        content: input.content,
        type: input.type,
        capability: input.capability,
        metadata: input.metadata,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  list: publicQuery
    .input(
      z.object({
        type: z.enum(["task", "error", "success"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      await ensureSeeded();
      const db = getDb();

      const conditions = [];
      if (input?.type) {
        conditions.push(eq(memoryEntries.type, input.type));
      }

      if (conditions.length > 0) {
        return await db
          .select()
          .from(memoryEntries)
          .where(conditions[0])
          .orderBy(desc(memoryEntries.createdAt))
          .limit(input?.limit ?? 20);
      }

      return await db
        .select()
        .from(memoryEntries)
        .orderBy(desc(memoryEntries.createdAt))
        .limit(input?.limit ?? 20);
    }),
});
