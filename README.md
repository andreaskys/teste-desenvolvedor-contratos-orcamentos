# Growth SaaS - Gestão de Contratos e Obras

Plataforma integrada para gestão de contratos, controle operacional de obras e automação de assinaturas eletrônicas.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js + Express** (API REST)
- **Prisma ORM** (Modelagem e Migrations)
- **PostgreSQL** (Banco de Dados)
- **pgvector** (Busca Semântica por IA)
- **node-cron** (Monitoramento de Prazos)
- **Multer** (Infraestrutura de Upload)

### Frontend
- **React + Vite**
- **TailwindCSS** (UI/UX Apple Style)
- **Zustand** (Gerenciamento de Estado)
- **Recharts** (Dashboard Analítico)
- **Lucide React** (Iconografia)

---

## 🛠️ Configuração e Instalação

### 1. Requisitos Próximos
- Node.js (v18+)
- Docker e Docker Compose (para o banco de dados)

### 2. Clonar e Instalar
```bash
git clone <url-do-repositorio>
cd teste-desenvolvedor-contratos-orcamentos
```

### 3. Banco de Dados (Docker)
Na raiz do projeto:
```bash
docker-compose up -d
```

### 4. Configuração do Backend
```bash
cd backend
npm install
cp .env.example .env
```
*Ajuste as variáveis no `.env` se necessário.*

**Executar Migrations e Seed:**
```bash
npx prisma migrate dev
npm run prisma:seed
```

### 5. Configuração do Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```

---

## 🏃 Executando o Projeto

### Iniciar Backend
```bash
cd backend
npm run dev
```
O servidor rodará em `http://localhost:3001`.

### Iniciar Frontend
```bash
cd frontend
npm run dev
```
O portal estará disponível em `http://localhost:5173`.

---

## 🔑 Credenciais de Teste
Acesse o sistema utilizando o usuário administrador criado pelo seed:
- **Email:** `admin@growth.com.br`
- **Senha:** `admin123`

---

## 🌟 Diferenciais Implementados
- **Busca Semântica (IA):** Utilize a barra de "Pesquisa IA" na tela de Templates para buscar contratos por conceito.
- **Isolamento Multi-tenant:** Dados estritamente protegidos por empresa (ID do Tenant).
- **Roteiro de Obra:** Controle completo de execução, vistorias fotográficas e financeiro.
- **Alertas Automáticos:** Notificações de vencimento geradas por jobs em background.
- **Fila de Assinaturas:** Monitoramento de envios com suporte a Webhooks.

---
Desenvolvido por **Andreas** - 2026.
