import type { RouterClient } from "@orpc/server";

import { announcementRouter } from "./announcement";
import { authRouter } from "./auth";
import { companyRouter } from "./company";
import { departmentRouter } from "./department";

export const appRouter = {
  auth: authRouter,
  announcement: announcementRouter,
  company: companyRouter,
  department: departmentRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
