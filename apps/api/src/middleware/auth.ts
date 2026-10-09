import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors";
import { AuthenticatedRequest } from "../types";
import { SessionRepository, UserRepository } from "../modules/auth/auth.repository";

export function createAuthMiddleware(
  sessionRepo: SessionRepository,
  userRepo: UserRepository
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.cookies?.sessionId;
      
      if (!sessionId) {
        throw new UnauthorizedError("Authentication required");
      }

      const session = await sessionRepo.findById(sessionId);
      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedError("Session expired or invalid");
      }

      const user = await userRepo.findById(session.userId);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      (req as AuthenticatedRequest).user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
