export type AuthRole = "DONOR" | "CHARITY" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  isVerified: boolean;
  isSuspended: boolean;
  charityVerificationStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  bio?: string | null;
  phone?: string | null;
  hasCharityProfile: boolean;
  charityId?: number;
  profileImage?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CharityProfile = {
  id: number;
  userId: number;
  organizationName: string;
  description: string;
  documentUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  logo?: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  socialFacebook?: string | null;
  socialTelegram?: string | null;
  socialInstagram?: string | null;
  socialTwitter?: string | null;
  socialYoutube?: string | null;
  socialTiktok?: string | null;
  createdAt: string;
};

export type PendingCharityRegistration = CharityProfile & {
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
};

export type AuthSuccessResponse = {
  success: true;
  message: string;
  user: User;
};

export type MeResponse = {
  success: true;
  user: User;
};

export type CharityProfileResponse = {
  success: true;
  profile: CharityProfile | null;
};

export type CreateCharityProfileResponse = {
  success: true;
  message: string;
  profile: CharityProfile;
};

export type PendingCharityProfilesResponse = {
  success: true;
  profiles: PendingCharityRegistration[];
};

export type ApproveCharityProfileResponse = {
  success: true;
  message: string;
  profile: PendingCharityRegistration & {
    user: PendingCharityRegistration["user"] & {
      isVerified: boolean;
      updatedAt: string;
    };
  };
};

export type RejectCharityProfileResponse = {
  success: true;
  message: string;
  data: {
    rejected: true;
  };
};

export type GenericSuccessResponse = {
  success: true;
  message: string;
};

export type VerifyResetOtpResponse = {
  success: true;
  message: string;
  data: {
    resetToken: string;
    expiresIn: string;
  };
};

export type UserProfileDetailsResponse = {
  success: true;
  data: {
    user: User;
    charityProfile: {
      id: number;
      organizationName: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      createdAt: string;
      verifiedAt?: string | null;
      updatedAt: string;
      phone: string | null;
      address: string | null;
      website: string | null;
      socialFacebook: string | null;
      socialTelegram: string | null;
      socialInstagram: string | null;
      socialTwitter: string | null;
      socialYoutube: string | null;
      socialTiktok: string | null;
    } | null;
    bankAccounts: {
      id: number;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      type: "PERSONAL" | "BUSINESS";
      isPrimary: boolean;
      createdAt: string;
    }[];
  };
};

export type UpdateUserProfileResponse = {
  success: true;
  message: string;
  data: UserProfileDetailsResponse["data"];
};
