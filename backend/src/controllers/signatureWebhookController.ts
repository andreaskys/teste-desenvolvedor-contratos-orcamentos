import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { SignatureStatus, ContractStatus } from '@prisma/client';
import { NotificationService } from '../services/notificationService';
import { createAuditLog } from '../utils/audit';

export class SignatureWebhookController {
  static async handle(req: Request, res: Response) {
    try {
      const { requestId, event, metadata } = req.body;

      // In a real scenario, we would validate a signature or secret from the provider
      console.log(`[Webhook] Signature event received: ${event} for Request: ${requestId}`);

      const request = await prisma.signatureRequest.findUnique({
        where: { id: requestId },
        include: { contract: true }
      });

      if (!request) {
        return res.status(404).json({ error: 'Signature request not found' });
      }

      if (event === 'document_signed') {
        await prisma.signatureRequest.update({
          where: { id: requestId },
          data: { 
            status: SignatureStatus.SIGNED,
            logs: [
              ...(request.logs as any[] || []),
              { event: 'signed_via_webhook', timestamp: new Date(), ...metadata }
            ] as any
          }
        });

        await prisma.contract.update({
          where: { id: request.contractId },
          data: { status: ContractStatus.SIGNED }
        });

        await NotificationService.create(
          request.companyId,
          'Contrato Assinado',
          `O contrato ${request.contract.number} foi assinado com sucesso via webhook.|ID:${request.contractId}`,
          'SUCCESS'
        );

        await createAuditLog(
          request.companyId,
          'SYSTEM',
          'SIGNED_WEBHOOK',
          'CONTRACT',
          { contractId: request.contractId, requestId }
        );
      } else if (event === 'document_viewed') {
        await prisma.signatureRequest.update({
          where: { id: requestId },
          data: {
            logs: [
              ...(request.logs as any[] || []),
              { event: 'document_viewed', timestamp: new Date(), ...metadata }
            ] as any
          }
        });
      }

      return res.status(200).send('OK');
    } catch (error: any) {
      console.error('[Webhook Error]', error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}
