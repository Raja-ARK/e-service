import { adminProcedure, protectedProcedure } from "../";
import * as announcementSchema from "../schema/announcement";
import { successResponseSchema } from "../schema/shared";
import * as announcementServices from "../services/announcement";

const list = protectedProcedure
  .route({
    method: "GET",
    path: "/",
    summary: "List Announcements",
    description: "List all announcements",
  })
  .input(announcementSchema.listAnnouncementsInputSchema)
  .output(announcementSchema.listAnnouncementsOutputSchema)
  .handler(async ({ input }) => {
    return await announcementServices.listAnnouncements({ input });
  });

const getById = protectedProcedure
  .route({
    method: "GET",
    path: "/{id}",
    summary: "Get Announcement",
    description: "Get an announcement by id",
  })
  .input(announcementSchema.getAnnouncementInputSchema)
  .output(announcementSchema.announcementOutputSchema)
  .handler(async ({ input }) => {
    return await announcementServices.getAnnouncement({ input });
  });

const create = adminProcedure
  .route({
    method: "POST",
    path: "/",
    summary: "Create Announcement",
    description: "Create a new announcement",
  })
  .input(announcementSchema.createAnnouncementSchema)
  .output(announcementSchema.announcementOutputSchema)
  .handler(async ({ input, context }) => {
    return await announcementServices.createAnnouncement({ input, context });
  });

const update = adminProcedure
  .route({
    method: "PUT",
    path: "/{id}",
    summary: "Update Announcement",
    description: "Update an announcement by id",
  })
  .input(announcementSchema.updateAnnouncementSchema)
  .output(announcementSchema.announcementOutputSchema)
  .handler(async ({ input, context }) => {
    return await announcementServices.updateAnnouncement({ input, context });
  });

const remove = adminProcedure
  .route({
    method: "DELETE",
    path: "/{id}",
    summary: "Delete Announcement",
    description: "Delete an announcement by id",
  })
  .input(announcementSchema.announcementIdSchema)
  .output(successResponseSchema)
  .handler(async ({ input }) => {
    return await announcementServices.deleteAnnouncement({ input });
  });

export const announcementRouter = protectedProcedure
  .tag("Announcement")
  .prefix("/announcements")
  .router({
    list,
    getById,
    create,
    update,
    remove,
  });
