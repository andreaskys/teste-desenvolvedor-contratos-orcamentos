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

  static async addVistoria(obraId: string, data: any) {
    return prisma.obraVistoria.create({
      data: {
        ...data,
        obraId,
      },
    });
  }

  static async addPurchaseOrder(obraId: string, data: any) {
    return prisma.purchaseOrder.create({
      data: {
        ...data,
        obraId,
      },
    });
  }
}
