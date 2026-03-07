---
name: vercel-react-best-practices
description: Fornece diretrizes de performance para React baseadas nas práticas da Vercel. Use ao desenvolver ou revisar componentes React, otimizar renderizações, busca de dados ou reduzir o tamanho de bundles.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Melhores Práticas React (Vercel)

Guia abrangente de otimização de performance para aplicações React e Next.js, mantido pela Vercel. Contém 57 regras divididas em 8 categorias, priorizadas de acordo com o impacto para guiar a refatoração e geração de código automatizadas.

## Quando Aplicar

Consulte estas diretrizes ao:
- Escrever novos componentes React ou páginas do Next.js
- Implementar data fetching (busca de dados - no lado do cliente ou servidor)
- Revisar o código procurando problemas de performance
- Refatorar códigos React/Next.js existentes
- Otimizar tamanho de bundle ou tempos de carregamento (load times)

## Aderência ao SegFlow CRM (React + Vite)

- Este projeto usa React + Vite e não possui dependência `next` no `package.json`.
- Aplique primeiro regras agnósticas de React (estado, renderização, efeitos, JS e bundle).
- Regras que dependem de APIs do Next.js (ex.: `next/dynamic`, `after()`, Server Actions) só se aplicam em contexto Next.js.
- Em React + Vite, prefira `React.lazy()` + `Suspense` + `import()` para code splitting.

## Categorias de Regras por Prioridade

| Prioridade | Categoria | Impacto | Prefixo |
|----------|----------|--------|--------|
| 1 | Eliminando Waterfalls (Gargalos Sequenciais) | CRÍTICO | `async-` |
| 2 | Otimização do Tamanho do Bundle | CRÍTICO | `bundle-` |
| 3 | Performance no Server-Side | ALTO | `server-` |
| 4 | Data Fetching no Client-Side | MÉDIO-ALTO | `client-` |
| 5 | Otimização de Re-renderização | MÉDIO | `rerender-` |
| 6 | Performance de Renderização | MÉDIO | `rendering-` |
| 7 | Performance do JavaScript | BAIXO-MÉDIO | `js-` |
| 8 | Padrões Avançados | BAIXO | `advanced-` |

## Referência Rápida

### 1. Eliminando Waterfalls (CRÍTICO)

- `async-defer-await` - Mova os `await` para o momento e contexto (branches) onde os dados são realmente utilizados
- `async-parallel` - Use `Promise.all()` para operações independentes
- `async-dependencies` - Use a lógica aprimorada (better-all) para lidar com dependências parciais
- `async-api-routes` - Inicie Promises logo no início, adie os `await` para mais tarde nas rotas de API
- `async-suspense-boundaries` - Use o `<Suspense>` para efetuar stream de conteúdo

### 2. Otimização do Tamanho do Bundle (CRÍTICO)

- `bundle-barrel-imports` - Importe os arquivos diretamente; evite usar "barrel files" (ex: `index.ts` agrupando vários exports)
- `bundle-dynamic-imports` - Em Next.js use `next/dynamic`; em React+Vite use `React.lazy()` com `Suspense`
- `bundle-defer-third-party` - Carregue scripts (analytics/logs) apenas após a hidratação (hydration)
- `bundle-conditional` - Só carregue os módulos quando a feature estiver ativada
- `bundle-preload` - Faça pré-carregamento no evento de hover/focus para acelerar a sensação de velocidade

### 3. Performance no Server-Side (ALTO)

- `server-auth-actions` - (Next.js) Autentique as server actions assim como faz nas API routes
- `server-cache-react` - Use `React.cache()` para a eliminação de duplicação por requisição
- `server-cache-lru` - Use cache LRU para realizar o cache cruzado entre requisições
- `server-dedup-props` - Evite serialização duplicada ao passar props nos RSC (React Server Components)
- `server-serialization` - Minimize a quantidade de dados passados para componentes clientes
- `server-parallel-fetching` - Reestruture seus componentes para paralelizar o fetching (busca) de dados
- `server-after-nonblocking` - (Next.js) Use `after()` para operações não-bloqueantes

### 4. Data Fetching no Client-Side (MÉDIO-ALTO)

