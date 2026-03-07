# SegFlow CRM - Claude Code Instructions

## Language & Tone
- Code and documentation (README) in English; UI text and user-facing messages in pt-BR.
- Short, objective messages; professional and consistent tone.

## Design System
- Base tokens in `src/index.css`: `brand`, `neutral`, `success`, `warning`, `danger`, `info` — with `dark:` variants.
- Avoid colors outside tokens (e.g., `gray-*`); prefer `neutral-*`.
- Base components in `src/shared/components/UIComponents.tsx` with CVA variants (`cva()`).
- Use `cn()` from `src/utils/cn.ts` (clsx + tailwind-merge) for composing classes; never concatenate strings manually.
- `ErrorBoundary` in `src/shared/components/ErrorBoundary.tsx` wraps the app for unhandled error capture.
- Main layout in `src/shared/components/Layout.tsx`: dark sidebar on desktop, sticky mobile header.
- Dark mode: components already have `dark:` variants; respect this pattern when creating or editing components.

### List Pages Pattern
- `PageHeader` + `Card` with filters; `SearchInput` + `Select` as main filters.
- `SearchInput` uses `label="Buscar"` and filter row uses `sm:items-end`.
- Mobile uses `MobileListCard`; table from `sm` breakpoint.
- `TableRowButton` for clickable rows with keyboard navigation.

### Form Pages Pattern
- `max-w-*`, `space-y-4 sm:space-y-6`, `Card` per section; `Input/Select/TextArea/DateInput`.
- `InputWithButton` for fields with action (e.g., CEP); `FileDropzone` for upload.
- **Action bar**: fixed on mobile, static on desktop. Form element must have `space-y-4 sm:space-y-6`.
- Outer wrapper: `pb-24 sm:pb-0` to avoid overlay of fixed bar on mobile.

### Feedback Pattern
- `Alert` inline (CVA variants: `error`, `warning`, `info`, `success`) for form/loading errors.
- `Toast` (`useToast`) for action success/error.

### Status & Tags
- `Badge` for document status; `Tag` for lightweight categories.

### Menu State
- "Configuracoes" item only active when route starts with `/settings`.

### Contrast
- On light backgrounds, avoid `text-neutral-400` for support text; prefer `text-neutral-500`/`text-neutral-600`.

## Messages
- Centralize messages in `src/utils/*Messages.ts`; avoid hardcoding outside these files.
- `uiMessages` = aggregator of `uiBaseMessages`, `uiNavigationMessages`, `uiPageMessages`; avoid key collisions.
- Page copy: `uiMessages.pages.<feature>.actions` and `.form`; `tableHeaders` reuses `uiBaseMessages.labels`.
- Errors: `validationMessages` + labels from `uiMessages`/`uiBaseMessages`.
- Frontend: per-field error via `error` prop; `Alert` only for general errors; `Toast` for action success/error.
- Backend: errors thrown via `AppError` (`NotFoundError`, `UnauthorizedError`, `ValidationError`, `ConflictError`); centralized handler converts to HTTP responses. Input validation via Zod + `validate` middleware.

## Responsiveness
- `sm` breakpoint defines card-to-table switch.
- Forms use `pb-24` to avoid fixed bar overlay on mobile.

## Modals & ConfirmDialog
- `useModalBehavior` in `src/shared/hooks/useModalBehavior.ts`: shared hook for focus trap, Escape, body overflow lock, focus restoration. Use in every modal/dialog.
- `ConfirmDialog` API: `isOpen`, `onConfirm`, `onCancel`, `title`, `message`, `confirmText`, `cancelText`, `variant`. No `onClose`/`type` props.
- ARIA: `role="alertdialog"`, `aria-labelledby`, `aria-describedby`.

## Backend Architecture (Clean Architecture)
- Controllers only orchestrate and call use cases.
- Use cases contain business rules.
- Repositories isolate DB access; shared helpers in `server/src/infrastructure/repositories/queryHelpers.js`.
- Entities in `server/src/domain/entities` with `fromDatabase()` and `toJSON()`.
- Input validation with Zod + `validate` middleware; business errors via `AppError` subclasses (`server/src/application/errors/AppError.js`).
- Catch blocks not using the error must use bare `catch {` (no parameter).
- Auth: JWT with short-lived access token + refresh token (automatic rotation). Protected routes require `authMiddleware`. Auth routes under `/api/auth/*`.
- Local disposable DB: no incremental migrations; full recreation on startup.
- Table/column names in lowercase; FKs with cascade when applicable; unique indexes reflect business rules.
- Backend stays in JavaScript (JSDoc + `checkJs`); do not migrate to TypeScript.
- Listings and autocompletes must use remote search with pagination; avoid loading full lists on frontend.
- Clickable list items (mobile and table) must be keyboard-navigable and expose `aria-label` when needed.

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + PostgreSQL
- Validation: Zod
- Testing: Vitest + Testing Library + vitest-axe
- Styling: Tailwind CSS with CVA for component variants

