import { auth } from "@e-service/auth";
import type { Session, User } from "@e-service/db/zod-schemas/auth";
import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });

  if (!session?.user || !session?.session) throw new ORPCError("UNAUTHORIZED");

  return next({
    context: {
      session: {
        user: session.user as unknown as User,
        session: session.session as unknown as Session,
      },
      headers: context.headers,
      origin: context.origin,
    },
  });
});

const requireAdmin = o.middleware(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });

  if (!session?.user || !session?.session) throw new ORPCError("UNAUTHORIZED");

  if ((session.user as unknown as User).role !== "admin")
    throw new ORPCError("FORBIDDEN", {
      message: "You are not authorized to access this resource",
    });

  return next({
    context: {
      session: {
        user: session.user as unknown as User,
        session: session.session as unknown as Session,
      },
      headers: context.headers,
      origin: context.origin,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export const adminProcedure = protectedProcedure.use(requireAdmin);
