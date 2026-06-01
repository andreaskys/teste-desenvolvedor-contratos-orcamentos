import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { ContractService } from '../services/contractService';
import { PDFService } from '../services/pdfService';
import { createAuditLog } from '../utils/audit';
import prisma from '../utils/prisma';

export class ContractController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const contracts = await ContractService.listAll(req.user!.companyId);
      return res.json(contracts);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async store(req: AuthRequest, res: Response) {
    try {
      const contract = await ContractService.create(req.user!.companyId, req.body);
      
      await createAuditLog(
        req.user!.companyId,
        req.user!.userId,
        'CREATE',
        'CONTRACT',
        { contractId: contract.id, number: contract.number }
      );

      return res.status(201).json(contract);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async show(req: AuthRequest, res: Response) {
    try {
      const contract = await ContractService.getById(req.params.id as string, req.user!.companyId);
      if (!contract) return res.status(404).json({ error: 'Contract not found' });

      // Fetch audit logs for this specific contract (Creation, Sending, Signing)
      const auditLogs = await prisma.auditLog.findMany({
        where: { 
          companyId: req.user!.companyId,
          resource: 'CONTRACT',
          action: { not: 'VIEW' },
          payload: {
            path: ['contractId'],
            equals: contract.id
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ ...contract, auditLogs });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async download(req: AuthRequest, res: Response) {
    try {
      const contract = await ContractService.getById(req.params.id as string, req.user!.companyId);
      if (!contract) return res.status(404).json({ error: 'Contract not found' });

      const pdfBuffer = await PDFService.generateContractPDF(contract);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contrato-${contract.number}.pdf`);
      return res.send(pdfBuffer);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const companyId = req.user!.companyId;
      
      const contract = await prisma.contract.findFirst({
        where: { id, companyId }
      });

      if (!contract) return res.status(404).json({ error: 'Contract not found' });

      const data = { ...req.body };
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      
      // Remove actionType before saving to DB
      const actionType = data.actionType || 'UPDATE';
      delete data.actionType;

      await ContractService.update(id, companyId, data);
      
      await createAuditLog(
        companyId,
        req.user!.userId,
        'UPDATE',
        'CONTRACT',
        { contractId: id, number: contract.number, actionType }
      );

      return res.status(200).json({ message: 'Contract updated successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async destroy(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const companyId = req.user!.companyId;

      // Verify if contract exists and is DRAFT before deleting
      const contract = await prisma.contract.findFirst({
        where: { id, companyId }
      });

      if (!contract) return res.status(404).json({ error: 'Contract not found' });
      if (contract.status !== 'DRAFT') {
        return res.status(400).json({ error: 'Apenas rascunhos podem ser excluídos.' });
      }

      await ContractService.delete(id, companyId);

      await createAuditLog(
        companyId,
        req.user!.userId,
        'DELETE',
        'CONTRACT',
        { contractId: id, number: contract.number }
      );

      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
