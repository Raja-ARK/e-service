import { protectedProcedure } from "../";
import * as companySchema from "../schema/company";
import * as companyServices from "../services/company";

const list = protectedProcedure
  .route({
    method: "GET",
    path: "/companies",
    summary: "List Companies",
    tags: ["Company"],
  })
  .input(companySchema.listCompaniesInputSchema)
  .output(companySchema.listCompaniesOutputSchema)
  .handler(async ({ input, context }) => {
    return await companyServices.listCompanies({ input, context });
  });

const getById = protectedProcedure
  .route({
    method: "GET",
    path: "/companies/{id}",
    summary: "Get Company",
    tags: ["Company"],
  })
  .input(companySchema.getCompanyInputSchema)
  .output(companySchema.companyOutputSchema)
  .handler(async ({ input, context }) => {
    return await companyServices.getCompany({ input, context });
  });

export const companyRouter = {
  list,
  getById,
};
