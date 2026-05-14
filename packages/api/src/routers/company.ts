import { protectedProcedure } from "../";
import * as companySchema from "../schema/company";
import * as companyServices from "../services/company";

const list = protectedProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Companies",
    description: "List all companies",
  })
  .input(companySchema.listCompaniesInputSchema)
  .output(companySchema.listCompaniesOutputSchema)
  .handler(async ({ input, context }) => {
    return await companyServices.listCompanies({ input, context });
  });

const getById = protectedProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get Company",
    description: "Get a company by id",
  })
  .input(companySchema.getCompanyInputSchema)
  .output(companySchema.companyOutputSchema)
  .handler(async ({ input, context }) => {
    return await companyServices.getCompany({ input, context });
  });

export const companyRouter = protectedProcedure
  .tag("Company")
  .prefix("/companies")
  .router({
    list,
    getById,
  });
