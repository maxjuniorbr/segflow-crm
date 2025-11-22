# SegFlow CRM

Sistema de gerenciamento de clientes e propostas/apólices de seguros.

## 🚀 Tecnologias

### Frontend
- **React** + TypeScript + Vite
- **TailwindCSS** para estilização
- **React Router** para navegação
- **Lucide React** para ícones

### Backend
- **Node.js** + Express
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Zod** para validação de dados
- **bcryptjs** para hash de senhas

---

## 📁 Estrutura do Projeto

```
segflow-crm/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── contexts/          # Context API (Auth)
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços (API, storage)
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilitários (formatters)
│
├── server/                # Backend Node.js
│   ├── config/           # Configuração (DB)
│   ├── controllers/      # Lógica de negócio
│   ├── middleware/       # Middlewares (auth, validate)
│   ├── routes/           # Definição de rotas
│   ├── schemas/          # Schemas Zod
│   └── scripts/          # Scripts de banco de dados
│
└── render.yaml           # Configuração de deploy no Render
```

---

## 🏃 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 16+

### 1. Clonar o repositório
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
```env
PORT=3001
DATABASE_URL=postgresql://usuario:senha@localhost:5432/segflow_crm
JWT_SECRET=sua_chave_secreta_aqui
NODE_ENV=development
```

**Inicializar banco de dados**:
```bash
# Criar database e tabelas
node scripts/dropDbLocal.js  # Opcional: limpar banco
node scripts/initDbLocal.js

# Popular com dados de teste (opcional)
node scripts/seedDbLocal.js
```

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

## 📦 Scripts Disponíveis

### Frontend (raiz)
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build

### Backend (pasta server/)
- `npm run dev` - Servidor de desenvolvimento
- `node scripts/dropDbLocal.js` - Limpar banco local
- `node scripts/initDbLocal.js` - Criar tabelas
- `node scripts/seedDbLocal.js` - Popular com dados de teste

---

## 🌐 Deploy no Render

O projeto está configurado para deploy automático no Render usando o arquivo `render.yaml`.

### Serviços Configurados
1. **PostgreSQL** - Banco de dados
2. **Backend** (Node.js) - API REST
3. **Frontend** (Static Site) - Interface React

### Variáveis de Ambiente no Render

**Backend**:
- `JWT_SECRET` - Chave secreta para JWT (obrigatório)
- `DATABASE_URL` - URL do PostgreSQL (auto-configurado)
- `NODE_ENV` - `production` (auto-configurado)

**Frontend**:
- `VITE_API_URL` - URL do backend (ex: `https://seu-backend.onrender.com`)

### Deploy
1. Conecte o repositório ao Render
2. Configure as variáveis de ambiente
3. O deploy é automático a cada push na branch principal

---

## 🔐 Funcionalidades

- ✅ Autenticação com JWT
- ✅ Cadastro de clientes (PF/PJ)
- ✅ Gerenciamento de propostas/apólices
- ✅ Busca e filtros
- ✅ Consulta de CEP (BrasilAPI)
- ✅ Validação de dados com Zod
- ✅ Interface responsiva

---

## 📝 Observações

- Scripts de banco com prefixo `Local` **não rodam em produção** (têm verificação de `NODE_ENV`)
- O arquivo `seedDbLocal.js` está no `.gitignore` e contém dados de teste locais
- Para mais detalhes técnicos do backend, consulte `/server/README.md`
