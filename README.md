# SegFlow CRM

Um sistema completo de gerenciamento de clientes e propostas de seguros, desenvolvido com tecnologias modernas para oferecer uma experiência intuitiva e eficiente.

## ✨ Funcionalidades

- **Gerenciamento de Clientes**: Cadastro completo de pessoas físicas e jurídicas
- **Gerenciamento de Propostas/Apólices**: Criação, edição e acompanhamento de documentos de seguros
- **Dashboard Analítico**: Visão geral com estatísticas de clientes e documentos
- **Tipos de Seguro**: Suporte a múltiplos tipos (Automóvel, Vida, Residencial, Empresarial, Saúde, Viagem)
- **Status de Documentos**: Controle de status (Proposta, Apólice, Cancelado)
- **Interface Responsiva**: Design moderno e adaptável a diferentes dispositivos

## 🏗️ Arquitetura e Tecnologias

### Frontend
- **React 19**: Framework JavaScript para construção de interfaces
- **TypeScript**: Tipagem estática para maior robustez
- **Vite**: Ferramenta de build rápida e moderna
- **React Router**: Roteamento para navegação SPA
- **Lucide React**: Biblioteca de ícones vetoriais
- **Tailwind CSS**: Estilização via classes utilitárias

### Backend
- **Node.js**: Runtime JavaScript no servidor
- **Express.js**: Framework web minimalista
- **PostgreSQL**: Banco de dados relacional robusto
- **JWT**: Autenticação baseada em tokens
- **bcryptjs**: Hashing de senhas
- **Zod**: Validação de dados de entrada
- **CORS**: Controle de acesso cross-origin

### Estrutura do Projeto
```
segflow-crm/
├── src/                # Código fonte do Frontend
│   ├── components/     # Componentes React reutilizáveis
│   ├── contexts/       # Contextos React (Autenticação)
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços para API e armazenamento
│   ├── utils/          # Utilitários
│   ├── App.tsx         # Componente principal
│   ├── index.tsx       # Ponto de entrada
│   └── types.ts        # Definições de tipos TypeScript
├── server/             # Backend Node.js
│   ├── controllers/    # Controladores da API
│   ├── middleware/     # Middlewares (auth, validation)
│   ├── routes/         # Definição das rotas
│   ├── schemas/        # Schemas de validação Zod
│   ├── config/         # Configurações do banco
│   └── scripts/        # Scripts de inicialização
├── index.html          # HTML principal
├── vite.config.ts      # Configuração do Vite
└── package.json        # Dependências e scripts
```

## 🗄️ Modelo de Dados

### Cliente (Client)
- `id`: Identificador único
- `name`: Nome completo
- `personType`: Tipo de pessoa (Física ou Jurídica)
- `cpf`: CPF (para Pessoa Física)
- `cnpj`: CNPJ (para Pessoa Jurídica)
- `rg`: RG (para Pessoa Física)
- `rgDispatchDate`: Data de expedição do RG
- `rgIssuer`: Órgão expedidor do RG
- `birthDate`: Data de nascimento (Pessoa Física)
- `maritalStatus`: Estado civil (Pessoa Física)
- `email`: Email
- `phone`: Telefone
- `address`: Endereço completo (rua, número, complemento, bairro, cidade, estado, CEP)
- `notes`: Observações adicionais
- `createdAt`: Data de criação

### Documento (Document)
- `id`: Identificador único
- `clientId`: Referência ao cliente
- `type`: Tipo de seguro (Auto, Life, Residential, Corporate, Health, Travel)
- `company`: Companhia seguradora
- `documentNumber`: Número da proposta/apólice
- `startDate`: Data de início
- `endDate`: Data de término
- `status`: Status (Proposta, Apólice, Cancelado)
- `attachmentName`: Nome do anexo (opcional)
- `notes`: Observações
- `createdAt`: Data de criação

### Usuário (User)
- `id`: Identificador único
- `email`: Email do usuário
- `username`: Nome de usuário
- `password`: Senha (hashada)
- `createdAt`: Data de criação

## 🔌 API Endpoints

### Autenticação
- `POST /api/register` - Registro de novo usuário
- `POST /api/login` - Login de usuário

### Clientes (Protegidos por JWT)
- `GET /api/clients` - Listar todos os clientes
- `GET /api/clients/:id` - Obter cliente específico
- `POST /api/clients` - Criar novo cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Excluir cliente

### Documentos (Protegidos por JWT)
- `GET /api/documents` - Listar todos os documentos
- `POST /api/documents` - Criar novo documento
- `PUT /api/documents/:id` - Atualizar documento
- `DELETE /api/documents/:id` - Excluir documento

## 🛠️ Instalação e Execução Local

### Pré-requisitos
- Node.js (v18 ou superior)
- PostgreSQL instalado e rodando localmente

### Passos de Instalação

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/maxjuniorbr/segflow-crm.git
   cd segflow-crm
   ```

2. **Configure o Banco de Dados**:
   - Crie um banco de dados PostgreSQL:
     ```sql
     CREATE DATABASE segflow_crm;
     ```
   - Configure as variáveis de ambiente criando `server/.env`:
     ```env
     PORT=3001
     DATABASE_URL=postgres://postgres:sua_senha@localhost:5432/segflow_crm
     JWT_SECRET=segredo_super_secreto_local
     NODE_ENV=development
     ```

3. **Instale as dependências**:
   ```bash
   # Dependências do projeto raiz (frontend)
   npm install
   
   # Dependências do servidor (backend)
   cd server
   npm install
   cd ..
   ```

4. **Inicialize o banco de dados**:
   ```bash
   cd server
   node scripts/initDb.js
   cd ..
   ```

5. **Execute a aplicação**:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## ☁️ Deploy no Render

O projeto está configurado para deploy simplificado no Render:

1. **Banco de Dados**: Crie uma instância PostgreSQL no Render
2. **Web Service**: Configure o build e start commands
3. **Variáveis de Ambiente**: Configure DATABASE_URL, JWT_SECRET e NODE_ENV

## 🔒 Segurança

- **Autenticação JWT**: Todas as rotas sensíveis são protegidas
- **Validação de Dados**: Uso de Zod para validação rigorosa
- **Hashing de Senhas**: bcryptjs para armazenamento seguro
- **CORS**: Configurado para aceitar apenas origens confiáveis
- **Validação de Entrada**: Schemas para prevenir dados malformados

## 🚀 Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia desenvolvimento (frontend + backend)
- `npm run build` - Build de produção
- `npm run preview` - Preview do build

### Backend
- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm start` - Inicia servidor em produção

## 📈 Roadmap

- [x] Suporte a upload de anexos (nome do arquivo)
- [ ] Implementar gráficos no dashboard
- [ ] Adicionar notificações por email
- [ ] Relatórios avançados
- [ ] Integração com APIs de seguradoras
- [ ] Aplicativo móvel

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
