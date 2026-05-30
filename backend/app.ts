import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import authRouter from "./routes/auth.routes";
import bankAccountRouter from "./routes/bankAccount.routes";
import charityProfileRouter from "./routes/charityProfile.routes";
import campaignRouter from "./routes/campaign.routes";
import campaignRequestRouter from "./routes/campaignRequest.routes";
import donationRouter from "./routes/donation.routes";
import donorRouter from "./routes/donor.routes";
import charityDashboardRouter from "./routes/charityDashboard.routes";
import notificationRouter from "./routes/notification.routes";
import adminDashboardRouter from "./routes/adminDashboard.routes";
import statsRouter from "./routes/stats.routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import { env } from "./utils/env";
import { prisma } from "./utils/prisma";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: string }).rawBody = buf.toString(
        "utf8",
      );
    },
  }),
);
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/bank-accounts", bankAccountRouter);
app.use("/api/charity-profile", charityProfileRouter);
app.use("/api/campaign", campaignRouter);
app.use("/api/campaign-requests", campaignRequestRouter);
app.use("/api/donation", donationRouter);
app.use("/api/donations", donationRouter);
app.use("/api/donor", donorRouter);
app.use("/api/charity-dashboard", charityDashboardRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin-dashboard", adminDashboardRouter);
app.use("/api/stats", statsRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
