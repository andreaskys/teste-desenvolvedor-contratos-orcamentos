import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { ObraService } from '../services/obraService';
import { createAuditLog } from '../utils/audit';

export class ObraController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const obras = await ObraService.listAll(req.user!.companyId);
      return res.json(obras);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async store(req: AuthRequest, res: Response) {
    try {
      const obra = await ObraService.create(req.user!.companyId, req.body);
      
      await createAuditLog(
        req.user!.companyId,
        req.user!.userId,
        'CREATE',
        'OBRA',
        { obraId: obra.id, name: obra.name }
      );

      return res.status(201).json(obra);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async show(req: AuthRequest, res: Response) {
    try {
      const obra = await ObraService.getById(req.params.id as string, req.user!.companyId);
      if (!obra) return res.status(404).json({ error: 'Obra not found' });
      return res.json(obra);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async addCost(req: AuthRequest, res: Response) {
    try {
      const cost = await ObraService.addCost(req.params.id as string, req.body);
      
      await createAuditLog(
        req.user!.companyId,
        req.user!.userId,
        'ADD_COST',
        'OBRA',
        { obraId: req.params.id, amount: cost.amount }
      );

      return res.status(201).json(cost);
    } catch (error: any) {
      console.error('[ObraController.addCost]', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  static async addStep(req: AuthRequest, res: Response) {
    try {
      const step = await ObraService.addStep(req.params.id as string, req.body);
      return res.status(201).json(step);
    } catch (error: any) {
      console.error('[ObraController.addStep]', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateStep(req: AuthRequest, res: Response) {
    try {
      const step = await ObraService.updateStep(req.params.stepId as string, req.body);
      return res.json(step);
    } catch (error: any) {
      console.error('[ObraController.updateStep]', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  static async addVistoria(req: AuthRequest, res: Response) {
    try {
      const vistoria = await ObraService.addVistoria(req.params.id as string, req.body);
      return res.status(201).json(vistoria);
    } catch (error: any) {
      console.error('[ObraController.addVistoria]', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  static async addPurchaseOrder(req: AuthRequest, res: Response) {
    try {
      const po = await ObraService.addPurchaseOrder(req.params.id as string, req.body);
      
      await createAuditLog(
        req.user!.companyId,
        req.user!.userId,
        'CREATE_PO',
        'OBRA',
        { obraId: req.params.id, poNumber: po.number }
      );

      return res.status(201).json(po);
    } catch (error: any) {
      console.error('[ObraController.addPurchaseOrder]', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  static async addManutencao(req: AuthRequest, res: Response) {
    try {
      const manutencao = await ObraService.addManutencao(req.params.id as string, req.body);
      
      await createAuditLog(
        req.user!.companyId,
        req.user!.userId,
        'ADD_MANUTENCAO',
        'OBRA',
        { obraId: req.params.id, manutencaoId: manutencao.id }
      );

      return res.status(201).json(manutencao);
    } catch (error: any) {
      console.error('[ObraController.addManutencao]', error.message);
      return res.status(400).json({ error: error.message });
    }
  }
}
