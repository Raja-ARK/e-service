import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "@e-service/db/drizzle/zod";
import {
  action,
  stageActionTypeExternalEnum,
  stageActionTypeInternalEnum,
  stageActionVariantEnum,
} from "@e-service/db/schema/service/stage";
import {
  ARABIC_NAME_REGEX,
  IMAGE_MIME_TYPES,
} from "@e-service/shared/utils/constant";
import { z } from "zod";
import {
  filterConditionInputSchema,
  filterConditionSchema,
  logicOperatorSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  portalTypeSchema,
  sortDirectionSchema,
} from "../shared";

const fieldRuleSchema = z.object({
  fieldId: z.string(),
  operator: z.enum([
    "eq",
    "neq",
    "in",
    "nin",
    "gt",
    "lt",
    "gte",
    "lte",
    "empty",
    "not_empty",
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
  ]),
  value: z
    .union([z.string(), z.array(z.string()), z.number(), z.boolean()])
    .nullish(),
});

export const visibilityConditionSchema = z.union([
  z.object({
    logic: logicOperatorSchema,
    rules: z.array(fieldRuleSchema),
  }),
  fieldRuleSchema,
]);

const actionAssignmentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("applicant") }),
  z.object({
    type: z.literal("internal"),
    userIds: z.array(z.string()).min(1, "At least one user id is required"),
  }),
]);

const bilingualValueSchema = z.object({
  en: z.string().trim().nonempty("English value is required"),
  ar: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type")
          return { message: "Arabic value is required" };
        if (code === "invalid_format")
          return { message: "Invalid Arabic value" };
      },
    })
    .trim()
    .nonempty("Arabic value is required")
    .regex(ARABIC_NAME_REGEX, "Invalid Arabic value"),
});

const actionOutcomeSchema = z.object({
  requestStatus: bilingualValueSchema.nullish(),
  paymentStatus: bilingualValueSchema.nullish(),
  assignment: actionAssignmentSchema.nullish(),
});

const actionConditionSchema = z.object({
  statuses: z.array(z.string()).optional(),
  roles: z.array(portalTypeSchema).optional(),
  operator: z.enum(["AND", "OR"]).optional(),
});

const stageIdField = z.uuid({
  error: ({ code }) => {
    if (code === "invalid_type") return { message: "Stage id is required" };
    if (code === "invalid_format") return { message: "Invalid stage id" };
  },
});

// Schema for a single skip-stage entry (maps to actionSkipStage table)
export const skipStageInputSchema = z.object({
  stageId: stageIdField,
  condition: visibilityConditionSchema.nullish(),
  outcome: actionOutcomeSchema.nullish(),
});

// Schema for an attachment on an action email
export const actionEmailAttachmentInputSchema = z
  .object({
    documentTemplateId: z
      .uuid({
        error: ({ code }) => {
          if (code === "invalid_format")
            return { message: "Invalid document template id" };
        },
      })
      .nullish(),
    fileUrl: z.url("Invalid attachment URL").nullish(),
  })
  .refine((v) => (v.documentTemplateId != null) !== (v.fileUrl != null), {
    message:
      "Attachment must have exactly one of a document template or a file URL",
  });

// Schema for a single email entry on an action (maps to actionEmail + actionEmailAttachment tables)
export const actionEmailInputSchema = z.object({
  emailTemplateId: z.uuid({
    error: ({ code }) => {
      if (code === "invalid_type")
        return { message: "Email template id is required" };
      if (code === "invalid_format")
        return { message: "Invalid email template id" };
    },
  }),
  attachments: z.array(actionEmailAttachmentInputSchema).default([]),
});

const actionNameArSchema = z
  .string({
    error: ({ code }) => {
      if (code === "invalid_type") {
        return {
          message: "Arabic action name is required",
        };
      }
    },
  })
  .trim()
  .nonempty("Arabic action name is required")
  .regex(ARABIC_NAME_REGEX, "Invalid Arabic action name")
  .max(250, "Arabic action name must be less than 250 characters long");

export const actionVariantSchema = z.enum(stageActionVariantEnum.enumValues);

export const actionTypeExternalSchema = z.enum(
  stageActionTypeExternalEnum.enumValues,
);

export const actionTypeInternalSchema = z.enum(
  stageActionTypeInternalEnum.enumValues,
);

