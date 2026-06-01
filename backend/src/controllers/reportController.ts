import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../utils/prisma';
import { Parser } from 'json2csv';

export class ReportController {
  static async exportContracts(req: AuthRequest, res: Response) {
    const { companyId } = req.user!;

    try {
      const contracts = await prisma.contract.findMany({
        where: { companyId },
        include: { template: true },
      });

      const fields = [
        { label: 'Número', value: 'number' },
        { label: 'Título', value: 'title' },
        { label: 'Parte Relacionada', value: 'relatedParty' },
        { label: 'Tipo', value: 'contractType' },
        { label: 'Valor', value: 'value' },
        { label: 'Início', value: 'startDate' },
        { label: 'Fim', value: 'endDate' },
        { label: 'Status', value: 'status' },
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(contracts);

      res.header('Content-Type', 'text/csv');
      res.attachment(`contratos-${new Date().getTime()}.csv`);
      return res.send(csv);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async exportObras(req: AuthRequest, res: Response) {
    const { companyId } = req.user!;

    try {
      const obras = await prisma.obra.findMany({
        where: { companyId },
        include: { contract: true },
      });

      const fields = [
        { label: 'Obra', value: 'name' },
        { label: 'Contrato Vinculado', value: 'contract.number' },
        { label: 'Orçamento Previsto', value: 'budget' },
        { label: 'Início', value: 'startDate' },
        { label: 'Fim', value: 'endDate' },
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(obras);

      res.header('Content-Type', 'text/csv');
      res.attachment(`obras-${new Date().getTime()}.csv`);
      return res.send(csv);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
