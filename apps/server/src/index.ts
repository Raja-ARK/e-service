/** biome-ignore-all lint/correctness/noUnusedVariables: Suppressing this rule for the server index file */
import { createContext } from "@e-service/api/context";
import { appRouter } from "@e-service/api/routers/index";
import { env } from "@e-service/env/server";
import { cors } from "@elysiajs/cors";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError, ValidationError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { isAPIError } from "better-auth/api";
import { Elysia } from "elysia";
import { ZodError, z } from "zod";

const formatValidationError = (cause: ValidationError) => {
  const zodError = new ZodError(cause.issues as never);
  return z.treeifyError(zodError);
};

const handleError = (error: unknown) => {
  console.error(error);
  if (
    error instanceof ORPCError &&
    error.code === "BAD_REQUEST" &&
    error.cause instanceof ValidationError
  ) {
    throw new ORPCError("INPUT_VALIDATION_FAILED", {
      status: 422,
      message: "Input validation failed",
      data: formatValidationError(error.cause),
      cause: error.cause,
    });
  }
  if (isAPIError(error)) {
    throw new ORPCError("BAD_REQUEST", { message: error.message });
  }
};

const rpcHandler = new RPCHandler(appRouter, {
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [onError(handleError)],
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
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
      },
    }),
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [onError(handleError)],
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
    async (ctx) => {
      const orpcContext = await createContext({ context: ctx });

      const { response } = await rpcHandler.handle(ctx.request, {
        prefix: "/rpc",
        context: orpcContext,
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api*",
    async (ctx) => {
      const orpcContext = await createContext({ context: ctx });
      const { response } = await apiHandler.handle(ctx.request, {
        prefix: "/api",
        context: orpcContext,
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
