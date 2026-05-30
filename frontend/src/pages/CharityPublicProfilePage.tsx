import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublicCharityProfileRequest } from "../services/charityProfile.api";
import { getApiErrorMessage } from "../services/apiErrors";
import { resolveAssetUrl } from "../utils/media";

type SocialKey =
  | "socialFacebook"
  | "socialTelegram"
  | "socialInstagram"
  | "socialTwitter"
  | "socialYoutube"
  | "socialTiktok";

type PublicCharityProfile = {
  id: number;
  organizationName: string;
  description: string;
  logo?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verifiedAt?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  socialFacebook?: string | null;
  socialTelegram?: string | null;
  socialInstagram?: string | null;
  socialTwitter?: string | null;
  socialYoutube?: string | null;
  socialTiktok?: string | null;
  createdAt: string;
  bankAccounts: Array<{
    id: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    type: "PERSONAL" | "BUSINESS";
    isPrimary: boolean;
  }>;
};

function SocialIcon({ platform }: { platform: SocialKey }) {
  switch (platform) {
    case "socialFacebook":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "socialInstagram":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case "socialTwitter":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      );
    case "socialYoutube":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "socialTiktok":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "socialTelegram":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.984 8.535l-1.977 9.32c-.15.733-.537.915-1.088.569l-3.01-2.22-1.452 1.397c-.16.161-.295.295-.605.295l.217-3.053 5.553-5.019c.242-.22-.053-.34-.373-.12l-6.869 4.332-2.963-.924c-.644-.203-.66-.644.135-.956l11.569-4.461c.54-.203 1.01.132.84.953z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function CharityPublicProfilePage() {
  const { charityId } = useParams<{ charityId: string }>();
  const [profile, setProfile] = useState<PublicCharityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!charityId) {
          setError("Invalid charity id");
          return;
        }
        setLoading(true);
        setError(null);
        const response = await getPublicCharityProfileRequest(Number(charityId));
        setProfile(response.profile);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [charityId]);

  const socialLinks = useMemo(() => {
    if (!profile) return [];

    const entries = [
      {
        key: "socialFacebook" as const,
        label: "Facebook",
        href: profile.socialFacebook,
        color: "text-blue-600",
      },
      {
        key: "socialTelegram" as const,
        label: "Telegram",
        href: profile.socialTelegram,
        color: "text-blue-400",
      },
      {
        key: "socialInstagram" as const,
        label: "Instagram",
        href: profile.socialInstagram,
        color: "text-pink-600",
      },
      {
        key: "socialTwitter" as const,
        label: "X / Twitter",
        href: profile.socialTwitter,
        color: "text-slate-900",
      },
      {
        key: "socialYoutube" as const,
        label: "YouTube",
        href: profile.socialYoutube,
        color: "text-red-600",
      },
      {
        key: "socialTiktok" as const,
        label: "TikTok",
        href: profile.socialTiktok,
        color: "text-black",
      },
    ];

    return entries.filter((entry) => Boolean(entry.href));
  }, [profile]);

  const handleCopyAccountNumber = async (
    accountNumber: string,
    accountId: number,
  ) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccountNumber(accountId);
      window.setTimeout(() => {
        setCopiedAccountNumber((cur) => (cur === accountId ? null : cur));
      }, 1800);
    } catch {
      // ignore clipboard failures
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl py-10">
        <div className="h-[560px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-5xl py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          <p className="font-semibold">{error || "Charity profile not found"}</p>
          <Link
            to="/campaigns"
            className="mt-3 inline-flex text-sm font-semibold text-red-700 underline"
          >
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-10">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Charity Profile
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          {profile.organizationName}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{profile.description}</p>
      </header>

      <div className="space-y-5 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4 border-b border-emerald-100 pb-4">
          <div className="flex items-center gap-4">
            <img
              src={
                resolveAssetUrl(profile.logo) ||
                "https://ui-avatars.com/api/?name=C&background=0b2b53&color=fff"
              }
              alt={profile.organizationName}
              className="h-14 w-14 rounded-full border border-slate-200 object-cover shadow-sm"
            />
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {profile.organizationName}
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            {profile.status}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact Phone
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {profile.phone || "Not added"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:col-span-1 xl:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Address
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {profile.address || "Not added"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Website
            </p>
            {profile.website ? (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-emerald-700 hover:text-emerald-600"
              >
                {profile.website}
              </a>
            ) : (
              <p className="mt-2 text-base font-semibold text-slate-900">Not added</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700">
            Social links
          </h4>
          {socialLinks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {socialLinks.map((entry) => (
                <a
                  key={entry.key}
                  href={entry.href || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${entry.color}`}
                  >
                    <SocialIcon platform={entry.key} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{entry.label}</p>
                    <p className="truncate text-xs text-slate-500">{entry.href}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              No social links added yet.
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700">
            Bank accounts
          </h4>
          {profile.bankAccounts.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {profile.bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-slate-900">{account.bankName}</p>
                      <p className="mt-1 text-sm text-slate-500">{account.accountHolder}</p>
                    </div>
                    {account.isPrimary && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Account Number
                      </p>
                      <p className="mt-1 truncate font-mono text-sm font-semibold text-slate-900">
                        {account.accountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyAccountNumber(account.accountNumber, account.id)
                      }
                      className="inline-flex h-10 min-w-[88px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                      aria-label="Copy account number"
                    >
                      {copiedAccountNumber === account.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              No bank accounts added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
