import prisma from '../utils/prisma';
import { SignatureStatus, ContractStatus } from '@prisma/client';

export class SignatureService {
  static async createRequest(contractId: string, data: any) {
    const { email, phone, channel } = data;
    
    const request = await prisma.signatureRequest.create({
      data: {
        contractId,
        email,
        phone,
        link: `http://localhost:5173/sign/${Math.random().toString(36).substring(7)}`,
        status: SignatureStatus.AWAITING,
        logs: [
          { event: 'request_created', channel, timestamp: new Date() },
          { event: 'notification_sent', channel, target: channel === 'WHATSAPP' ? phone : email, timestamp: new Date() }
        ] as any
      },
    });

    await prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.PENDING_SIGNATURE },
    });

    // Simulated Dispatch
    console.log(`[Signature] Enviando link via ${channel}: ${request.link}`);
    if (channel === 'BOTH' || channel === 'EMAIL') console.log(`[Email] Destinatário: ${email}`);
    if (channel === 'BOTH' || channel === 'WHATSAPP') console.log(`[WhatsApp] Destinatário: ${phone}`);

    return request;
  }

  static async sign(requestId: string) {
    const request = await prisma.signatureRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new Error('Pedido de assinatura não encontrado.');

    const updatedRequest = await prisma.signatureRequest.update({
      where: { id: requestId },
      data: { 
        status: SignatureStatus.SIGNED,
        logs: [
          ...(request.logs as any[] || []),
          { event: 'signed_electronically', timestamp: new Date(), ip: '127.0.0.1' }
        ] as any
      },
    });

    await prisma.contract.update({
      where: { id: updatedRequest.contractId },
      data: { status: ContractStatus.ACTIVE },
    });

    return updatedRequest;
  }
}
