import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { PurchaseOrderService } from '../services/purchaseOrderService';

export class PurchaseOrderController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const orders = await PurchaseOrderService.listAll(req.user!.companyId);
      return res.json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
