import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  float,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// ── OAuth Users ──
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Local Auth Users ──
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// ── Chat Sessions ──
export const chatSessions = mysqlTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  userType: mysqlEnum("userType", ["oauth", "local"]).default("oauth").notNull(),
  title: varchar("title", { length: 255 }),
  model: varchar("model", { length: 100 }).default("gpt-4o"),
  provider: varchar("provider", { length: 50 }).default("openai"),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// ── Messages ──
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: bigint("sessionId", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  model: varchar("model", { length: 100 }),
  tokensUsed: int("tokensUsed").default(0),
  latency: int("latency").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ── Agents ──
export const agents = mysqlTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  model: varchar("model", { length: 100 }),
  provider: varchar("provider", { length: 50 }),
  role: varchar("role", { length: 50 }),
  status: mysqlEnum("status", ["idle", "busy", "error"]).default("idle").notNull(),
  vramUsage: float("vramUsage").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// ── Memory Entries ──
export const memoryEntries = mysqlTable("memory_entries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["task", "error", "success"]).default("task").notNull(),
  capability: varchar("capability", { length: 100 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MemoryEntry = typeof memoryEntries.$inferSelect;
export type InsertMemoryEntry = typeof memoryEntries.$inferInsert;

// ── API Keys ──
export const apiKeys = mysqlTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  userType: mysqlEnum("userType", ["oauth", "local"]).default("oauth").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  keyHash: varchar("keyHash", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
