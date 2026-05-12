import type z from "zod";
import type {
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
  sortItemSchema,
  successResponseSchema,
} from "../schema/shared";

export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type PaginatedResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof paginatedResponseSchema<T>>
>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;
export type SortItem = z.infer<typeof sortItemSchema>;
