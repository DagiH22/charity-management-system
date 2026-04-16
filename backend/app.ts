import express from "express";
import cors from "cors";
import path from "node:path";
import authRouter from "./routes/auth.routes";
import charityProfileRouter from "./routes/charityProfile.routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import { env } from "./utils/env";
import { prisma } from "./utils/prisma";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
	res.status(200).json({
		success: true,
		message: "Authentication API is running",
	});
});

app.use("/auth", authRouter);
app.use("/charity-profile", charityProfileRouter);

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
