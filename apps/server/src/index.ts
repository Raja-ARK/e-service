/** biome-ignore-all lint/correctness/noUnusedVariables: Suppressing this rule for the server index file */
import { createContext } from "@e-service/api/context";
import { appRouter } from "@e-service/api/routers/index";
import { auth } from "@e-service/auth";
import { env } from "@e-service/env/server";
import { cors } from "@elysiajs/cors";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Elysia } from "elysia";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

// @ts-expect-error
const app = new Elysia()
  .use(
    cors({
      origin: [env.EXTERNAL_URL, env.INTERNAL_URL, env.ADMIN_URL],
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  // For better-auth to work, we don't need to include in our routing document.
  .post("/api/auth/sign-in/social", ({ request }) => auth.handler(request))
  .get("/api/auth/callback/:provider", ({ request }) => auth.handler(request))
  // For RPC call
  .all(
    "/rpc*",
    async (context) => {
      const { response } = await rpcHandler.handle(context.request, {
        prefix: "/rpc",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .all(
    "/docs*",
    async (context) => {
      const { response } = await apiHandler.handle(context.request, {
        prefix: "/docs",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
