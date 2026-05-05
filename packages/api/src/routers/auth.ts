import { auth } from "@e-service/auth";
import { env } from "@e-service/env/server";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { publicProcedure } from "../index";

const throwAuthError = async (res: Response): Promise<never> => {
  const body = (await res.json().catch(() => ({}))) as { message?: string };
  throw new ORPCError("BAD_REQUEST", {
    message: body.message ?? "Authentication failed",
  });
};

export const authRouter = {
  signInWithGoogle: publicProcedure
    .input(z.object({ callbackURL: z.string() }))
    .handler(async ({ input, context }) => {
      const req = new Request(
        `${env.BETTER_AUTH_URL}/api/auth/sign-in/social`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: context.headers.get("origin") ?? "",
          },
          body: JSON.stringify({
            provider: "google",
            callbackURL: input.callbackURL,
            disableRedirect: true,
          }),
        },
      );
      const res = await auth.handler(req);
      if (!res.ok) await throwAuthError(res);
      context.setHeaders(res.headers);
      const data = (await res.json()) as { url: string };
      return { url: data.url };
    }),

  signOut: publicProcedure.handler(async ({ context }) => {
    const res = await auth.api.signOut({
      headers: context.headers,
      asResponse: true,
    });
    context.setHeaders(res.headers);
    return { success: res.ok };
  }),

  session: publicProcedure.handler(({ context }) => context.session),
};
