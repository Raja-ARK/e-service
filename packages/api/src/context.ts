import { auth } from "@e-service/auth";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
  context: ElysiaContext;
};

export const createContext = async ({ context }: CreateContextOptions) => {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });
  return {
    session,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
