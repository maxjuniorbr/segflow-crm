---
name: nodejs-backend-patterns
description: Aplica padrões arquiteturais e boas práticas para o backend Node.js do SegFlow CRM. Use ao criar, refatorar ou revisar rotas, middlewares, controllers, casos de uso, repositórios ou testes no backend.
---

# Node.js Backend Patterns (SegFlow CRM)

## Objetivo

Aplicar um padrao unico para desenvolvimento backend no SegFlow CRM, priorizando:

- consistencia arquitetural com o codigo existente;
- seguranca por padrao;
- manutencao simples;
- validacao e testes confiaveis.

## Quando usar esta skill

Use esta skill quando a tarefa envolver backend em:

- `server/routes/*`
- `server/middleware/*`
- `server/controllers/*` (camada de compatibilidade/re-export; mantenha logica em `server/src/application/controllers/*`)
- `server/src/application/controllers/*`
- `server/src/application/useCases/*`
- `server/src/infrastructure/repositories/*`
- `server/src/domain/entities/*`
- `server/schemas/*`
- `server/tests/*`

## Escopo atual do projeto (fonte da verdade)

- **Runtime/Framework:** Node.js + Express
- **Linguagem backend:** JavaScript ESM com JSDoc e verificacao `checkJs` (via `server/jsconfig.json`; nao migrar para TypeScript)
- **Banco:** PostgreSQL via `pg` (`Pool`)
- **Validacao de entrada:** Zod + middleware `validate`
- **Auth:** JWT de acesso + refresh token com rotacao
- **Erros de negocio:** subclasses de `AppError`
- **Testes:** Vitest (+ Supertest para HTTP)

## Workflow recomendado

1. Defina/ajuste schema Zod em `server/schemas/index.js`.
2. Registre rota em `server/routes/index.js` com middlewares corretos.
3. Mantenha controller fino em `server/src/application/controllers/*`.
4. Coloque regra de negocio em `server/src/application/useCases/*`.
5. Mantenha SQL em `server/src/infrastructure/repositories/*` com queries parametrizadas.
6. Mapeie dados via entidades (`fromDatabase()`/`toJSON()`) e DTOs.
7. Padronize tratamento de erro com `respondWithError` e `AppError`.
8. Atualize/adicione testes de unidade e/ou integracao.

## Padrões obrigatorios por camada

### 1) Rotas e middlewares

- Ordem preferencial: `authMiddleware` -> limiter -> `validate(...)` -> controller.
- Para query/params, use explicitamente `validate(schema, { target: 'query' | 'params' })`.
- Reaproveite limiters existentes (`authLimiter`, `readLimiter`, `writeLimiter`).

Exemplo:

```javascript
router.put(
  '/clients/:id',
  authMiddleware,
  writeLimiter,
  validate(idParamSchema, { target: 'params' }),
  validate(clientSchema),
  updateClient
);
```

### 2) Controllers

- Apenas orquestram request/response.
- Nao conter regra de negocio complexa.
- Encaminhar falhas via `respondWithError`.

Exemplo:

```javascript
export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.cookie('segflow_token', result.token, accessCookieOptions());
    res.cookie('segflow_refresh', result.refreshToken, refreshCookieOptions());
    res.status(result.status).json(result.payload);
  } catch (err) {
    respondWithError(res, err, { context: 'login' });
  }
};
```

### 3) Use cases

- Concentram regras de negocio.
- Fazem validacoes de regra (nao de formato; formato fica no Zod).
- Controlam transacoes quando houver mais de uma operacao dependente.
- Devem retornar estrutura de resposta de caso de uso (`status` + `payload`).

### 4) Repositories

- Isolam acesso ao banco.
- Usar sempre placeholders (`$1`, `$2`, ...) com array de valores.
- Nunca concatenar entrada de usuario para montar SQL.
- Em entidades multi-tenant, sempre escopar por `broker_id` quando aplicavel.

Exemplo:

```javascript
const result = await pool.query(
  'SELECT id, name FROM users WHERE id = $1 AND broker_id = $2',
  [id, brokerId]
);
```

### 5) Entidades e DTOs

- Entidades em `server/src/domain/entities/*` devem manter:
  - `static fromDatabase(row)`
  - `toJSON()`
- Controllers/use cases devem expor dados via DTOs e `toJSON()`, nao row cru.

## Validacao de entrada (Zod)

