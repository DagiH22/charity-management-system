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
      setSubmitError("Organization name, description and document are required");
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 sm:p-10 my-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Complete Charity Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This is step 2 to finalize your charity registration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Tell donors what your organization does..."
            />
          </div>

          <div>
            <label htmlFor="document" className="mb-1.5 block text-sm font-medium text-slate-700">
              Verification Document
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 transition-all hover:border-slate-300 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
              <input
                id="document"
                type="file"
                accept=".pdf,image/jpeg,image/png"
                required
                onChange={(e) => {
                  const selected = e.target.files?.[0] ?? null;
                  setDocumentFile(selected);
                }}
                className="block w-full text-sm text-slate-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-emerald-700 file:transition-colors hover:file:bg-emerald-100"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Accepted formats: PDF, JPG, JPEG, PNG
              {documentFile ? <span className="font-semibold text-emerald-600 block mt-1">✓ Selected: {documentFile.name}</span> : ""}
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
            >
              {isSubmitting ? "Saving profile..." : "Complete Registration"}
            </button>
          </div>

          {submitError && (
             <div className="rounded-lg bg-red-50 p-3 mt-4">
              <p className="text-sm font-medium text-red-600 text-center">{submitError}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
