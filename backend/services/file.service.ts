import { ApiError } from "../utils/ApiError";

type UploadedFile = {
  filename: string;
};

export const uploadFile = (file?: UploadedFile) => {
  if (!file) {
    throw new ApiError(400, "Document file is required");
  }

  return `/uploads/${file.filename}`;
};
