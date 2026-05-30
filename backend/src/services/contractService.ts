import prisma from '../utils/prisma';
import { ContractStatus } from '@prisma/client';

export class ContractService {
  static async listAll(companyId: string) {
    return prisma.contract.findMany({
      where: { companyId },
      include: { template: true, signatureRequest: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async create(companyId: string, data: any) {
    const { 
      number, 
      title, 
      relatedParty, 
      contractType, 
      value, 
      startDate, 
      endDate, 
      templateId, 
      filledFields 
    } = data;

    return prisma.contract.create({
      data: {
        number,
        title,
        relatedParty: relatedParty || 'Não Informado',
        contractType: contractType || 'Outros',
        value,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: ContractStatus.DRAFT,
        filledFields: filledFields || {},
        companyId,
        templateId,
      },
      include: { template: true },
    });
  }

  static async getById(id: string, companyId: string) {
    return prisma.contract.findFirst({
      where: { id, companyId },
      include: { template: true, signatureRequest: true, obras: true },
    });
  }

  static async update(id: string, companyId: string, data: any) {
    return prisma.contract.updateMany({
      where: { id, companyId },
      data,
    });
  }
}