- Defina schemas em `server/schemas/index.js`.
- Normalize e limite dados de entrada no schema (ex.: limites de tamanho, enums, dates).
- Use `superRefine` para regras de consistencia (ex.: CPF/CNPJ, data inicio/fim).

Exemplo:

```javascript
export const idParamSchema = z.object({
  id: z.string().min(1).max(255),
});
```

## Tratamento de erros

- Erros de negocio devem usar `AppError` e subclasses:
  - `NotFoundError`
  - `ValidationError`
  - `UnauthorizedError`
  - `ConflictError`
- Controllers devem delegar para `respondWithError`.
- Evite `throw new Error(...)` para cenarios de dominio previsiveis.

## Auth e sessao (padrao atual do SegFlow)

- Access token JWT:
  - payload minimo (`id`, `email`, `brokerId`)
  - algoritmo HS256
  - expiracao curta (atual: 15 min)
- Refresh token:
  - valor aleatorio (UUID)
  - armazenamento apenas em hash (SHA-256)
  - rotacao a cada refresh
  - revogacao/invalidacao no logout e em cenarios de reuso invalido
- Cookies:
  - `HttpOnly`
  - `SameSite='strict'`
  - `Secure` em producao
  - refresh cookie com escopo `path: '/api/auth'`

## Seguranca backend (checklist minimo)

- Validar toda entrada externa (body, query, params).
- Usar queries parametrizadas em 100% dos acessos SQL.
- Aplicar least privilege no banco (sem papeis administrativos na aplicacao).
- Garantir controle de acesso por tenant (`brokerId`) onde necessario.
- Manter `helmet`, `cors` restrito por allowlist e `compression`.
- Aplicar rate limiting em auth e operacoes sensiveis.
- Nao vazar stack trace em producao.

## Banco de dados e operacao local

- Usar `Pool` central de `server/config/db.js`.
- Em desenvolvimento local, banco e descartavel por bootstrap (`drop/init/seed`) no startup.
- Evitar criar fluxo que dependa de migrations incrementais locais.

## Testes (obrigatorio em mudancas relevantes)

Ao alterar backend:

- **Use case/repository:** adicionar ou ajustar testes de unidade.
- **Rotas/controllers/middlewares:** adicionar ou ajustar testes com Supertest.
- Cobrir ao menos:
  - caminho de sucesso;
  - erro de validacao;
  - erro de autorizacao/permissao;
  - regra de negocio critica alterada.

## Anti-patterns (nao fazer)

- Migrar backend para TypeScript.
- Colocar regra de negocio em controller.
- Concatenar SQL com input de usuario.
- Ignorar escopo de tenant (`brokerId`) em consultas sensiveis.
- Retornar entidade/row com campos sensiveis (ex.: hash de senha).
- Introduzir framework/stack fora do padrao do projeto sem pedido explicito.

## Referencias internas do projeto

- `server/src/app.js`
- `server/routes/index.js`
- `server/middleware/index.js`
- `server/src/application/controllers/authController.js`
- `server/src/application/useCases/authUseCases.js`
- `server/src/application/errors/AppError.js`
- `server/src/application/errors/respondWithError.js`
- `server/src/infrastructure/repositories/userRepository.js`
- `server/src/domain/entities/User.js`
- `server/schemas/index.js`
- `server/config/db.js`

## Fontes oficiais e confiaveis

- Node.js Security Best Practices: https://nodejs.org/en/learn/getting-started/security-best-practices
- Express middleware: https://expressjs.com/en/guide/writing-middleware.html
- Express error handling: https://expressjs.com/en/guide/error-handling.html
- node-postgres (queries parametrizadas): https://node-postgres.com/features/queries
- PostgreSQL docs (current): https://www.postgresql.org/docs/current/
- Zod docs: https://zod.dev/
- Vitest guide: https://vitest.dev/guide/
- Helmet docs: https://helmetjs.github.io/
- express-rate-limit docs: https://express-rate-limit.mintlify.app/overview
- OWASP REST Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- OWASP SQL Injection Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- JWT (RFC 7519): https://datatracker.ietf.org/doc/html/rfc7519
- JWT Best Current Practices (RFC 8725): https://datatracker.ietf.org/doc/html/rfc8725
- Cookies (RFC 6265): https://www.rfc-editor.org/rfc/rfc6265
- MDN Set-Cookie reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
