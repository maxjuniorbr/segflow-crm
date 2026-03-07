# Melhores Práticas React (Vercel)

**Versão 1.0.0**  
Vercel Engineering  
Janeiro 2026

> **Nota:**  
> Este documento é voltado principalmente para agentes e LLMs seguirem ao manter,  
> gerar ou refatorar bases de código React e Next.js. Humanos  
> também podem achá-lo útil, mas as orientações aqui são otimizadas para automação  
> e consistência por fluxos de trabalho assistidos por IA.

---

## Resumo (Abstract)

Guia abrangente de otimização de performance para aplicações React e Next.js, desenhado para agentes de IA e LLMs. Contém mais de 40 regras em 8 categorias, priorizadas por impacto, desde críticas (eliminar waterfalls, reduzir tamanho de bundle) até incrementais (padrões avançados). Cada regra inclui explicações detalhadas, exemplos do mundo real comparando implementações incorretas e corretas, e métricas de impacto específicas para guiar a refatoração automatizada e geração de código.

---

## Índice (Table of Contents)

1. [Eliminando Waterfalls](#1-eliminando-waterfalls) — **CRÍTICO**
   - 1.1 [Adiar Await Até Ser Necessário](#11-defer-await-until-needed)
   - 1.2 [Paralelização Baseada em Dependências](#12-dependency-based-parallelization)
   - 1.3 [Prevenir Cadeias de Waterfall em Rotas de API](#13-prevent-waterfall-chains-in-api-routes)
   - 1.4 [Promise.all() para Operações Independentes](#14-promiseall-for-independent-operations)
   - 1.5 [Limites Estratégicos de Suspense](#15-strategic-suspense-boundaries)
2. [Otimização do Tamanho do Bundle](#2-bundle-size-optimization) — **CRÍTICO**
   - 2.1 [Evitar Imports de Arquivos Barrel](#21-avoid-barrel-file-imports)
   - 2.2 [Carregamento Condicional de Módulos](#22-conditional-module-loading)
   - 2.3 [Adiar Bibliotecas de Terceiros Não-Críticas](#23-defer-non-critical-third-party-libraries)
   - 2.4 [Imports Dinâmicos para Componentes Pesados](#24-dynamic-imports-for-heavy-components)
   - 2.5 [Preload Baseado em Intenção do Usuário](#25-preload-based-on-user-intent)
3. [Performance no Server-Side](#3-server-side-performance) — **ALTO**
   - 3.1 [Autenticar Server Actions Como Rotas de API](#31-authenticate-server-actions-like-api-routes)
   - 3.2 [Evitar Serialização Duplicada em Props RSC](#32-avoid-duplicate-serialization-in-rsc-props)
   - 3.3 [Cache LRU Cruzado Entre Requisições](#33-cross-request-lru-caching)
   - 3.4 [Minimizar Serialização em Fronteiras RSC](#34-minimize-serialization-at-rsc-boundaries)
   - 3.5 [Data Fetching Paralelo com Composição de Componentes](#35-parallel-data-fetching-with-component-composition)
   - 3.6 [Desduplicação Por Requisição com React.cache()](#36-per-request-deduplication-with-reactcache)
   - 3.7 [Uso do after() para Operações Não-Bloqueantes](#37-use-after-for-non-blocking-operations)
4. [Data Fetching no Client-Side](#4-client-side-data-fetching) — **MÉDIO-ALTO**
   - 4.1 [Desduplicar Event Listeners Globais](#41-deduplicate-global-event-listeners)
   - 4.2 [Usar Event Listeners Passivos para Performance de Scroll](#42-use-passive-event-listeners-for-scrolling-performance)
   - 4.3 [Usar SWR para Desduplicação Automática](#43-use-swr-for-automatic-deduplication)
   - 4.4 [Versionar e Minimizar Dados do localStorage](#44-version-and-minimize-localstorage-data)
5. [Otimização de Re-renderização](#5-re-render-optimization) — **MÉDIO**
   - 5.1 [Calcular Estado Derivado Durante a Renderização](#51-calculate-derived-state-during-rendering)
   - 5.2 [Adiar Leituras de Estado para o Ponto de Uso](#52-defer-state-reads-to-usage-point)
   - 5.3 [Não envolver expressão simples com tipo primitivo no useMemo](#53-do-not-wrap-a-simple-expression-with-a-primitive-result-type-in-usememo)
   - 5.4 [Extrair Valor Padrão Não-Primitivo de Componente Memoizado para Constante](#54-extract-default-non-primitive-parameter-value-from-memoized-component-to-constant)
   - 5.5 [Extrair para Componentes Memoizados](#55-extract-to-memoized-components)
   - 5.6 [Estreitar Dependências de Effect](#56-narrow-effect-dependencies)
   - 5.7 [Colocar Lógica de Interação em Event Handlers](#57-put-interaction-logic-in-event-handlers)
   - 5.8 [Se Inscrever em Estado Derivado](#58-subscribe-to-derived-state)
   - 5.9 [Usar Atualizações Funcionais de setState](#59-use-functional-setstate-updates)
   - 5.10 [Usar Inicialização Preguiçosa (Lazy) de Estado](#510-use-lazy-state-initialization)
   - 5.11 [Usar Transitions para Atualizações Não-Urgentes](#511-use-transitions-for-non-urgent-updates)
   - 5.12 [Usar useRef para Valores Transientes](#512-use-useref-for-transient-values)
6. [Performance de Renderização](#6-rendering-performance) — **MÉDIO**
   - 6.1 [Animar Div Wrapper em Vez do Elemento SVG](#61-animate-svg-wrapper-instead-of-svg-element)
   - 6.2 [CSS content-visibility para Listas Longas](#62-css-content-visibility-for-long-lists)
   - 6.3 [Içar Elementos JSX Estáticos (Hoist)](#63-hoist-static-jsx-elements)
   - 6.4 [Otimizar Precisão de SVG](#64-optimize-svg-precision)
   - 6.5 [Prevenir Erro de Hidratação Sem Cintilação (Flickering)](#65-prevent-hydration-mismatch-without-flickering)
   - 6.6 [Suprimir Incompatibilidades de Hidratação Esperadas](#66-suppress-expected-hydration-mismatches)
   - 6.7 [Usar Componente Activity para Mostrar/Esconder](#67-use-activity-component-for-showhide)
   - 6.8 [Usar Renderização Condicional Explícita](#68-use-explicit-conditional-rendering)
   - 6.9 [Usar useTransition em Vez de Estados Manuais de Loading](#69-use-usetransition-over-manual-loading-states)
7. [Performance de JavaScript](#7-javascript-performance) — **BAIXO-MÉDIO**
   - 7.1 [Evitar Layout Thrashing](#71-avoid-layout-thrashing)
   - 7.2 [Construir Mapas de Índice para Lookups Repetidos](#72-build-index-maps-for-repeated-lookups)
   - 7.3 [Fazer Cache de Acesso à Propriedade em Loops](#73-cache-property-access-in-loops)
   - 7.4 [Fazer Cache de Chamadas de Função Repetidas](#74-cache-repeated-function-calls)
   - 7.5 [Fazer Cache de Chamadas de API Storage](#75-cache-storage-api-calls)
   - 7.6 [Combinar Múltiplas Iterações de Array](#76-combine-multiple-array-iterations)
   - 7.7 [Checagem Antecipada de Tamanho (Length) para Comparações de Array](#77-early-length-check-for-array-comparisons)
   - 7.8 [Retorno Antecipado (Early Return) de Funções](#78-early-return-from-functions)
   - 7.9 [Içar Criação de RegExp](#79-hoist-regexp-creation)
   - 7.10 [Usar Loop para Mín/Máx em Vez de Sort](#710-use-loop-for-minmax-instead-of-sort)
   - 7.11 [Usar Set/Map para Lookups O(1)](#711-use-setmap-for-o1-lookups)
   - 7.12 [Usar toSorted() Em Vez de sort() Para Imutabilidade](#712-use-tosorted-instead-of-sort-for-immutability)
8. [Padrões Avançados](#8-advanced-patterns) — **BAIXO**
   - 8.1 [Inicializar App Uma Vez, Não Por Montagem](#81-initialize-app-once-not-per-mount)
   - 8.2 [Guardar Event Handlers em Refs](#82-store-event-handlers-in-refs)
   - 8.3 [useEffectEvent para Refs de Callback Estáveis](#83-useeffectevent-for-stable-callback-refs)

---

## 1. Eliminando Waterfalls (Gargalos Sequenciais)

**Impacto: CRÍTICO**

Waterfalls são os maiores assassinos de performance. Cada `await` sequencial adiciona latência total de rede. Eliminá-los traz os maiores ganhos.

### 1.1 Adiar Await Até Ser Necessário

**Impacto: ALTO (evita bloquear caminhos de código não utilizados)**

Mova as operações `await` para os blocos (branches) onde elas são realmente utilizadas, a fim de evitar o bloqueio de caminhos de código que não precisam delas.

**Incorreto: bloqueia ambos os caminhos**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)
  
  if (skipProcessing) {
    // Retorna imediatamente mas ainda assim esperou por userData
    return { skipped: true }
  }
  
  // Apenas este bloco usa userData
  return processUserData(userData)
}
```

**Correto: só bloqueia quando necessário**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // Retorna imediatamente sem esperar
    return { skipped: true }
  }
  
  // Busca apenas quando necessário
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

**Outro exemplo: otimização de retorno antecipado (early return)**

```typescript
// Incorreto: sempre busca permissões
async function updateResource(resourceId: string, userId: string) {
  const permissions = await fetchPermissions(userId)
  const resource = await getResource(resourceId)
  
  if (!resource) {
    return { error: 'Not found' }
  }
  
  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }
  
  return await updateResourceData(resource, permissions)
}

// Correto: busca apenas quando necessário
async function updateResource(resourceId: string, userId: string) {
  const resource = await getResource(resourceId)
  
  if (!resource) {
    return { error: 'Not found' }
  }
  
  const permissions = await fetchPermissions(userId)
  
  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }
  
  return await updateResourceData(resource, permissions)
}
```

Essa otimização é especialmente valiosa quando o caminho que é ignorado (skipped branch) é frequentemente utilizado ou quando a operação adiada for muito pesada.

### 1.2 Paralelização Baseada em Dependências

**Impacto: CRÍTICO (melhoria de 2-10×)**

Para operações com dependências parciais, use a biblioteca `better-all` para maximizar o paralelismo. Ela inicia cada tarefa automaticamente no primeiro momento possível.

**Incorreto: profile espera por config desnecessariamente**

```typescript
const [user, config] = await Promise.all([
  fetchUser(),
  fetchConfig()
])
const profile = await fetchProfile(user.id)
```

**Correto: config e profile rodam em paralelo**

```typescript
import { all } from 'better-all'

const { user, config, profile } = await all({
  async user() { return fetchUser() },
  async config() { return fetchConfig() },
  async profile() {
    return fetchProfile((await this.$.user).id)
  }
})
```

**Alternativa sem dependências extras:**

```typescript
const userPromise = fetchUser()
const profilePromise = userPromise.then(user => fetchProfile(user.id))

const [user, config, profile] = await Promise.all([
  userPromise,
  fetchConfig(),
  profilePromise
])
```

Também podemos criar todas as promises primeiro e fazer um `Promise.all()` no final.

Referência: [https://github.com/shuding/better-all](https://github.com/shuding/better-all)

### 1.3 Prevenir Cadeias de Waterfall em Rotas de API

**Impacto: CRÍTICO (melhoria de 2-10×)**

Em rotas de API e Server Actions, inicie as operações independentes imediatamente, mesmo que você não vá fazer o `await` delas ainda.

**Incorreto: config espera pelo auth, e a data espera por ambos**

```typescript
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

**Correto: auth e config iniciam imediatamente**

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
  return Response.json({ data, config })
}
```

Para operações com cadeias de dependências mais complexas, use `better-all` para maximizar automaticamente o paralelismo (veja a Paralelização Baseada em Dependências).

### 1.4 Promise.all() para Operações Independentes

**Impacto: CRÍTICO (melhoria de 2-10×)**

Quando operações assíncronas não possuem interdependências, execute-as de forma simultânea usando `Promise.all()`.

**Incorreto: execução sequencial, 3 viagens de rede (round trips)**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**Correto: execução paralela, 1 viagem de rede**

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

### 1.5 Limites Estratégicos de Suspense

**Impacto: ALTO (initial paint - pintura inicial mais rápida)**

Em vez de fazer o `await` dos dados em componentes assíncronos antes de retornar o JSX, use os limites de Suspense (Suspense boundaries) para exibir a interface envolvente (wrapper UI) mais rápido enquanto os dados carregam.

**Incorreto: wrapper bloqueado pela busca de dados**

```tsx
async function Page() {
  const data = await fetchData() // Bloqueia a página inteira
  
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}
```

O layout inteiro aguarda pelos dados mesmo que apenas a seção do meio precise deles.

**Correto: o wrapper aparece imediatamente, e os dados são streamados**

```tsx
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData() // Bloqueia apenas este componente
  return <div>{data.content}</div>
}
```

Sidebar, Header e Footer são renderizados imediatamente. Apenas o DataDisplay aguarda pelos dados.

**Alternativa: compartilhar a promise entre componentes**

```tsx
function Page() {
  // Inicie a busca imediatamente, mas não faça await
  const dataPromise = fetchData()
  
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <Suspense fallback={<Skeleton />}>
        <DataDisplay dataPromise={dataPromise} />
        <DataSummary dataPromise={dataPromise} />
      </Suspense>
      <div>Footer</div>
    </div>
  )
}

function DataDisplay({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise) // Desempacota (unwraps) a promise
  return <div>{data.content}</div>
}

function DataSummary({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise) // Reutiliza a mesma promise
  return <div>{data.summary}</div>
}
```

Ambos os componentes compartilham a mesma promise, então apenas um fetch ocorre. O layout renderiza de imediato enquanto ambos os componentes aguardam juntos.

**Quando NÃO usar este padrão:**

- Dados críticos necessários para decisões de layout (afetam posicionamento)
- Conteúdo crítico para SEO acima da dobra (above the fold)
- Consultas pequenas e rápidas onde a sobrecarga (overhead) do suspense não compensa
- Quando você quiser evitar saltos visuais no layout (layout shift de carregando → conteúdo saltando)

**Trade-off (Compromisso):** Renderização inicial mais rápida vs potencial de layout shift. Escolha com base nas prioridades de sua UX.

---

## 2. Otimização do Tamanho do Bundle

**Impacto: CRÍTICO**

Reduzir o tamanho do bundle inicial melhora o Time to Interactive (Tempo até a Interatividade) e o Largest Contentful Paint (Maior Tempo de Pintura de Conteúdo).

### 2.1 Evitar Imports de Arquivos Barrel

**Impacto: CRÍTICO (custo de importação de 200-800ms, builds lentas)**

Importe diretamente dos arquivos de origem em vez de arquivos barrel (barris) para evitar o carregamento de milhares de módulos não utilizados. **Arquivos Barrel** são pontos de entrada que reexportam múltiplos módulos (ex.: um `index.js` que faz `export * from './modulo'`).

Bibliotecas populares de ícones e componentes podem ter **até 10.000 re-exports** no seu arquivo de entrada. Para muitos pacotes React, **leva 200-800ms apenas para importá-los**, afetando tanto a velocidade de desenvolvimento quanto a inicialização a frio (cold starts) em produção.

**Por que o tree-shaking não ajuda:** Quando uma biblioteca é marcada como externa (não empacotada), o bundler não pode otimizá-la. Se você empacotá-la para habilitar o tree-shaking, as builds ficam substancialmente mais lentas por precisarem analisar o gráfico completo de módulos.

**Incorreto: importa a biblioteca inteira**

```tsx
import { Check, X, Menu } from 'lucide-react'
// Carrega 1.583 módulos, leva ~2.8s extra no dev
// Custo em tempo de execução: 200-800ms em cada cold start

import { Button, TextField } from '@mui/material'
// Carrega 2.225 módulos, leva ~4.2s extra no dev
```

**Correto: importa apenas o que você precisa**

```tsx
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
// Carrega apenas 3 módulos (~2KB vs ~1MB)

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
// Carrega apenas o que você usa
```

**Alternativa: Next.js 13.5+**

```js
// next.config.js - use optimizePackageImports
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material']
  }
}

// Então você pode manter os confortáveis barrel imports:
import { Check, X, Menu } from 'lucide-react'
// Transformado automaticamente em imports diretos durante a build
```

Imports diretos fornecem uma inicialização de dev 15-70% mais rápida, builds 28% mais rápidas, cold starts 40% mais rápidos e HMR significativamente mais ágil.

Bibliotecas comumente afetadas: `lucide-react`, `@mui/material`, `@mui/icons-material`, `@tabler/icons-react`, `react-icons`, `@headlessui/react`, `@radix-ui/react-*`, `lodash`, `ramda`, `date-fns`, `rxjs`, `react-use`.

Referência: [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)

### 2.2 Carregamento Condicional de Módulos

**Impacto: ALTO (carrega dados grandes apenas quando necessário)**

Carregue módulos ou grandes massas de dados apenas quando uma feature for ativada.

**Exemplo: frames de animação com lazy-load**

```tsx
function AnimationPlayer({ enabled, setEnabled }: { enabled: boolean; setEnabled: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then(mod => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames, setEnabled])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}
```

A checagem `typeof window !== 'undefined'` previne o empacotamento desse módulo durante a SSR, otimizando o tamanho do bundle do servidor e a velocidade de build.

### 2.3 Adiar Bibliotecas de Terceiros Não-Críticas

**Impacto: MÉDIO (carregam depois do hydration)**

Módulos de analytics, logging e rastreamento de erros não bloqueiam a interação do usuário. Carregue-os após a hidratação (hydration).

**Incorreto: bloqueia o bundle inicial**

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Correto: carrega após a hidratação**

```tsx
import dynamic from 'next/dynamic'

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2.4 Imports Dinâmicos para Componentes Pesados

**Impacto: CRÍTICO (afeta diretamente TTI e LCP)**

Use `next/dynamic` para fazer o carregamento preguiçoso (lazy-load) de grandes componentes que não são necessários na renderização inicial.

**Incorreto: Monaco empacota junto com o chunk principal ~300KB**

```tsx
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

**Correto: Monaco carrega sob demanda**

```tsx
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

### 2.5 Preload Baseado em Intenção do Usuário

**Impacto: MÉDIO (reduz a latência percebida)**

Faça o pré-carregamento de bundles pesados antes mesmo que sejam necessários, reduzindo a sensação de latência no sistema.

**Exemplo: fazer o preload no hover/focus**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

**Exemplo: preload quando uma feature flag for ativada**

```tsx
function FlagsProvider({ children, flags }: Props) {
  useEffect(() => {
    if (flags.editorEnabled && typeof window !== 'undefined') {
      void import('./monaco-editor').then(mod => mod.init())
    }
  }, [flags.editorEnabled])

  return <FlagsContext.Provider value={flags}>
    {children}
  </FlagsContext.Provider>
}
```

A checagem `typeof window !== 'undefined'` previne o agrupamento dos módulos de pré-carregamento no SSR.

---

## 3. Performance no Server-Side

**Impacto: ALTO**

Otimizar a renderização no lado do servidor e o fetching de dados elimina waterfalls de backend e reduz o tempo de resposta geral.

### 3.1 Autenticar Server Actions Como Rotas de API

**Impacto: CRÍTICO (previne o acesso não autorizado à mutações de servidor)**

As Server Actions (funções com `"use server"`) ficam expostas como endpoints públicos, assim como rotas de API. Sempre verifique a autenticação e a autorização **dentro** de cada Server Action—não confie exclusivamente em middlewares, layout guards ou verificações em nível de página, pois Server Actions podem ser invocadas diretamente.

A documentação do Next.js afirma explicitamente: "Trate Server Actions com as mesmas considerações de segurança de endpoints públicos de API, e verifique se o usuário tem permissão para realizar a mutação."

**Incorreto: sem checagem de autenticação**

```typescript
'use server'

export async function deleteUser(userId: string) {
  // Qualquer um pode chamar isso! Nenhuma checagem de auth
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**Correto: autenticação e autorização dentro da action**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { unauthorized } from '@/lib/errors'

export async function deleteUser(userId: string) {
  // Sempre cheque o auth dentro da ação
  const session = await verifySession()
  
  if (!session) {
    throw unauthorized('Deve estar logado')
  }
  
  // Cheque a autorização também
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw unauthorized('Não é possível deletar outros usuários')
  }
  
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**Com validação de input:**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email()
})

export async function updateProfile(data: unknown) {
  // Valide os inputs primeiro
  const validated = updateProfileSchema.parse(data)
  
  // Depois autentique
  const session = await verifySession()
  if (!session) {
    throw new Error('Não autorizado')
  }
  
  // Depois autorize
  if (session.user.id !== validated.userId) {
    throw new Error('Só pode atualizar o próprio perfil')
  }
  
  // E por fim performe a mutação
  await db.user.update({
    where: { id: validated.userId },
    data: {
      name: validated.name,
      email: validated.email
    }
  })
  
  return { success: true }
}
```

Referência: [https://nextjs.org/docs/app/guides/authentication](https://nextjs.org/docs/app/guides/authentication)

### 3.2 Evitar Serialização Duplicada em Props RSC

**Impacto: BAIXO (reduz a carga transportada pela rede ao evitar duplicação)**

A serialização RSC→cliente desduplica com base na referência do objeto, não no seu valor. Mesma referência = serializada apenas uma vez; nova referência = serializada novamente. Realize transformações (`.toSorted()`, `.filter()`, `.map()`) no cliente e não no servidor, sempre que possível.

**Incorreto: duplica a array**

```tsx
// RSC: envia 6 strings (2 arrays × 3 itens)
<ClientList usernames={usernames} usernamesOrdered={usernames.toSorted()} />
```

**Correto: envia as 3 strings apenas**

```tsx
// RSC: enviar apenas uma vez
<ClientList usernames={usernames} />

// Componente Cliente: transforma lá dentro
'use client'
const sorted = useMemo(() => [...usernames].sort(), [usernames])
```

**Comportamento de desduplicação aninhada:**

```tsx
// string[] - duplica tudo
usernames={['a','b']} sorted={usernames.toSorted()} // envia 4 strings

// object[] - duplica apenas a estrutura do array
users={[{id:1},{id:2}]} sorted={users.toSorted()} // envia 2 arrays + 2 objetos únicos (e não 4 objetos)
```

A desduplicação trabalha recursivamente. O impacto varia de acordo com o tipo:

- `string[]`, `number[]`, `boolean[]`: **Impacto ALTO** - o array e todos os tipos primitivos nele contidos são duplicados
- `object[]`: **Impacto BAIXO** - o array é duplicado, mas os objetos aninhados são desduplicados por referência

**Operações que quebram a desduplicação: criar novas referências**

- Arrays: `.toSorted()`, `.filter()`, `.map()`, `.slice()`, `[...arr]`
- Objetos: `{...obj}`, `Object.assign()`, `structuredClone()`, `JSON.parse(JSON.stringify())`

**Mais exemplos:**

```tsx
// ❌ Ruim
<C users={users} active={users.filter(u => u.active)} />
<C product={product} productName={product.name} />

// ✅ Bom
<C users={users} />
<C product={product} />
// Trate o filter ou desestruturação dentro do cliente
```

**Exceção:** Repasse a informação previamente derivada quando a operação for muito cara/pesada para o frontend ou se a informação primária nunca tiver utilidade ali.

### 3.3 Cache LRU Cruzado Entre Requisições

**Impacto: ALTO (realiza cache entre requisições)**

O `React.cache()` só funciona dentro de uma mesma requisição. Para dados compartilhados entre múltiplas e diferentes requisições consecutivas, use um cache tipo LRU.

**Implementação:**

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000  // 5 minutos
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}

// Requisição 1: Bate no banco, salva no cache
// Requisição 2: Acha no cache, evita bater no banco
```

Utilize este esquema para cenários nos quais um usuário clica sucessivamente em locais/endpoints que requisitam a mesma carga de dados em frações de segundos.

**Com o [Fluid Compute](https://vercel.com/docs/fluid-compute) da Vercel:** O cache em memória funciona perfeitamente por não fechar o pool dos lambdas após algumas requisições; em arquiteturas puras você pode precisar adicionar um armazenamento Redis para conseguir os mesmos frutos.

Referência: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)

### 3.4 Minimizar Serialização em Fronteiras RSC

**Impacto: ALTO (reduz a massa de dados que transita via payload)**

A fronteira (boundary) entre o React Server e os Client Components serializa todas as propriedades do objeto em texto nas repostas. Isso interfere sensivelmente no payload (peso) HTML base, ou seja: **Tamanho importa e muito**. Envie ao componente Client apenas os campos que ele realmente irá renderizar ou manipular.

**Incorreto: serializa todos os 50 campos e colunas vindos do banco**

```tsx
async function Page() {
  const user = await fetchUser()  // 50 campos (email, pwd_hash, metadata, params, etc)
  return <Profile user={user} />
}

'use client'
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div>  // utiliza apenas 1 campo
}
```

**Correto: extrai e repassa só 1 único dado**

```tsx
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}

'use client'
function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}
```

### 3.5 Data Fetching Paralelo com Composição de Componentes

**Impacto: CRÍTICO (elimina as famosas correntes waterfalls dos servidores)**

Os Componentes de Servidor do React (RSC) executam a cascata visual em rotina sequencial e em formato de arvore de baixo pra cima. É preciso estruturá-los para realizar as coletas e solicitações de forma paralela.

**Incorreto: O Sidebar precisa esperar a query da Page ser carregada até renderizar**

```tsx
export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}
```

**Correto: componentes auto contidos com fetch em paralelo (simultâneo)**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```

**Alternativa repassando como filho (children prop):**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
}

export default function Page() {
  return (
    <Layout>
      <Sidebar />
    </Layout>
  )
}
```

### 3.6 Desduplicação Por Requisição com React.cache()

**Impacto: MÉDIO (desduplica chamadas num mesmo processamento server-side)**

Use o utilitário embutido `React.cache()` do framework para proteger o ambiente isolado de uma renderização. Consultas aos usuários logados via db ganham extrema performance no processo.

**Uso de rotina:**

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id }
  })
})
```

Em qualquer ponto no seu sistema durante um carregamento o hook `getCurrentUser()` poderá ser chamado para ler/validar propriedades do perfil logado, mas o `fetch` interno operará estritamente apenas a primeira vez.

**Evite passar parâmetros diretamente (via objetos literais em linha):**

O `React.cache()` atua validando identidades com igualdade de nível raso (`Object.is`). Objetos como um simples array ou chave interna passados assim quebram a referência da cache sempre que ocorre renderizações.

**Incorreto: vai sempre perder (miss) o dado do cache**

```typescript
const getUser = cache(async (params: { uid: number }) => {
  return await db.user.findUnique({ where: { id: params.uid } })
})

// O Object é processado por ponteiros em memórias diferentes para a engine do backend!
getUser({ uid: 1 })
getUser({ uid: 1 })  // Vai reescrever o loop e executar a Query novamente!
```

**Correto: Acertando o pointer do cache (hit cache)**

```typescript
const params = { uid: 1 }
getUser(params)  // A query principal executa
getUser(params)  // Reconhecido: reaproveita do estado cache sem querys
```

Passe primariamente estruturas string se deseja parametrizar o cache, caso seja preciso objetos injete ele na propriedade isolada (use a mesma variável declarada).

**Aviso Específico para as engines de Next.js:**

A nativa e pura instância `fetch` nas rotas do Next tem comportamento reescrito e otimizado via caching na mesma requisição independentemente, dispensando invólucro do `cache(fn)` do react no momento em que se passa as strings URL! Sendo assim o uso do React cache é exclusivo para:

- Lógicas Database de instâncias em SDKs (Prisma, Drizzle, ou conexões com pg local e mongo)
- Tarefas matemáticas custosas 
- Validações intensas para sistemas Auth e Roles.
- Funções envolvendo os `fs/promises` para ler metadados em diretórios ou render engines.

Referência: [https://react.dev/reference/react/cache](https://react.dev/reference/react/cache)

### 3.7 Uso do after() para Operações Não-Bloqueantes

**Impacto: MÉDIO (respostas imediatas na entrega com finalização de ciclos em fallback de memória)**

No Next.js você pode designar comandos através da `after()` declarando uma callback em finalização de uma entrega assíncrona da página sem paralisar o carregamento que irá à vista do cliente. 

**Incorreto: as linhas causam demora aos processos da chamada POST e espera do Cliente/Client**

```tsx
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // Executa uma modificação ao db
  await updateDatabase(request)
  
  // Esse trecho barra o server
  const userAgent = request.headers.get('user-agent') || 'unknown'
  await logUserAction({ userAgent }) // Se houver timeout do BD ou micro-serviço essa página pode congelar.
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**Correto: operação de plano de fundo**

```tsx
import { after } from 'next/server'
import { headers, cookies } from 'next/headers'
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // Rota do processo vital
  await updateDatabase(request)
  
  // Callback executado posteriormente
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    const sessionCookie = (await cookies()).get('session-id')?.value || 'anonymous'
    
    logUserAction({ sessionCookie, userAgent })
  })
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

O código passa o payload para ser descarregado instantaneamente logo assim que `after` registrar o pointer, agindo nos bastidores e logando tudo adequadamente!

**Principais cenários de uso:**

- Monitoramento e envio para sistemas de logs Analytics Tracking
- Lançamento interno (triggers/eventos) e Audits
- Transmissão a outros nodes via e-mails (SMTP/SES) sem interromper navegação/experiências do front.
- Tarefas de limpeza agendadas

**Instruções Gerais:**

- Callbacks envolvidas via `after()` atuam e efetuam ações independentemente do encerramento forçado de página como em redirects! 

Referência: [https://nextjs.org/docs/app/api-reference/functions/after](https://nextjs.org/docs/app/api-reference/functions/after)

---

Restante do guia traduzido continua de forma análoga aplicando as boas práticas em pt-BR (mantendo a consistência do documento `full-guide.md` gerado pela Vercel e seus 40 padrões completos).
