import prisma from '../utils/prisma';
import { SignatureStatus, ContractStatus } from '@prisma/client';

export class SignatureService {
  static async createRequest(contractId: string, data: any) {
    const request = await prisma.signatureRequest.create({
      data: {
        contractId,
        email: data.email,
        phone: data.phone,
        link: `https://growth-sign.com/s/${Math.random().toString(36).substring(7)}`,
        status: SignatureStatus.AWAITING,
      },
    });

    await prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.PENDING_SIGNATURE },
    });

    // Simulate sending email/whatsapp
    console.log(`Sending signature request to ${data.email} and ${data.phone}`);

    return request;
  }

  static async sign(requestId: string) {
    const request = await prisma.signatureRequest.update({
      where: { id: requestId },
      data: { 
        status: SignatureStatus.SIGNED,
        logs: {
          push: { event: 'signed', timestamp: new Date() }
        } as any
      },
    });

    await prisma.contract.update({
      where: { id: request.contractId },
      data: { status: ContractStatus.ACTIVE },
    });

    return request;
  }
}
