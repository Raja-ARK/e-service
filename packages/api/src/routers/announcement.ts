import { adminProcedure, protectedProcedure } from "../";
import * as announcementSchema from "../schema/announcement";
import { successResponseSchema } from "../schema/shared";
import * as announcementServices from "../services/announcement";

const list = protectedProcedure
  .route({
    method: "GET",
    path: "/announcements",
    summary: "List Announcements",
    tags: ["Announcement"],
  })
  .input(announcementSchema.listAnnouncementsInputSchema)
  .output(announcementSchema.listAnnouncementsOutputSchema)
  .handler(async ({ input }) => {
    return await announcementServices.listAnnouncements({ input });
  });

const getById = protectedProcedure
  .route({
    method: "GET",
    path: "/announcements/{id}",
    summary: "Get Announcement",
    tags: ["Announcement"],
  })
  .input(announcementSchema.getAnnouncementInputSchema)
  .output(announcementSchema.announcementOutputSchema)
  .handler(async ({ input }) => {
    return await announcementServices.getAnnouncement({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/announcements",
    summary: "Create Announcement",
    tags: ["Announcement"],
  })
  .input(announcementSchema.createAnnouncementSchema)
  .output(announcementSchema.announcementOutputSchema)
  .handler(async ({ input, context }) => {
    return await announcementServices.createAnnouncement({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/announcements/{id}",
    summary: "Update Announcement",
    tags: ["Announcement"],
  })
  .input(announcementSchema.updateAnnouncementSchema)
  .output(announcementSchema.announcementOutputSchema)
  .handler(async ({ input, context }) => {
    return await announcementServices.updateAnnouncement({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/announcements/{id}",
    summary: "Delete Announcement",
    tags: ["Announcement"],
  })
  .input(announcementSchema.announcementIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await announcementServices.deleteAnnouncement({ input });
  });

export const announcementRouter = {
  list,
  getById,
  create,
  update,
  remove,
};
