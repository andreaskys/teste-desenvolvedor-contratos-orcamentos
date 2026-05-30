import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { ContractService } from '../services/contractService';

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
      return res.status(201).json(contract);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async show(req: AuthRequest, res: Response) {
    try {
      const contract = await ContractService.getById(req.params.id as string, req.user!.companyId);
      if (!contract) return res.status(404).json({ error: 'Contract not found' });
      return res.json(contract);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
