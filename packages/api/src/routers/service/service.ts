import { adminProcedure, protectedProcedure } from "../../";
import * as serviceSchema from "../../schema/service/service";
import { successResponseSchema } from "../../schema/shared";
import * as serviceServices from "../../services/service/service";

const list = adminProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Services",
    description: "List all services",
  })
  .input(serviceSchema.listServicesInputSchema)
  .output(serviceSchema.listServicesOutputSchema)
  .handler(async ({ input }) => {
    return await serviceServices.listServices({ input });
  });

const getById = adminProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get Service",
    description: "Get a service by id",
  })
  .input(serviceSchema.getServiceInputSchema)
  .output(serviceSchema.serviceOutputSchema)
  .handler(async ({ input }) => {
    return await serviceServices.getService({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create Service",
    description: "Create a new service",
  })
  .input(serviceSchema.createServiceInputSchema)
  .output(serviceSchema.serviceOutputSchema)
  .handler(async ({ input, context }) => {
    return await serviceServices.createService({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update Service",
    description: "Update a service by id",
  })
  .input(serviceSchema.updateServiceInputSchema)
  .output(serviceSchema.serviceOutputSchema)
  .handler(async ({ input, context }) => {
    return await serviceServices.updateService({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/{id}",
    summary: "Delete Service",
    description: "Delete a service by id",
  })
  .input(serviceSchema.deleteServiceInputSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await serviceServices.deleteService({ input });
  });

export const serviceRouter = protectedProcedure
  .tag("Service")
  .prefix("/services")
  .router({
    list,
    getById,
    create,
    update,
    remove,
  });
