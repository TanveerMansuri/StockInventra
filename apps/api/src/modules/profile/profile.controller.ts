import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import { AuthenticatedRequest } from "../../types";

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      res.json({ success: true, data: authReq.user, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const updatedUser = await this.profileService.updateProfile(authReq.user.id, req.body);
      res.json({ success: true, data: updatedUser, message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  };
}
