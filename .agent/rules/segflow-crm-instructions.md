---
trigger: always_on
---

# Instrucoes do agente (SegFlow CRM)

## Linguagem e tom
- Codigo em ingles; interface, textos e mensagens ao usuario em pt-BR.
- Mensagens curtas e objetivas, tom profissional e consistente.

## Design System (estado atual)
- Tokens base em `src/index.css`: `brand`, `neutral`, `success`, `warning`, `danger`, `info`.
- Evitar cores fora dos tokens (ex.: `gray-*`); preferir `neutral-*`.
- Componentes base em `src/shared/components/UIComponents.tsx`: `Alert`, `Button`, `Input`, `SearchInput`, `InputWithButton`, `DateInput`, `Select`, `TextArea`, `PageHeader`, `LoadingState`, `EmptyState`, `MobileListCard`, `Table*`, `Card`, `Badge`, `Tag`, `FileDropzone`, `SectionTitle`, `HelperText`.
- Layout principal em `src/shared/components/Layout.tsx`: sidebar escura no desktop e header mobile sticky.
- Padrao de listas:
  - `PageHeader` + `Card` com filtros.
  - `SearchInput` e `Select` como filtros principais.
  - Campo `SearchInput` deve usar `label="Buscar"` e o row de filtros usa `sm:items-end` para alinhar altura entre inputs.
  - Mobile com `MobileListCard` e tabela a partir de `sm`.
- Padrao de formularios:
  - `max-w-*`, `space-y-4 sm:space-y-6`, `Card` por secao.
  - `Input/Select/TextArea/DateInput` para campos.
  - `InputWithButton` para campos com acao (ex.: CEP).
  - `FileDropzone` para upload de arquivo.
  - Barra de acoes fixa no mobile (bottom) e estatica no desktop.
- Padrao de feedback:
  - `Alert` inline para erro de formulario ou carregamento local.
  - `Toast` (`useToast`) para sucesso e erros de acao.
- Padrões de status:
  - `Badge` para status de documento (Proposta/Apolice/Cancelado).
  - `Tag` para categorias leves (ex.: tipo de pessoa).
- Estado de menu:
  - Item "Configuracoes" so fica ativo quando rota inicia com `/settings`; nao manter estilo ativo fora dessas rotas.
- Contraste:
  - Em fundos claros, evitar `text-neutral-400` para textos de apoio; preferir `text-neutral-500`/`text-neutral-600`.

## Mensagens
- Centralizar mensagens em `src/utils/*Messages.ts` (action, confirm, validation, search, emptyState, auth, ui, dashboard).
- Evitar strings hardcoded fora desses arquivos, exceto labels muito especificas do campo.

## Responsividade
- `sm` define a troca de cards moveis para tabela.
- Formularios usam `pb-24` para evitar overlay da barra fixa no mobile.

## ConfirmDialog
- API atual: `isOpen`, `onConfirm`, `onCancel`, `title`, `message`, `confirmText`, `cancelText`, `variant`.
- Nao usar props `onClose`/`type` (nao suportadas).

## Regras tecnicas (backend e qualidade)
- Manter tecnologias atuais (React+TS, Vite, Tailwind, Express, PostgreSQL, Zod, Vitest).
- Preservar a estrutura atual de pastas.
- Backend segue Clean Architecture:
  - Controllers apenas orquestram e chamam use cases.
  - Use cases concentram regras de negocio.
  - Repositories isolam acesso ao banco.
  - Entidades em `server/src/domain/entities` com `fromDatabase()` e `toJSON()`.
- Validacoes apenas com Zod + middleware `validate`.
- Autenticacao via JWT; rotas protegidas exigem middleware.
- Banco local descartavel: sem migrations incrementais; recriacao completa no startup.
- Nomes de tabelas/colunas em lowercase; FKs com cascade quando aplicavel; indices unicos refletem regra de negocio.
- Backend permanece em JavaScript (JSDoc + `checkJs`), nao migrar para TS.

## Documentacao e processos
- Deve existir apenas um `README.md` na raiz; nao criar READMEs em subpastas.
- Atualizar README apenas quando houver impacto real em estrutura, fluxo ou setup.

## Segurança
- Todas as entradas devem ser validadas e sanitizadas.
- Preparar contra SQL Injection, IDOR, Mass Assignment e Broken Access Control.
- Senhas com hash seguro; segredos em variaveis de ambiente.
- Rate limiting e CORS configurados corretamente.

## Observacoes de consistencia (estado atual)
- Nenhuma observacao aberta; manter padroes atuais sem introduzir excecoes.
