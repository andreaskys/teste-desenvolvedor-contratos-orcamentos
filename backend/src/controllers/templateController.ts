import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { TemplateService } from '../services/templateService';

export class TemplateController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const templates = await TemplateService.listAll(req.user!.companyId);
      return res.json(templates);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async show(req: AuthRequest, res: Response) {
    try {
      const template = await TemplateService.getById(req.params.id as string, req.user!.companyId);
      if (!template) return res.status(404).json({ error: 'Template not found' });
      return res.json(template);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async store(req: AuthRequest, res: Response) {
    try {
      const template = await TemplateService.create(req.user!.companyId, req.body);
      return res.status(201).json(template);
    } catch (error: any) {
      console.error('[TemplateController.store] Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }
}
