import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { SignatureService } from '../services/signatureService';
import prisma from '../utils/prisma';

export class SignatureController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const requests = await prisma.signatureRequest.findMany({
        where: { companyId: req.user!.companyId },
        include: { contract: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(requests);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async store(req: AuthRequest, res: Response) {
    try {
      const { contractId, email, phone, channel } = req.body;
      const request = await SignatureService.createRequest(contractId, { email, phone, channel });
      return res.status(201).json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async show(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const signatureRequest = await prisma.signatureRequest.findUnique({
        where: { id },
        include: { 
          contract: {
            include: { 
              company: true, 
              template: { include: { fields: true } } 
            }
          } 
        }
      });

      if (!signatureRequest) {
        return res.status(404).json({ error: 'Pedido de assinatura não encontrado.' });
      }

      return res.json(signatureRequest);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async sign(req: Request, res: Response) {
    try {
      const metadata = {
        ip: String(req.ip || req.headers['x-forwarded-for'] || 'unknown'),
        userAgent: String(req.headers['user-agent'] || 'unknown')
      };
      const request = await SignatureService.sign(req.params.id as string, metadata);
      return res.json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
