# Contexto do Projeto - Growth SaaS

## 🎯 Visão Geral
Plataforma SaaS para gestão de contratos, assinaturas eletrônicas e controle de obras. O sistema permite que empresas gerenciem o ciclo de vida de contratos desde a criação via templates até a assinatura e acompanhamento físico-financeiro da obra vinculada.

## 🛠️ Stack Tecnológica
- **Frontend:** React, TypeScript, TailwindCSS, Zustand, Vite.
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL.
- **Infra:** Docker Compose (PostgreSQL + pgvector).

## 🏗️ Arquitetura e Funcionalidades Implementadas

### Backend (Node.js + Prisma)
- **Multi-tenancy:** Isolamento de dados por `Company` em todas as entidades.
- **Autenticação:** JWT com controle de roles (`ADMIN`, `MANAGER`, `OPERATOR`).
- **Templates de Contrato:** Sistema dinâmico de campos (`fields`) para criação de documentos personalizados.
- **Gestão de Contratos:** CRUD completo e fluxo de status (`DRAFT`, `PENDING_SIGNATURE`, `ACTIVE`, `EXPIRED`, `CANCELLED`).
- **Assinaturas:** Estrutura de `SignatureRequest` para controle de assinaturas digitais.
- **Gestão de Obras:** Cadastro de obras vinculado a contratos, com suporte a etapas (`steps`), custos (`costs`) e vistorias.
- **Audit Log:** Infraestrutura pronta para rastreamento de ações críticas.

### Frontend (React + Tailwind)
- **Design System:** Baseado em princípios da Apple (Clean, Spacing, Typography, Minimalismo).
- **Dashboard:** Indicadores rápidos de contratos e visão geral da plataforma.
- **Páginas de Contratos:** Listagem com filtros e criação dinâmica baseada no template selecionado.
- **Gestão de Templates:** Editor de templates que permite definir campos variáveis.
- **Gestão de Obras:** Interface para acompanhamento de obras e orçamentos.

## 📅 Sprints e Próximos Passos

### Sprint 2: Assinatura Real e Documentos
- [ ] Integração com API de assinatura digital (ZapSign, Docusign ou Clicksign).
- [ ] Sistema de Upload para `uploads` (S3 ou Local storage) e gestão de anexos.
- [ ] Geração automática de PDF (PDFKit ou Puppeteer) do contrato preenchido.

### Sprint 3: Analytics e Financeiro Avançado
- [ ] Dashboard com gráficos (Recharts) de evolução de custos (Reais vs Orçados).
- [ ] Gestão de Ordens de Compra (`PurchaseOrder`) e fluxo de aprovação.
- [ ] Relatórios exportáveis (Excel/PDF) de performance de obras.

### Sprint 4: UX e Notificações
- [ ] Fluxo de notificações (NodeMailer/Twilio) para assinaturas pendentes.
- [ ] Visualizador de Auditoria (`AuditLog`) para usuários Admin.
- [ ] Refinamentos de UI: Animações (Framer Motion) e feedbacks de carregamento (Skeletons).

## 🚀 Guia Rápido de Desenvolvimento
1. **Banco:** `docker-compose up -d`
2. **Backend:** `cd backend && npm run dev`
3. **Frontend:** `cd frontend && npm run dev`
4. **Seed:** Use `npm run prisma:seed` no backend para resetar dados de teste.

---
*Documento gerado e mantido pelo Gemini CLI para garantir a continuidade estratégica do projeto.*
