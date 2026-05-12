import z from "zod";

export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const filterConditionInputSchema = z.union([
  z.literal("and"),
  z.literal("or"),
]);

export const filterOperatorSchema = z.enum([
  "equals",
  "notEquals",
  "greater",
  "greaterOrEquals",
  "less",
  "lessOrEquals",
  "like",
  "ilike",
  "notLike",
  "in",
  "isNull",
  "isNotNull",
]);

export const filterValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number()])),
]);

export const filterConditionSchema = z.object({
  operator: filterOperatorSchema,
  value: filterValueSchema.optional(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    data: dataSchema.array(),
    total: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
    nextPage: z.number().nullable(),
    prevPage: z.number().nullable(),
    currentPage: z.number(),
    totalPages: z.number(),
  });

export const paginationQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
});

export const sortDirectionSchema = z.enum(["asc", "desc"]);

/** Generic sort tuple; constrain `field` in domain schemas (e.g. department sort fields). */
export const sortItemSchema = z.object({
  field: z.string(),
  direction: sortDirectionSchema,
});
