import type { z } from "zod";
import type {
  createServiceInputSchema,
  deleteServiceInputSchema,
  getServiceInputSchema,
  listServicesInputSchema,
  serviceIdSchema,
  updateServiceInputSchema,
} from "../../schema/service/service";

export type ServiceIdInput = z.infer<typeof serviceIdSchema>;
export type GetServiceInput = z.infer<typeof getServiceInputSchema>;
export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;
export type DeleteServiceInput = z.infer<typeof deleteServiceInputSchema>;
export type ListServicesInput = z.infer<typeof listServicesInputSchema>;
