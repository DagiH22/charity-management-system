type AppRole = "DONOR" | "CHARITY" | "ADMIN";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: AppRole;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};
