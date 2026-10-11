import { UserRepository } from "../auth/auth.repository";
import { updateProfileSchema } from "@stock-inventra/validation";
import { UserProfile } from "@stock-inventra/types";

export class ProfileService {
  constructor(private userRepo: UserRepository) {}

  async updateProfile(userId: string, data: unknown): Promise<UserProfile> {
    // Note: Changing the account email requires an authorized backend/database operation 
    // and appropriate uniqueness checks. It is intentionally omitted from the standard Profile API.
    const validData = updateProfileSchema.parse(data);
    const updated = await this.userRepo.update(userId, validData);
    
    const { passwordHash, ...safeUser } = updated;
    return safeUser as UserProfile;
  }

}
