# Growth SaaS - Controle de Contratos e Gestão Orçamentária

Plataforma multi-tenant completa para gestão de contratos, assinaturas eletrônicas e acompanhamento operacional de obras. Desenvolvido com foco em alta performance e design minimalista inspirado nos padrões da Apple.

## 🚀 Stack Tecnológica

- **Frontend:** React, Vite, TailwindCSS, Zustand, Lucide React.
- **Backend:** Node.js, Express, Prisma ORM.
- **Banco de Dados:** PostgreSQL + pgvector (Docker).
- **Autenticação:** JWT (JSON Web Token).

## 🛠️ Como Executar o Projeto

### 1. Pré-requisitos
- Node.js (v18+)
- Docker e Docker Compose
- NPM ou Yarn

### 2. Configuração do Banco de Dados
Na raiz do projeto, suba o container do banco de dados:
```bash
docker-compose up -d
```

### 3. Configuração do Backend
```bash
cd backend
npm install
# Gere o cliente Prisma
npm run prisma:generate
# Rode as migrations para criar as tabelas
npm run prisma:migrate
# Popule o banco com dados iniciais (Admin: admin@modelo.com / admin123)
npm run prisma:seed
# Inicie o servidor
npm run dev
```

### 4. Configuração do Frontend
```bash
cd frontend
npm install
# Inicie o ambiente de desenvolvimento
npm run dev
```

O sistema estará acessível em: `http://localhost:5173`

## 📂 Estrutura do Projeto

### Backend
- `/prisma`: Schema do banco e scripts de seed.
- `/src/controllers`: Lógica de controle de rotas.
- `/src/services`: Lógica de negócio e integração com banco.
- `/src/middlewares`: Middlewares de autenticação e tenant.

### Frontend
- `/src/components`: Componentes UI reutilizáveis (Apple Design).
- `/src/pages`: Páginas da aplicação (Dashboard, Contratos, Obras).
- `/src/store`: Estado global com Zustand.
- `/src/api`: Cliente Axios configurado.

## 🔑 Credenciais de Acesso (Seed)
- **Usuário:** `admin@modelo.com`
- **Senha:** `admin123`

---
Desenvolvido por Gemini CLI - 2026.
