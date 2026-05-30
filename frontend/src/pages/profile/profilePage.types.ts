import type { UserProfileDetailsResponse } from "../../types/auth";

export type SocialKey =
  | "socialFacebook"
  | "socialTelegram"
  | "socialInstagram"
  | "socialTwitter"
  | "socialYoutube"
  | "socialTiktok";

export type SocialLinks = Record<SocialKey, string>;

export type EditingBankAccount = {
  id?: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type: "PERSONAL" | "BUSINESS";
  isPrimary: boolean;
  toDelete?: boolean;
};

export type CharityProfile = UserProfileDetailsResponse["data"]["charityProfile"] & {
  socialFacebook?: string | null;
  socialTelegram?: string | null;
  socialInstagram?: string | null;
  socialTwitter?: string | null;
  socialYoutube?: string | null;
  socialTiktok?: string | null;
};

export type ProfileData = UserProfileDetailsResponse["data"];

export type ActiveSocialLink = {
  key: SocialKey;
  label: string;
  color: string;
  href: string;
};
