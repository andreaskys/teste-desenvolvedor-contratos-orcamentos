import cron from 'node-cron';
import prisma from '../utils/prisma';

export const startDeadlineMonitor = () => {
  // Runs every day at 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('[Job] Running Deadline Monitor...');
    const today = new Date();
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + 30); // 30 days ahead

    try {
      // 1. Find and expire contracts
      const expiredContracts = await prisma.contract.findMany({
        where: {
          endDate: { lte: today },
          status: { not: 'EXPIRED' }
        }
      });

      for (const contract of expiredContracts) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: { status: 'EXPIRED' }
        });

        await prisma.notification.create({
          data: {
            companyId: contract.companyId,
            title: 'Contrato Expirado',
            message: `O contrato ${contract.number} atingiu a data de vigência e foi marcado como expirado.`,
            type: 'WARNING'
          }
        });
      }

      // 2. Alert for contracts expiring soon (in 30 days)
      const expiringSoon = await prisma.contract.findMany({
        where: {
          endDate: { 
            gt: today,
            lte: warningDate 
          },
          status: 'ACTIVE'
        }
      });

      for (const contract of expiringSoon) {
        // Check if we already sent a notification today to avoid duplicates
        const alreadyNotified = await prisma.notification.findFirst({
          where: {
            companyId: contract.companyId,
            title: 'Aviso de Vencimento',
            message: { contains: contract.number },
            createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
          }
        });

        if (!alreadyNotified) {
          await prisma.notification.create({
            data: {
              companyId: contract.companyId,
              title: 'Aviso de Vencimento',
              message: `O contrato ${contract.number} irá expirar em ${new Date(contract.endDate).toLocaleDateString()}.`,
              type: 'INFO'
            }
          });
        }
      }

      // 3. Obra Deadline Alerts
      const expiringObras = await prisma.obra.findMany({
        where: {
          endDate: { 
            gt: today,
            lte: warningDate 
          }
        }
      });

      for (const obra of expiringObras) {
        const alreadyNotified = await prisma.notification.findFirst({
          where: {
            companyId: obra.companyId,
            title: 'Prazo de Obra',
            message: { contains: obra.name },
            createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
          }
        });

        if (!alreadyNotified) {
          await prisma.notification.create({
            data: {
              companyId: obra.companyId,
              title: 'Prazo de Obra',
              message: `A obra "${obra.name}" está se aproximando do prazo final (${new Date(obra.endDate).toLocaleDateString()}).`,
              type: 'INFO'
            }
          });
        }
      }

      console.log(`[Job] Deadline Monitor completed. Processed ${expiredContracts.length} expirations and checked alerts.`);
    } catch (error) {
      console.error('[Job] Error in Deadline Monitor:', error);
    }
  });
};
