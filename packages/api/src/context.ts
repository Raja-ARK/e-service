import type { Session, User } from "@e-service/db/zod-schemas/auth";
import { env } from "@e-service/env/server";
import type { Context as ElysiaContext } from "elysia";
import type { Origin } from "./utils/constant";

export type CreateContextOptions = {
  context: ElysiaContext;
};

export const createContext = async ({ context }: CreateContextOptions) => {
  const origin =
    context.request.headers.get("origin") ||
    context.request.headers.get("Origin");

  const getOrigin = (origin: string): Origin | undefined => {
    switch (true) {
      case origin.startsWith(env.EXTERNAL_URL):
        return "external";
      case origin.startsWith(env.INTERNAL_URL):
        return "internal";
      case origin.startsWith(env.ADMIN_URL):
        return "admin";
      default:
        return undefined;
    }
  };

  return {
    session: null as {
      user: User;
      session: Session;
    } | null,
    headers: context.request.headers,
    origin: origin ? getOrigin(origin) : undefined,
    responseCookies: [] as string[],
  };
};

export type Context = Awaited<ReturnType<typeof createContext>> & {
  session: {
    user: User;
    session: Session;
  } | null;
};
