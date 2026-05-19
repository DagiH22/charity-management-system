export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const MAX_IMAGE_SIZE_MB = 5;

export const validateImageFile = (file: File) => {
  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
  }

  const maxSizeBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Image size must be under ${MAX_IMAGE_SIZE_MB}MB.`;
  }

  return null;
};
