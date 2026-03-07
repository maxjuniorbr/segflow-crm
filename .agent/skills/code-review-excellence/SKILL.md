---
name: code-review-excellence
description: Define práticas de revisão de código para feedback construtivo e detecção de bugs. Use ao revisar pull requests (PRs) ou estabelecer padrões de qualidade para o código de outros desenvolvedores.
---

# Excelência em Revisão de Código (Code Review Excellence)

Transforme as revisões de código de uma barreira (gatekeeping) para um compartilhamento de conhecimento através de feedback construtivo, análise sistemática e melhoria colaborativa.

## Quando Usar Esta Skill

- Revisar pull requests e mudanças de código
- Estabelecer padrões de code review para equipes
- Mentorar desenvolvedores juniores através de revisões
- Conduzir revisões de arquitetura
- Criar checklists e diretrizes (guidelines) de revisão
- Melhorar a colaboração da equipe
- Reduzir o tempo de ciclo (cycle time) de revisão de código
- Manter padrões de qualidade de código

## Princípios Principais (Core Principles)

### 1. A Mentalidade da Revisão (The Review Mindset)

**Objetivos da Revisão de Código:**

- Pegar bugs e casos limite (edge cases)
- Garantir a manutenibilidade do código
- Compartilhar conhecimento por toda a equipe
- Fazer cumprir padrões de codificação (coding standards)
- Melhorar o design e a arquitetura
- Construir a cultura da equipe

**O que NÃO são Objetivos:**

- Exibir conhecimento
- Implicar com formatação (use linters)
- Bloquear o progresso desnecessariamente
- Reescrever para o seu gosto pessoal

### 2. Feedback Eficiente

**O Bom Feedback é:**

- Específico e acionável
- Educacional, não julgador
- Focado no código, não na pessoa
- Equilibrado (elogie o bom trabalho também)
- Priorizado (crítico vs "nice-to-have")

```markdown
❌ Ruim: "Isto está errado."
✅ Bom: "Isto pode causar uma race condition quando múltiplos usuários
acessarem simultaneamente. Considere usar um mutex aqui."

❌ Ruim: "Por que você não usou o padrão X?"
✅ Bom: "Você considerou o padrão Repository? Ele tornaria
isto mais fácil de testar. Aqui está um exemplo: [link]"

❌ Ruim: "Renomeie esta variável."
✅ Bom: "[nit] Considere usar `userCount` em vez de `uc` para
clareza. Não é impeditivo se você preferir manter assim."
```

### 3. Escopo da Revisão (Review Scope)

**O que Revisar:**

- Correção da lógica e edge cases
- Vulnerabilidades de segurança
- Implicações de performance
- Cobertura e qualidade dos testes
- Tratamento de erros
- Documentação e comentários
- Design e nomenclatura de API
- Encaixe arquitetural

**O que Não Revisar Manualmente:**

- Formatação de código (use Prettier, Black, etc.)
- Organização de imports
- Violações de Linting
- Erros de digitação (typos) simples

## Processo de Revisão

### Fase 1: Coleta de Contexto (2-3 minutos)

```markdown
Antes de mergulhar no código, entenda:

1. Leia a descrição do PR e a issue linkada
2. Cheque o tamanho do PR (>400 linhas? Peça para dividir)
3. Revise o status de CI/CD (os testes passam?)
4. Entenda o requisito de negócios
5. Observe quaisquer decisões de arquitetura relevantes
```

### Fase 2: Revisão de Alto Nível (5-10 minutos)

```markdown
1. **Arquitetura & Design**
   - A solução se adequa ao problema?
   - Existem abordagens mais simples?
   - É consistente com padrões já existentes?
   - Vai escalar?

2. **Organização de Arquivos**
   - Os novos arquivos estão nos lugares certos?
   - O código está agrupado de forma lógica?
   - Existem arquivos duplicados?

3. **Estratégia de Testes**
   - Existem testes?
   - Os testes cobrem edge cases?
   - Os testes são legíveis?
```

### Fase 3: Revisão Linha por Linha (10-20 minutos)

