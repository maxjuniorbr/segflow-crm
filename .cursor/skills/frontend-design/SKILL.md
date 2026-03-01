---
name: frontend-design
description: Orienta a criação de interfaces frontend distintas, criativas e prontas para produção. Use ao construir ou estilizar componentes, páginas, layouts ou aplicações web.
---

Esta skill orienta a criação de interfaces frontend distintas e prontas para produção que evitam estéticas genéricas (conhecidas como "AI slop"). Implemente código real e funcional com excepcional atenção aos detalhes estéticos e escolhas criativas.

O usuário fornece os requisitos do frontend: um componente, página, aplicação ou interface a ser construída. Eles podem incluir o contexto sobre o propósito, público ou restrições técnicas.

## Design Thinking

Antes de codificar, entenda o contexto e comprometa-se com uma direção estética OUSADA:
- **Propósito**: Qual problema essa interface resolve? Quem a utiliza?
- **Tom**: Escolha um extremo: brutalmente minimalista, caos maximalista, retrofuturista, orgânico/natural, luxuoso/refinado, lúdico/brinquedo, editorial/revista, brutalista/cru, art déco/geométrico, suave/pastel, industrial/utilitário, etc. Existem muitos sabores para escolher. Use-os como inspiração, mas projete algo que seja fiel à direção estética escolhida.
- **Restrições**: Requisitos técnicos (framework, performance, acessibilidade).
- **Diferenciação**: O que torna isso INESQUECÍVEL? Qual é a única coisa da qual alguém vai se lembrar?

**CRÍTICO**: Escolha uma direção conceitual clara e a execute com precisão. Tanto o maximalismo ousado quanto o minimalismo refinado funcionam - a chave é a intencionalidade, não a intensidade.

Em seguida, implemente um código funcional (HTML/CSS/JS, React, Vue, etc.) que seja:
- Pronto para produção e funcional
- Visualmente impactante e memorável
- Coeso com um ponto de vista estético claro
- Meticulosamente refinado em cada detalhe

## Diretrizes Estéticas de Frontend

Foque em:
- **Tipografia**: Escolha fontes que sejam bonitas, únicas e interessantes. Evite fontes genéricas como Arial e Inter; prefira escolhas distintivas que elevem a estética do frontend. Combine uma fonte display distinta com uma fonte para corpo (body text) mais refinada.
- **Cores e Tema**: Comprometa-se com uma estética coesa. Use variáveis CSS para consistência. Cores dominantes com toques de destaque (accents) nítidos funcionam muito melhor do que paletas tímidas e distribuídas uniformemente.
- **Movimento (Motion)**: Use animações para efeitos e microinterações. Priorize soluções utilizando apenas CSS para HTML. Use a biblioteca Motion para React quando estiver disponível. Concentre-se em momentos de alto impacto: o carregamento de uma página bem orquestrada com revelações em cascata (animation-delay) cria mais deleite do que diversas microinterações espalhadas. Utilize gatilhos por scroll e estados de hover que tragam surpresas.
- **Composição Espacial**: Layouts inesperados. Assimetria. Sobreposições. Fluxo diagonal. Elementos que rompem a grade (grid-breaking). Amplo espaço negativo OU densidade controlada.
- **Fundos e Detalhes Visuais**: Crie atmosfera e profundidade em vez de apenas adotar cores sólidas. Adicione efeitos e texturas contextuais que combinem com a estética geral. Aplique formas criativas como malhas de gradiente (gradient meshes), texturas de ruído (noise), padrões geométricos, transparências em camadas, sombras dramáticas, bordas decorativas, cursores personalizados e sobreposições granuladas (grain overlays).

NUNCA use estéticas genéricas geradas por IA, como famílias de fonte excessivamente usadas (Inter, Roboto, Arial, system fonts), esquemas de cores clichês (especialmente gradientes roxos em fundos brancos), layouts previsíveis e padrões de componentes repetitivos (cookie-cutter) sem caráter específico do contexto.

Interprete de forma criativa e faça escolhas inusitadas que pareçam ter sido genuinamente desenhadas para o contexto. Nenhum design deve ser igual ao outro. Varie entre temas claros e escuros, fontes diferentes e estéticas diversificadas. NUNCA convergir para escolhas comuns (Space Grotesk, por exemplo) entre diferentes gerações de código.

**IMPORTANTE**: Ajuste a complexidade da implementação à visão estética. Designs maximalistas requerem códigos elaborados com extensas animações e efeitos. Designs minimalistas ou refinados precisam de moderação, precisão e uma atenção redobrada a espaçamentos, tipografia e detalhes sutis. A elegância é fruto de uma visão muito bem executada.

Comprometa-se com uma visão distinta e a execute com consistência, acessibilidade e código focado em produção.

Quando a tarefa for neste repositório (SegFlow CRM), mantenha estes guardrails:
- Use React + TypeScript + Vite + Tailwind; nao proponha Vue/Angular.
- Reutilize componentes de `src/shared/components/UIComponents.tsx` e utilitario `cn()` de `src/utils/cn.ts`.
- Respeite os tokens de `src/index.css` (`brand`, `neutral`, `success`, `warning`, `danger`, `info`) e evite cores fora dos tokens.
- Preserve acessibilidade e responsividade nos padroes do projeto.

Lembrete: o agente e capaz de produzir trabalho criativo de alto nivel. Nao se limite; busque uma execucao realmente distinta e bem acabada.
