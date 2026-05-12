import type { z } from "zod";
import type {
  companyIdSchema,
  getCompanyInputSchema,
  listCompaniesInputSchema,
} from "../schema/company";

export type CompanyIdInput = z.infer<typeof companyIdSchema>;
export type CompanyGetInput = z.infer<typeof getCompanyInputSchema>;
export type ListCompaniesInput = z.infer<typeof listCompaniesInputSchema>;
