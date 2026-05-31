import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const notifications = await NotificationService.listAll(req.user!.companyId);
      return res.json(notifications);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async read(req: AuthRequest, res: Response) {
    try {
      await NotificationService.markAsRead(req.params.id as string, req.user!.companyId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async readAll(req: AuthRequest, res: Response) {
    try {
      await NotificationService.markAllAsRead(req.user!.companyId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
