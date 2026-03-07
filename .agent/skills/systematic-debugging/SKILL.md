---
name: systematic-debugging
description: Fornece um método estruturado para investigação e correção de problemas. Use ao se deparar com qualquer bug, falha de teste ou comportamento inesperado, antes de propor correções.
---

# Debug Sistemático (Systematic Debugging)

## Visão Geral

Correções aleatórias desperdiçam tempo e criam novos bugs. "Patches" rápidos mascaram problemas subjacentes.

**Princípio central:** SEMPRE encontre a causa raiz antes de tentar fazer correções. Consertar apenas o sintoma é falhar.

**Violar a letra deste processo é violar o espírito de debugar.**

## A Regra de Ouro (The Iron Law)

```
NENHUMA CORREÇÃO SEM INVESTIGAÇÃO DA CAUSA RAIZ PRIMEIRO
```

Se você não concluiu a Fase 1, não pode propor correções.

## Quando Usar

Use para QUALQUER problema técnico:
- Falhas em testes
- Bugs em produção
- Comportamento inesperado
- Problemas de performance
- Falhas de compilação (build)
- Problemas de integração

**Use isto ESPECIALMENTE quando:**
- Estiver sob pressão de tempo (emergências tornam o "chutar" tentador)
- "Só uma correção rápida" parece óbvia
- Você já tentou múltiplas correções
- A correção anterior não funcionou
- Você não entende completamente o problema

**Não pule isso quando:**
- O problema parecer simples (bugs simples também têm causas raiz)
- Você estiver com pressa (apressar-se garante retrabalho)
- O gestor quiser o conserto AGORA MESMO (o método sistemático é mais rápido do que tentar às cegas)

## As Quatro Fases

Você DEVE completar cada fase antes de seguir para a próxima.

### Fase 1: Investigação da Causa Raiz

**ANTES de tentar QUALQUER correção:**

1. **Leia Mensagens de Erro Atentamente**
   - Não ignore (skip) erros ou avisos (warnings)
   - Eles frequentemente contêm a solução exata
   - Leia as *stack traces* (pilhas de chamadas) por completo
   - Anote os números das linhas, caminhos dos arquivos, códigos de erro

2. **Reproduza Consistentemente**
   - Você consegue engatilhar o erro com confiabilidade?
   - Quais são os passos exatos?
   - Acontece sempre?
   - Se não for reprodutível → obtenha mais dados, não chute

3. **Verifique Mudanças Recentes**
   - O que mudou que poderia causar isso?
   - `git diff`, commits recentes
   - Novas dependências, alterações de configuração
   - Diferenças de ambiente

4. **Reúna Evidências em Sistemas Multicomponentes**

   **QUANDO o sistema tiver múltiplos componentes (CI → build → assinatura, API → serviço → banco de dados):**

   **ANTES de propor correções, adicione instrumentação de diagnóstico:**
   ```
   Para CADA fronteira de componente:
     - Logue quais dados entram no componente
     - Logue quais dados saem do componente
     - Verifique a propagação de ambiente/configuração
     - Verifique o estado em cada camada

   Execute uma vez para coletar evidências mostrando ONDE quebra
   DEPOIS analise as evidências para identificar o componente falho
   DEPOIS investigue esse componente específico
   ```

   **Exemplo (sistema multi-camadas):**
   ```bash
   # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   env | grep IDENTITY || echo "IDENTITY not in environment"

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```

   **Isto revela:** Qual camada falha (secrets → workflow ✓, workflow → build ✗)

5. **Rastreie o Fluxo de Dados (Data Flow)**

   **QUANDO o erro estiver profundo na call stack:**

   Veja `references/root-cause-tracing.md` para a técnica completa de rastreamento reverso.

   **Versão rápida:**
   - Onde o valor ruim tem origem?
   - O que chamou isso passando um valor ruim?
   - Continue subindo no rastreamento até encontrar a origem
   - Conserte na origem, não no sintoma

### Fase 2: Análise de Padrão (Pattern Analysis)

**Encontre o padrão antes de consertar:**

