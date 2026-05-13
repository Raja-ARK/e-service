import type { z } from "zod";
import type {
  catalogIdSchema,
  createCatalogInputSchema,
  listCatalogsInputSchema,
  updateCatalogInputSchema,
} from "../../schema/service/catalog";

export type CatalogIdInput = z.infer<typeof catalogIdSchema>;
export type CreateCatalogInput = z.infer<typeof createCatalogInputSchema>;
export type UpdateCatalogInput = z.infer<typeof updateCatalogInputSchema>;
export type ListCatalogsInput = z.infer<typeof listCatalogsInputSchema>;
