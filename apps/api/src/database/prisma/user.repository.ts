import { UserRepository, UserWithPassword } from "../../modules/auth/auth.repository";
import { prisma } from "../prisma";
import { Role } from "@prisma/client";

export class PrismaUserRepository implements UserRepository {
  private mapToUser(data: any): UserWithPassword {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role as "ADMIN" | "USER",
      avatar: data.avatar,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    };
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.mapToUser(user) : null;
  }

  async findById(id: string): Promise<UserWithPassword | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.mapToUser(user) : null;
  }

  async update(id: string, data: Partial<UserWithPassword>): Promise<UserWithPassword> {
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return this.mapToUser(user);
  }
}