- `client-swr-dedup` - Use SWR para evitar duplicação automática de requisições
- `client-event-listeners` - Dedup (remova duplicações) de event listeners globais
- `client-passive-event-listeners` - Use listeners passivos para eventos de rolagem (scroll)
- `client-localstorage-schema` - Versione e minimize os dados guardados em `localStorage`

### 5. Otimização de Re-renderização (MÉDIO)

- `rerender-defer-reads` - Não subscreva (subscribe) estados que só são utilizados dentro de callbacks
- `rerender-memo` - Extraia processamentos caros em componentes memoizados
- `rerender-memo-with-default-value` - Isole "props" padrão que não são tipos primitivos
- `rerender-dependencies` - Use apenas dependências primitivas dentro de arrays de dependências em `useEffect`
- `rerender-derived-state` - Faça o subscribe apenas de booleanos derivados em vez de seus valores brutos (raw)
- `rerender-derived-state-no-effect` - Derive estados durante o fluxo da renderização normal (e não usando `useEffect`)
- `rerender-functional-setstate` - Use setState de forma funcional para manter as instâncias de callback estáveis
- `rerender-lazy-state-init` - Passe uma função para o `useState` se for utilizar valores muito caros na iniciação do estado
- `rerender-simple-expression-in-memo` - Evite memoizar primitivas muito simples
- `rerender-move-effect-to-event` - Mova qualquer lógica reativa para dentro dos "handlers" de eventos (event handlers)
- `rerender-transitions` - Use `startTransition` para atualizações de interface que não são urgentes
- `rerender-use-ref-transient-values` - Use o `useRef` para valores transientes frequentes

### 6. Performance de Renderização (MÉDIO)

- `rendering-animate-svg-wrapper` - Anima o elemento `div` envolvendo, e não o próprio SVG
- `rendering-content-visibility` - Use a prop css `content-visibility` para listas grandes
- `rendering-hoist-jsx` - Extraia elementos JSX estáticos para o lado de fora do escopo do componente
- `rendering-svg-precision` - Reduza a precisão de coordenadas desenhadas no SVG
- `rendering-hydration-no-flicker` - Utilize injeção de script (inline) para dados exclusivos da camada cliente
- `rendering-hydration-suppress-warning` - Suprima mensagens caso o comportamento esperado do estado não gere casamento (mismatch) entre servidor e cliente
- `rendering-activity` - Use o `<Activity>` do React ao invés de controlar esconder/mostrar (display block) com CSS
- `rendering-conditional-render` - Use operadores ternários e não o operador sintático condicional `&&`
- `rendering-usetransition-loading` - Dê preferência a utilizar a funcionalidade do hook `useTransition` para criar o estado de carregamento

### 7. Performance do JavaScript (BAIXO-MÉDIO)

- `js-batch-dom-css` - Agrupe mudanças de estilo via classes ou `cssText`
- `js-index-maps` - Monte `Map` para lookups repetidos
- `js-cache-property-access` - Faça cache de acesso a propriedades em loops
- `js-cache-function-results` - Faça cache de resultados de função em `Map` no escopo de módulo
- `js-cache-storage` - Faça cache de leituras repetidas de `localStorage`/`sessionStorage`
- `js-combine-iterations` - Combine múltiplos `filter`/`map` em um único loop quando fizer sentido
- `js-length-check-first` - Verifique `length` antes de comparações custosas
- `js-early-exit` - Use retorno antecipado (early return)
- `js-hoist-regexp` - Içe criação de `RegExp` para fora de loops
- `js-min-max-loop` - Use loop para min/max em vez de `sort()`
- `js-set-map-lookups` - Use `Set`/`Map` para lookups O(1)
- `js-tosorted-immutable` - Use `toSorted()` para manter imutabilidade

### 8. Padrões Avançados (BAIXO)

- `advanced-event-handler-refs` - Guarde event handlers em refs
- `advanced-init-once` - Inicialize a aplicação uma vez por carregamento da página
- `advanced-use-latest` - Use `useLatest()` para manter refs de callback atualizadas

## Como Usar (How to Use)

Use a lista de atalho e referência rápida logo acima para priorizar refatorações. Para detalhes completos de cada regra, consulte `references/full-guide.md`.
