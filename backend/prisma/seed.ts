import { PrismaClient, UserRole, ContractStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  // 1. Create Company
  const company = await prisma.company.upsert({
    where: { slug: 'construtora-modelo' },
    update: {},
    create: {
      name: 'Construtora Modelo Ltda',
      slug: 'construtora-modelo',
      cnpj: '12.345.678/0001-99',
    },
  });

  // 2. Create Admin User
  await prisma.user.upsert({
    where: { email: 'admin@modelo.com' },
    update: {},
    create: {
      email: 'admin@modelo.com',
      password,
      name: 'Admin Growth',
      role: UserRole.ADMIN,
      companyId: company.id,
    },
  });

  // 3. Create Contract Template
  const template = await prisma.contractTemplate.create({
    data: {
      name: 'Contrato de Prestação de Serviços de Obra',
      content: 'Este contrato regula a prestação de serviços na obra {{nome_obra}}...',
      companyId: company.id,
      fields: {
        create: [
          { label: 'Nome da Obra', key: 'nome_obra', type: 'text', required: true },
          { label: 'Valor Total', key: 'valor_total', type: 'number', required: true },
          { label: 'Data de Início', key: 'data_inicio', type: 'date', required: true },
        ],
      },
    },
  });

  console.log({
    company,
    template,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
