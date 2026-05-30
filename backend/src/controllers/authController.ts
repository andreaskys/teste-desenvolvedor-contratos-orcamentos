import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login(email, password);
      return res.json(data);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}
