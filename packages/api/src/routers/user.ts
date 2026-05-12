import { adminProcedure, protectedProcedure } from "../";
import { successResponseSchema } from "../schema/shared";
import * as userSchema from "../schema/user";
import * as userServices from "../services/user";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/users",
    summary: "List users",
    description:
      "Paginated list of all users. Only administrators can call this endpoint.",
    tags: ["User"],
  })
  .input(userSchema.listUsersInputSchema)
  .output(userSchema.listUsersOutputSchema)
  .handler(async ({ input }) => {
    return await userServices.listUsers({ input });
  });

const getUser = protectedProcedure
  .route({
    method: "GET",
    path: "/user",
    summary: "Get user",
    description:
      "Returns the authenticated user’s record. External and internal users only ever see themselves. Administrators should use GET /users to list or inspect other accounts.",
    tags: ["User"],
  })
  .input(userSchema.getUsersInputSchema)
  .output(userSchema.getUsersOutputSchema)
  .handler(async ({ input, context }) => {
    return await userServices.getUsers({ input, context });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/user",
    summary: "Create user",
    tags: ["User"],
  })
  .input(userSchema.createUserInputSchema)
  .output(userSchema.createUserOutputSchema)
  .handler(async ({ input, context }) => {
    return await userServices.createUser({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/user/{id}",
    summary: "Remove user",
    tags: ["User"],
  })
  .input(userSchema.removeUserInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await userServices.removeUser({ input, context });
  });

const update = protectedProcedure
  .route({
    method: "PUT",
    path: "/user",
    summary: "Update user",
    description:
      "Updates the current user’s profile (no role or ban fields). Administrators may include `id` to update another user, including role and ban fields.",
    tags: ["User"],
  })
  .input(userSchema.updateUserInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input, context }) => {
    return await userServices.updateUser({ input, context });
  });

export const userRouter = {
  list,
  getUser,
  create,
  remove,
  update,
};
