import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../utils/prisma';

export class UploadController {
  static async store(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { entityId, entityType } = req.body;

      const upload = await prisma.upload.create({
        data: {
          companyId: req.user!.companyId,
          filename: req.file.filename,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
          entityId: entityId || null,
          entityType: entityType || null,
        },
      });

      return res.status(201).json(upload);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async index(req: AuthRequest, res: Response) {
    try {
      const { entityId, entityType } = req.query;

      const uploads = await prisma.upload.findMany({
        where: {
          companyId: req.user!.companyId,
          entityId: entityId ? String(entityId) : undefined,
          entityType: entityType ? String(entityType) : undefined,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json(uploads);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