```markdown
Para cada arquivo:

1. **Lógica & Correção**
   - Edge cases foram tratados?
   - Erros off-by-one?
   - Checagens de null/undefined?
   - Race conditions?

2. **Segurança**
   - Validação de inputs?
   - Riscos de SQL injection?
   - Vulnerabilidades de XSS?
   - Exposição de dados sensíveis?

3. **Performance**
   - N+1 queries?
   - Loops desnecessários?
   - Memory leaks?
   - Operações bloqueantes (blocking I/O)?

4. **Manutenibilidade**
   - Nomes de variáveis claros?
   - Funções fazendo apenas uma coisa?
   - Código complexo está autoexplicativo ou com comentários mínimos quando estritamente necessário?
   - Números mágicos (magic numbers) foram extraídos?
```

### Fase 4: Resumo & Decisão (2-3 minutos)

```markdown
1. Resuma as principais preocupações
2. Destaque o que você gostou
3. Tome uma decisão clara:
   - ✅ Approve (Aprovar)
   - 💬 Comment (Comentar: pequenas sugestões)
   - 🔄 Request Changes (Requerer mudanças: obrigatórias)
4. Ofereça-se para parear (pair programming) se for algo complexo
```

## Técnicas de Revisão

### Técnica 1: O Método do Checklist

```markdown
## Checklist de Segurança

- [ ] Input do usuário validado e higienizado (sanitized)
- [ ] Queries SQL usam parametrização
- [ ] Autenticação/autorização checada
- [ ] Segredos não estão "hardcoded" (fixos no código)
- [ ] Mensagens de erro não vazam informações

## Checklist de Performance

- [ ] Sem queries N+1
- [ ] Queries no banco de dados indexadas
- [ ] Listas grandes paginadas
- [ ] Operações caras cacheadas
- [ ] Sem I/O bloqueante (blocking I/O) em caminhos críticos (hot paths)

## Checklist de Testes

- [ ] Caminho feliz (happy path) testado
- [ ] Casos limite (edge cases) cobertos
- [ ] Casos de erro testados
- [ ] Nomes dos testes são descritivos
- [ ] Os testes são determinísticos
```

### Técnica 2: A Abordagem por Perguntas

Em vez de declarar os problemas, faça perguntas para encorajar o raciocínio:

```markdown
❌ "Isto vai falhar se a lista estiver vazia."
✅ "O que acontece se `items` for um array vazio?"

❌ "Você precisa de tratamento de erro aqui."
✅ "Como isto deveria se comportar se a chamada da API falhar?"

❌ "Isto é ineficiente."
✅ "Vejo que isto faz um loop em todos os usuários. Já consideramos
o impacto de performance com 100k usuários?"
```

### Técnica 3: Sugira, Não Ordene

```markdown
## Use Linguagem Colaborativa

❌ "Você tem que mudar isto para usar async/await"
✅ "Sugestão: async/await pode tornar isto mais legível:
    async function fetchUser(id: string) {
      const user = await db.query('SELECT * FROM users WHERE id = ?', id);
      return user;
    }
O que você acha?"

❌ "Extraia isto para uma função"
✅ "Esta lógica aparece em 3 lugares. Faria sentido
extraí-la para uma função utilitária compartilhada?"
```

### Técnica 4: Diferencie a Severidade

```markdown
Use labels (rótulos) para indicar prioridade:

🔴 [blocking] - Impeditivo. Deve ser consertado antes do merge
🟡 [important] - Importante. Deveria ser corrigido, debata se discordar
🟢 [nit] - Detalhe. Bom ter, não impeditivo
💡 [suggestion] - Sugestão. Abordagem alternativa para se pensar
📚 [learning] - Aprendizado. Comentário educativo, nenhuma ação exigida
🎉 [praise] - Elogio. Bom trabalho, continue assim!

Exemplo:
"🔴 [blocking] Esta query SQL está vulnerável a injection.
Por favor, use parameterized queries."

"🟢 [nit] Considere renomear `data` para `userData` para maior clareza."

"🎉 [praise] Excelente cobertura de testes! Isso vai pegar vários edge cases."
```

## Padrões Específicos por Linguagem

### Code Review em Python

