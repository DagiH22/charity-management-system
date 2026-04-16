import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeOriginalName = file.originalname
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const uniqueName = `${Date.now()}-${safeOriginalName}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error("Invalid file type. Only PDF, JPEG, and PNG files are allowed.");
      (error as Error & { code?: string }).code = "INVALID_FILE_TYPE";
      cb(error);
      return;
    }

    cb(null, true);
  },
});
