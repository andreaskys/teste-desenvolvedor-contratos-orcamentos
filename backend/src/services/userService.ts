import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

export class UserService {
  static async listAll(companyId: string) {
    return prisma.user.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(companyId: string, data: any) {
    const hashedPassword = await bcrypt.hash(data.password || 'changeMe123!', 10);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'OPERATOR',
        companyId,
      },
      select: { id: true, name: true, email: true, role: true }
    });
  }
}
