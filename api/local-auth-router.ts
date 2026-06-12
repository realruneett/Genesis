import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { env } from "./lib/env";

const JWT_SECRET = env.appSecret || "sutradhar-local-secret";

export async function verifyLocalToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { clockTolerance: 60 }) as {
      userId: number;
      username: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export async function getLocalUserFromHeaders(headers: Headers) {
  const token = headers.get("x-local-auth-token");
  if (!token) return null;

  const decoded = await verifyLocalToken(token);
  if (!decoded) return null;

  const db = getDb();
  const rows = await db
    .select()
    .from(localUsers)
    .where(eq(localUsers.id, decoded.userId))
    .limit(1);

  return rows.at(0) ?? null;
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6).max(100),
        displayName: z.string().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const result = await db.insert(localUsers).values({
        username: input.username,
        displayName: input.displayName || input.username,
        passwordHash,
      });

      const userId = Number(result[0].insertId);
      const token = jwt.sign({ userId, username: input.username }, JWT_SECRET, {
        expiresIn: "30d",
      });

      return { token, userId };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const rows = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      const user = rows.at(0);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid username or password",
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      return { token, userId: user.id };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req.headers.get("x-local-auth-token");
    if (!token) return null;

    const decoded = await verifyLocalToken(token);
    if (!decoded) return null;

    const db = getDb();
    const rows = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.id, decoded.userId))
      .limit(1);

    const user = rows.at(0);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      name: user.displayName || user.username,
      role: user.role,
      createdAt: user.createdAt,
    };
  }),
});
