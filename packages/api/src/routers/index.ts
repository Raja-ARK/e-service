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
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
