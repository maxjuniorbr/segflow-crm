---
description: Mantém o README.md atualizado automaticamente sempre que arquivos estruturais ou de configuração mudam.
paths: ["package.json", "server/package.json", "server/.env.example", "server/routes/**/*.js", "server/src/app.js", ".cursor/rules/*.mdc", ".cursor/skills/**/*.md", ".claude/CLAUDE.md", ".claude/rules/**/*.md", ".claude/skills/**/SKILL.md"]
---

# Manutenção da Consistência do README.md

O arquivo `README.md` é a documentação principal e a porta de entrada técnica e de negócios do projeto. Ele DEVE sempre refletir a realidade do código.

Sempre que você (AI) ou o usuário modificar algum dos arquivos monitorados por esta regra (`paths`), você deve avaliar silenciosamente se a mudança afeta o `README.md`. Se afetar, atualize o README na mesma iteração.

## Gatilhos Diretos de Atualização

1. Mudança em `package.json` ou `server/package.json`:
   - Verifique a seção **Tecnologias** (se uma biblioteca/ferramenta core foi adicionada/removida).
   - Verifique a seção **Scripts Disponíveis** (se os comandos `npm run` sofreram adição, deleção ou alteração).

2. Mudança em `server/.env.example`:
   - Mantenha a tabela da seção **Variáveis de Ambiente** 100% sincronizada com o arquivo de exemplo. Adicione ou remova colunas/linhas conforme necessário.

3. Mudança em `server/routes/**/*.js` ou `server/src/app.js`:
   - Atualize a seção **Endpoints da API (Resumo)** no README, refletindo as rotas exatas, deleções de rotas legadas, ou mudanças drásticas de middlewares.

4. Adição/Remoção de Skills e Rules (`.cursor/` ou `.claude/`):
   - Atualize a seção de instruções do agente no README para refletir a nova inteligência adicionada, removida ou migrada entre os dois ecossistemas.

## Restrições de Edição
- Faça atualizações cirúrgicas e localizadas no `README.md` (use replace de strings ou blocos de código).
- Mantenha a linguagem do documento focada nos públicos técnico e de produto (mensagens curtas, precisas e amigáveis).
- Não destrua ou edite a estrutura principal (como o gráfico Mermaid de Arquitetura), a menos que haja uma refatoração arquitetural explícita sendo conduzida.