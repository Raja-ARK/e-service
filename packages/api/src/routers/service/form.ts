import { z } from "zod";
import { adminProcedure, protectedProcedure } from "../../";
import * as formSchema from "../../schema/service/form";
import { successResponseSchema } from "../../schema/shared";
import * as formServices from "../../services/service/form";

// ---- FORM ----

const getByService = adminProcedure
  .route({
    method: "GET",
    path: "/by-service/{serviceId}",
    summary: "Get Form By Service",
    description:
      "Get the full form (steps, groups, fields, rules) for a service.",
  })
  .input(formSchema.getFormByServiceInputSchema)
  .output(z.object({ form: formSchema.formByServiceOutputSchema }))
  .handler(async ({ input }) => {
    return await formServices.getFormByService({ input });
  });

// ---- STEPS ----

const listSteps = adminProcedure
  .route({
    method: "GET",
    path: "/steps",
    summary: "List Form Steps",
    description: "List all form steps",
  })
  .input(formSchema.listStepsInputSchema)
  .output(formSchema.listStepsOutputSchema)
  .handler(async ({ input }) => {
    return await formServices.listSteps({ input });
  });

const getStep = adminProcedure
  .route({
    method: "GET",
    path: "/steps/{id}",
    summary: "Get Form Step",
    description: "Get a form step by id",
  })
  .input(formSchema.stepIdSchema)
  .output(formSchema.stepResponseSchema)
  .handler(async ({ input }) => {
    return await formServices.getStep({ input });
  });

const createStep = adminProcedure
  .route({
    method: "POST",
    path: "/steps",
    summary: "Create Form Step",
    description: "Create a new form step",
  })
  .input(formSchema.createStepInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await formServices.createStep({ input, context });
  });

const updateStep = adminProcedure
  .route({
    method: "PUT",
    path: "/steps/{id}",
    summary: "Update Form Step",
    description: "Update a form step by id",
  })
  .input(formSchema.updateStepInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await formServices.updateStep({ input, context });
  });

const removeStep = adminProcedure
  .route({
    method: "DELETE",
    path: "/steps/{id}",
    summary: "Delete Form Step",
    description: "Delete a form step by id",
  })
  .input(formSchema.stepIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await formServices.deleteStep({ input });
  });

// ---- GROUPS ----

const listGroups = adminProcedure
  .route({
    method: "GET",
    path: "/groups",
    summary: "List Form Groups",
    description: "List all form groups",
  })
  .input(formSchema.listGroupsInputSchema)
  .output(formSchema.listGroupsOutputSchema)
  .handler(async ({ input }) => {
    return await formServices.listGroups({ input });
  });

const getGroup = adminProcedure
  .route({
    method: "GET",
    path: "/groups/{id}",
    summary: "Get Form Group",
    description: "Get a form group by id",
  })
  .input(formSchema.groupIdSchema)
  .output(formSchema.groupResponseSchema)
  .handler(async ({ input }) => {
    return await formServices.getGroup({ input });
  });

const createGroup = adminProcedure
  .route({
    method: "POST",
    path: "/groups",
    summary: "Create Form Group",
    description: "Create a new form group",
  })
  .input(formSchema.createGroupInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await formServices.createGroup({ input, context });
  });

const updateGroup = adminProcedure
  .route({
    method: "PUT",
    path: "/groups/{id}",
    summary: "Update Form Group",
    description: "Update a form group by id",
  })
  .input(formSchema.updateGroupInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await formServices.updateGroup({ input, context });
  });

const removeGroup = adminProcedure
  .route({
    method: "DELETE",
    path: "/groups/{id}",
    summary: "Delete Form Group",
    description: "Delete a form group by id",
  })
  .input(formSchema.groupIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await formServices.deleteGroup({ input });
  });

// ---- FIELDS ----

const listFields = adminProcedure
  .route({
    method: "GET",
    path: "/fields",
    summary: "List Form Fields",
    description: "List all form fields",
  })
  .input(formSchema.listFieldsInputSchema)
  .output(formSchema.listFieldsOutputSchema)
  .handler(async ({ input }) => {
    return await formServices.listFields({ input });
  });

const getField = adminProcedure
  .route({
    method: "GET",
    path: "/fields/{id}",
    summary: "Get Form Field",
    description: "Get a form field by id",
  })
  .input(formSchema.fieldIdSchema)
  .output(formSchema.fieldResponseSchema)
  .handler(async ({ input }) => {
    return await formServices.getField({ input });
  });

const createField = adminProcedure
  .route({
    method: "POST",
    path: "/fields",
    summary: "Create Form Field",
    description: "Create a new form field",
  })
  .input(formSchema.createFieldInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await formServices.createField({ input, context });
  });

const updateField = adminProcedure
  .route({
    method: "PUT",
    path: "/fields/{id}",
    summary: "Update Form Field",
    description: "Update a form field by id",
  })
  .input(formSchema.updateFieldInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await formServices.updateField({ input, context });
  });

const removeField = adminProcedure
  .route({
    method: "DELETE",
    path: "/fields/{id}",
    summary: "Delete Form Field",
    description: "Delete a form field by id",
  })
  .input(formSchema.fieldIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await formServices.deleteField({ input });
  });

// ---- RULES ----

const listRules = adminProcedure
  .route({
    method: "GET",
    path: "/rules",
    summary: "List Form Rules",
    description: "List all form rules",
  })
  .input(formSchema.listRulesInputSchema)
  .output(formSchema.listRulesOutputSchema)
  .handler(async ({ input }) => {
    return await formServices.listRules({ input });
  });

const getRule = adminProcedure
  .route({
    method: "GET",
    path: "/rules/{id}",
    summary: "Get Form Rule",
    description: "Get a form rule by id",
  })
  .input(formSchema.ruleIdSchema)
  .output(formSchema.ruleResponseSchema)
  .handler(async ({ input }) => {
    return await formServices.getRule({ input });
  });

const createRule = adminProcedure
  .route({
    method: "POST",
    path: "/rules",
    summary: "Create Form Rule",
    description: "Create a new form rule",
  })
  .input(formSchema.createRuleInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await formServices.createRule({ input, context });
  });

const updateRule = adminProcedure
  .route({
    method: "PUT",
    path: "/rules/{id}",
    summary: "Update Form Rule",
    description: "Update a form rule by id",
  })
  .input(formSchema.updateRuleInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await formServices.updateRule({ input, context });
  });

const removeRule = adminProcedure
  .route({
    method: "DELETE",
    path: "/rules/{id}",
    summary: "Delete Form Rule",
    description: "Delete a form rule by id",
  })
  .input(formSchema.ruleIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await formServices.deleteRule({ input });
  });

export const formRouter = protectedProcedure
  .tag("Form")
  .prefix("/services/forms")
  .router({
    getByService,
    steps: {
      list: listSteps,
      getById: getStep,
      create: createStep,
      update: updateStep,
      remove: removeStep,
    },
    groups: {
      list: listGroups,
      getById: getGroup,
      create: createGroup,
      update: updateGroup,
      remove: removeGroup,
    },
    fields: {
      list: listFields,
      getById: getField,
      create: createField,
      update: updateField,
      remove: removeField,
    },
    rules: {
      list: listRules,
      getById: getRule,
      create: createRule,
      update: updateRule,
      remove: removeRule,
    },
  });
