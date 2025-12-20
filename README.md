# SegFlow CRM

Sistema de gerenciamento de clientes e propostas/apolices de seguros.

## Tecnologias

### Frontend
- **React** + TypeScript + Vite
- **TailwindCSS** para estilizacao
- **React Router** para navegacao
- **Lucide React** para icones

### Backend
- **Node.js** + Express
- **PostgreSQL** como banco de dados
- **JWT** para autenticacao
- **Zod** para validacao de dados
- **bcryptjs** para hash de senhas
- **JSDoc** para tipagem estatica (checkJS)

---

## Arquitetura (visao geral)

```
UI (React) -> services (fetch) -> Express routes -> controllers -> use cases -> repositories -> PostgreSQL
```

### Camadas
- UI/Transport: `routes`, `middleware`, `app`.
- Application: `controllers`, `useCases`, `dto`, `errors`.
- Domain: `entities`.
- Infrastructure: `repositories`, `db`.

---

## Estrutura do Projeto

```
segflow-crm/
├── src/                    # Frontend React
│   ├── contexts/          # Context API (Auth)
│   ├── features/          # Features (pages/components)
│   ├── services/          # Services (API, storage)
│   ├── shared/            # Shared UI components
│   ├── types.ts           # TypeScript types
│   └── utils/             # Utils (formatters)
│
├── server/                # Backend Node.js
│   ├── config/           # DB config (compat)
│   ├── controllers/      # Compatibility stubs
│   ├── middleware/       # Middlewares (auth, validate)
│   ├── routes/           # Route definitions
│   ├── schemas/          # Zod schemas
│   ├── scripts/          # Database scripts
│   ├── src/              # Application/Domain/Infrastructure
│   │   ├── app.js
│   │   ├── config/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   └── index.js           # Bootstrap do servidor
│
```

---

## Como Rodar Localmente

### Pre-requisitos
- Node.js 18+
- PostgreSQL 16+

### 1. Clonar o repositorio
```bash
git clone <url-do-repositorio>
cd segflow-crm
```

### 2. Configurar Backend

```bash
cd server
npm install
```

Criar arquivo `.env` na pasta `server/`:
```bash
cp server/.env.example server/.env
```

Edite o arquivo `.env` na pasta `server/`:
```env
PORT=3001
DATABASE_URL=postgresql://usuario:senha@localhost:5432/segflow_crm
JWT_SECRET=sua_chave_secreta_aqui
NODE_ENV=development
RESET_DB_ON_STARTUP=true
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Inicializar banco de dados**:
```bash
# Fluxo automatico no startup do backend (dev-only)
RESET_DB_ON_STARTUP=false npm run dev   # opcional para desativar
```
> Para reset manual, use `node scripts/dropDbLocal.js`, `node scripts/initDbLocal.js` e `node scripts/seedDbLocal.js`.
> O schema e criado localmente via `server/scripts/schemaDefinition.js`.

**Rodar servidor**:
```bash
npm run dev  # Roda na porta 3001
```

### 3. Configurar Frontend

Em outra janela do terminal:
```bash
cd segflow-crm  # Pasta raiz
npm install
npm run dev     # Roda na porta 5173
```

Acessar: `http://localhost:5173`

---

## Scripts Disponiveis

### Frontend (raiz)
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build do frontend
- `npm run preview` - Preview do build

### Backend (pasta server/)
- `npm run dev` - Servidor de desenvolvimento (reset/seed automatico em dev)
- `node scripts/dropDbLocal.js` - Limpar banco local
- `node scripts/initDbLocal.js` - Criar tabelas
- `node scripts/seedDbLocal.js` - Popular com dados de teste

### Testes

#### Backend
- `cd server && npm run test` - Vitest com mocks cobrindo controllers, entidades, use cases e repositorios

#### Frontend
- `npm run test` - Vitest + Testing Library para fluxos do React

---

## Banco de Dados (Dev)

O banco local e descartavel e recriado no startup do backend via `server/scripts/devBootstrap.js`.
Para desativar, defina `RESET_DB_ON_STARTUP=false`.

Nao existem migrations incrementais. O schema e criado a partir de `server/scripts/schemaDefinition.js`.

---

## Endpoints da API (Resumo)

### Autenticacao
```
POST   /api/register       - Criar novo usuario
POST   /api/login         - Login
GET    /api/auth/validate - Validar token
```

### Clientes (requer autenticacao)
```
GET    /api/clients           - Listar todos
GET    /api/clients/:id       - Buscar por ID
POST   /api/clients           - Criar novo
PUT    /api/clients/:id       - Atualizar
DELETE /api/clients/:id       - Deletar
```

### Documentos (requer autenticacao)
```
GET    /api/documents         - Listar todos
POST   /api/documents         - Criar novo
PUT    /api/documents/:id     - Atualizar
DELETE /api/documents/:id     - Deletar
```

---

## Tratamento de Erros

Backend: `server/src/application/errors` centraliza respostas e logging.
Frontend: `src/services/api.ts` padroniza mensagens via `ApiError`.

---

## Validacoes e Tipagem

Backend: schemas Zod em `server/schemas` sao aplicados via middleware `validate`.
Frontend: formularios validam campos criticos (CPF/CNPJ/email) e usam tipos em `src/types.ts`.
Backend JS usa JSDoc + `checkJs` para tipagem estatica.

---

## Funcionalidades

- Autenticacao com JWT via cookies HTTP-only
- Cadastro de clientes (PF/PJ)
- Gerenciamento de propostas/apolices
- Cadastro e manutencao de corretoras (Configuracoes)
- Busca e filtros
- Consulta de CEP (BrasilAPI)
- Validacao de dados com Zod
- Interface responsiva

---

## Refatoracao - Checklist

1) Diagnostico e alinhamento de arquitetura
2) Padronizacao de estrutura no backend (Clean Architecture)
3) DTOs e contratos de entrada/saida no backend
4) Camada de Use Cases
5) Camada de Repositorios
6) Padronizacao de tratamento de erros no backend
7) Validacoes e schema unicos
8) Padronizacao de entidades de dominio
9) Configuracao e bootstrap do servidor
10) Frontend: estrutura por feature
11) Frontend: tipagem e validacoes
12) Frontend: servicos e camada de dados
13) Testes: backend
14) Testes: frontend
15) Banco de dados (dev-only)
16) Documentacao tecnica

---

## Variaveis de Ambiente (Resumo)

**Backend**:
- `JWT_SECRET` - Chave secreta para JWT (obrigatorio)
- `DATABASE_URL` - URL do PostgreSQL
- `CORS_ALLOWED_ORIGINS` - Lista de origens permitidas separadas por virgula
- `NODE_ENV` - Ambiente atual (ex.: `development`)

**Frontend**:
- `VITE_API_URL` - URL do backend
