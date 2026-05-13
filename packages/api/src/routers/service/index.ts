import { publicProcedure } from "../..";
import { actionRouter } from "./action";
import { catalogRouter } from "./catalog";
import {
  formFieldRouter,
  formGroupRouter,
  formRouter,
  formRuleRouter,
  formStepRouter,
} from "./form";
import { prerequisiteRouter } from "./prerequisite";
import { serviceRouter } from "./service";
import { stageRouter } from "./stage";

export const serviceRootRouter = publicProcedure
  .tag("Service")
  .prefix("/services")
  .router({
    service: serviceRouter,
    catalog: catalogRouter,
    prerequisite: prerequisiteRouter,
    stage: stageRouter,
    action: actionRouter,
    form: formRouter,
    formStep: formStepRouter,
    formGroup: formGroupRouter,
    formField: formFieldRouter,
    formRule: formRuleRouter,
  });
