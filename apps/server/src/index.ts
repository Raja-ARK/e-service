/** biome-ignore-all lint/correctness/noUnusedVariables: Suppressing this rule for the server index file */
import { createContext } from "@e-service/api/context";
import { appRouter } from "@e-service/api/routers/index";
import { env } from "@e-service/env/server";
import { cors } from "@elysiajs/cors";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { isAPIError } from "better-auth/api";
import { Elysia } from "elysia";

const rpcHandler = new RPCHandler(appRouter, {
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
      if (isAPIError(error)) {
        throw new ORPCError("BAD_REQUEST", { message: error.message });
      }
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      docsTitle: "E-Services Digital Platform",
      docsPath: "/doc",
      specPath: "/openapi.json",
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "E-Services Digital Platform",
          description: "E-Services Digital Platform API",
          version: "1.0.0",
        },
      },
    }),
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
      if (isAPIError(error)) {
        throw new ORPCError("BAD_REQUEST", { message: error.message });
      }
    }),
  ],
});

// @ts-expect-error
const app = new Elysia()
  .use(
    cors({
      origin: [env.EXTERNAL_URL, env.INTERNAL_URL, env.ADMIN_URL],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  // For RPC call
  .all(
    "/rpc*",
    async (elysiaCtx) => {
      const orpcContext = await createContext({ context: elysiaCtx });
      const { response } = await rpcHandler.handle(elysiaCtx.request, {
        prefix: "/rpc",
        context: orpcContext,
      });
      const base = response ?? new Response("Not Found", { status: 404 });
      if (orpcContext.responseCookies.length === 0) return base;
      const headers = new Headers(base.headers);
      for (const cookie of orpcContext.responseCookies)
        headers.append("Set-Cookie", cookie);
      return new Response(base.body, { status: base.status, headers });
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api*",
    async (elysiaCtx) => {
      const orpcContext = await createContext({ context: elysiaCtx });
      const { response } = await apiHandler.handle(elysiaCtx.request, {
        prefix: "/api",
        context: orpcContext,
      });
      const base = response ?? new Response("Not Found", { status: 404 });
      if (orpcContext.responseCookies.length === 0) return base;
      const headers = new Headers(base.headers);
      for (const cookie of orpcContext.responseCookies)
        headers.append("Set-Cookie", cookie);
      return new Response(base.body, { status: base.status, headers });
    },
    {
      parse: "none",
    },
  )
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
