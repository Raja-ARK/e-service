import { ORPCError } from "@orpc/server";

export const createError = (
  message: string,
  code:
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "METHOD_NOT_SUPPORTED"
    | "NOT_ACCEPTABLE"
    | "TIMEOUT"
    | "CONFLICT"
    | "PRECONDITION_FAILED"
    | "PAYLOAD_TOO_LARGE"
    | "UNSUPPORTED_MEDIA_TYPE"
    | "UNPROCESSABLE_CONTENT"
    | "TOO_MANY_REQUESTS"
    | "CLIENT_CLOSED_REQUEST"
    | "INTERNAL_SERVER_ERROR"
    | "NOT_IMPLEMENTED"
    | "BAD_GATEWAY"
    | "SERVICE_UNAVAILABLE"
    | "GATEWAY_TIMEOUT" = "INTERNAL_SERVER_ERROR",
) => {
  return new ORPCError(code, { message });
};
