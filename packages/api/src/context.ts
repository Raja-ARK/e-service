import type { Session, User } from "@e-service/db/zod-schemas/auth";
import type { Context as ElysiaContext } from "elysia";
import { ORIGINS } from "./utils/constant";

export type CreateContextOptions = {
  context: ElysiaContext;
};

export const createContext = async ({ context }: CreateContextOptions) => {
  const origin =
    ORIGINS[context.request.headers.get("Host") as keyof typeof ORIGINS] ??
    undefined;

  return {
    session: null as {
      user: User;
      session: Session;
    } | null,
    headers: context.request.headers,
    origin,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
