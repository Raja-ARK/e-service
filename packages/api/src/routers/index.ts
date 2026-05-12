import type { RouterClient } from "@orpc/server";

import { authRouter } from "./auth";
import { departmentRouter } from "./department";

export const appRouter = {
  auth: authRouter,
  department: departmentRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
