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
    const { name, content, fields = [] } = data;
    console.log('TemplateService.create - Fields to create:', JSON.stringify(fields, null, 2));
    try {
      const template = await prisma.contractTemplate.create({
        data: {
          name,
          content,
          companyId,
          fields: {
            create: (fields || []).map((f: any) => ({
              label: f.label,
              key: f.key,
              type: f.type || 'text',
              required: f.required !== undefined ? f.required : true,
            })),
          },
        },
        include: { fields: true },
      });
      return template;
    } catch (err) {
      console.error('Prisma Error in TemplateService.create:', err);
      throw err;
    }
  }
}
