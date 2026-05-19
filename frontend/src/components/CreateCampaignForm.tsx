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
import { getAuthToken } from "../services/auth.api";
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
    const token = getAuthToken();

    if (!token) {
      return;
    }
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
        const uploadResponse = await uploadCampaignImage(
          token,
          imageFile,
          (progress) => setUploadProgress(progress),
        );
        imageUrl = uploadResponse.imageUrl;
      }

      await createCampaign(token, {
        ...result.data,
        imageUrl,
      });

      setSubmitMessage("Campaign created successfully");

      setFormValues(initialCampaignFormValues);
      setImageFile(null);
      setUploadProgress(0);
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
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(10,40,80,0.05)] sm:p-8">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-[#0b2b53]">
          Create Campaign Form
        </h2>
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
          <legend className="text-base font-bold text-[#0b2b53]">
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
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0b2b53] focus:ring-4 focus:ring-[#0b2b53]/10 ${
                errors.title ? "border-rose-300" : "border-slate-200"
              }`}
              id="title"
              name="title"
              placeholder="Enter campaign title"
              type="text"
              value={formValues.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
            {errors.title && (
              <p className="mt-1.5 text-sm font-medium text-rose-600">
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
              className={`min-h-36 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0b2b53] focus:ring-4 focus:ring-[#0b2b53]/10 ${
                errors.description ? "border-rose-300" : "border-slate-200"
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
              <p className="mt-1.5 text-sm font-medium text-rose-600">
                {errors.description}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-5 text-base font-bold text-[#0b2b53]">
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
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0b2b53] focus:ring-4 focus:ring-[#0b2b53]/10 ${
                errors.targetAmount ? "border-rose-300" : "border-slate-200"
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
              <p className="mt-1.5 text-sm font-medium text-rose-600">
                {errors.targetAmount}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-5 text-base font-bold text-[#0b2b53]">
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
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0b2b53] focus:ring-4 focus:ring-[#0b2b53]/10 ${
                  errors.startDate ? "border-rose-300" : "border-slate-200"
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
                <p className="mt-1.5 text-sm font-medium text-rose-600">
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
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0b2b53] focus:ring-4 focus:ring-[#0b2b53]/10 ${
                  errors.endDate ? "border-rose-300" : "border-slate-200"
                }`}
                id="endDate"
                name="endDate"
                type="date"
                value={formValues.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
              />
              {errors.endDate && (
                <p className="mt-1.5 text-sm font-medium text-rose-600">
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {submitMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {submitMessage}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_22px_rgba(14,204,110,0.22)] transition hover:-translate-y-[1px] hover:bg-emerald-600"
            type="submit"
          >
            Create Campaign
          </button>
        </div>
      </form>
    </section>
  );
}
