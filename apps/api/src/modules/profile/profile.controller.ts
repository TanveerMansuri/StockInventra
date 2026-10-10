import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import { AuthenticatedRequest } from "../../types";
import { AppError } from "../../utils/errors";

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

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!req.file) throw new AppError(400, "No file uploaded");
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const updatedUser = await this.profileService.updateProfile(authReq.user.id, { avatar: avatarUrl });
      res.json({ success: true, data: updatedUser, message: "Avatar uploaded successfully" });
    } catch (error) {
      next(error);
    }
  };
}
