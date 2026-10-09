import { SessionRepository } from "../../modules/auth/auth.repository";
import { prisma } from "../prisma";
import { Session } from "../../database/memory/db"; // Using same type structure as defined before

export class PrismaSessionRepository implements SessionRepository {
  async create(userId: string): Promise<Session> {
    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      },
    });

    return {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    };
  }

  async findById(id: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) return null;

    return {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.session.delete({ where: { id } }).catch(() => {});
  }
}
