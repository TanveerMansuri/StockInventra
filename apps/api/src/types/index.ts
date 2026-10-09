import { Request } from "express";
import { UserProfile } from "@stock-inventra/types";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: UserProfile;
}
