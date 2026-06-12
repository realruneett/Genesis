import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

// ── OAuth Users ──
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Local Auth Users ──
export const localUsers = sqliteTable("local_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  displayName: text("displayName"),
  passwordHash: text("passwordHash").notNull(),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// ── Chat Sessions ──
export const chatSessions = sqliteTable("chat_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  userType: text("userType", { enum: ["oauth", "local"] }).default("oauth").notNull(),
  title: text("title"),
  model: text("model").default("gpt-4o"),
  provider: text("provider").default("openai"),
  status: text("status", { enum: ["active", "archived"] }).default("active").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// ── Messages ──
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("sessionId").notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  model: text("model"),
  tokensUsed: integer("tokensUsed").default(0),
  latency: integer("latency").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ── Agents ──
export const agents = sqliteTable("agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  model: text("model"),
  provider: text("provider"),
  role: text("role"),
  status: text("status", { enum: ["idle", "busy", "error"] }).default("idle").notNull(),
  vramUsage: real("vramUsage").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// ── Memory Entries ──
export const memoryEntries = sqliteTable("memory_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  type: text("type", { enum: ["task", "error", "success"] }).default("task").notNull(),
  capability: text("capability"),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type MemoryEntry = typeof memoryEntries.$inferSelect;
export type InsertMemoryEntry = typeof memoryEntries.$inferInsert;

// ── API Keys ──
export const apiKeys = sqliteTable("api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  userType: text("userType", { enum: ["oauth", "local"] }).default("oauth").notNull(),
  provider: text("provider").notNull(),
  keyHash: text("keyHash").notNull(),
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
