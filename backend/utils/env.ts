import "dotenv/config";

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 5000),
  FRONTEND_URLS: process.env.FRONTEND_URLS ?? "http://localhost:5173",
  MOBILE_RETURN_SCHEMES:
    process.env.MOBILE_RETURN_SCHEMES ?? "charitymanagment",
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  CHAPA_PUBLIC_KEY: process.env.CHAPA_PUBLIC_KEY ?? "",
  CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY ?? "",
  CHAPA_SECRET_HASH: process.env.CHAPA_SECRET_HASH ?? "",
  WEBHOOK_URL: process.env.WEBHOOK_URL ?? undefined,
  EMAIL: getEnv("EMAIL"),
  EMAIL_APP_PASSWORD: getEnv("EMAIL_APP_PASSWORD"),
};
