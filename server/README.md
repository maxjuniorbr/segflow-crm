# SegFlow CRM - Backend

API REST para gerenciamento de clientes e propostas/apólices de seguros.

---

## Tecnologias

- **Node.js** + Express
- **PostgreSQL** 16
- **JWT** (jsonwebtoken) para autenticação
- **Zod** para validação de schemas
- **bcryptjs** para hash de senhas
- **CORS** habilitado

---

## Estrutura

```
server/
├── config/
│   └── db.js              # Pool de conexão PostgreSQL
├── controllers/
│   ├── authController.js  # Login, registro, validação
│   ├── clientController.js
│   └── documentController.js
├── middleware/
│   └── index.js           # authMiddleware + validate (Zod)
├── routes/
│   └── index.js           # Definição de todas as rotas
├── schemas/
│   └── index.js           # Schemas Zod (validação)
└── scripts/
    ├── dropDbLocal.js     # Limpar banco (apenas local)
    ├── initDbLocal.js     # Criar tabelas (apenas local)
    ├── initDbProd.js      # Criar tabelas (produção)
    └── seedDbLocal.js     # Dados de teste (git ignored)
```

---

## Variáveis de Ambiente

Criar arquivo `.env` na raiz de `server/`:

```env
PORT=3001
DATABASE_URL=postgresql://usuario:senha@localhost:5432/segflow_crm
JWT_SECRET=sua_chave_secreta_super_segura
NODE_ENV=development
```

### Descrição

- `PORT` - Porta do servidor (padrão: 3001)
- `DATABASE_URL` - String de conexão PostgreSQL
- `JWT_SECRET` - **OBRIGATÓRIO** - Chave para assinar tokens JWT
- `NODE_ENV` - Ambiente (`development` ou `production`)

---

## Scripts

### Desenvolvimento
```bash
npm run dev        # Inicia servidor com nodemon
```

### Banco de Dados (Local)
```bash
# 1. Limpar banco (CUIDADO: deleta tudo)
node scripts/dropDbLocal.js

# 2. Criar tabelas
node scripts/initDbLocal.js

# 3. Popular com dados de teste (opcional)
node scripts/seedDbLocal.js
```

> **Nota**: Scripts com sufixo `Local` **não rodam em produção** (verificam `NODE_ENV`).

### Banco de Dados (Produção)
```bash
# Criar tabelas em produção
node scripts/initDbProd.js
```

Executado automaticamente no primeiro deploy via `render.yaml`.

---

## Schema do Banco

### Tabela: `users`
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password` (VARCHAR) - hash bcrypt
- `username` (VARCHAR)
- `createdat` (TIMESTAMP)

### Tabela: `clients`
- `id` (VARCHAR PRIMARY KEY)
- `name`, `persontype`, `cpf`, `cnpj`, `rg`, `rgissuer`, `rgdispatchdate`
- `birthdate`, `maritalstatus`, `email`, `phone`
- `address` (JSONB) - {street, number, complement, neighborhood, city, state, zipCode}
- `notes` (TEXT)
- `createdat` (TIMESTAMP)

### Tabela: `documents`
- `id` (VARCHAR PRIMARY KEY)
- `clientid` (FK → clients.id CASCADE)
- `type`, `company`, `documentnumber`
- `startdate`, `enddate`, `status`
- `notes`, `attachmentname`
- `createdat` (TIMESTAMP)

---

## Endpoints da API

### Autenticação
```
POST   /api/register       - Criar novo usuário
POST   /api/login         - Login (retorna token JWT)
GET    /api/auth/validate - Validar token
```

### Clientes (requer autenticação)
```
GET    /api/clients           - Listar todos
GET    /api/clients/:id       - Buscar por ID
POST   /api/clients           - Criar novo
PUT    /api/clients/:id       - Atualizar
DELETE /api/clients/:id       - Deletar
```

### Documentos (requer autenticação)
```
GET    /api/documents         - Listar todos
POST   /api/documents         - Criar novo
PUT    /api/documents/:id     - Atualizar
DELETE /api/documents/:id     - Deletar
```

---

## Autenticação

Todas as rotas exceto `/register` e `/login` exigem header:

```
Authorization: Bearer <token_jwt>
```

**Middleware**: `authMiddleware` verifica token e injeta `req.user`.

---

## Validação de Dados

Schemas Zod aplicados via middleware `validate`:

- `registerSchema` - Email, password, username
- `loginSchema` - Email, password
- `clientSchema` - Todos os campos de cliente (PF/PJ)
- `documentSchema` - Campos de proposta/apólice

Erros retornam status `400` com array de erros Zod.

---

## Tratamento de Erros

- **401** - Token não fornecido
- **400** - Token inválido ou validação Zod falhou
- **500** - Erro interno (stack trace oculto em produção)

Logs de erro aparecem no console do servidor com `console.error`.

---

## Como Testar

### 1. Com Thunder Client / Postman

**Registrar**:
```http
POST http://localhost:3001/api/register
Content-Type: application/json

{
  "email": "teste@email.com",
  "password": "senha123",
  "username": "Teste"
}
```

**Login**:
```http
POST http://localhost:3001/api/login
Content-Type: application/json

{
  "email": "teste@email.com",
  "password": "senha123"
}
```

Retorna: `{ token: "...", user: {...} }`

**Listar Clientes** (com token):
```http
GET http://localhost:3001/api/clients
Authorization: Bearer SEU_TOKEN_AQUI
```

### 2. Via Interface Frontend

Execute o frontend (porta 5173) e teste pelo navegador.

---

## Observações Importantes

1. **JWT_SECRET** deve ser definido OBRIGATORIAMENTE (servidor não inicia sem)
2. **SSL do PostgreSQL** é habilitado apenas em `NODE_ENV=production`
3. Scripts `*Local.js` têm proteção e **não rodam em produção**
4. Validação Zod está aplicada em **POST e PUT** em todos os endpoints
5. Tratamento de erros oculta stack trace em produção

---

## Deploy (Render)

O servidor é deployado automaticamente via `render.yaml`:

- Build: `npm install && npm run init-db-prod`
- Start: `node index.js`
- Variáveis obrigatórias: `JWT_SECRET`
- `DATABASE_URL` é auto-configurado pelo Render

Consulte `/README.md` (raiz) para mais detalhes de deploy.
