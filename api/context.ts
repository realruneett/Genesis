import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { getLocalUserFromHeaders } from "./local-auth-router";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  localUser?: {
    id: number;
    username: string;
    displayName: string | null;
    role: "user" | "admin";
  } | null;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth authentication
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // OAuth auth is optional
  }

  // Try local authentication
  try {
    ctx.localUser = await getLocalUserFromHeaders(opts.req.headers);
  } catch {
    // Local auth is optional
  }

  return ctx;
}
