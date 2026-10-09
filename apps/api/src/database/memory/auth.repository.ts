import { UserWithPassword, UserRepository, SessionRepository } from "../../modules/auth/auth.repository";
import { memoryDb, Session } from "./db";

export class MemoryUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    for (const user of memoryDb.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<UserWithPassword | null> {
    return memoryDb.users.get(id) || null;
  }

  async update(id: string, data: Partial<UserWithPassword>): Promise<UserWithPassword> {
    const user = memoryDb.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    memoryDb.users.set(id, updated);
    return updated;
  }
}

export class MemorySessionRepository implements SessionRepository {
  async create(userId: string): Promise<Session> {
    const id = Math.random().toString(36).substring(2, 15);
    const session: Session = {
      id,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    };
    memoryDb.sessions.set(id, session);
    return session;
  }

  async findById(id: string): Promise<Session | null> {
    return memoryDb.sessions.get(id) || null;
  }

  async delete(id: string): Promise<void> {
    memoryDb.sessions.delete(id);
  }
}
