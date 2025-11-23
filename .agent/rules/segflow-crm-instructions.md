---
trigger: always_on
---

1. Código sempre em **inglês**; interface, textos e mensagens ao usuário em **pt-BR**.
2. Manter as tecnologias já adotadas no projeto (React+TS, Vite, Tailwind, Express, PostgreSQL, Zod).
3. Preservar a estrutura atual de pastas do frontend e backend.
4. Backend segue DDD; entidades com `fromDatabase()` e `toJSON()`.
5. Validação sempre com Zod e middleware `validate`.
6. Autenticação via JWT; rotas protegidas exigem middleware.
7. Banco: nomes em lowercase, FK com cascade, índices únicos conforme regras atuais.
8. Frontend: manter máscaras, validações e mensagens de erro em PT-BR.
9. Sempre garantir feedback visual (loading, erros, toasts).
10. Testes com Vitest no frontend e backend.
11. Respeitar ESLint e Prettier já configurados.
12. Mensagens de erro e interações do frontend sempre em português-brasileiro.
13. Atualizar README raiz e `server/` quando houver mudança estrutural.