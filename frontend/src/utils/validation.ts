import { z } from "zod";

export type CampaignFormValues = {
  title: string;
  description: string;
  targetAmount: string;
  startDate: string;
  endDate: string;
};

export type CampaignFormErrors = Partial<Record<keyof CampaignFormValues, string>>;

export const initialCampaignFormValues: CampaignFormValues = {
  title: "",
  description: "",
  targetAmount: "",
  startDate: "",
  endDate: "",
};

export const campaignSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Campaign title must be at least 3 characters")
      .max(150, "Campaign title must be 150 characters or less"),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters"),
    targetAmount: z.coerce
      .number()
      .positive("Fundraising goal must be greater than 0"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .superRefine((values, context) => {
    const startDate = new Date(values.startDate);
    const endDate = new Date(values.endDate);

    if (Number.isNaN(startDate.getTime())) {
      context.addIssue({
        code: "custom",
        message: "Start date is invalid",
        path: ["startDate"],
      });
    }

    if (Number.isNaN(endDate.getTime())) {
      context.addIssue({
        code: "custom",
        message: "End date is invalid",
        path: ["endDate"],
      });
    }

    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      if (endDate < startDate) {
        context.addIssue({
          code: "custom",
          message: "End date must be after the start date",
          path: ["endDate"],
        });
      }
    }
  });

export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email address";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return null;
};
export const editCampaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be less than 150 characters"),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters"),

  targetAmount: z.coerce
    .number()
    .positive("Target amount must be greater than 0"),

  endDate: z.string().min(1, "End date is required"),
});