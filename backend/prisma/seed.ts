import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  // 1. Create Company
  const company = await prisma.company.upsert({
    where: { slug: 'construtora-modelo' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
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
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@modelo.com',
      password,
      name: 'Admin Growth',
      role: UserRole.ADMIN,
      companyId: company.id,
    },
  });

  // 3. Clear existing templates to avoid duplicates during testing
  await prisma.contractTemplate.deleteMany({
    where: { companyId: company.id }
  });

  // 4. Create Mock Templates
  const templates = [
    {
      name: 'Prestação de Serviço de TI',
      content: 'Este contrato regula a prestação de serviços de {{tipo_servico}} entre a CONTRATANTE e o profissional {{nome_profissional}}, com início em {{data_inicio}} e valor total de R$ {{valor_total}}.',
      fields: [
        { label: 'Tipo de Serviço', key: 'tipo_servico', type: 'text' },
        { label: 'Nome do Profissional', key: 'nome_profissional', type: 'text' },
        { label: 'Data de Início', key: 'data_inicio', type: 'date' },
        { label: 'Valor Total', key: 'valor_total', type: 'number' },
      ],
    },
    {
      name: 'Contrato de Aluguel Residencial',
      content: 'Pelo presente instrumento, o LOCADOR aluga ao LOCATÁRIO {{nome_locatario}} o imóvel situado em {{endereco_imovel}}, pelo período de {{meses_duracao}} meses, com valor mensal de R$ {{valor_aluguel}}.',
      fields: [
        { label: 'Nome do Locatário', key: 'nome_locatario', type: 'text' },
        { label: 'Endereço do Imóvel', key: 'endereco_imovel', type: 'text' },
        { label: 'Duração (Meses)', key: 'meses_duracao', type: 'number' },
        { label: 'Valor do Aluguel', key: 'valor_aluguel', type: 'number' },
      ],
    },
    {
      name: 'Contrato de Obra (Empreitada)',
      content: 'Contrato para execução de obra no projeto {{nome_obra}}. A execução seguirá o cronograma previsto com entrega final em {{data_entrega}}. O custo estimado de materiais é de R$ {{custo_materiais}}.',
      fields: [
        { label: 'Nome da Obra', key: 'nome_obra', type: 'text' },
        { label: 'Data de Entrega', key: 'data_entrega', type: 'date' },
        { label: 'Custo de Materiais', key: 'custo_materiais', type: 'number' },
      ],
    },
    {
      name: 'Acordo de Confidencialidade (NDA)',
      content: 'As partes {{parte_a}} e {{parte_b}} concordam em manter sigilo absoluto sobre as informações compartilhadas durante o projeto {{projeto_sigiloso}}.',
      fields: [
        { label: 'Parte A', key: 'parte_a', type: 'text' },
        { label: 'Parte B', key: 'parte_b', type: 'text' },
        { label: 'Nome do Projeto', key: 'projeto_sigiloso', type: 'text' },
      ],
    }
  ];

  for (const t of templates) {
    await prisma.contractTemplate.create({
      data: {
        name: t.name,
        content: t.content,
        companyId: company.id,
        fields: {
          create: t.fields,
        },
      },
    });
  }

  console.log('Seed completed: Company, Admin and 4 Mock Templates created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
