import type { RouterClient } from "@orpc/server";

import { announcementRouter } from "./announcement";
import { authRouter } from "./auth";
import { companyRouter } from "./company";
import { departmentRouter } from "./department";
import { documentRouter } from "./document";
import { emailRouter } from "./email";
import { fileRouter } from "./file";
import { lookupRouter } from "./lookup";
import { requestRouter } from "./request";
import { actionRouter } from "./service/action";
import { catalogRouter } from "./service/catalog";
import { formRouter } from "./service/form";
import { prerequisiteRouter } from "./service/prerequisite";
import { serviceRouter } from "./service/service";
import { stageRouter } from "./service/stage";
import { userRouter } from "./user";

export const appRouter = {
  auth: authRouter,
  announcement: announcementRouter,
  company: companyRouter,
  department: departmentRouter,
  document: documentRouter,
  email: emailRouter,
  file: fileRouter,
  lookup: lookupRouter,
  user: userRouter,
  request: requestRouter,
  service: serviceRouter,
  stage: stageRouter,
  action: actionRouter,
  catalog: catalogRouter,
  form: formRouter,
  prerequisite: prerequisiteRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
