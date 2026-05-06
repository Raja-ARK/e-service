import {
  boolean,
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
  ],
);

// Dependency mapping table. id column not required as it is overkill for a dependency mapping table.
export const lookupDependencies = pgTable("lookup_dependencies", {
  parentType: text("parent_type").notNull(), // 'country'
  parentCode: text("parent_code").notNull(), // 'US'
  childType: text("child_type").notNull(), // 'state'
  childCode: text("child_code").notNull(), // 'CA'
});

// Define composite keys if needed
export const lookupDependenciesWithKey = pgTable(
  "lookup_dependencies",
  {
    parentType: text("parent_type").notNull(),
    parentCode: text("parent_code").notNull(),
    childType: text("child_type").notNull(),
    childCode: text("child_code").notNull(),
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
  ],
);
