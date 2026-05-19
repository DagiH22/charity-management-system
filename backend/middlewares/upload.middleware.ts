import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const documentMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

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
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!documentMimeTypes.has(file.mimetype)) {
      const error = new Error(
        "Invalid file type. Only PDF, JPG, JPEG, PNG, and WEBP files are allowed.",
      );
      (error as Error & { code?: string }).code = "INVALID_FILE_TYPE";
      cb(error);
      return;
    }

    cb(null, true);
  },
});

export const imageUpload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!imageMimeTypes.has(file.mimetype)) {
      const error = new Error(
        "Invalid image type. Only JPG, JPEG, PNG, and WEBP files are allowed.",
      );
      (error as Error & { code?: string }).code = "INVALID_FILE_TYPE";
      cb(error);
      return;
    }

    cb(null, true);
  },
});

export const profileUpload = multer({
  storage,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "document") {
      if (!documentMimeTypes.has(file.mimetype)) {
        const error = new Error(
          "Invalid document type. Only PDF, JPG, JPEG, PNG, and WEBP files are allowed.",
        );
        (error as Error & { code?: string }).code = "INVALID_FILE_TYPE";
        cb(error);
        return;
      }

      cb(null, true);
      return;
    }

    if (file.fieldname === "logo") {
      if (!imageMimeTypes.has(file.mimetype)) {
        const error = new Error(
          "Invalid logo type. Only JPG, JPEG, PNG, and WEBP files are allowed.",
        );
        (error as Error & { code?: string }).code = "INVALID_FILE_TYPE";
        cb(error);
        return;
      }

      cb(null, true);
      return;
    }

    const error = new Error("Unexpected upload field");
    (error as Error & { code?: string }).code = "INVALID_FILE_TYPE";
    cb(error);
  },
});
