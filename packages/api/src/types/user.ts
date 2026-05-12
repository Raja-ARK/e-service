import type z from "zod";
import type {
  createUserInputSchema,
  getUsersInputSchema,
  listUsersInputSchema,
  removeUserInputSchema,
  updateUserInputSchema,
} from "../schema/user";

export type ListUsersInput = z.infer<typeof listUsersInputSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type RemoveUserInput = z.infer<typeof removeUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type GetUsersInput = z.infer<typeof getUsersInputSchema>;
