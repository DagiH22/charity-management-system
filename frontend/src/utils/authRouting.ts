import type { User } from "../types/auth";

export const needsCharityProfileSetup = (user: User) => {
  return user.role === "CHARITY" && !user.hasCharityProfile;
};

export const getPostAuthRedirectPath = (user: User) => {
  if (needsCharityProfileSetup(user)) {
    return "/charity-profile/setup";
  }

  return "/dashboard";
};