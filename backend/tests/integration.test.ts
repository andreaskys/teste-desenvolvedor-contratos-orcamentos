import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cleanDatabase } from './setup';

describe('Integration Tests - Growth SaaS', () => {
  let tokenA: string;
  let tokenB: string;
  let companyAId: string;
  let companyBId: string;
  let templateId: string;

  beforeAll(async () => {
    await cleanDatabase();

    const password = await bcrypt.hash('password123', 10);

    // Setup Company A
    const companyA = await prisma.company.create({
      data: { name: 'Tenant A', slug: 'tenant-a', cnpj: '11.111.111/0001-01' }
    });
    companyAId = companyA.id;
    const userA = await prisma.user.create({
      data: { email: 'user@a.com', password, name: 'User A', companyId: companyA.id, role: 'ADMIN' }
    });
    tokenA = jwt.sign({ userId: userA.id, companyId: companyA.id, role: userA.role }, process.env.JWT_SECRET || 'secret');

    // Setup Company B
    const companyB = await prisma.company.create({
      data: { name: 'Tenant B', slug: 'tenant-b', cnpj: '22.222.222/0001-02' }
    });
    companyBId = companyB.id;
    const userB = await prisma.user.create({
      data: { email: 'user@b.com', password, name: 'User B', companyId: companyB.id, role: 'ADMIN' }
    });
    tokenB = jwt.sign({ userId: userB.id, companyId: companyB.id, role: userB.role }, process.env.JWT_SECRET || 'secret');

    // Create a Template for Company A
    const template = await prisma.contractTemplate.create({
      data: {
        name: 'Obra Template',
        content: 'Content...',
        companyId: companyA.id,
        fields: { create: [{ label: 'Local', key: 'local', type: 'text' }] }
      }
    });
    templateId = template.id;
  });

  describe('Fluxo de Contratos', () => {
    it('deve criar um template com campos dinâmicos', async () => {
      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Template de Teste',
          content: 'Conteúdo do template {{campo1}}',
          fields: [
            { label: 'Campo 1', key: 'campo1', type: 'text', required: true }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Template de Teste');
      expect(res.body.fields).toHaveLength(1);
    });

    it('deve criar um contrato a partir de um template no status DRAFT', async () => {
      const res = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          number: 'CNT-001',
          title: 'Contrato Teste',
          value: 50000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000 * 30),
          templateId: templateId,
          status: 'DRAFT'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('DRAFT');
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('usuário da Empresa B NÃO deve conseguir ver contratos da Empresa A', async () => {
      // First create a contract for A
      const contractA = await prisma.contract.create({
        data: {
          number: 'CNT-A-SEC',
          title: 'Secret A',
          value: 100,
          startDate: new Date(),
          endDate: new Date(),
          companyId: companyAId,
          status: 'ACTIVE'
        }
      });

      const res = await request(app)
        .get(`/api/contracts/${contractA.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Contract not found');
    });
  });

  describe('Fluxo de Obras', () => {
    it('deve criar uma obra vinculada a um contrato da mesma empresa', async () => {
      const contract = await prisma.contract.findFirst({ where: { companyId: companyAId } });
      
      const res = await request(app)
        .post('/api/obras')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Edifício A',
          budget: 1000000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000 * 365),
          contractId: contract!.id
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Edifício A');
    });
  });
});
