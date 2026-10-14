import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "../../types";

export class AuthController {
  constructor(private authService: AuthService) { }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { session, user } = await this.authService.login(req.body);

      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // sameSite: "lax",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: session.expiresAt,
      });

      res.json({ success: true, data: user, message: "Logged in successfully" });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.cookies?.sessionId;
      if (sessionId) {
        await this.authService.logout(sessionId);
      }
      res.clearCookie("sessionId");
      res.json({ success: true, data: null, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      res.json({ success: true, data: authReq.user, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      await this.authService.changePassword(authReq.user.id, req.body);
      res.json({ success: true, data: null, message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  };
}