1. **Encontre Exemplos Funcionais**
   - Localize um código funcional semelhante no mesmo codebase
   - O que funciona que seja similar ao que está quebrado?

2. **Compare com Referências**
   - Se estiver implementando um padrão, leia COMPLETAMENTE a implementação de referência
   - Não passe o olho - leia cada linha
   - Entenda completamente o padrão antes de aplicar

3. **Identifique Diferenças**
   - Qual a diferença entre o que funciona e o que está quebrado?
   - Liste todas as diferenças, por menores que sejam
   - Não assuma "isso não pode importar"

4. **Entenda Dependências**
   - Que outros componentes isso precisa?
   - Quais configurações (settings, config), ambiente?
   - Quais premissas ele estabelece?

### Fase 3: Hipótese e Teste

**Método científico:**

1. **Formule uma Hipótese Única**
   - Declare claramente: "Eu acho que X é a causa raiz por causa de Y"
   - Escreva
   - Seja específico, não vago

2. **Teste Minimamente**
   - Faça a MENOR mudança possível para testar a hipótese
   - Uma variável de cada vez
   - Não corrija múltiplas coisas ao mesmo tempo

3. **Verifique Antes de Continuar**
   - Funcionou? Sim → Fase 4
   - Não funcionou? Formule uma NOVA hipótese
   - NÃO adicione mais correções por cima do que já foi feito

4. **Quando Você Não Sabe**
   - Diga "Eu não entendo X"
   - Não finja que sabe
   - Peça ajuda
   - Pesquise mais

### Fase 4: Implementação

**Conserte a causa raiz, não o sintoma:**

1. **Crie um Caso de Teste Falhando**
   - A reprodução mais simples possível
   - Teste automatizado, se possível
   - Script de teste temporário (one-off) caso não tenha framework
   - DEVE existir antes de consertar
   - Use a skill `test-driven-development` para escrever os testes falhando adequadamente

2. **Implemente uma Única Correção**
   - Resolva a causa raiz identificada
   - UMA mudança por vez
   - Nada de melhorias do tipo "já que estou aqui..."
   - Sem refatorações aglomeradas (bundled refactoring)

3. **Verifique a Correção**
   - O teste passa agora?
   - Nenhum outro teste quebrou?
   - O problema foi realmente resolvido?

4. **Se a Correção Não Funcionar**
   - PARE
   - Conte: Quantas correções você já tentou?
   - Se < 3: Retorne para a Fase 1, reanalise com as novas informações
   - **Se ≥ 3: PARE e questione a arquitetura (passo 5 abaixo)**
   - NÃO tente a Correção #4 sem uma discussão arquitetural

5. **Se 3+ Correções Falharam: Questione a Arquitetura**

   **Padrão indicando problema arquitetural:**
   - Cada correção revela um novo estado compartilhado/acoplamento/problema em um local diferente
   - Correções exigem "refatoração maciça" para serem implementadas
   - Cada correção cria novos sintomas em outros lugares

   **PARE e questione os fundamentos:**
   - Este padrão é fundamentalmente sólido?
   - Estamos "mantendo-o só por inércia"?
   - Devemos refatorar a arquitetura versus continuar corrigindo sintomas?

   **Discuta com seu parceiro humano antes de tentar mais correções**

   Isso NÃO é uma hipótese falha - isso é uma arquitetura errada.

## Alertas Vermelhos - PARE e Siga o Processo

Se você se pegar pensando:
- "Correção rápida por agora, investigo depois"
- "Só vou tentar alterar X e ver se funciona"
- "Adicionar múltiplas alterações, rodar testes"
- "Pular o teste, vou verificar manualmente"
- "Provavelmente é X, deixa eu corrigir isso"
- "Não entendo completamente, mas isto pode funcionar"
- "O padrão diz X, mas eu vou adaptá-lo diferente"
- "Aqui estão os principais problemas: [lista as correções sem investigação]"
- Propondo soluções antes de rastrear o fluxo de dados (data flow)
- **"Só mais uma tentativa de correção" (quando já tentou 2+)**
- **Cada correção revela um novo problema em um lugar diferente**

