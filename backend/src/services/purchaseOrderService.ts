import prisma from '../utils/prisma';

export class PurchaseOrderService {
  static async listAll(companyId: string) {
    return prisma.purchaseOrder.findMany({
      where: { obra: { companyId } },
      include: { obra: { select: { name: true, contract: { select: { number: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
