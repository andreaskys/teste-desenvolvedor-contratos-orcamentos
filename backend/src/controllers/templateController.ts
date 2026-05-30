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
      const { name, content, fields = [] } = req.body;
      
      if (!req.user?.companyId) {
        return res.status(401).json({ error: 'Empresa não identificada.' });
      }

      const template = await prisma.contractTemplate.create({
        data: {
          name,
          content,
          companyId: req.user.companyId,
          fields: {
            create: (fields || []).map((f: any) => ({
              label: f.label,
              key: f.key,
              type: f.type || 'text',
              required: f.required !== undefined ? f.required : true,
            })),
          },
        },
        include: { fields: true },
      });
      return res.status(201).json(template);
    } catch (error: any) {
      console.error('[TemplateController.store] Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const template = await TemplateService.update(req.params.id as string, req.user!.companyId, req.body);
      return res.json(template);
    } catch (error: any) {
      console.error('[TemplateController.update] Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  static async destroy(req: AuthRequest, res: Response) {
    try {
      await TemplateService.delete(req.params.id as string, req.user!.companyId);
      return res.status(204).send();
    } catch (error: any) {
      console.error('[TemplateController.destroy] Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }
}
