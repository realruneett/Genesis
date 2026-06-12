import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatSessions, messages } from "@db/schema";

// In-memory stream registry for demo
const streamRegistry = new Map<string, string[]>();

export const chatRouter = createRouter({
  listSessions: publicQuery
    .input(
      z.object({
        userId: z.number().optional(),
        userType: z.enum(["oauth", "local"]).optional(),
        status: z.enum(["active", "archived"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.userId) {
        conditions.push(eq(chatSessions.userId, input.userId));
      }
      if (input?.status) {
        conditions.push(eq(chatSessions.status, input.status));
      }

      const query = db
        .select()
        .from(chatSessions)
        .orderBy(desc(chatSessions.updatedAt));

      if (conditions.length > 0) {
        return await query.where(conditions[0]);
      }
      return await query;
    }),

  createSession: publicQuery
    .input(
      z.object({
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
        title: z.string().optional(),
        model: z.string().optional(),
        provider: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(chatSessions).values({
        userId: input.userId,
        userType: input.userType,
        title: input.title || "New Session",
        model: input.model || "gpt-4o",
        provider: input.provider || "openai",
      });
      const sessionId = Number(result[0].insertId);
      return { id: sessionId, ...input };
    }),

  getSession: publicQuery
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const sessionRows = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, input.sessionId))
        .limit(1);

      if (sessionRows.length === 0) return null;

      const messageRows = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, input.sessionId))
        .orderBy(messages.createdAt);

      return {
        ...sessionRows[0],
        messages: messageRows,
      };
    }),

  sendMessage: publicQuery
    .input(
      z.object({
        sessionId: z.number(),
        content: z.string().min(1),
        role: z.enum(["user", "assistant", "system"]).default("user"),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(messages).values({
        sessionId: input.sessionId,
        role: input.role,
        content: input.content,
        model: input.model,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  streamMessage: publicQuery
    .input(
      z.object({
        sessionId: z.number(),
        content: z.string().min(1),
        model: z.string().default("gpt-4o"),
        provider: z.string().default("openai"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Save user message
      await db.insert(messages).values({
        sessionId: input.sessionId,
        role: "user",
        content: input.content,
        model: input.model,
      });

      // Generate a unique stream ID
      const streamId = `stream_${input.sessionId}_${Date.now()}`;

      // For demo: simulate streaming with pre-defined responses
      const demoResponses: Record<string, string> = {
        "gpt-4o": "I'm a versatile AI model capable of handling a wide range of tasks. I can help with writing, analysis, coding, math, creative projects, and much more. What would you like to explore together?",
        "gpt-4o-mini": "I'm a fast, efficient AI model optimized for quick responses. I can handle most everyday tasks like summarization, simple coding, Q&A, and creative writing with minimal latency.",
        "claude-sonnet-4": "I'm Claude, an AI assistant made by Anthropic. I'm designed to be helpful, harmless, and honest. I excel at analysis, writing, coding, and thoughtful conversation. How can I assist you today?",
        "claude-haiku": "I'm Claude Haiku, a fast and lightweight AI model. I'm optimized for quick responses while maintaining high quality. Great for rapid prototyping, summaries, and casual conversation.",
        "gemini-2.5-pro": "I'm Gemini 2.5 Pro, Google's most capable AI model. I have advanced reasoning, coding abilities, and can process very long contexts. I can also analyze images and multimedia content.",
        "gemini-2.5-flash": "I'm Gemini 2.5 Flash, optimized for speed and efficiency. I deliver fast responses while maintaining strong performance across coding, analysis, and creative tasks.",
        "grok-3": "I'm Grok 3, xAI's latest model. I have real-time knowledge access and a witty, rebellious personality. I can handle complex reasoning, coding, and creative tasks with a unique perspective.",
        "command-r": "I'm Command R from Cohere. I'm built for enterprise use cases with strong retrieval-augmented generation capabilities. I excel at long-context tasks and grounded responses.",
        "codestral": "I'm Codestral from Mistral AI, specialized for code generation and software development. I support 80+ programming languages and excel at fill-in-the-middle tasks.",
        "deepseek-chat": "I'm DeepSeek-V3, a powerful open-source model. I excel at coding, math, and reasoning tasks. I'm designed to be highly capable while remaining efficient.",
        "qwen-turbo": "I'm Qwen Turbo from Alibaba Cloud. I'm optimized for speed with strong multilingual capabilities. I support Chinese, English, and many other languages natively.",
      };

      const responseText = demoResponses[input.model] || demoResponses["gpt-4o"];
      streamRegistry.set(streamId, responseText.split(" "));

      return { streamId, sessionId: input.sessionId };
    }),

  getStreamTokens: publicQuery
    .input(z.object({ streamId: z.string() }))
    .query(async ({ input }) => {
      const tokens = streamRegistry.get(input.streamId);
      if (!tokens) return { done: true, tokens: [] };

      // Return remaining tokens and clear
      streamRegistry.delete(input.streamId);
      return { done: false, tokens };
    }),

  updateSession: publicQuery
    .input(
      z.object({
        sessionId: z.number(),
        title: z.string().optional(),
        status: z.enum(["active", "archived"]).optional(),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { sessionId, ...updates } = input;
      await db
        .update(chatSessions)
        .set(updates)
        .where(eq(chatSessions.id, sessionId));
      return { success: true };
    }),

  deleteSession: publicQuery
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(messages).where(eq(messages.sessionId, input.sessionId));
      await db.delete(chatSessions).where(eq(chatSessions.id, input.sessionId));
      return { success: true };
    }),

  getRecentMessages: publicQuery
    .input(
      z.object({
        sessionId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      return await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, input.sessionId))
        .orderBy(desc(messages.createdAt))
        .limit(input.limit);
    }),
});
