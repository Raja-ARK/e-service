import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const uploadedFile = pgTable(
  "uploaded_file",
  {
    key: text("key").primaryKey(),
    uploadedBy: text("uploaded_by")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("uploaded_file_uploaded_by_idx").on(table.uploadedBy),
    index("uploaded_file_created_at_idx").on(table.createdAt),
  ],
);

export const uploadedFileRelations = relations(uploadedFile, ({ one }) => ({
  uploadedBy: one(user, {
    fields: [uploadedFile.uploadedBy],
    references: [user.id],
  }),
}));
