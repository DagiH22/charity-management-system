import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { createMyCharityProfileRequest, getApiErrorMessage, getAuthToken } from "../services/auth.api";
import { InputField } from "../components/InputField";
import type { User } from "../types/auth";

type CharityProfileSetupPageProps = {
  user: User | null;
  onProfileCompleted: () => void;
};

export default function CharityProfileSetupPage({
  user,
  onProfileCompleted,
}: CharityProfileSetupPageProps) {
  const navigate = useNavigate();

  const [organizationName, setOrganizationName] = useState("");
  const [description, setDescription] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "CHARITY" && user.hasCharityProfile) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "CHARITY") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!organizationName.trim() || !description.trim() || !documentFile) {
      setSubmitError("organizationName, description and document are required");
      return;
    }

    const allowedMimeTypes = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
    ]);

    if (!allowedMimeTypes.has(documentFile.type)) {
      setSubmitError("Only PDF, JPEG, and PNG files are allowed");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setSubmitError("Session expired. Please login again.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      setIsSubmitting(true);

      await createMyCharityProfileRequest(token, {
        organizationName,
        description,
        document: documentFile,
        phone,
        address,
        website,
      });

      onProfileCompleted();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(10,40,80,0.08)]">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">Complete charity profile</h1>
        <p className="mt-2 text-sm text-slate-500">This is step 2 of registration for charity accounts.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <InputField
            id="organizationName"
            type="text"
            label="Organization Name"
            required
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Helping Hands Foundation"
          />

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Tell donors what your organization does..."
            />
          </div>

          <div>
            <label htmlFor="document" className="block text-sm font-semibold text-slate-700">
              Verification Document
            </label>
            <input
              id="document"
              type="file"
              accept=".pdf,image/jpeg,image/png"
              required
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null;
                setDocumentFile(selected);
              }}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Accepted formats: PDF, JPG, JPEG, PNG
              {documentFile ? ` • Selected: ${documentFile.name}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              id="phone"
              type="text"
              label="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 890"
            />

            <InputField
              id="website"
              type="url"
              label="Website (optional)"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://your-charity.org"
            />
          </div>

          <InputField
            id="address"
            type="text"
            label="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, Country"
          />

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Saving profile..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
