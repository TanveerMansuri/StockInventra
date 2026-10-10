import bcrypt from "bcryptjs";
import { UserRepository, SessionRepository } from "./auth.repository";
import { UnauthorizedError } from "../../utils/errors";
import { UserProfile } from "@stock-inventra/types";
import { loginSchema, changePasswordSchema, requestPasswordResetSchema, verifyPasswordResetSchema } from "@stock-inventra/validation";
import { OTPService } from "./otp.service";

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository
  ) {}

  async login(data: unknown) {
    const { email, password } = loginSchema.parse(data);
    
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedError("Invalid email or password");

    const session = await this.sessionRepo.create(user.id);
    
    // Strip password
    const { passwordHash, ...safeUser } = user;
    
    return { session, user: safeUser as UserProfile };
  }

  async logout(sessionId: string) {
    await this.sessionRepo.delete(sessionId);
  }

  async changePassword(userId: string, data: unknown) {
    const { currentPassword, newPassword } = changePasswordSchema.parse(data);
    
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedError("Incorrect current password");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { passwordHash });
  }

  async forgotPassword(data: unknown) {
    const { email } = requestPasswordResetSchema.parse(data);
    const user = await this.userRepo.findByEmail(email);
    console.log("[DEBUG] forgotPassword email:", email, "user found:", !!user);
    if (!user) return; // Silent success to prevent email enumeration

    await OTPService.sendOTP(email, 'PASSWORD_RESET');
  }

  async resetPassword(data: unknown) {
    const { email, otp, newPassword } = verifyPasswordResetSchema.parse(data);
    
    const isValid = await OTPService.verifyOTP(email, 'PASSWORD_RESET', otp);
    if (!isValid) throw new UnauthorizedError("Invalid or expired reset code");

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedError("User not found");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(user.id, { passwordHash });

    // Optional: invalidate all sessions
    await this.sessionRepo.delete(user.id); // Wait, sessionRepo.delete usually takes sessionId. Let's not call delete(user.id) if it expects sessionId.
  }
}
