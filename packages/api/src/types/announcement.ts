import type { z } from "zod";
import type {
  announcementIdSchema,
  createAnnouncementSchema,
  getAnnouncementInputSchema,
  listAnnouncementsInputSchema,
  updateAnnouncementSchema,
} from "../schema/announcement";

export type AnnouncementIdInput = z.infer<typeof announcementIdSchema>;
export type AnnouncementGetInput = z.infer<typeof getAnnouncementInputSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type ListAnnouncementsInput = z.infer<
  typeof listAnnouncementsInputSchema
>;
