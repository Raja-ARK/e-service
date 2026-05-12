import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const lookupOptions = pgTable(
  "lookup_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(),
    code: text("code").notNull(),
    label: text("label").notNull(),
    labelAr: text("label_ar").notNull(),
    parentType: text("parent_type"),
    parentCode: text("parent_code"),
    order: integer("order").default(0),
    isActive: boolean("is_active").default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (table) => [
    unique("lookup_options_type_code_unique").on(table.type, table.code),
    index("lookup_options_type_idx").on(table.type),
    index("lookup_options_type_code_idx").on(table.type, table.code),
    index("lookup_options_parent_idx").on(table.parentType, table.parentCode),
    foreignKey({
      name: "lookup_options_parent_fk",
      columns: [table.parentType, table.parentCode],
      foreignColumns: [table.type, table.code],
    }),
  ],
);
