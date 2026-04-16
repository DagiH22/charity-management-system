export type AuthRole = "DONOR" | "CHARITY" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  isVerified: boolean;
  hasCharityProfile: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CharityProfile = {
  id: number;
  userId: number;
  organizationName: string;
  description: string;
  documentUrl: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  createdAt: string;
};

export type AuthSuccessResponse = {
  success: true;
  message: string;
  token: string;
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
