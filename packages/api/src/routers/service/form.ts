import { adminProcedure, publicProcedure } from "../../";
import * as formSchema from "../../schema/service/form";
import { successResponseSchema } from "../../schema/shared";
import * as formServices from "../../services/service/form";

// ─── Form ─────────────────────────────────────────────────────────────────────

const getByServiceId = adminProcedure
  .route({
    method: "GET",
    path: "/by-service/{serviceId}",
    summary: "Get Form by Service",
  })
  .input(formSchema.getFormByServiceIdSchema)
  .output(formSchema.formResponseSchema)
  .handler(async ({ input }) => formServices.getFormByServiceId({ input }));

const getForm = adminProcedure
  .route({ method: "GET", path: "/{id}", summary: "Get Form" })
  .input(formSchema.formIdSchema)
  .output(formSchema.formResponseSchema)
  .handler(async ({ input }) => formServices.getForm({ input }));

const createForm = adminProcedure
  .route({ method: "POST", path: "/", summary: "Create Form" })
  .input(formSchema.createFormInputSchema)
  .output(formSchema.formResponseSchema)
  .handler(async ({ input }) => formServices.createForm({ input }));

const updateForm = adminProcedure
  .route({ method: "PUT", path: "/{id}", summary: "Update Form" })
  .input(formSchema.updateFormInputSchema)
  .output(formSchema.formResponseSchema)
  .handler(async ({ input }) => formServices.updateForm({ input }));

const deleteForm = adminProcedure
  .route({ method: "DELETE", path: "/{id}", summary: "Delete Form" })
  .input(formSchema.formIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => formServices.deleteForm({ input }));

export const formRouter = publicProcedure
  .tag("Form")
  .prefix("/forms")
  .router({ getByServiceId, getForm, createForm, updateForm, deleteForm });

// ─── FormStep ─────────────────────────────────────────────────────────────────

const getStep = adminProcedure
  .route({ method: "GET", path: "/{id}", summary: "Get Form Step" })
  .input(formSchema.formStepIdSchema)
  .output(formSchema.formStepResponseSchema)
  .handler(async ({ input }) => formServices.getFormStep({ input }));

const createStep = adminProcedure
  .route({ method: "POST", path: "/", summary: "Create Form Step" })
  .input(formSchema.createFormStepInputSchema)
  .output(formSchema.formStepResponseSchema)
  .handler(async ({ input }) => formServices.createFormStep({ input }));

const updateStep = adminProcedure
  .route({ method: "PUT", path: "/{id}", summary: "Update Form Step" })
  .input(formSchema.updateFormStepInputSchema)
  .output(formSchema.formStepResponseSchema)
  .handler(async ({ input }) => formServices.updateFormStep({ input }));

const deleteStep = adminProcedure
  .route({ method: "DELETE", path: "/{id}", summary: "Delete Form Step" })
  .input(formSchema.formStepIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => formServices.deleteFormStep({ input }));

export const formStepRouter = publicProcedure
  .tag("Form Step")
  .prefix("/form-steps")
  .router({ getStep, createStep, updateStep, deleteStep });

// ─── FormGroup ────────────────────────────────────────────────────────────────

const getGroup = adminProcedure
  .route({ method: "GET", path: "/{id}", summary: "Get Form Group" })
  .input(formSchema.formGroupIdSchema)
  .output(formSchema.formGroupResponseSchema)
  .handler(async ({ input }) => formServices.getFormGroup({ input }));

const createGroup = adminProcedure
  .route({ method: "POST", path: "/", summary: "Create Form Group" })
  .input(formSchema.createFormGroupInputSchema)
  .output(formSchema.formGroupResponseSchema)
  .handler(async ({ input }) => formServices.createFormGroup({ input }));

const updateGroup = adminProcedure
  .route({ method: "PUT", path: "/{id}", summary: "Update Form Group" })
  .input(formSchema.updateFormGroupInputSchema)
  .output(formSchema.formGroupResponseSchema)
  .handler(async ({ input }) => formServices.updateFormGroup({ input }));

const deleteGroup = adminProcedure
  .route({ method: "DELETE", path: "/{id}", summary: "Delete Form Group" })
  .input(formSchema.formGroupIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => formServices.deleteFormGroup({ input }));

export const formGroupRouter = publicProcedure
  .tag("Form Group")
  .prefix("/form-groups")
  .router({ getGroup, createGroup, updateGroup, deleteGroup });

// ─── FormField ────────────────────────────────────────────────────────────────

const getField = adminProcedure
  .route({ method: "GET", path: "/{id}", summary: "Get Form Field" })
  .input(formSchema.formFieldIdSchema)
  .output(formSchema.formFieldResponseSchema)
  .handler(async ({ input }) => formServices.getFormField({ input }));

const createField = adminProcedure
  .route({ method: "POST", path: "/", summary: "Create Form Field" })
  .input(formSchema.createFormFieldInputSchema)
  .output(formSchema.formFieldResponseSchema)
  .handler(async ({ input }) => formServices.createFormField({ input }));

const updateField = adminProcedure
  .route({ method: "PUT", path: "/{id}", summary: "Update Form Field" })
  .input(formSchema.updateFormFieldInputSchema)
  .output(formSchema.formFieldResponseSchema)
  .handler(async ({ input }) => formServices.updateFormField({ input }));

const deleteField = adminProcedure
  .route({ method: "DELETE", path: "/{id}", summary: "Delete Form Field" })
  .input(formSchema.formFieldIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => formServices.deleteFormField({ input }));

export const formFieldRouter = publicProcedure
  .tag("Form Field")
  .prefix("/form-fields")
  .router({ getField, createField, updateField, deleteField });

// ─── FormRule ─────────────────────────────────────────────────────────────────

const getRule = adminProcedure
  .route({ method: "GET", path: "/{id}", summary: "Get Form Rule" })
  .input(formSchema.formRuleIdSchema)
  .output(formSchema.formRuleResponseSchema)
  .handler(async ({ input }) => formServices.getFormRule({ input }));

const createRule = adminProcedure
  .route({ method: "POST", path: "/", summary: "Create Form Rule" })
  .input(formSchema.createFormRuleInputSchema)
  .output(formSchema.formRuleResponseSchema)
  .handler(async ({ input }) => formServices.createFormRule({ input }));

const updateRule = adminProcedure
  .route({ method: "PUT", path: "/{id}", summary: "Update Form Rule" })
  .input(formSchema.updateFormRuleInputSchema)
  .output(formSchema.formRuleResponseSchema)
  .handler(async ({ input }) => formServices.updateFormRule({ input }));

const deleteRule = adminProcedure
  .route({ method: "DELETE", path: "/{id}", summary: "Delete Form Rule" })
  .input(formSchema.formRuleIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => formServices.deleteFormRule({ input }));

export const formRuleRouter = publicProcedure
  .tag("Form Rule")
  .prefix("/form-rules")
  .router({ getRule, createRule, updateRule, deleteRule });
