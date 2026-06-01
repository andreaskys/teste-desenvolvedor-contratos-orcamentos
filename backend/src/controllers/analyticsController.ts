import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../utils/prisma';

export class AnalyticsController {
  static async getSummary(req: AuthRequest, res: Response) {
    const { companyId } = req.user!;

    try {
      const [
        totalContracts,
        activeContracts,
        totalObras,
        totalBudget,
        totalRealized,
        recentActivity,
        contractStatusDist,
        obraStatusDist,
        latestObras
      ] = await Promise.all([
        prisma.contract.count({ where: { companyId } }),
        prisma.contract.count({ where: { companyId, status: 'ACTIVE' } }),
        prisma.obra.count({ where: { companyId } }),
        prisma.obra.aggregate({
          where: { companyId },
          _sum: { budget: true }
        }),
        prisma.obraCusto.aggregate({
          where: { obra: { companyId } },
          _sum: { amount: true }
        }),
        prisma.auditLog.findMany({
          where: { companyId },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        prisma.contract.groupBy({
          by: ['status'],
          where: { companyId },
          _count: { id: true }
        }),
        prisma.obra.findMany({
          where: { companyId },
          select: {
            id: true,
            name: true,
            budget: true,
            costs: { select: { amount: true } },
            manutencoes: { select: { cost: true } }
          }
        }),
        prisma.obra.findMany({
          where: { companyId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { contract: true }
        })
      ]);

      // Calculate maintenance costs to include in total realized
      const maintenanceSum = await prisma.obraManutencao.aggregate({
        where: { obra: { companyId } },
        _sum: { cost: true }
      });

      const realizedValue = (Number(totalRealized._sum.amount || 0)) + (Number(maintenanceSum._sum.cost || 0));

      // Process obra status/progress for a chart
      const obraProgressData = latestObras.map(o => {
        const directCosts = (o as any).costs?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
        const maintCosts = (o as any).manutencoes?.reduce((sum: number, m: any) => sum + Number(m.cost), 0) || 0;
        const total = directCosts + maintCosts;
        return {
          name: o.name,
          budget: Number(o.budget),
          realized: total,
          percentage: (total / Number(o.budget)) * 100
        };
      });

      return res.json({
        metrics: {
          totalContracts,
          activeContracts,
          totalObras,
          totalBudget: Number(totalBudget._sum.budget || 0),
          totalRealized: realizedValue,
        },
        distributions: {
          contracts: contractStatusDist,
          obras: obraProgressData
        },
        recentActivity,
        latestObras
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
