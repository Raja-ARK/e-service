import { auth } from "@e-service/auth";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
  context: ElysiaContext;
};

export const createContext = async ({ context }: CreateContextOptions) => {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  const setHeaders = (headers: Headers) => {
    const cookies: string[] = [];
    headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        cookies.push(value);
      } else {
        context.set.headers[key] = value;
      }
    });
    if (cookies.length) {
      (context.set.headers as Record<string, string | string[]>)["set-cookie"] =
        cookies;
    }
  };

  return {
    session,
    headers: context.request.headers,
    setHeaders,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