export const createActionInputSchema = createInsertSchema(action, {
  stageId: stageIdField.trim().nonempty("Stage id is required"),
  actionName: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type")
          return { message: "Action name is required" };
      },
    })
    .trim()
    .min(2, "Action name must be at least 2 characters")
    .max(250, "Action name must be less than 250 characters"),
  actionNameAr: actionNameArSchema,
  actionVariant: actionVariantSchema.default("primary"),
  typeExternal: actionTypeExternalSchema.nullish(),
  typeInternal: actionTypeInternalSchema.nullish(),
  showCondition: actionConditionSchema.nullish(),
  outcome: actionOutcomeSchema.nullish(),
  order: z.number().int().gte(0, "Order must be greater than 0").default(0),
  icon: z.file().mime(["image/svg+xml"]).nullish(),
  modalIcon: z.file().mime(IMAGE_MIME_TYPES).nullish(),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
  })
  .extend({
    completeStageIds: z.array(stageIdField).default([]),
    removeStageIds: z.array(stageIdField).default([]),
    skipStages: z.array(skipStageInputSchema).default([]),
    emails: z.array(actionEmailInputSchema).default([]),
  });

export const updateActionInputSchema = createUpdateSchema(action, {
  id: z
    .uuid({
      error: ({ code }) => {
        if (code === "invalid_type")
          return { message: "Action id is required" };
        if (code === "invalid_format") return { message: "Invalid action id" };
      },
    })
    .trim()
    .nonempty("Action id is required"),
  actionName: z
    .string()
    .trim()
    .min(2, "Action name must be at least 2 characters")
    .max(250, "Action name must be less than 250 characters")
    .optional(),
  actionNameAr: actionNameArSchema.optional(),
  actionVariant: actionVariantSchema.optional().default("primary"),
  typeExternal: actionTypeExternalSchema.nullish(),
  typeInternal: actionTypeInternalSchema.nullish(),
  showCondition: actionConditionSchema.nullish(),
  outcome: actionOutcomeSchema.nullish(),
  order: z.number().int().gte(0, "Order must be greater than 0").optional(),
  icon: z.file().mime(["image/svg+xml"]).nullish(),
  modalIcon: z.file().mime(IMAGE_MIME_TYPES).nullish(),
})
  .omit({
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
    stageId: true,
  })
  .extend({
    completeStageIds: z.array(stageIdField).optional(),
    removeStageIds: z.array(stageIdField).optional(),
    skipStages: z.array(skipStageInputSchema).optional(),
    emails: z.array(actionEmailInputSchema).optional(),
  });

export const actionIdSchema = z.object({
  id: z
    .string({
      error: ({ code }) => {
        if (code === "invalid_type")
          return { message: "Action id is required" };
      },
    })
    .trim()
    .nonempty("Action id is required"),
});

export const ACTION_SORT_FIELDS = [
  "actionName",
  "actionNameAr",
  "actionVariant",
  "disabled",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof typeof action.$inferSelect>;

export const actionSortSchema = z
  .array(
    z.object({
      field: z.enum(ACTION_SORT_FIELDS),
      direction: sortDirectionSchema,
    }),
  )
  .max(5)
  .optional();

export const actionFilterSchema = z.object({
  stageId: z.union([z.string(), filterConditionSchema]).optional(),
  actionName: z.union([z.string(), filterConditionSchema]).optional(),
  actionNameAr: z.union([z.string(), filterConditionSchema]).optional(),
  disabled: z.union([z.boolean(), filterConditionSchema]).optional(),
});

export const listActionsInputSchema = paginationQuerySchema.extend({
  filter: actionFilterSchema.optional(),
  filterCondition: filterConditionInputSchema.optional().default("and"),
  sort: actionSortSchema,
  withoutPagination: z.boolean().optional().default(false),
});

const stageRefSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  titleAr: z.string(),
});

const actionCompleteStageOutputSchema = z.object({
  stage: stageRefSchema,
});

const actionRemoveStageOutputSchema = z.object({
  stage: stageRefSchema,
});

const actionSkipStageOutputSchema = z.object({
  stageId: z.uuid(),
  condition: visibilityConditionSchema.nullable(),
  outcome: actionOutcomeSchema.nullable(),
  stage: stageRefSchema,
});

const actionEmailAttachmentOutputSchema = z.object({
  documentTemplateId: z.uuid().nullable(),
  fileUrl: z.string().nullable(),
});

const actionEmailOutputSchema = z.object({
  emailTemplateId: z.uuid(),
  attachments: z.array(actionEmailAttachmentOutputSchema),
});

const actionSchema = createSelectSchema(action).omit({
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  stageId: true,
});

const actionWithRelationsSchema = actionSchema.extend({
  completeStages: z.array(actionCompleteStageOutputSchema),
  removeStages: z.array(actionRemoveStageOutputSchema),
  skipStages: z.array(actionSkipStageOutputSchema),
  emails: z.array(actionEmailOutputSchema),
});

export const actionResponseSchema = z.object({
  action: actionWithRelationsSchema,
});

export const listActionsOutputSchema = paginatedResponseSchema(actionSchema);
