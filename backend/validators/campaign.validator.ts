import { z } from "zod";

export const createCampaignSchema = z
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
    imageUrl: z.string().trim().optional(),
  })
  .superRefine((values, context) => {
    const startDate = new Date(values.startDate);
    const endDate = new Date(values.endDate);

    if (Number.isNaN(startDate.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date is invalid",
        path: ["startDate"],
      });
    }

    if (Number.isNaN(endDate.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is invalid",
        path: ["endDate"],
      });
    }

    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime())
    ) {
      if (endDate < startDate) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after the start date",
          path: ["endDate"],
        });
      }
    }
  });

export const updateCampaignSchema = z
  .object({
    title: z.string().trim().min(3).max(150),

    description: z.string().trim().min(20),

    targetAmount: z.coerce.number().positive(),

    endDate: z.string(),
    imageUrl: z.string().trim().nullable().optional(),
  })
  .partial();
