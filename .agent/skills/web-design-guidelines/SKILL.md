---
name: web-design-guidelines
description: Fornece diretrizes de qualidade de interface, UX e acessibilidade web. Use ao revisar código de UI, auditar design ou avaliar o frontend em relação a boas práticas.
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Diretrizes de Interface Web (Web Interface Guidelines)

Revise os arquivos buscando conformidade com as Web Interface Guidelines.

## Como Funciona

1. Obtenha (fetch) as diretrizes mais recentes na URL fonte abaixo.
2. Leia os arquivos especificados (ou pergunte ao usuário quais são os arquivos/padrão).
3. Verifique a conformidade contra todas as regras contidas nas diretrizes obtidas.
4. Forneça o resultado com os achados no formato sucinto `file:line`.

## Fonte das Diretrizes

Obtenha diretrizes atualizadas antes de cada revisão:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch para recuperar as regras mais recentes. O conteúdo obtido contém todas as regras e instruções de formato de saída.

## Uso

Quando um usuário fornece um arquivo ou argumento de padrão:
1. Obtenha as diretrizes da URL fonte acima.
2. Leia os arquivos especificados.
3. Aplique todas as regras das diretrizes obtidas.
4. Dê a saída com os achados usando o formato especificado nas diretrizes.

Se nenhum arquivo for especificado, pergunte ao usuário quais arquivos devem ser revisados.
