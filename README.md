# SegFlow CRM

Management and multi-quote system for insurance brokerages, with a React frontend, a Node.js backend, and PostgreSQL.

Public page: https://maxjuniorbr.github.io/segflow-crm/

---

## What to Expect

- It centralizes clients, proposals, policies, and users in a single application.
- It separates frontend and backend, with its own API and PostgreSQL database.
- It uses JWT authentication with refresh token rotation.
- Official repository documents default to English; the public landing is available in EN and PT-BR.

## Core Features

- brokerage registration with an admin user
- client management for individuals and companies
- proposal and policy management
- dashboard with key metrics
- search, filters, and pagination
- zip code lookup through BrasilAPI
- responsive interface with light and dark themes

## Stack and Architecture

- Frontend: React 19, TypeScript, Vite, and Tailwind CSS v4
- Backend: Node.js, Express, PostgreSQL, Zod, and JWT
- Tests: Vitest, Testing Library, vitest-axe, and dedicated backend suites
- Quality: SonarCloud, Dependabot, and build validation
- Architecture: routes, controllers, use cases, entities, and repositories

## Run Locally

Requirements:

- Node.js 18+
- PostgreSQL 14+

Installation:

```bash
git clone https://github.com/maxjuniorbr/segflow-crm.git
cd segflow-crm
npm install
cd server
npm install
cp .env.example .env
cd ..
```

Run:

```bash
npm run dev
```

Web app: `http://localhost:5173`

## Main Scripts

At the repository root:

```bash
npm run dev            # frontend + backend in development
npm run build          # frontend production build
npm run preview        # local preview of the build
npm test               # full test suite
npm run test:backend   # backend tests
npm run test:frontend  # frontend tests
```

In the backend:

```bash
cd server
npm run dev            # local bootstrap + server
npm run test           # backend tests
```

## Quality and Validation

- `npm test`
- `npm run build`
- `npm exec tsc --noEmit`
- SonarCloud with an `A` Quality Gate target

## Project Documents

- Public page: https://maxjuniorbr.github.io/segflow-crm/
- Support: [SUPPORT.md](SUPPORT.md)
- Privacy: [PRIVACY.md](PRIVACY.md)
- Security: [SECURITY.md](SECURITY.md)

## License

MIT. See [LICENSE](LICENSE).
