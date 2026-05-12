import { adminProcedure } from "../";
import * as departmentSchema from "../schema/department";
import { successResponseSchema } from "../schema/shared";
import * as departmentServices from "../services/department";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/departments",
    summary: "List Departments",
    tags: ["Department"],
  })
  .input(departmentSchema.listDepartmentsInputSchema)
  .output(departmentSchema.listDepartmentsOutputSchema)
  .handler(async ({ input }) => {
    return await departmentServices.listDepartments({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/departments/{id}",
    summary: "Get Department",
    tags: ["Department"],
  })
  .input(departmentSchema.getDepartmentInputSchema)
  .output(departmentSchema.departmentOutputSchema)
  .handler(async ({ input }) => {
    return await departmentServices.getDepartment({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/departments",
    summary: "Create Department",
    tags: ["Department"],
  })
  .input(departmentSchema.createDepartmentSchema)
  .output(departmentSchema.departmentOutputSchema)
  .handler(async ({ input, context }) => {
    return await departmentServices.createDepartment({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/departments/{id}",
    summary: "Update Department",
    tags: ["Department"],
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
    path: "/departments/{id}",
    summary: "Delete Department",
    tags: ["Department"],
  })
  .input(departmentSchema.departmentIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await departmentServices.deleteDepartment({ input });
  });

export const departmentRouter = {
  list,
  getById,
  create,
  update,
  remove,
};
