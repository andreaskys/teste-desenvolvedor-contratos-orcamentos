import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { UserService } from '../services/userService';
import { createAuditLog } from '../utils/audit';

export class UserController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const users = await UserService.listAll(req.user!.companyId);
      return res.json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async store(req: AuthRequest, res: Response) {
    try {
      const user = await UserService.create(req.user!.companyId, req.body);
      
      await createAuditLog(
        req.user!.companyId,
        req.user!.userId,
        'CREATE',
        'USER',
        { newUserId: user.id, email: user.email }
      );

      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
