import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle-zod";
import { user } from "@e-service/db/schema/auth";
import { emailSchema, passwordSchema } from "@e-service/shared/schema";
import {
  ARABIC_NAME_REGEX,
  IMAGE_MIME_TYPES,
} from "@e-service/shared/utils/constant";
import { z } from "zod";
import {
  dateSchema,
  filterConditionInputSchema,
  filterConditionSchema,
  genderSchema,
  hourFormatSchema,
  languagesSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
  themeSchema,
  userRoleSchema,
} from "./shared";

export const USER_SORT_FIELDS = [
  "name",
  "nameAr",
  "email",
  "role",
  "gender",
  "mobile",
  "nationality",
  "emirateId",
  "dob",
  "language",
  "dateFormat",
  "dateTimeFormat",
  "itemsPerPage",
  "timeFormat",
  "hourFormat",
  "defaultTheme",
  "timezone",
  "currency",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof user.$inferSelect>;

const userSortFieldSchema = z.enum(USER_SORT_FIELDS);

export const userSortSchema = z
  .array(
    z.object({
      field: userSortFieldSchema,
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

const nameSchema = z.string().check(({ issues, value }) => {
  if (value === null || value === undefined || value?.trim() === "") {
    issues.push({
      code: "custom",
      message: "Name is required",
      input: value,
    });
    return;
  }

  if (value.length < 2) {
    issues.push({
      code: "custom",
      message: "Name must be at least 2 characters long",
      input: value,
    });
    return;
  }

  if (value.length > 50) {
    issues.push({
      code: "custom",
      message: "Name must be less than 50 characters long",
      input: value,
    });
    return;
  }
});

const nameArSchema = z
  .string()
  .check(({ issues, value }) => {
    if (value && value?.trim() !== "" && !ARABIC_NAME_REGEX.test(value)) {
      issues.push({
        code: "custom",
        message: "Invalid Arabic name",
        input: value,
      });
      return;
    }
  })
  .nullish();

export const userSchema = createSelectSchema(user);

export const userPartialSchema = userSchema.partial();

export const USER_SELECTABLE_COLUMNS = [
  "id",
  "name",
  "nameAr",
  "email",
  "emailVerified",
  "image",
  "role",
  "banned",
  "banReason",
  "banExpires",
  "gender",
  "mobile",
  "nationality",
  "emirateId",
  "dob",
  "language",
  "dateFormat",
  "dateTimeFormat",
  "itemsPerPage",
  "timeFormat",
  "hourFormat",
  "defaultTheme",
  "timezone",
  "currency",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof user.$inferSelect>;

export const userColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  nameAr: z.boolean().optional(),
  email: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  image: z.boolean().optional(),
  role: z.boolean().optional(),
  banned: z.boolean().optional(),
  banReason: z.boolean().optional(),
  banExpires: z.boolean().optional(),
  gender: z.boolean().optional(),
  mobile: z.boolean().optional(),
  nationality: z.boolean().optional(),
  emirateId: z.boolean().optional(),
  dob: z.boolean().optional(),
  language: z.boolean().optional(),
  dateFormat: z.boolean().optional(),
  dateTimeFormat: z.boolean().optional(),
  itemsPerPage: z.boolean().optional(),
  timeFormat: z.boolean().optional(),
  hourFormat: z.boolean().optional(),
  defaultTheme: z.boolean().optional(),
  timezone: z.boolean().optional(),
  currency: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
});

export const userFilterSchema = z.object({
  name: z.union([z.string(), filterConditionSchema]).optional(),
  nameAr: z.union([z.string(), filterConditionSchema]).optional(),
  email: z.union([z.string(), filterConditionSchema]).optional(),
  role: z.union([userRoleSchema, filterConditionSchema]).optional(),
  banned: z.union([z.boolean(), filterConditionSchema]).optional(),
  emailVerified: z.union([z.boolean(), filterConditionSchema]).optional(),
  gender: z.union([genderSchema, filterConditionSchema]).optional(),
  mobile: z.union([z.string(), filterConditionSchema]).optional(),
  nationality: z.union([z.string(), filterConditionSchema]).optional(),
  emirateId: z.union([z.string(), filterConditionSchema]).optional(),
  dob: z.union([dateSchema, filterConditionSchema]).optional(),
  language: z.union([languagesSchema, filterConditionSchema]).optional(),
  dateFormat: z.union([z.string(), filterConditionSchema]).optional(),
  dateTimeFormat: z.union([z.string(), filterConditionSchema]).optional(),
  itemsPerPage: z.union([z.number(), filterConditionSchema]).optional(),
  timeFormat: z.union([z.string(), filterConditionSchema]).optional(),
  hourFormat: z.union([hourFormatSchema, filterConditionSchema]).optional(),
  defaultTheme: z.union([themeSchema, filterConditionSchema]).optional(),
  timezone: z.union([z.string(), filterConditionSchema]).optional(),
  currency: z.union([z.string(), filterConditionSchema]).optional(),
});

export const listUsersInputSchema = paginationQuerySchema.extend({
  filter: userFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: userSortSchema,
  select: userColumnSelectSchema.optional(),
  withoutPagination: z.boolean().optional().default(false),
});

export const listUsersOutputSchema = paginatedResponseSchema(userPartialSchema);

export const getUsersInputSchema = z.object({
  id: z.string().optional(),
  select: userColumnSelectSchema.optional(),
});

export const getUsersOutputSchema = z.object({
  user: userPartialSchema,
});

export const createUserInputSchema = createInsertSchema(user, {
  name: nameSchema,
  nameAr: nameArSchema.nullish(),
  email: emailSchema.transform((e) => e.toLowerCase()),
  role: userRoleSchema,
  dob: dateSchema.nullish(),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    banExpires: true,
    banReason: true,
    banned: true,
    image: true,
    emailVerified: true,
  })
  .extend({
    password: passwordSchema,
  });

export const createUserOutputSchema = z.object({
  user: userPartialSchema,
});

export const userIdSchema = z.object({
  id: z.string(),
});

export const removeUserInputSchema = userIdSchema;

export const updateUserInputSchema = createUpdateSchema(user, {
  id: z
    .string()
    .trim()
    .nonempty("User id is required")
    .nonoptional("User id is required"),
  name: nameSchema.optional(),
  nameAr: nameArSchema.optional(),
  image: z.file().mime(IMAGE_MIME_TYPES).nullable().optional(),
})
  .omit({
    email: true,
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
  })
  .check(({ issues, value }) => {
    const hasId = value.id !== undefined && value.id !== "";
    const keys = Object.keys(value).filter((k) => k !== "id");
    if (keys.length === 0) {
      issues.push({
        code: "custom",
        message: "At least one field to update is required",
        input: value,
      });
      return;
    }
    if (hasId && !value.id?.trim()) {
      issues.push({
        code: "custom",
        message: "Invalid user id",
        input: value,
        path: ["id"],
      });
    }
  });
