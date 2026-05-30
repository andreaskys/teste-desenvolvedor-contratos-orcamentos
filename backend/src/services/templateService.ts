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

  static async update(id: string, companyId: string, data: any) {
    const { name, content, fields = [] } = data;
    
    // First, delete old fields to replace with new ones (standard approach for dynamic fields)
    await prisma.contractTemplateField.deleteMany({
      where: { templateId: id },
    });

    return prisma.contractTemplate.update({
      where: { id, companyId },
      data: {
        name,
        content,
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
  }

  static async delete(id: string, companyId: string) {
    return prisma.contractTemplate.delete({
      where: { id, companyId },
    });
  }
}
