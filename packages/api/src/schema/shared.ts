import { genderEnum, userRoleEnum } from "@e-service/db/schema/auth";
import {
  categoryEnum,
  hourFormatEnum,
  languagesEnum,
  portalTypeEnum,
  themeEnum,
} from "@e-service/db/schema/shared";
import z from "zod";

export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const logicOperatorSchema = z.enum(["and", "or"]);

export const categorySchema = z.enum(categoryEnum.enumValues);

export const userRoleSchema = z.enum(userRoleEnum.enumValues);

export const genderSchema = z.enum(genderEnum.enumValues);

export const languagesSchema = z.enum(languagesEnum.enumValues);

export const hourFormatSchema = z.enum(hourFormatEnum.enumValues);

export const themeSchema = z.enum(themeEnum.enumValues);

export const dateSchema = z.codec(z.iso.date(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
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
  "between",
  "notBetween",
]);

/** Bounds for date/time filters (`between` / `notBetween`). ISO date strings decode to `Date`. */
export const filterDateRangeSchema = z.object({
  from: dateSchema,
  to: dateSchema,
});

export const filterValueSchema = z.union([
  dateSchema,
  filterDateRangeSchema,
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number(), dateSchema])),
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

export const portalTypeSchema = z.enum(portalTypeEnum.enumValues);

export const sortItemSchema = z.object({
  field: z.string(),
  direction: sortDirectionSchema,
});
