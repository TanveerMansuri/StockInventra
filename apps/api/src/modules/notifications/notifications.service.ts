import { NotificationRepository } from "./notifications.repository";

export class NotificationService {
  constructor(private repo: NotificationRepository) {}

  async getNotifications(userId: string) {
    const list = await this.repo.findByUserId(userId);
    const unreadCount = await this.repo.getUnreadCount(userId);
    return { list, unreadCount };
  }

  async markAsRead(userId: string, notificationId: string) {
    await this.repo.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string) {
    await this.repo.markAllAsRead(userId);
  }

  async createNotification(userId: string, title: string, description: string, link?: string) {
    return this.repo.create(userId, title, description, link);
  }
}
