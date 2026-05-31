import prisma from '../utils/prisma';

export class NotificationService {
  static async listAll(companyId: string) {
    return prisma.notification.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  static async create(companyId: string, title: string, message: string, type: string = 'INFO') {
    return prisma.notification.create({
      data: {
        companyId,
        title,
        message,
        type
      }
    });
  }

  static async markAsRead(id: string, companyId: string) {
    return prisma.notification.updateMany({
      where: { id, companyId },
      data: { read: true }
    });
  }

  static async markAllAsRead(companyId: string) {
    return prisma.notification.updateMany({
      where: { companyId, read: false },
      data: { read: true }
    });
  }
}
