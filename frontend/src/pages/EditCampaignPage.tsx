import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { editCampaignSchema } from "../utils/validation";
import type { EditCampaignFormValues } from "../types/campaign";
import { getAuthToken } from "../services/auth.api";
import {
  getCampaignById,
  updateCampaign,
  closeCampaign,
  uploadCampaignImage,
} from "../services/campaign.api";
import ImageUploadField from "../components/ImageUploadField";
import { validateImageFile } from "../utils/fileValidation";
import { resolveAssetUrl } from "../utils/media";

type EditCampaignErrors = Partial<Record<keyof EditCampaignFormValues, string>>;

const EditCampaign = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [campaignStatus, setCampaignStatus] = useState<string>("");
  const [errors, setErrors] = useState<EditCampaignErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formValues, setFormValues] = useState<EditCampaignFormValues>({
    title: "",
    description: "",
    targetAmount: "",
    endDate: "",
  });

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

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const data = await getCampaignById(token, id);

        const campaign = data.data;

        setCampaignStatus(campaign.status);
        setFormValues({
          title: campaign.title,
          description: campaign.description,
          targetAmount: campaign.targetAmount,
          endDate: campaign.endDate.split("T")[0],
        });
        setImageUrl(campaign.imageUrl || null);
      } catch (error: any) {
        if (error.response?.data?.message) {
          setSubmitMessage(error.response.data.message);
        } else {
          setSubmitMessage("Failed to load campaign");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof EditCampaignErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = editCampaignSchema.safeParse(formValues);

    if (!result.success) {
      const nextErrors: EditCampaignErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof EditCampaignFormValues;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });

      setErrors(nextErrors);

      return;
    }

    if (imageError) {
      setSubmitMessage("Please fix the campaign image before saving.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMessage("");

      const token = getAuthToken();
      if (!token) return;
      let nextImageUrl = imageUrl;
      if (imageFile) {
        setIsUploadingImage(true);
        const uploadResponse = await uploadCampaignImage(
          token,
          imageFile,
          (progress) => setUploadProgress(progress),
        );
        nextImageUrl = uploadResponse.imageUrl;
      }

      await updateCampaign(token, id, {
        ...result.data,
        imageUrl: nextImageUrl,
      });

      setSubmitMessage("Campaign updated successfully 🎉");

      setTimeout(() => {
        navigate("/dashboard/my-campaigns");
      }, 1500);
    } catch (error: any) {
      setSubmitMessage(
        error.response?.data?.message || "Failed to update campaign",
      );
    } finally {
      setSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  const handleCloseCampaign = async () => {
    if (
      !window.confirm(
        "Are you sure you want to close this campaign? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setClosing(true);
      setSubmitMessage("");

      const token = getAuthToken();
      if (!token) return;

      await closeCampaign(token, id);

      setSubmitMessage("Campaign closed successfully 🎉");
      setCampaignStatus("Closed");

      setTimeout(() => {
        navigate("/dashboard/my-campaigns");
      }, 1500);
    } catch (error: any) {
      setSubmitMessage(
        error.response?.data?.message || "Failed to close campaign",
      );
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-600">Loading campaign...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Edit Campaign</h1>

          <p className="mt-2 text-gray-500">
            Update your fundraising campaign details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ImageUploadField
            label="Campaign Banner"
            description="Update your campaign banner image."
            previewUrl={imagePreview || resolveAssetUrl(imageUrl)}
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
              setImageUrl(null);
              setImageError(null);
            }}
            error={imageError}
            isUploading={isUploadingImage}
            uploadProgress={uploadProgress}
            helperText="JPG, PNG, or WEBP up to 5MB"
            variant="banner"
          />

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Campaign Title
            </label>

            <input
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500"
            />

            {errors.title && (
              <p className="mt-2 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              rows={6}
              value={formValues.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500"
            />

            {errors.description && (
              <p className="mt-2 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Target Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Fundraising Goal
            </label>

            <input
              type="number"
              name="targetAmount"
              value={formValues.targetAmount}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500"
            />

            {errors.targetAmount && (
              <p className="mt-2 text-sm text-red-500">{errors.targetAmount}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={formValues.endDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500"
            />

            {errors.endDate && (
              <p className="mt-2 text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Updating Campaign..." : "Update Campaign"}
          </button>

          {/* Close Campaign Button */}
          {campaignStatus !== "Closed" && (
            <button
              type="button"
              onClick={handleCloseCampaign}
              disabled={closing}
              className="w-full rounded-xl bg-red-600 py-3 text-lg font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {closing ? "Closing Campaign..." : "Close Campaign"}
            </button>
          )}

          {/* Message */}
          {submitMessage && (
            <div className="rounded-xl bg-gray-100 p-4 text-sm text-gray-700">
              {submitMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditCampaign;
