import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  removeNotification,
} from "../controllers/notification.controller";

const notificationRouter = Router();

notificationRouter.use(protect);
notificationRouter.use(authorize("DONOR", "CHARITY", "ADMIN"));

notificationRouter.get("/", getNotifications);
notificationRouter.patch("/:id/read", markNotificationRead);
notificationRouter.patch("/read-all", markAllNotificationsRead);
notificationRouter.delete("/:id", removeNotification);

export default notificationRouter;
