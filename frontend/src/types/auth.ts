export type AuthRole = "DONOR" | "CHARITY" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
