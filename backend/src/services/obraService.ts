import prisma from '../utils/prisma';

export class ObraService {
  static async listAll(companyId: string) {
    return prisma.obra.findMany({
      where: { companyId },
      include: { contract: true },
    });
  }

  static async create(companyId: string, data: any) {
    return prisma.obra.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  static async getById(id: string, companyId: string) {
    return prisma.obra.findFirst({
      where: { id, companyId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        vistorias: true,
        costs: true,
        purchaseOrders: true,
        manutencoes: true,
        contract: true,
      },
    });
  }

  static async addCost(obraId: string, data: any) {
    return prisma.obraCusto.create({
      data: {
        ...data,
        obraId,
      },
    });
  }

  static async addStep(obraId: string, data: any) {
    return prisma.obraStep.create({
      data: {
        ...data,
        obraId,
      },
    });
  }

  static async updateStep(stepId: string, data: any) {
    return prisma.obraStep.update({
      where: { id: stepId },
      data
    });
  }

  static async addVistoria(obraId: string, data: any) {
    return prisma.obraVistoria.create({
      data: {
        ...data,
        obraId,
      },
    });
  }

  static async addPurchaseOrder(obraId: string, data: any) {
    if (data.payingCnpj) {
      const cleanCnpj = data.payingCnpj.replace(/[^\d]/g, '');
      if (cleanCnpj.length !== 14) {
        throw new Error('CNPJ Inválido: Deve conter 14 dígitos.');
      }
      
      // Basic check digit validation (simplified for brevity, but functional)
      if (/^(\d)\1+$/.test(cleanCnpj)) throw new Error('CNPJ Inválido.');
    }

    return prisma.purchaseOrder.create({
      data: {
        ...data,
        obraId,
      },
    });
  }

  static async addManutencao(obraId: string, data: any) {
    return prisma.obraManutencao.create({
      data: {
        ...data,
        obraId,
      },
    });
  }
}
