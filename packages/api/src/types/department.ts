import type { z } from "zod";
import type {
  createDepartmentSchema,
  departmentIdSchema,
  getDepartmentInputSchema,
  listDepartmentsInputSchema,
  updateDepartmentSchema,
} from "../schema/department";

export type DepartmentIdInput = z.infer<typeof departmentIdSchema>;
export type DepartmentGetInput = z.infer<typeof getDepartmentInputSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ListDepartmentsInput = z.infer<typeof listDepartmentsInputSchema>;