```python
# Checar por problemas específicos de Python

# ❌ Argumentos default mutáveis
def add_item(item, items=[]):  # Bug! Compartilhado entre todas as chamadas
    items.append(item)
    return items

# ✅ Usar None como padrão
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

# ❌ Tratamento (catch) muito amplo
try:
    result = risky_operation()
except:  # Pega tudo, até mesmo KeyboardInterrupt!
    pass

# ✅ Tratar exceções específicas
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Valor inválido: {e}")
    raise

# ❌ Usando atributos de classe mutáveis
class User:
    permissions = []  # Compartilhado entre todas as instâncias!

# ✅ Inicializar dentro do __init__
class User:
    def __init__(self):
        self.permissions = []
```

### Code Review em TypeScript/JavaScript

```typescript
// Checar por problemas específicos de TypeScript

// ❌ Usar "any" anula a tipagem estática (type safety)
function processData(data: any) {  // Evite any
    return data.value;
}

// ✅ Usar os tipos corretos
interface DataPayload {
    value: string;
}
function processData(data: DataPayload) {
    return data.value;
}

// ❌ Não tratar erros assíncronos (async)
async function fetchUser(id: string) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();  // E se a rede falhar?
}

// ✅ Tratar erros corretamente
async function fetchUser(id: string): Promise<User> {
    try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Falha ao buscar usuário:', error);
        throw error;
    }
}

// ❌ Mutação de props (React)
function UserProfile({ user }: Props) {
    user.lastViewed = new Date();  // Mutando uma prop!
    return <div>{user.name}</div>;
}

// ✅ Não mute props
function UserProfile({ user, onView }: Props) {
    useEffect(() => {
        onView(user.id);  // Notifica o pai para atualizar
    }, [user.id]);
    return <div>{user.name}</div>;
}
```

## Padrões de Revisão Avançados

### Padrão 1: Revisão Arquitetural

```markdown
Ao revisar mudanças significativas:

1. **Documento de Design Primeiro**
   - Para grandes funcionalidades, exija um doc de design antes do código
   - Revise o design com a equipe antes da implementação
   - Cheguem a um acordo na abordagem para evitar retrabalho

2. **Revise em Estágios**
   - Primeiro PR: Abstrações e interfaces base
   - Segundo PR: Implementação
   - Terceiro PR: Integração e testes
   - Mais fácil de revisar, mais rápido de iterar

3. **Considere Alternativas**
   - "Já consideramos usar [padrão/biblioteca]?"
   - "Qual é o trade-off contra uma abordagem mais simples?"
   - "Como isso vai evoluir conforme os requisitos mudarem?"
```

### Padrão 2: Revisão de Qualidade de Teste

```typescript
// ❌ Teste ruim: Testando detalhe de implementação
test('incrementa variável do counter', () => {
    const component = render(<Counter />);
    const button = component.getByRole('button');
    fireEvent.click(button);
    expect(component.state.counter).toBe(1);  // Testando estado interno
});

// ✅ Teste bom: Testando o comportamento
test('mostra a contagem incrementada ao ser clicado', () => {
    render(<Counter />);
    const button = screen.getByRole('button', { name: /incrementar/i });
    fireEvent.click(button);
    expect(screen.getByText('Contagem: 1')).toBeInTheDocument();
});

// Perguntas de revisão para testes:
// - Os testes descrevem o comportamento, e não a implementação?
// - Os nomes dos testes são claros e descritivos?
// - Os testes cobrem edge cases?
// - Os testes são independentes (sem estado compartilhado)?
// - Os testes podem rodar em qualquer ordem?
```

### Padrão 3: Revisão de Segurança

```markdown
## Checklist de Revisão de Segurança

### Autenticação & Autorização

- [ ] Autenticação é exigida onde necessário?
- [ ] Existem checagens de autorização antes de toda ação?
- [ ] A validação do JWT é adequada (assinatura, validade)?
- [ ] Chaves de API/segredos estão devidamente protegidos?

### Validação de Input

- [ ] Todos os inputs de usuário estão sendo validados?
- [ ] Uploads de arquivos possuem restrições (tamanho, tipo)?
- [ ] Queries SQL estão parametrizadas?
- [ ] Proteção contra XSS (escape no output)?

### Proteção de Dados

- [ ] Senhas com hash criptográfico (bcrypt/argon2)?
- [ ] Dados sensíveis criptografados em repouso (at rest)?
- [ ] HTTPS forçado para dados sensíveis?
- [ ] PII (Informações de Identificação Pessoal) tratadas de acordo com regulações?

### Vulnerabilidades Comuns

- [ ] Nenhuma execução dinâmica do tipo eval()?
- [ ] Sem segredos hardcoded?
- [ ] Proteção contra CSRF para operações que mudam estado?
- [ ] Rate limiting implementado nos endpoints públicos?
```

