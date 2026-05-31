import PDFDocument from 'pdfkit';
import { Contract, ContractTemplate } from '@prisma/client';

export class PDFService {
  static async generateContractPDF(contract: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(20).text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Número: ${contract.number}`, { align: 'right' });
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'right' });
      doc.moveDown(2);

      // Body
      doc.fontSize(14).font('Helvetica-Bold').text('1. OBJETO');
      doc.fontSize(12).font('Helvetica').text(contract.title);
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('2. PARTES');
      doc.fontSize(12).font('Helvetica').text(`Contratante: ${contract.company.name}`);
      doc.text(`Contratado: ${contract.relatedParty}`);
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('3. VALOR E VIGÊNCIA');
      doc.fontSize(12).font('Helvetica').text(`Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(contract.value))}`);
      doc.text(`Início: ${new Date(contract.startDate).toLocaleDateString('pt-BR')}`);
      doc.text(`Término: ${new Date(contract.endDate).toLocaleDateString('pt-BR')}`);
      doc.moveDown();

      if (contract.template && contract.filledFields) {
        doc.fontSize(14).font('Helvetica-Bold').text('4. CLÁUSULAS ESPECÍFICAS');
        const fields = contract.filledFields as Record<string, any>;
        Object.entries(fields).forEach(([key, value]) => {
          const fieldDef = contract.template.fields.find((f: any) => f.key === key);
          const label = fieldDef ? fieldDef.label : key;
          doc.fontSize(12).font('Helvetica').text(`${label}: ${value}`);
        });
        doc.moveDown();
      }

      // Signatures
      doc.moveDown(4);
      doc.fontSize(10).text('__________________________________________', { align: 'center' });
      doc.text(contract.company.name, { align: 'center' });
      doc.moveDown(2);
      doc.text('__________________________________________', { align: 'center' });
      doc.text(contract.relatedParty, { align: 'center' });

      doc.end();
    });
  }
}
