---
name: responsive-design
description: Orienta a implementação de layouts fluidos e responsivos (mobile-first, CSS Grid, container queries). Use ao construir interfaces adaptativas ou ajustar o comportamento responsivo de componentes.
---

# Design Responsivo (Responsive Design)

Domine as técnicas modernas de design responsivo para criar interfaces que se adaptam de forma contínua em todos os tamanhos de tela e contextos de dispositivos.

## Quando Usar Esta Skill

- Implementar layouts responsivos mobile-first
- Usar container queries para responsividade baseada em componentes
- Criar tipografia fluida e escalas de espaçamento
- Construir layouts complexos com CSS Grid e Flexbox
- Projetar estratégias de breakpoint para design systems
- Implementar imagens e mídias responsivas
- Criar padrões de navegação adaptativa
- Construir tabelas e exibições de dados responsivas

## Capacidades Principais (Core Capabilities)

### 1. Container Queries

- Responsividade no nível do componente, independente da viewport
- Unidades de container query (`cqi`, `cqw`, `cqh`)
- Style queries para estilização condicional
- Fallbacks para suporte de navegadores

### 2. Tipografia e Espaçamento Fluidos (Fluid Typography & Spacing)

- `clamp()` do CSS para escalonamento fluido
- Unidades relativas à viewport (`vw`, `vh`, `dvh`)
- Escalas de tipos fluidos com limites min/max
- Sistemas de espaçamento responsivos

### 3. Padrões de Layout

- CSS Grid para layouts 2D
- Flexbox para distribuição 1D
- Layouts intrínsecos (dimensionamento baseado no conteúdo)
- Subgrid para alinhamento de grades (grids) aninhadas

### 4. Estratégia de Breakpoint

- Media queries mobile-first
- Breakpoints baseados em conteúdo
- Integração de design tokens
- Consultas de recursos (Feature queries com `@supports`)

## Referência Rápida

### Escala de Breakpoints Moderna

```css
/* Breakpoints mobile-first */
/* Base: Mobile (< 640px) */
@media (min-width: 640px) {
  /* sm: Celulares em paisagem (Landscape), pequenos tablets */
}
@media (min-width: 768px) {
  /* md: Tablets */
}
@media (min-width: 1024px) {
  /* lg: Laptops, desktops pequenos */
}
@media (min-width: 1280px) {
  /* xl: Desktops */
}
@media (min-width: 1536px) {
  /* 2xl: Desktops grandes */
}

/* Equivalente no Tailwind CSS */
/* sm:  @media (min-width: 640px) */
/* md:  @media (min-width: 768px) */
/* lg:  @media (min-width: 1024px) */
/* xl:  @media (min-width: 1280px) */
/* 2xl: @media (min-width: 1536px) */
```

## Padrões Chave (Key Patterns)

### Padrão 1: Container Queries

```css
/* Define um contexto de contêiner */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Consulta o contêiner, não a viewport */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1rem;
  }

  .card-image {
    aspect-ratio: 1;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 250px 1fr;
  }

  .card-title {
    font-size: 1.5rem;
  }
}

/* Unidades de container query */
.card-title {
  /* 5% da largura do contêiner, restrito entre 1rem e 2rem */
  font-size: clamp(1rem, 5cqi, 2rem);
}
```

```tsx
// Componente React com container queries
function ResponsiveCard({ title, image, description }) {
  return (
    <div className="@container">
      <article className="flex flex-col @md:flex-row @md:gap-4">
        <img
          src={image}
          alt=""
          className="w-full @md:w-48 @lg:w-64 aspect-video @md:aspect-square object-cover"
        />
        <div className="p-4 @md:p-0">
          <h2 className="text-lg @md:text-xl @lg:text-2xl font-semibold">
            {title}
          </h2>
          <p className="mt-2 text-muted-foreground @md:line-clamp-3">
            {description}
          </p>
        </div>
      </article>
    </div>
  );
}
```

### Padrão 2: Tipografia Fluida (Fluid Typography)

```css
/* Escala de tipo fluida usando clamp() */
:root {
  /* Tamanho mínimo, preferido (fluido), tamanho máximo */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1rem + 1.25vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
  --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem);
}

/* Uso */
h1 {
  font-size: var(--text-4xl);
}
h2 {
  font-size: var(--text-3xl);
}
h3 {
  font-size: var(--text-2xl);
}
p {
  font-size: var(--text-base);
}

/* Escala de espaçamento fluida */
:root {
  --space-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
  --space-xl: clamp(2rem, 1.5rem + 2.5vw, 4rem);
}
```

```tsx
// Função utilitária para valores fluidos
function fluidValue(
  minSize: number,
  maxSize: number,
  minWidth = 320,
  maxWidth = 1280,
) {
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const yAxisIntersection = -minWidth * slope + minSize;

  return `clamp(${minSize}rem, ${yAxisIntersection.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxSize}rem)`;
}

// Gerar escala de tipo fluida
const fluidTypeScale = {
  sm: fluidValue(0.875, 1),
  base: fluidValue(1, 1.125),
  lg: fluidValue(1.25, 1.5),
  xl: fluidValue(1.5, 2),
  "2xl": fluidValue(2, 3),
};
```

### Padrão 3: Layout Responsivo com CSS Grid

