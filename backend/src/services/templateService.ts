import prisma from '../utils/prisma';

export class TemplateService {
  static async listAll(companyId: string) {
    return prisma.contractTemplate.findMany({
      where: { companyId },
      include: { fields: true },
    });
  }

  static async getById(id: string, companyId: string) {
    return prisma.contractTemplate.findFirst({
      where: { id, companyId },
      include: { fields: true },
    });
  }

  static async create(companyId: string, data: any) {
    const { name, content, fields } = data;
    return prisma.contractTemplate.create({
      data: {
        name,
        content,
        companyId,
        fields: {
          create: fields,
        },
      },
      include: { fields: true },
    });
  }
}
