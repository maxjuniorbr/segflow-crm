---
trigger: always_on
---

1. Código deve ser escrito em inglês; interface, textos e mensagens ao usuário devem ser em pt-BR.
2. Devem ser mantidas as tecnologias já adotadas no projeto (React+TS, Vite, Tailwind, Express, PostgreSQL, Zod, Vitest).
3. A estrutura atual de pastas do frontend e backend deve ser preservada.
4. O backend deve seguir Clean Architecture:
   - Controllers devem apenas orquestrar e chamar use cases.
   - Use cases devem concentrar as regras de negócio.
   - Repositories devem isolar o acesso ao banco.
   - Entidades devem ficar em `server/src/domain/entities` e expor `fromDatabase()` e `toJSON()`.
5. Validações devem ser feitas exclusivamente com Zod e middleware `validate`.
6. A autenticação deve ser via JWT; rotas protegidas devem exigir middleware.
7. Banco de dados:
   - PostgreSQL deve ser tratado como **descartável em ambiente local (dev)**.
   - **Não devem ser criadas migrations incrementais**.
   - Qualquer alteração de modelo deve pressupor **recriação completa do banco**.
   - A aplicação deve **criar toda a estrutura do banco automaticamente no startup**.
   - Nomes de tabelas e colunas devem ser em lowercase.
   - FKs devem usar cascade quando aplicável.
   - Índices únicos devem refletir as regras de negócio.
8. Frontend:
   - Máscaras, validações e mensagens de erro devem ser mantidas em pt-BR.
   - Deve haver sempre feedback visual (loading, erros, toasts).
9. Testes devem ser escritos com Vitest no frontend e no backend.
10. As configurações existentes de ESLint e Prettier devem ser respeitadas.
11. O backend deve permanecer em JavaScript, com tipagem via JSDoc + `checkJs` (não migrar para TypeScript).
12. Documentação:
    - Deve existir **apenas um único `README.md` na raiz** como fonte de verdade.
    - Não devem existir READMEs em subpastas.
    - O README deve ser atualizado sempre que houver mudança de estrutura, fluxo ou setup.
13. Tratamento de erros:
    - O backend deve usar `server/src/application/errors` para respostas padronizadas.
    - O frontend deve usar `src/services/api.ts` (`ApiError`).
14. Segurança:
    - Todas as entradas devem ser validadas e sanitizadas.
    - O projeto deve estar preparado contra SQL Injection, IDOR, Mass Assignment e Broken Access Control (no estado atual).
    - Senhas devem ser armazenadas com hash seguro.
    - Segredos devem ficar fora do código-fonte, via variáveis de ambiente.
    - Rate limiting e CORS devem ser configurados corretamente.
15. Controle de acesso por perfil (RBAC):
    - Não deve ser considerado obrigatório nesta fase inicial.
    - A ausência de RBAC não deve ser tratada como falha crítica.
    - A arquitetura deve facilitar implementação futura.
16. Processos guiados por arquivos `.md`:
    - Refatorações grandes devem começar com a criação de um `REFATORACAO.md` na raiz, contendo checklist e execução por etapas.
    - Auditorias de segurança devem gerar um `SEGURANCA.md` na raiz, listando apenas ações necessárias.
17. Em processos de auditoria:
    - Código não deve ser alterado automaticamente.
    - A saída deve se limitar à análise e geração do arquivo `.md` correspondente.