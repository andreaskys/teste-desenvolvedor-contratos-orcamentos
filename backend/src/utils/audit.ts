import prisma from './prisma';

export async function createAuditLog(
  companyId: string,
  userId: string,
  action: string,
  resource: string,
  payload: any = {}
) {
  try {
    await prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        resource,
        payload,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
