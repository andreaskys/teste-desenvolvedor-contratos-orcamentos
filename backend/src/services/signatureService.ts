import prisma from '../utils/prisma';
import { SignatureStatus, ContractStatus } from '@prisma/client';
import { NotificationService } from './notificationService';
import { createAuditLog } from '../utils/audit';

export class SignatureService {
  static async createRequest(contractId: string, data: any) {
    const { email, phone, channel } = data;
    
    const request = await prisma.signatureRequest.create({
      data: {
        contractId,
        email,
        phone,
        link: `http://localhost:5173/sign/{{id}}`, // ID will be filled after creation or we can use the UUID
        status: SignatureStatus.AWAITING,
        logs: [
          { event: 'request_created', channel, timestamp: new Date() },
          { event: 'notification_sent', channel, target: channel === 'WHATSAPP' ? phone : email, timestamp: new Date() }
        ] as any
      },
    });

    const finalLink = `http://localhost:5173/sign/${request.id}`;
    await prisma.signatureRequest.update({
      where: { id: request.id },
      data: { link: finalLink }
    });

    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.PENDING_SIGNATURE },
    });

    // Create Audit Log for Sending
    await createAuditLog(
      contract.companyId,
      'USER_ID_MOCKED', // In a real scenario, pass the user ID
      'SEND_FOR_SIGNATURE',
      'CONTRACT',
      { contractId, channel, target: email || phone }
    );

    // Simulated Dispatch
    console.log(`[Signature] Enviando link via ${channel}: ${request.link}`);

    return request;
  }

  static async sign(requestId: string) {
    const request = await prisma.signatureRequest.findUnique({
      where: { id: requestId },
      include: { contract: true }
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
      data: { status: ContractStatus.SIGNED },
    });

    // Create Notification with embedded contractId in message for easy parsing, or ideally in a payload field.
    // For simplicity, we will append it to the message or title if we don't have a payload field in the DB schema.
    // Since we don't have a JSON payload field on Notifications, I will encode the ID in the message string:
    await NotificationService.create(
      request.contract.companyId,
      'Contrato Assinado',
      `O contrato ${request.contract.number} foi assinado por todas as partes.|ID:${request.contract.id}`,
      'SUCCESS'
    );

    // Create Audit Log
    await createAuditLog(
      request.contract.companyId,
      'SYSTEM',
      'SIGNED',
      'CONTRACT',
      { contractId: request.contract.id, number: request.contract.number }
    );

    return updatedRequest;
  }
}
