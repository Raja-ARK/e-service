import { relations } from "drizzle-orm";
import { pgTable, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { service } from "./service";

export const catalog = pgTable("catalog", {
  id: text("id").primaryKey(),
  heading: text("point").notNull(),
  headingAr: text("heading_ar").notNull(),
  logo: text("logo").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  serviceId: text("service_id")
    .notNull()
    .references(() => service.id, { onDelete: "cascade" }),
});

export const catalogSubCatalog = pgTable("catalog_sub_catalog", {
  id: text("id").primaryKey(),
  heading: text("heading").notNull(),
  headingAr: text("heading_ar").notNull(),
  order: smallint("order").notNull().default(0),
  catalogId: text("catalog_id")
    .notNull()
    .references(() => catalog.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// point belongs to catalog directly (no subCatalog) OR to a subCatalog
export const catalogPoint = pgTable("catalog_point", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  textAr: text("text_ar").notNull(),
  order: smallint("order").notNull().default(0),
  catalogId: text("catalog_id").references(() => catalog.id, {
    onDelete: "cascade",
  }),
  subCatalogId: text("sub_catalog_id").references(() => catalogSubCatalog.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
