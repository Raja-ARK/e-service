import { adminProcedure, protectedProcedure } from "../";
import * as departmentSchema from "../schema/department";
import { successResponseSchema } from "../schema/shared";
import * as departmentServices from "../services/department";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Departments",
    description: "List all departments",
  })
  .input(departmentSchema.listDepartmentsInputSchema)
  .output(departmentSchema.listDepartmentsOutputSchema)
  .handler(async ({ input }) => {
    return await departmentServices.listDepartments({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get Department",
    description: "Get a department by id",
  })
  .input(departmentSchema.getDepartmentInputSchema)
  .output(departmentSchema.departmentOutputSchema)
  .handler(async ({ input }) => {
    return await departmentServices.getDepartment({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create Department",
    description: "Create a new department",
  })
  .input(departmentSchema.createDepartmentSchema)
  .output(departmentSchema.departmentOutputSchema)
  .handler(async ({ input, context }) => {
    return await departmentServices.createDepartment({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update Department",
    description: "Update a department by id",
  })
  .input(
    departmentSchema.departmentIdSchema.merge(
      departmentSchema.updateDepartmentSchema,
    ),
  )
  .output(departmentSchema.departmentOutputSchema)
  .handler(async ({ input, context }) => {
    return await departmentServices.updateDepartment({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/{id}",
    summary: "Delete Department",
    description: "Delete a department by id",
  })
  .input(departmentSchema.departmentIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await departmentServices.deleteDepartment({ input });
  });

export const departmentRouter = protectedProcedure
  .tag("Department")
  .prefix("/departments")
  .router({
    list,
    getById,
    create,
    update,
    remove,
  });
