import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
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
    order: integer("order").default(0),
    isActive: boolean("is_active").default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (table) => [
    unique("lookup_options_type_code_unique").on(table.type, table.code),
    index("lookup_options_type_idx").on(table.type),
    index("lookup_options_type_code_idx").on(table.type, table.code),
  ],
);

// Parent→child lookup dependency mapping (e.g. country→state, state→city)
export const lookupDependencies = pgTable(
  "lookup_dependencies",
  {
    parentType: text("parent_type").notNull(), // e.g. 'country'
    parentCode: text("parent_code").notNull(), // e.g. 'US'
    childType: text("child_type").notNull(), // e.g. 'state'
    childCode: text("child_code").notNull(), // e.g. 'CA'
  },
  (table) => [
    primaryKey({
      columns: [
        table.parentType,
        table.parentCode,
        table.childType,
        table.childCode,
      ],
    }),
    index("lookup_dep_parent_idx").on(table.parentType, table.parentCode),
  ],
);
