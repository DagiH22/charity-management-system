import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../services/apiErrors";
import {
  getMyProfileRequest,
  resetPasswordRequest,
  updateMyProfileRequest,
} from "../services/auth.api";
import {
  createBankAccountRequest,
  deleteBankAccountRequest,
  updateBankAccountRequest,
} from "../services/bankAccount.api";
import { updateMyCharityProfileRequest } from "../services/charityProfile.api";
import { useAuthStore } from "../store/authStore";
import { resolveAssetUrl } from "../utils/media";
import {
  EMPTY_SOCIAL_LINKS,
} from "./profile/profilePage.constants";
import {
  ProfileErrorState,
  ProfileLoadingState,
  ProfileMainCard,
  ProfilePageHeader,
  ProfileSettingsSidebar,
} from "./profile/profilePage.components";
import type {
  EditingBankAccount,
  ProfileData,
  SocialKey,
  SocialLinks,
  CharityProfile,
} from "./profile/profilePage.types";

export default function ProfilePage() {
  const { setAuthSession } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Personal profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Charity contact fields
  const [charityPhone, setCharityPhone] = useState("");
  const [charityAddress, setCharityAddress] = useState("");
  const [charityWebsite, setCharityWebsite] = useState("");

  // ✅ Single object replaces 6 individual social link states
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(EMPTY_SOCIAL_LINKS);

  const [editingBankAccounts, setEditingBankAccounts] = useState<EditingBankAccount[]>([]);

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [copiedAccountNumber, setCopiedAccountNumber] = useState<number | null>(null);

  const syncProfileForm = (data: ProfileData) => {
    setName(data.user.name);
    setPhone(data.user.phone ?? "");
    setBio(data.user.bio ?? "");
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setRemoveProfileImage(false);
    setUploadProgress(null);

    if (data.charityProfile) {
      const cp = data.charityProfile as CharityProfile;
      setCharityPhone(cp.phone ?? "");
      setCharityAddress(cp.address ?? "");
      setCharityWebsite(cp.website ?? "");
      setSocialLinks({
        socialFacebook: cp.socialFacebook ?? "",
        socialTelegram: cp.socialTelegram ?? "",
        socialInstagram: cp.socialInstagram ?? "",
        socialTwitter: cp.socialTwitter ?? "",
        socialYoutube: cp.socialYoutube ?? "",
        socialTiktok: cp.socialTiktok ?? "",
      });
    }

    setEditingBankAccounts(
      (data.bankAccounts ?? []).map((b) => ({
        id: b.id,
        bankName: b.bankName ?? "",
        accountNumber: b.accountNumber ?? "",
        accountHolder: b.accountHolder ?? "",
        type: b.type ?? "PERSONAL",
        isPrimary: !!b.isPrimary,
      })),
    );
  };

  const patchBankAccount = (idx: number, patch: Partial<EditingBankAccount>) => {
    setEditingBankAccounts((prev) =>
      prev.map((acct, i) => (i === idx ? { ...acct, ...patch } : acct)),
    );
  };

  const removeBankAccount = (idx: number) => {
    setEditingBankAccounts((prev) => {
      const copy = [...prev];
      if (copy[idx].id) {
        copy[idx] = { ...copy[idx], toDelete: true };
      } else {
        copy.splice(idx, 1);
      }
      return copy;
    });
  };

  const handleCopyAccountNumber = async (accountNumber: string, accountId: number) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccountNumber(accountId);
      window.setTimeout(() => {
        setCopiedAccountNumber((cur) => (cur === accountId ? null : cur));
      }, 1800);
    } catch {
      // clipboard unavailable
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getMyProfileRequest();
        setProfile(response.data);
        syncProfileForm(response.data);
        setIsEditingProfile(false);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    void loadProfile();
  }, []);

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImageFile]);

  const currentImageUrl = useMemo(() => {
    if (profileImagePreview) return profileImagePreview;
    if (removeProfileImage) return null;
    return resolveAssetUrl(profile?.user.profileImage);
  }, [profile?.user.profileImage, profileImagePreview, removeProfileImage]);

  const isCharity = profile?.user.role === "CHARITY";
  const userInitial = (profile?.user.name ?? "U").trim().charAt(0).toUpperCase();

  const activeSocialLinks = useMemo(
    () =>
      (Object.entries(socialLinks) as [SocialKey, string][])
        .map(([key, href]) => {
          const entry = { ...SOCIAL_LINK_MAP[key], href };
          return entry;
        })
        .filter((entry) => Boolean(entry.href)),
    [socialLinks],
  );

  const handleProfileUpdate = async () => {
    if (!profile) return;

    try {
      setIsSavingProfile(true);
      setProfileMessage(null);
      setError(null);

      await updateMyProfileRequest(
        { name, phone, bio, profileImage: profileImageFile, removeProfileImage },
        setUploadProgress,
      );

      if (isCharity) {
        await updateMyCharityProfileRequest(
          { phone: charityPhone, address: charityAddress, website: charityWebsite, ...socialLinks },
          setUploadProgress,
        );

        // Sync bank accounts: deletions first, then upserts
        await Promise.allSettled(
          editingBankAccounts
            .filter((a) => a.toDelete && a.id)
            .map((a) => deleteBankAccountRequest(a.id!)),
        );

        await Promise.allSettled(
          editingBankAccounts
            .filter((a) => !a.toDelete)
            .map((a) => {
              const payload = {
                bankName: a.bankName,
                accountNumber: a.accountNumber,
                accountHolder: a.accountHolder,
                type: a.type,
                isPrimary: a.isPrimary,
              };
              return a.id
                ? updateBankAccountRequest(a.id, payload)
                : createBankAccountRequest(payload);
            }),
        );
      }

      const updatedProfile = await getMyProfileRequest();
      setProfile(updatedProfile.data);
      setProfileImageFile(null);
      setRemoveProfileImage(false);
      setUploadProgress(null);
      setProfileMessage("Profile updated successfully!");
      setAuthSession(updatedProfile.data.user);
      setIsEditingProfile(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStartEditing = () => {
    if (!profile) return;
    setError(null);
    setProfileMessage(null);
    syncProfileForm(profile);
    setIsEditingProfile(true);
  };

  const handleCancelEditing = () => {
    if (!profile) return;
    setError(null);
    setProfileMessage(null);
    syncProfileForm(profile);
    setIsEditingProfile(false);
  };

  const handlePasswordUpdate = async () => {
    setPasswordMessage(null);
    setPasswordError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    try {
      setIsSavingPassword(true);
      const response = await resetPasswordRequest({ oldPassword, newPassword });
      setPasswordMessage(response.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAuthSession(response.user);
    } catch (err) {
      setPasswordError(getApiErrorMessage(err));
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  if (error && !profile) {
    return <ProfileErrorState message={error} />;
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <ProfilePageHeader role={profile.user.role} />

      {profileMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {profileMessage}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileMainCard
          profile={profile}
          currentImageUrl={currentImageUrl}
          userInitial={userInitial}
          isEditingProfile={isEditingProfile}
          isCharity={isCharity}
          onStartEditing={handleStartEditing}
          editModeProps={{
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
            onAddBankAccount: () =>
              setEditingBankAccounts((prev) => [
                ...prev,
                {
                  bankName: "",
                  accountNumber: "",
                  accountHolder: "",
                  type: "PERSONAL",
                  isPrimary: false,
                },
              ]),
            onChangeBankAccount: patchBankAccount,
            onRemoveBankAccount: removeBankAccount,
            onCancelEditing: handleCancelEditing,
            onSaveProfile: () => void handleProfileUpdate(),
          }}
          viewModeProps={{
            profile,
            activeSocialLinks,
            copiedAccountNumber,
            onCopyAccountNumber: handleCopyAccountNumber,
          }}
        />

        <ProfileSettingsSidebar
          oldPassword={oldPassword}
          setOldPassword={setOldPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          passwordError={passwordError}
          passwordMessage={passwordMessage}
          isSavingPassword={isSavingPassword}
          onUpdatePassword={() => void handlePasswordUpdate()}
        />
      </div>
    </div>
  );
}

const SOCIAL_LINK_MAP: Record<SocialKey, { key: SocialKey; label: string; color: string }> = {
  socialFacebook: { key: "socialFacebook", label: "Facebook", color: "text-blue-600" },
  socialTelegram: { key: "socialTelegram", label: "Telegram", color: "text-blue-400" },
  socialInstagram: { key: "socialInstagram", label: "Instagram", color: "text-pink-600" },
  socialTwitter: { key: "socialTwitter", label: "X / Twitter", color: "text-slate-900" },
  socialYoutube: { key: "socialYoutube", label: "YouTube", color: "text-red-600" },
  socialTiktok: { key: "socialTiktok", label: "TikTok", color: "text-black" },
};