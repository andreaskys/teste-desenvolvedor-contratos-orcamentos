import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { TemplateService } from '../services/templateService';
import prisma from '../utils/prisma';
import { generateEmbedding } from '../utils/embeddings';

export class TemplateController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const { search } = req.query;
      
      if (search && String(search).trim()) {
        const query = String(search);
        const embedding = await generateEmbedding(query);
        const vectorString = `[${embedding.join(',')}]`;
        
        // Semantic search using pgvector similarity (<=> operator)
        const templates = await prisma.$queryRawUnsafe(`
          SELECT id, name, content, company_id as "companyId", created_at as "createdAt"
          FROM contract_templates
          WHERE company_id = '${req.user!.companyId}'
          ORDER BY embedding <=> '${vectorString}'::vector
          LIMIT 10
        `);
        
        return res.json(templates);
      }

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

      // Generate and update embedding
      try {
        const embedding = await generateEmbedding(`${name} ${content}`);
        const vectorString = `[${embedding.join(',')}]`;
        await prisma.$executeRawUnsafe(`
          UPDATE contract_templates 
          SET embedding = '${vectorString}'::vector 
          WHERE id = '${template.id}'
        `);
      } catch (embErr) {
        console.error('[TemplateController.store] Embedding generation failed:', embErr);
      }

      return res.status(201).json(template);
    } catch (error: any) {
      console.error('[TemplateController.store] Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const template = await TemplateService.update(req.params.id as string, req.user!.companyId, req.body);
      
      // Update embedding if core content changed
      if (req.body.name || req.body.content) {
        try {
          const embedding = await generateEmbedding(`${req.body.name || template.name} ${req.body.content || template.content}`);
          const vectorString = `[${embedding.join(',')}]`;
          await prisma.$executeRawUnsafe(`
            UPDATE contract_templates 
            SET embedding = '${vectorString}'::vector 
            WHERE id = '${template.id}'
          `);
        } catch (embErr) {
          console.error('[TemplateController.update] Embedding generation failed:', embErr);
        }
      }

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