```css
/* Grid auto-fit - itens quebram de linha automaticamente */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem;
}

/* Grid auto-fill - mantém colunas vazias */
.grid-auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* Grid responsivo com áreas nomeadas */
.page-layout {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
  gap: 1rem;
}

@media (min-width: 768px) {
  .page-layout {
    grid-template-columns: 1fr 300px;
    grid-template-areas:
      "header header"
      "main sidebar"
      "footer footer";
  }
}

@media (min-width: 1024px) {
  .page-layout {
    grid-template-columns: 250px 1fr 300px;
    grid-template-areas:
      "header header header"
      "nav main sidebar"
      "footer footer footer";
  }
}

.header {
  grid-area: header;
}
.main {
  grid-area: main;
}
.sidebar {
  grid-area: sidebar;
}
.footer {
  grid-area: footer;
}
```

```tsx
// Componente de Grid Responsivo
function ResponsiveGrid({ children, minItemWidth = "250px", gap = "1.5rem" }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  );
}

// Uso com Tailwind
function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Padrão 4: Navegação Responsiva

```tsx
function ResponsiveNav({ items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative">
      {/* Botão de menu mobile */}
      <button
        className="lg:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="nav-menu"
      >
        <span className="sr-only">Alternar navegação</span>
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Links de navegação */}
      <ul
        id="nav-menu"
        className={cn(
          // Base: escondido no mobile
          "absolute top-full left-0 right-0 bg-background border-b",
          "flex flex-col",
          // Mobile: desliza para baixo
          isOpen ? "flex" : "hidden",
          // Desktop: sempre visível, horizontal
          "lg:static lg:flex lg:flex-row lg:border-0 lg:bg-transparent",
        )}
      >
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={cn(
                "block px-4 py-3",
                "lg:px-3 lg:py-2",
                "hover:bg-muted lg:hover:bg-transparent lg:hover:text-primary",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### Padrão 5: Imagens Responsivas

```tsx
// Imagem responsiva com art direction
function ResponsiveHero() {
  return (
    <picture>
      {/* Art direction: cortes diferentes para telas diferentes */}
      <source
        media="(min-width: 1024px)"
        srcSet="/hero-wide.webp"
        type="image/webp"
      />
      <source
        media="(min-width: 768px)"
        srcSet="/hero-medium.webp"
        type="image/webp"
      />
      <source srcSet="/hero-mobile.webp" type="image/webp" />

      {/* Fallback */}
      <img
        src="/hero-mobile.jpg"
        alt="Descrição da imagem Hero"
        className="w-full h-auto"
        loading="eager"
        fetchpriority="high"
      />
    </picture>
  );
}

// Imagem responsiva usando srcset para troca de resolução
function ProductImage({ product }) {
  return (
    <img
      src={product.image}
      srcSet={`
        ${product.image}?w=400 400w,
        ${product.image}?w=800 800w,
        ${product.image}?w=1200 1200w
      `}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      alt={product.name}
      className="w-full h-auto object-cover"
      loading="lazy"
    />
  );
}
```

### Padrão 6: Tabelas Responsivas

```tsx
// Tabela responsiva com scroll horizontal
function ResponsiveTable({ data, columns }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-left p-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((col) => (
                <td key={col.key} className="p-3">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Tabela baseada em cards para mobile
function ResponsiveDataTable({ data, columns }) {
  return (
    <>
      {/* Tabela Desktop */}
      <table className="hidden sm:table w-full">
        {/* ... tabela padrão */}
      </table>

      {/* Cards Mobile */}
      <div className="sm:hidden space-y-4">
        {data.map((row, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {col.label}
                </span>
                <span>{row[col.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
```

## Viewport Units

```css
/* Unidades de viewport padrão */
.full-height {
  height: 100vh; /* Pode causar problemas em mobile */
}

/* Unidades dinâmicas de viewport (recomendado para mobile) */
.full-height-dynamic {
  height: 100dvh; /* Considera as barras de UI do browser mobile */
}

/* Viewport pequena (mínima) */
.min-full-height {
  min-height: 100svh;
}

/* Viewport grande (máxima) */
.max-full-height {
  max-height: 100lvh;
}

/* Dimensionamento de fonte relativo à viewport */
.hero-title {
  /* 5vw com limites min/max */
  font-size: clamp(2rem, 5vw, 4rem);
}
```

## Melhores Práticas

1. **Mobile-First**: Comece com estilos mobile, enriqueça para telas maiores
2. **Breakpoints por Conteúdo (Content Breakpoints)**: Defina breakpoints baseados no conteúdo, não em dispositivos específicos
3. **Fluido em vez de Fixo**: Use valores fluidos para tipografia e espaçamento
4. **Container Queries**: Use para responsividade no nível do componente
5. **Teste em Dispositivos Reais**: Simuladores não pegam todos os problemas
6. **Performance**: Otimize imagens, atrase o carregamento (lazy load) de conteúdos fora da tela
7. **Touch Targets (Áreas de toque)**: Mantenha um mínimo de 44x44px no mobile
8. **Propriedades Lógicas (Logical Properties)**: Use inline/block para suporte à internacionalização

## Problemas Comuns

- **Overflow Horizontal**: Conteúdo quebrando ou ultrapassando a viewport
- **Larguras Fixas (Fixed Widths)**: Usar `px` em vez de unidades relativas
- **Altura da Viewport (Viewport Height)**: Problemas com `100vh` em navegadores mobile
- **Tamanho da Fonte (Font Size)**: Texto muito pequeno no mobile
- **Touch Targets**: Botões pequenos demais para serem tocados com precisão
- **Proporção (Aspect Ratio)**: Imagens esmagadas ou esticadas
- **Empilhamento (Z-Index Stacking)**: Overlays quebrando em diferentes telas

## Recursos (Resources)

- [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)
- [Utopia Fluid Type Calculator](https://utopia.fyi/type/calculator/)
- [Every Layout](https://every-layout.dev/)
- [Responsive Images Guide](https://web.dev/responsive-images/)
- [CSS Grid Garden](https://cssgridgarden.com/)
