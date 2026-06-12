import { relations } from "drizzle-orm";
import { chatSessions, messages } from "./schema";

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [messages.sessionId],
    references: [chatSessions.id],
  }),
}));
