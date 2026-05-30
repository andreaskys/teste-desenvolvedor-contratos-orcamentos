import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { ObraService } from '../services/obraService';

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
}
