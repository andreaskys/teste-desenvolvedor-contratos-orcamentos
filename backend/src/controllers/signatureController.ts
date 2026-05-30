import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { SignatureService } from '../services/signatureService';

export class SignatureController {
  static async store(req: AuthRequest, res: Response) {
    try {
      const { contractId, email, phone, channel } = req.body;
      const request = await SignatureService.createRequest(contractId, { email, phone, channel });
      return res.status(201).json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async sign(req: AuthRequest, res: Response) {
    try {
      const request = await SignatureService.sign(req.params.id as string);
      return res.json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
