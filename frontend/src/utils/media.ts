import { apiBaseUrl } from "../services/httpClient";

export const resolveAssetUrl = (path?: string | null) => {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${apiBaseUrl}${path}`;
};
