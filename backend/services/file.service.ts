import { ApiError } from "../utils/ApiError";

type UploadedFile = {
  filename: string;
};

export const uploadFile = (
  file?: UploadedFile,
  errorMessage: string = "Document file is required",
) => {
  if (!file) {
    throw new ApiError(400, errorMessage);
  }

  return `/uploads/${file.filename}`;
};
