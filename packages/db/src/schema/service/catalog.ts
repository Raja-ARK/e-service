import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { service } from "./service";

export const catalog = pgTable(
  "catalog",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    heading: text("heading").notNull(),
    headingAr: text("heading_ar").notNull(),
    logo: text("logo").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
  },
  (table) => [index("catalog_service_id_idx").on(table.serviceId)],
);

export const catalogSubCatalog = pgTable(
  "catalog_sub_catalog",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    heading: text("heading").notNull(),
    headingAr: text("heading_ar").notNull(),
    order: smallint("order").notNull().default(0),
    catalogId: uuid("catalog_id")
      .notNull()
      .references(() => catalog.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("catalog_sub_catalog_catalog_id_idx").on(table.catalogId)],
);

// point belongs to catalog directly (no subCatalog) OR to a subCatalog
export const catalogPoint = pgTable(
  "catalog_point",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    text: text("text").notNull(),
    textAr: text("text_ar").notNull(),
    order: smallint("order").notNull().default(0),
    catalogId: uuid("catalog_id").references(() => catalog.id, {
      onDelete: "cascade",
    }),
    subCatalogId: uuid("sub_catalog_id").references(
      () => catalogSubCatalog.id,
      {
        onDelete: "cascade",
      },
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("catalog_point_catalog_id_idx").on(table.catalogId),
    index("catalog_point_sub_catalog_id_idx").on(table.subCatalogId),
  ],
);

export const catalogRelations = relations(catalog, ({ one, many }) => ({
  service: one(service, {
    fields: [catalog.serviceId],
    references: [service.id],
  }),
  subCatalogs: many(catalogSubCatalog),
  points: many(catalogPoint),
}));

export const catalogSubCatalogRelations = relations(
  catalogSubCatalog,
  ({ one, many }) => ({
    catalog: one(catalog, {
      fields: [catalogSubCatalog.catalogId],
      references: [catalog.id],
    }),
    points: many(catalogPoint),
  }),
);

export const catalogPointRelations = relations(catalogPoint, ({ one }) => ({
  catalog: one(catalog, {
    fields: [catalogPoint.catalogId],
    references: [catalog.id],
  }),
  subCatalog: one(catalogSubCatalog, {
    fields: [catalogPoint.subCatalogId],
    references: [catalogSubCatalog.id],
  }),
}));
