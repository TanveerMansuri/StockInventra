import { UserProfile } from "@stock-inventra/types";
import { Session } from "../../database/memory/db";

export interface UserWithPassword extends UserProfile {
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<UserWithPassword | null>;
  update(id: string, data: Partial<UserWithPassword>): Promise<UserWithPassword>;
}

export interface SessionRepository {
  create(userId: string): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  delete(id: string): Promise<void>;
}
