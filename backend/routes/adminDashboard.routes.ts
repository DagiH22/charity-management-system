import { Router } from "express";
import { isAdmin, protect } from "../middlewares/auth.middleware";
import {
  getAdminCampaignOversight,
  getAdminCharityVerifications,
  getAdminDonationLogs,
  getAdminOverview,
  getAdminReports,
  getAdminUsers,
} from "../controllers/adminDashboard.controller";

const adminDashboardRouter = Router();

adminDashboardRouter.use(protect, isAdmin);

adminDashboardRouter.get("/overview", getAdminOverview);
adminDashboardRouter.get("/users", getAdminUsers);
adminDashboardRouter.get("/charities", getAdminCharityVerifications);
adminDashboardRouter.get("/campaigns", getAdminCampaignOversight);
adminDashboardRouter.get("/donations", getAdminDonationLogs);
adminDashboardRouter.get("/reports", getAdminReports);

export default adminDashboardRouter;