**TODAS essas coisas significam: PARE. Retorne à Fase 1.**

**Se 3+ correções falharam:** Questione a arquitetura (veja Fase 4.5)

## Sinais de Que Você Está Fazendo Errado (Vindos do Seu Parceiro Humano)

**Atenção para estes redirecionamentos:**
- "Isso não está acontecendo?" - Você assumiu sem verificar
- "Isso vai nos mostrar...?" - Você deveria ter adicionado a coleta de evidências
- "Pare de chutar" - Você está propondo consertos sem entender
- "Ultrathink this" (Pense além) - Questione os fundamentos, não apenas os sintomas
- "Estamos travados?" (frustrado) - Sua abordagem não está funcionando

**Quando você ver isso:** PARE. Retorne para a Fase 1.

## Racionalizações Comuns

| Desculpa | Realidade |
|--------|---------|
| "O problema é simples, não precisa do processo" | Problemas simples também têm causas raiz. O processo é rápido para bugs simples. |
| "Emergência, sem tempo para processos" | O debug sistemático é MAIS RÁPIDO do que tentativa e erro às cegas. |
| "Apenas tente isso primeiro, depois investigue" | A primeira tentativa dita o padrão. Faça direito desde o início. |
| "Vou escrever o teste depois de confirmar que a correção funciona" | Correções não testadas não se mantêm. O teste primeiro prova isso. |
| "Múltiplas correções de uma vez economizam tempo" | Não se pode isolar o que funcionou. Causa novos bugs. |
| "A referência é muito longa, vou adaptar o padrão" | Entendimento parcial garante bugs. Leia por completo. |
| "Eu vejo o problema, deixe-me consertar" | Ver os sintomas ≠ entender a causa raiz. |
| "Só mais uma tentativa de correção" (após 2+ falhas) | 3+ falhas = problema arquitetural. Questione o padrão, não corrija de novo. |

## Referência Rápida

| Fase | Atividades Principais | Critérios de Sucesso |
|-------|---------------|------------------|
| **1. Causa Raiz** | Ler erros, reproduzir, checar mudanças, reunir evidências | Entender O QUÊ e o PORQUÊ |
| **2. Padrão** | Encontrar exemplos funcionais, comparar | Identificar diferenças |
| **3. Hipótese** | Formular teoria, testar o mínimo | Hipótese confirmada ou nova |
| **4. Implementação** | Criar teste, corrigir, verificar | Bug resolvido, testes passam |

## Quando o Processo Revela "Nenhuma Causa Raiz"

Se uma investigação sistemática revelar que o problema é genuinamente de ambiente, dependente de tempo de execução (timing) ou externo:

1. Você completou o processo
2. Documente o que você investigou
3. Implemente o tratamento adequado (retry, timeout, mensagem de erro)
4. Adicione monitoramento/logs para investigação futura

**Mas:** 95% dos casos de "nenhuma causa raiz" são, na verdade, investigações incompletas.

## Técnicas de Apoio

Estas técnicas fazem parte do debug sistemático e estão disponíveis neste diretório:

- **`references/root-cause-tracing.md`** - Rastreie bugs inversamente (de trás para frente) pela call stack (pilha de chamadas) para encontrar o gatilho original.
- **`references/defense-in-depth.md`** - Adicione validação em múltiplas camadas após encontrar a causa raiz.
- **`references/condition-based-waiting.md`** - Substitua timeouts arbitrários por polling (consulta) de condições.

**Skills Relacionadas:**
- **test-driven-development** - Para criar casos de testes que falham (Fase 4, Passo 1).
- **verification-before-completion** - Verifique se a correção funcionou antes de alegar sucesso.

## Impacto no Mundo Real

A partir de sessões de debug:
- Abordagem Sistemática: 15-30 minutos para consertar
- Abordagem de Correções Aleatórias: 2-3 horas de retrabalho "se debatendo" (thrashing)
- Taxa de sucesso de primeira: 95% vs 40%
- Novos bugs introduzidos: Próximo a zero vs comum