## Dando Feedback Difícil

### Padrão: O Método Sanduíche (Modificado)

```markdown
Tradicional: Elogio + Crítica + Elogio (parece falso)

Melhor: Contexto + Problema Específico + Solução Útil

Exemplo:
"Percebi que a lógica de processamento de pagamento está inline
no controller. Isto torna mais difícil de testar e reutilizar.

[Problema Específico]
A função calculateTotal() mistura cálculo de taxa,
lógica de desconto e chamadas no banco de dados, tornando difícil
fazer teste unitário e entender o código.

[Solução Útil]
Poderíamos extrair isso para uma classe PaymentService? Isso
o tornaria testável e reutilizável. Eu posso fazer um pair programming
com você sobre isso se for útil."
```

### Lidando com Discordâncias

```markdown
Quando o autor discorda do seu feedback:

1. **Busque Entender**
   "Me ajude a entender sua abordagem. O que te levou a
   escolher este padrão?"

2. **Reconheça Pontos Válidos**
   "Esse é um ótimo ponto sobre X. Eu não tinha considerado isso."

3. **Forneça Dados**
   "Estou preocupado com a performance. Podemos adicionar um
   benchmark para validar a abordagem?"

4. **Escale se Necessário**
   "Vamos chamar o [arquiteto/desenvolvedor sênior] para dar uma opinião sobre isto."

5. **Saiba a Hora de Deixar Passar**
   Se está funcionando e não é um problema crítico, aprove.
   O ótimo é inimigo do bom (Perfection is the enemy of progress).
```

## Melhores Práticas

1. **Revise Prontamente**: Dentro de 24 horas, idealmente no mesmo dia.
2. **Limite o Tamanho do PR**: Máximo de 200-400 linhas para uma revisão eficaz.
3. **Revise em Blocos de Tempo**: Máximo de 60 minutos, faça pausas.
4. **Use Ferramentas de Revisão**: GitHub, GitLab ou ferramentas dedicadas.
5. **Automatize o Que Puder**: Linters, formatters, scans de segurança.
6. **Construa Afinidade**: Emojis, elogios e empatia importam.
7. **Esteja Disponível**: Ofereça-se para parear (pair programming) em problemas complexos.
8. **Aprenda com os Outros**: Leia os comentários de revisão feitos por outras pessoas.

## Armadilhas Comuns (Common Pitfalls)

- **Perfeccionismo**: Bloquear PRs por preferências menores de estilo.
- **Scope Creep (Fuga de Escopo)**: "Já que você está mexendo nisso, você poderia também..."
- **Inconsistência**: Padrões diferentes cobrados para pessoas diferentes.
- **Revisões Atrasadas**: Deixar os PRs mofando por dias.
- **Ghosting (Sumiço)**: Pedir alterações e sumir.
- **Rubber Stamping (Aprovação Cega)**: Aprovar sem realmente revisar o código.
- **Bike Shedding (Discussão Fútil)**: Debater por horas detalhes absolutamente irrelevantes.

## Templates

### Template de Comentário para Revisão de PR

```markdown
## Resumo (Summary)

[Visão geral breve do que foi revisado]

## Pontos Fortes (Strengths)

- [O que foi bem feito]
- [Bons padrões ou abordagens]

## Alterações Obrigatórias (Required Changes)

🔴 [Problema bloqueante 1]
🔴 [Problema bloqueante 2]

## Sugestões (Suggestions)

💡 [Melhoria 1]
💡 [Melhoria 2]

## Dúvidas (Questions)

❓ [Necessito de esclarecimento sobre X]
❓ [Consideração sobre abordagem alternativa]

## Veredito (Verdict)

✅ Aprovo após as alterações obrigatórias serem resolvidas
```

## Recursos

- **Google Engineering Practices (Code Review):** https://google.github.io/eng-practices/review/reviewer/
- **GitHub Docs (Reviewing proposed changes in a pull request):** https://docs.github.com/articles/reviewing-proposed-changes-in-a-pull-request
- **OWASP Secure Code Review Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html
