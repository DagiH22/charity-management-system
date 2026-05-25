import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  campaignSchema,
  initialCampaignFormValues,
  type CampaignFormErrors,
  type CampaignFormValues,
} from "../utils/validation";
import { createCampaign, uploadCampaignImage } from "../services/campaign.api";
import ImageUploadField from "./ImageUploadField";
import { validateImageFile } from "../utils/fileValidation";

export default function CreateCampaignForm() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<CampaignFormValues>(
    initialCampaignFormValues,
  );
  const [errors, setErrors] = useState<CampaignFormErrors>({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const isLimitError =
    submitMessage.toLowerCase().includes("monthly campaign limit") ||
    submitMessage.toLowerCase().includes("request admin approval");

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  const updateField = (field: keyof CampaignFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = campaignSchema.safeParse(formValues);

    if (!result.success) {
      const nextErrors: CampaignFormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CampaignFormValues | undefined;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });

      setErrors(nextErrors);
      setSubmitMessage("");
      return;
    }

    if (imageError) {
      setSubmitMessage("Please fix the campaign image before submitting.");
      return;
    }

    try {
      setErrors({});
      setSubmitMessage("Creating campaign...");

      let imageUrl: string | null | undefined;
      if (imageFile) {
        setIsUploadingImage(true);
        const uploadResponse = await uploadCampaignImage(imageFile, (progress) =>
          setUploadProgress(progress),
        );
        imageUrl = uploadResponse.imageUrl;
      }

      const response = await createCampaign({
        ...result.data,
        imageUrl,
      });

      setFormValues(initialCampaignFormValues);
      setImageFile(null);
      setUploadProgress(0);

      const createdCampaignId = response?.data?.id;
      if (createdCampaignId) {
        navigate(`/campaigns/${createdCampaignId}`, { replace: true });
        return;
      }

      navigate("/campaigns", { replace: true });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setSubmitMessage("");
      } else if (error.response?.data?.message) {
        setErrors(error.response.data.message);
        setSubmitMessage(error.response.data.message);
      } else {
        setSubmitMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(10,40,80,0.04)] sm:p-8">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Campaign Details
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the information below to start your new fundraising campaign.
        </p>
      </div>

      <form className="mt-6 space-y-8" onSubmit={handleSubmit} noValidate>
        <ImageUploadField
          label="Campaign Banner"
          description="Upload a banner image to represent your campaign."
          previewUrl={imagePreview}
          onFileSelect={(file) => {
            if (!file) {
              setImageFile(null);
              setImageError(null);
              return;
            }

            const validationError = validateImageFile(file);
            if (validationError) {
              setImageError(validationError);
              setImageFile(null);
              return;
            }

            setImageError(null);
            setImageFile(file);
          }}
          onRemove={() => {
            setImageFile(null);
            setImageError(null);
          }}
          error={imageError}
          isUploading={isUploadingImage}
          uploadProgress={uploadProgress}
          helperText="JPG, PNG, or WEBP up to 5MB"
          variant="banner"
        />

        <fieldset className="space-y-5">
          <legend className="text-base font-bold text-slate-900 mb-2">
            Basic Information
          </legend>

          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-slate-700"
              htmlFor="title"
            >
              Campaign Title
            </label>
            <input
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
              }`}
              id="title"
              name="title"
              placeholder="Enter campaign title"
              type="text"
              value={formValues.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
            {errors.title && (
              <p className="mt-1.5 text-sm font-medium text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-slate-700"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className={`min-h-36 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
              }`}
              id="description"
              name="description"
              placeholder="Describe your campaign..."
              value={formValues.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
            />
            {errors.description && (
              <p className="mt-1.5 text-sm font-medium text-red-600">
                {errors.description}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset className="pt-6 border-t border-slate-100">
          <legend className="mb-5 text-base font-bold text-slate-900">
            Financial Info
          </legend>

          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-slate-700"
              htmlFor="targetAmount"
            >
              Fundraising Goal
            </label>
            <input
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                errors.targetAmount ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
              }`}
              id="targetAmount"
              min="1"
              name="targetAmount"
              placeholder="Enter target amount"
              step="0.01"
              type="number"
              value={formValues.targetAmount}
              onChange={(event) =>
                updateField("targetAmount", event.target.value)
              }
            />
            {errors.targetAmount && (
              <p className="mt-1.5 text-sm font-medium text-red-600">
                {errors.targetAmount}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset className="pt-6 border-t border-slate-100">
          <legend className="mb-5 text-base font-bold text-slate-900">
            Dates
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-sm font-semibold text-slate-700"
                htmlFor="startDate"
              >
                Start Date
              </label>
              <input
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.startDate ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
                }`}
                id="startDate"
                name="startDate"
                type="date"
                value={formValues.startDate}
                onChange={(event) =>
                  updateField("startDate", event.target.value)
                }
              />
              {errors.startDate && (
                <p className="mt-1.5 text-sm font-medium text-red-600">
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-semibold text-slate-700"
                htmlFor="endDate"
              >
                End Date
              </label>
              <input
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.endDate ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
                }`}
                id="endDate"
                name="endDate"
                type="date"
                value={formValues.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
              />
              {errors.endDate && (
                <p className="mt-1.5 text-sm font-medium text-red-600">
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {submitMessage && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              isLimitError
                ? "border border-amber-200 bg-amber-50 text-amber-800"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{submitMessage}</p>
              {isLimitError && (
                <button
                  type="button"
                  onClick={() => navigate("/charity/campaign-requests")}
                  className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-500"
                >
                  Request approval
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:justify-end">
          <button
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none"
            type="submit"
          >
            Create Campaign
          </button>
        </div>
      </form>
    </section>
  );
}