## Testing
- Vitest for backend and frontend; Testing Library + vitest-axe for React components.
- Backend structure: `tests/controllers/`, `tests/unit/`, `tests/functional/`, `tests/security/`.
- Centralized mocks via `__mocks__/` convention (e.g., `server/config/__mocks__/db.js`, `__mocks__/bcryptjs.js`).
- Shared helpers in `tests/utils/`: `controllerTestUtils.js`, `testFactories.js`, `integrationTestUtils.js`, `testDbMock.js`.
- New features and bugfixes must include tests; run suite before declaring task complete.
- Never claim tests pass without executing and confirming output.

## Documentation
- Only one `README.md` at root; do not create READMEs in subfolders.
- Update README only when there is real impact on structure, flow, or setup.
- Whenever `package.json`, `server/package.json`, `server/.env.example`, `server/routes/**/*.js`, or `server/src/app.js` are modified, evaluate if README needs updating and apply it in the same iteration.

## Security
- All inputs must be validated and sanitized.
- Guard against SQL Injection, IDOR, Mass Assignment, and Broken Access Control.
- Passwords with secure hash; secrets in environment variables.
- Rate limiting and CORS configured correctly.
- Validation regex must be ReDoS-free: no lookaheads with `.*`; prefer individual character class tests.
- Dev logs must sanitize user-controlled data against log injection.

## Code Quality Principles
- Code should be self-explanatory; avoid comments. Comments only when strictly necessary.
- Follow Clean Architecture and coding patterns defined by the technology community.
- Maintain current technologies; preserve current folder structure.

## Debugging Methodology
Detailed guide: `.claude/skills/systematic-debugging/SKILL.md`

- Never propose fixes without understanding root cause.
- Four phases: Root Cause Investigation → Pattern Analysis → Hypothesis Testing → Implementation.
- If 3+ fixes fail, question the architecture.

## Verification Before Completion
Detailed guide: `.claude/skills/verification-before-completion/SKILL.md`

- No assertions of success without recent verification command execution.
- Always run tests and confirm output before declaring a task done.

## Reference Skills
Detailed skill guides are in `.claude/skills/`. Consult them when relevant:

| Skill | Path |
|---|---|
| Systematic Debugging | `.claude/skills/systematic-debugging/SKILL.md` |
| Verification Before Completion | `.claude/skills/verification-before-completion/SKILL.md` |
| Test-Driven Development | `.claude/skills/test-driven-development/SKILL.md` |
| Node.js Backend Patterns | `.claude/skills/nodejs-backend-patterns/SKILL.md` |
| Frontend Design | `.claude/skills/frontend-design/SKILL.md` |
| Tailwind Design System | `.claude/skills/tailwind-design-system/SKILL.md` |
| Responsive Design | `.claude/skills/responsive-design/SKILL.md` |
| TypeScript Advanced Types | `.claude/skills/typescript-advanced-types/SKILL.md` |
| PostgreSQL Table Design | `.claude/skills/postgresql-table-design/SKILL.md` |
| SQL Optimization | `.claude/skills/sql-optimization-patterns/SKILL.md` |
| Auth Implementation | `.claude/skills/auth-implementation-patterns/SKILL.md` |
| Error Handling | `.claude/skills/error-handling-patterns/SKILL.md` |
| JavaScript Testing | `.claude/skills/javascript-testing-patterns/SKILL.md` |
| Modern JavaScript | `.claude/skills/modern-javascript-patterns/SKILL.md` |
| Code Review | `.claude/skills/code-review-excellence/SKILL.md` |
| Vercel/React Best Practices | `.claude/skills/vercel-react-best-practices/SKILL.md` |
| Web Design Guidelines | `.claude/skills/web-design-guidelines/SKILL.md` |
