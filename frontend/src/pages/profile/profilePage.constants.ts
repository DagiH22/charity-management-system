import type { SocialKey, SocialLinks } from "./profilePage.types";

export const SOCIAL_ENTRIES: { key: SocialKey; label: string; color: string }[] = [
  { key: "socialFacebook", label: "Facebook", color: "text-blue-600" },
  { key: "socialTelegram", label: "Telegram", color: "text-blue-400" },
  { key: "socialInstagram", label: "Instagram", color: "text-pink-600" },
  { key: "socialTwitter", label: "X / Twitter", color: "text-slate-900" },
  { key: "socialYoutube", label: "YouTube", color: "text-red-600" },
  { key: "socialTiktok", label: "TikTok", color: "text-black" },
];

export const EMPTY_SOCIAL_LINKS: SocialLinks = {
  socialFacebook: "",
  socialTelegram: "",
  socialInstagram: "",
  socialTwitter: "",
  socialYoutube: "",
  socialTiktok: "",
};

export const SOCIAL_PLACEHOLDERS: Record<SocialKey, string> = {
  socialFacebook: "https://facebook.com/...",
  socialTelegram: "https://telegram.me/...",
  socialInstagram: "https://instagram.com/...",
  socialTwitter: "https://twitter.com/...",
  socialYoutube: "https://youtube.com/...",
  socialTiktok: "https://tiktok.com/@...",
};
