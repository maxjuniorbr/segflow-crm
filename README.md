# SegFlow CRM

Sistema de gestão e multicálculo para corretoras de seguros, com frontend em React, backend em Node.js e banco PostgreSQL.

Página pública: https://maxjuniorbr.github.io/segflow-crm/

---

## O que você precisa saber

- centraliza clientes, propostas, apólices e usuários em uma única aplicação
- separa frontend e backend, com API própria e banco PostgreSQL
- usa autenticação com JWT e rotação de refresh token
- mantém os docs oficiais em PT-BR; a landing pública está em PT-BR e EN

## Principais recursos

- cadastro de corretora com usuário administrador
- cadastro de clientes PF e PJ
- gestão de propostas e apólices
- dashboard com métricas principais
- busca, filtros e paginação
- busca de CEP via BrasilAPI
- interface responsiva com tema claro e escuro

## Stack e arquitetura

- Frontend: React 19, TypeScript, Vite e Tailwind CSS v4
- Backend: Node.js, Express, PostgreSQL, Zod e JWT
- Testes: Vitest, Testing Library, vitest-axe e testes backend dedicados
- Qualidade: SonarCloud, Dependabot e validação de build
- Arquitetura: rotas, controllers, use cases, entidades e repositórios

## Como rodar localmente

Pré-requisitos:

- Node.js 18+
- PostgreSQL 14+

Instalação:

```bash
git clone https://github.com/maxjuniorbr/segflow-crm.git
cd segflow-crm
npm install
cd server
npm install
cp .env.example .env
cd ..
```

Execução:

```bash
npm run dev
```

Aplicação web: `http://localhost:5173`

## Scripts principais

Na raiz:

```bash
npm run dev            # frontend + backend em desenvolvimento
npm run build          # build de produção do frontend
npm run preview        # preview local do build
npm test               # suíte completa
npm run test:backend   # testes do backend
npm run test:frontend  # testes do frontend
```

No backend:

```bash
cd server
npm run dev            # bootstrap local + servidor
npm run test           # testes do backend
```

## Qualidade e validação

- `npm test`
- `npm run build`
- `npm exec tsc --noEmit`
- SonarCloud com Quality Gate no nível `A`

## Documentos do projeto

- Página pública: https://maxjuniorbr.github.io/segflow-crm/
- Suporte: [SUPPORT.md](SUPPORT.md)
- Privacidade: [PRIVACY.md](PRIVACY.md)
- Segurança: [SECURITY.md](SECURITY.md)

## Licença

MIT. Veja [LICENSE](LICENSE).
