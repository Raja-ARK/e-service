import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle-zod";
import { announcement } from "@e-service/db/schema/announcement";
import { ARABIC_NAME_REGEX } from "@e-service/shared/utils/constant";
import { z } from "zod";
import {
  categorySchema,
  dateSchema,
  filterConditionInputSchema,
  filterConditionSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  sortDirectionSchema,
} from "./shared";

const announcementSortFieldSchema = z.enum([
  "title",
  "titleAr",
  "description",
  "descriptionAr",
  "issueDate",
  "effectiveFrom",
  "effectiveTo",
  "category",
  "createdAt",
  "updatedAt",
]);

export const announcementSortSchema = z
  .array(
    z.object({
      field: announcementSortFieldSchema,
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

const titleSchema = z.string().check(({ issues, value }) => {
  if (value === null || value === undefined || value?.trim() === "") {
    issues.push({
      code: "custom",
      message: "Title is required",
      input: value,
    });
    return;
  }

  if (value.length < 2) {
    issues.push({
      code: "custom",
      message: "Title must be at least 2 characters long",
      input: value,
    });
    return;
  }

  if (value.length > 250) {
    issues.push({
      code: "custom",
      message: "Title must be less than 250 characters long",
      input: value,
    });
  }
});

const titleArSchema = z
  .string({
    error: ({ code }) => {
      if (code === "invalid_type") {
        return {
          message: "Arabic title is required",
        };
      }
    },
  })
  .trim()
  .nonempty("Arabic title is required")
  .check(({ issues, value }) => {
    if (value && value?.trim() !== "" && !ARABIC_NAME_REGEX.test(value)) {
      issues.push({
        code: "custom",
        message: "Invalid Arabic title",
        input: value,
      });
      return;
    }

    if (value.length < 2) {
      issues.push({
        code: "custom",
        message: "Arabic title must be at least 2 characters long",
        input: value,
      });
      return;
    }
    if (value.length > 250) {
      issues.push({
        code: "custom",
        message: "Arabic title must be less than 250 characters long",
        input: value,
      });
    }
  });

export const announcementRowSchema = createSelectSchema(announcement);

/** Full row subset; validates list/get responses when `select` limits columns. */
export const announcementPartialSchema = announcementRowSchema.partial();

export const ANNOUNCEMENT_SELECTABLE_COLUMNS = [
  "id",
  "title",
  "titleAr",
  "description",
  "descriptionAr",
  "attachment",
  "issueDate",
  "effectiveFrom",
  "effectiveTo",
  "category",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof announcement.$inferSelect>;

export const announcementColumnSelectSchema = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  titleAr: z.boolean().optional(),
  description: z.boolean().optional(),
  descriptionAr: z.boolean().optional(),
  attachment: z.boolean().optional(),
  issueDate: z.boolean().optional(),
  effectiveFrom: z.boolean().optional(),
  effectiveTo: z.boolean().optional(),
  category: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
});

export const createAnnouncementSchema = createInsertSchema(announcement, {
  title: titleSchema,
  titleAr: titleArSchema,
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  attachment: z.string().optional(),
  issueDate: dateSchema,
  effectiveFrom: dateSchema,
  effectiveTo: dateSchema.optional().nullable(),
  category: z.array(categorySchema).min(1, "At least one category"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAnnouncementSchema = createUpdateSchema(announcement, {
  id: z.string(),
  title: titleSchema.optional(),
  titleAr: titleArSchema.optional(),
  issueDate: dateSchema.optional(),
  effectiveFrom: dateSchema.optional(),
  effectiveTo: dateSchema.optional().nullable(),
  category: z.array(categorySchema).min(1).optional(),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const announcementIdSchema = z.object({
  id: z.string(),
});

export const getAnnouncementInputSchema = announcementIdSchema.extend({
  select: announcementColumnSelectSchema.optional(),
});

export const announcementFilterSchema = z.object({
  title: z.union([z.string(), filterConditionSchema]).optional(),
  titleAr: z.union([z.string(), filterConditionSchema]).optional(),
  description: z.union([z.string(), filterConditionSchema]).optional(),
  descriptionAr: z.union([z.string(), filterConditionSchema]).optional(),
  issueDate: z.union([dateSchema, filterConditionSchema]).optional(),
  effectiveFrom: z.union([dateSchema, filterConditionSchema]).optional(),
  effectiveTo: z.union([dateSchema, filterConditionSchema]).optional(),
  category: z.union([z.string(), filterConditionSchema]).optional(),
});

export const listAnnouncementsInputSchema = paginationQuerySchema.extend({
  filter: announcementFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: announcementSortSchema,
  select: announcementColumnSelectSchema.optional(),
});

export const listAnnouncementsOutputSchema = paginatedResponseSchema(
  announcementPartialSchema,
);

export const announcementOutputSchema = z.object({
  announcement: announcementPartialSchema,
});
