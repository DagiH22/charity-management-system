import {
  BanknotesIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
  LinkIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import type { Dispatch, SetStateAction } from "react";
import ImageUploadField from "../../components/ImageUploadField";
import Avatar from "../../components/Avatar";
import type {
  ActiveSocialLink,
  EditingBankAccount,
  ProfileData,
  SocialKey,
  SocialLinks,
} from "./profilePage.types";
import { SOCIAL_ENTRIES, SOCIAL_PLACEHOLDERS } from "./profilePage.constants";

export function ProfileLoadingState() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="h-[560px] animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
      <div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

export function ProfileErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
      <p className="font-semibold">{message}</p>
    </div>
  );
}

export function ProfilePageHeader({ role }: { role: string }) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            My Profile
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            View your profile details, then switch to edit mode when needed.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 shadow-sm">
          {role}
        </div>
      </div>
    </header>
  );
}

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
      return <LinkIcon className="h-5 w-5" />;
  }
}

function BankAccountCard({
  account,
  copiedId,
  onCopy,
}: {
  account: ProfileData["bankAccounts"][number];
  copiedId: number | null;
  onCopy: (accountNumber: string, id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-slate-900">
            {account.bankName}
          </p>
          <p className="mt-1 text-sm text-slate-500">{account.accountHolder}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {account.isPrimary && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Primary
            </span>
          )}
        </div>
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
          onClick={() => onCopy(account.accountNumber, account.id)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
          aria-label="Copy account number"
        >
          {copiedId === account.id ? (
            <CheckIcon className="h-5 w-5 text-emerald-600" />
          ) : (
            <ClipboardDocumentIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function EditingBankAccountRow({
  acct,
  idx,
  onChange,
  onRemove,
}: {
  acct: EditingBankAccount;
  idx: number;
  onChange: (idx: number, patch: Partial<EditingBankAccount>) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <input
            value={acct.bankName}
            onChange={(e) => onChange(idx, { bankName: e.target.value })}
            placeholder="Bank name"
            autoComplete="new-password"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          />
          <input
            value={acct.accountHolder}
            onChange={(e) => onChange(idx, { accountHolder: e.target.value })}
            placeholder="Account holder"
            autoComplete="new-password"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div className="w-40 space-y-2">
          <input
            value={acct.accountNumber}
            onChange={(e) => onChange(idx, { accountNumber: e.target.value })}
            placeholder="Account number"
            autoComplete="new-password"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          />
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={acct.isPrimary}
                onChange={(e) => onChange(idx, { isPrimary: e.target.checked })}
              />
              Primary
            </label>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="rounded-xl border border-red-200 bg-white px-3 py-1 text-sm text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function ProfileAvatar({
  src,
  fallback,
  alt,
}: {
  src: string | null;
  fallback: string;
  alt: string;
}) {
  return (
    <Avatar
      src={src ?? undefined}
      name={fallback}
      alt={alt}
      size="lg"
      withBorder
      className="shadow-sm"
    />
  );
}

function ProfileEditMode({
  profile,
  currentImageUrl,
  uploadProgress,
  isSavingProfile,
  name,
  setName,
  bio,
  setBio,
  setProfileImageFile,
  setRemoveProfileImage,
  charityPhone,
  setCharityPhone,
  charityAddress,
  setCharityAddress,
  charityWebsite,
  setCharityWebsite,
  socialLinks,
  setSocialLinks,
  editingBankAccounts,
  onAddBankAccount,
  onChangeBankAccount,
  onRemoveBankAccount,
  onCancelEditing,
  onSaveProfile,
}: {
  profile: ProfileData;
  currentImageUrl: string | null;
  uploadProgress: number | null;
  isSavingProfile: boolean;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  bio: string;
  setBio: Dispatch<SetStateAction<string>>;
  setProfileImageFile: (file: File | null) => void;
  setRemoveProfileImage: Dispatch<SetStateAction<boolean>>;
  charityPhone: string;
  setCharityPhone: Dispatch<SetStateAction<string>>;
  charityAddress: string;
  setCharityAddress: Dispatch<SetStateAction<string>>;
  charityWebsite: string;
  setCharityWebsite: Dispatch<SetStateAction<string>>;
  socialLinks: SocialLinks;
  setSocialLinks: Dispatch<SetStateAction<SocialLinks>>;
  editingBankAccounts: EditingBankAccount[];
  onAddBankAccount: () => void;
  onChangeBankAccount: (
    idx: number,
    patch: Partial<EditingBankAccount>,
  ) => void;
  onRemoveBankAccount: (idx: number) => void;
  onCancelEditing: () => void;
  onSaveProfile: () => void;
}) {
  return (
    <div className="space-y-5">
      <ImageUploadField
        label="Profile Image"
        description="Upload a clear profile image."
        variant="logo"
        previewUrl={currentImageUrl}
        uploadProgress={uploadProgress}
        isUploading={isSavingProfile}
        onFileSelect={(file) => {
          setProfileImageFile(file);
          if (file) setRemoveProfileImage(false);
        }}
        onRemove={() => {
          setProfileImageFile(null);
          setRemoveProfileImage(true);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            value={profile.user.email}
            disabled
            className="block w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Role
          </label>
          <input
            value={profile.user.role}
            disabled
            className="block w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          placeholder="Tell people about yourself"
        />
      </div>

      {profile.user.role === "CHARITY" && (
        <div className="space-y-5 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
          <div className="border-b border-emerald-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Charity Information
            </p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900">
              Edit Your Charity Profile
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                value={charityPhone}
                onChange={(e) => setCharityPhone(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                placeholder="Contact phone number"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Website
              </label>
              <input
                value={charityWebsite}
                onChange={(e) => setCharityWebsite(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              value={charityAddress}
              onChange={(e) => setCharityAddress(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              placeholder="Your organization address"
            />
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700">
              Social Links
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_ENTRIES.map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    {label}
                  </label>
                  <input
                    value={socialLinks[key]}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                    placeholder={SOCIAL_PLACEHOLDERS[key]}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-700">
              Bank Accounts
            </h4>
            <div className="space-y-3">
              {editingBankAccounts
                .filter((a) => !a.toDelete)
                .map((acct, idx) => (
                  <EditingBankAccountRow
                    key={acct.id ?? `new-${idx}`}
                    acct={acct}
                    idx={idx}
                    onChange={onChangeBankAccount}
                    onRemove={onRemoveBankAccount}
                  />
                ))}
              <button
                type="button"
                onClick={onAddBankAccount}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Add Bank Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancelEditing}
          disabled={isSavingProfile}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSaveProfile}
          disabled={isSavingProfile}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {isSavingProfile ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function ProfileViewMode({
  profile,
  isCharity,
  activeSocialLinks,
  copiedAccountNumber,
  onCopyAccountNumber,
}: {
  profile: ProfileData;
  isCharity: boolean;
  activeSocialLinks: ActiveSocialLink[];
  copiedAccountNumber: number | null;
  onCopyAccountNumber: (accountNumber: string, accountId: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            ["Full Name", profile.user.name],
            ["Email", profile.user.email],
            ["Role", profile.user.role],
          ] as [string, string][]
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Bio
        </p>
        <p className="mt-2 text-lg font-bold text-slate-900">
          {profile.user.bio ?? "No bio added yet."}
        </p>
      </div>

      {isCharity && profile.charityProfile && (
        <div className="space-y-5 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-emerald-100 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Charity Profile
              </p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
                {profile.charityProfile.organizationName}
              </h3>
            </div>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {profile.charityProfile.status}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <PhoneIcon className="h-4 w-4 text-emerald-600" />
                Contact Phone
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {profile.charityProfile.phone ?? "Not added"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:col-span-1 xl:col-span-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <MapPinIcon className="h-4 w-4 text-emerald-600" />
                Address
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {profile.charityProfile.address ?? "Not added"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Website
              </p>
              {profile.charityProfile.website ? (
                <a
                  href={profile.charityProfile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-emerald-700 hover:text-emerald-600"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  {profile.charityProfile.website}
                </a>
              ) : (
                <p className="mt-2 text-base font-semibold text-slate-900">
                  Not added
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-emerald-600" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Social links
              </h4>
            </div>
            {activeSocialLinks.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeSocialLinks.map((entry) => (
                  <a
                    key={entry.key}
                    href={entry.href}
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
                      <p className="text-sm font-bold text-slate-900">
                        {entry.label}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {entry.href}
                      </p>
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
            <div className="mb-3 flex items-center gap-2">
              <BanknotesIcon className="h-4 w-4 text-emerald-600" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Bank accounts
              </h4>
            </div>
            {profile.bankAccounts.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {profile.bankAccounts.map((account) => (
                  <BankAccountCard
                    key={account.id}
                    account={account}
                    copiedId={copiedAccountNumber}
                    onCopy={onCopyAccountNumber}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                No bank accounts added yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export type ProfileMainCardProps = {
  profile: ProfileData;
  currentImageUrl: string | null;
  userInitial: string;
  isEditingProfile: boolean;
  isCharity: boolean;
  onStartEditing: () => void;
  editModeProps: Omit<
    Parameters<typeof ProfileEditMode>[0],
    "profile" | "currentImageUrl" | "isSavingProfile" | "isCharity"
  > & {
    isSavingProfile: boolean;
    profile: ProfileData;
    currentImageUrl: string | null;
  };
  viewModeProps: Omit<
    Parameters<typeof ProfileViewMode>[0],
    "profile" | "isCharity"
  > & {
    profile: ProfileData;
  };
};

export function ProfileMainCard({
  profile,
  currentImageUrl,
  userInitial,
  isEditingProfile,
  isCharity,
  onStartEditing,
  editModeProps,
  viewModeProps,
}: ProfileMainCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            src={currentImageUrl}
            fallback={userInitial}
            alt={profile.user.name}
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditingProfile
                ? "Edit Profile"
                : isCharity && profile.charityProfile
                  ? profile.charityProfile.organizationName
                  : "My Profile"}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditingProfile
                ? "Update your personal details and save when you are done."
                : isCharity
                  ? "Your personal details, charity profile, social links, and bank accounts."
                  : "Your profile summary and account information."}
            </p>
          </div>
        </div>
        {!isEditingProfile && (
          <button
            type="button"
            onClick={onStartEditing}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditingProfile ? (
        <ProfileEditMode {...editModeProps} />
      ) : (
        <ProfileViewMode {...viewModeProps} isCharity={isCharity} />
      )}
    </section>
  );
}

export function ProfileSettingsSidebar({
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  passwordMessage,
  isSavingPassword,
  onUpdatePassword,
}: {
  oldPassword: string;
  setOldPassword: Dispatch<SetStateAction<string>>;
  newPassword: string;
  setNewPassword: Dispatch<SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
  passwordError: string | null;
  passwordMessage: string | null;
  isSavingPassword: boolean;
  onUpdatePassword: () => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Settings</h2>
      <p className="mt-1 text-sm text-slate-500">
        Change your password to keep your account secure.
      </p>

      <div className="mt-5 space-y-4">
        {(
          [
            ["Current Password", oldPassword, setOldPassword],
            ["New Password", newPassword, setNewPassword],
            ["Confirm New Password", confirmPassword, setConfirmPassword],
          ] as [string, string, Dispatch<SetStateAction<string>>][]
        ).map(([label, value, setter]) => (
          <div key={label}>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {label}
            </label>
            <input
              type="password"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
          </div>
        ))}

        {passwordError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {passwordError}
          </div>
        )}
        {passwordMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            {passwordMessage}
          </div>
        )}

        <button
          type="button"
          onClick={onUpdatePassword}
          disabled={isSavingPassword}
          className="w-full rounded-xl bg-[#0b2b53] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123a67] disabled:opacity-60"
        >
          {isSavingPassword ? "Updating..." : "Update Password"}
        </button>
      </div>
    </aside>
  );
}
