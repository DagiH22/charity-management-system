import express from "express";
import cors from "cors";
import path from "node:path";
import authRouter from "./routes/auth.routes";
import charityProfileRouter from "./routes/charityProfile.routes";
import campaignRouter from "./routes/campaign.routes";
import donorRouter from "./routes/donor.routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import { env } from "./utils/env";
import { prisma } from "./utils/prisma";

const app = express();

const allowedOrigins = env.FRONTEND_URLS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/charity-profile", charityProfileRouter);
app.use("/api/campaign", campaignRouter);
app.use("/api/donor", donorRouter);

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
