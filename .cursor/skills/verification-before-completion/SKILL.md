---
name: verification-before-completion
description: Use quando estiver prestes a afirmar que o trabalho esta concluido, corrigido ou passando em testes, antes de fazer commits ou criar PRs - requer a execucao de comandos de verificacao e a confirmacao do resultado antes de fazer qualquer afirmacao de sucesso; evidencias antes de afirmacoes, sempre.
---

# Verificacao Antes da Conclusao (Verification Before Completion)

## Visao Geral

Afirmar que o trabalho esta concluido sem verificacao e desonestidade, nao eficiencia.

**Principio central:** Evidencias antes de afirmacoes, sempre.

**Violar a letra desta regra e violar o espirito desta regra.**

## A Lei de Ferro (The Iron Law)

```
NENHUMA AFIRMACAO DE CONCLUSAO SEM EVIDENCIA DE VERIFICACAO RECENTE
```

Se voce nao executou o comando de verificacao nesta mesma mensagem, nao pode afirmar que ele passa.

## A Funcao de Checagem (The Gate Function)

```
ANTES de afirmar qualquer status ou expressar satisfacao:

1. IDENTIFIQUE: Qual comando prova essa afirmacao?
2. EXECUTE: Rode o comando COMPLETO (recente, inteiro)
3. LEIA: Output completo, verifique o codigo de saida (exit code), conte as falhas
4. VERIFIQUE: O output confirma a afirmacao?
   - Se NAO: Declare o status real com evidencias
   - Se SIM: Faca a afirmacao COM evidencias
5. SOMENTE ENTAO: Faca a afirmacao

Pular qualquer etapa = mentir, nao verificar
```

## Falhas Comuns

| Afirmacao | Requer | Nao e Suficiente |
|-------|----------|----------------|
| Testes passam | Output do comando de teste: 0 falhas | Execucao anterior, "deve passar" |
| Linter limpo | Output do linter: 0 erros | Checagem parcial, extrapolacao |
| Build bem sucedido | Comando de build: exit 0 | Linter passando, logs parecem bons |
| Bug corrigido | Testar o sintoma original: passa | Codigo alterado, assumido como corrigido |
| Teste de regressao funciona | Ciclo red-green verificado | Teste passa uma vez |
| Agente concluiu | Diff no VCS mostra mudancas | Agente relata "sucesso" |
| Requisitos atendidos | Checklist linha por linha | Testes passando |

## Alertas Vermelhos - PARE (Red Flags - STOP)

- Usar "deve", "provavelmente", "parece que"
- Expressar satisfacao antes da verificacao ("Otimo!", "Perfeito!", "Feito!", etc.)
- Estar prestes a comitar/fazer push/PR sem verificacao
- Confiar nos relatorios de sucesso do agente
- Depender de verificacao parcial
- Pensar "so desta vez"
- Estar cansado e querer que o trabalho termine
- **QUALQUER fraseologia que implique sucesso sem ter executado a verificacao**

## Prevencao de Racionalizacao

| Desculpa | Realidade |
|--------|---------|
| "Deve funcionar agora" | EXECUTE a verificacao |
| "Estou confiante" | Confianca ≠ evidencia |
| "So desta vez" | Sem excecoes |
| "O linter passou" | Linter ≠ compilador |
| "O agente disse que foi sucesso" | Verifique de forma independente |
| "Estou cansado" | Exaustao ≠ desculpa |
| "Checagem parcial e o suficiente" | Checagem parcial nao prova nada |
| "Palavras diferentes para que a regra nao se aplique" | O espirito vale mais que a letra |

## Padroes Principais

**Testes:**
```
✅ [Executa comando de teste] [Ve: 34/34 passando] "Todos os testes passam"
❌ "Deve passar agora" / "Parece correto"
```

**Testes de regressao (TDD Red-Green):**
```
✅ Escreve → Executa (passa) → Reverte a correcao → Executa (DEVE FALHAR) → Restaura → Executa (passa)
❌ "Eu escrevi um teste de regressao" (sem verificacao red-green)
```

**Build:**
```
✅ [Executa o build] [Ve: exit 0] "O build passa"
❌ "O linter passou" (o linter nao checa a compilacao)
```

**Requisitos:**
```
✅ Rele o plano → Cria checklist → Verifica cada um → Relata as lacunas ou a conclusao
❌ "Os testes passam, fase concluida"
```

**Delegacao para agentes:**
```
✅ Agente relata sucesso → Checa o diff no VCS → Verifica as mudancas → Relata o estado real
❌ Confiar no relatorio do agente
```

## Por Que Isso Importa

Das 24 memorias de falha:
- seu parceiro humano disse "Eu nao acredito em voce" - confianca quebrada
- Funcoes indefinidas entregues em producao - causariam crash
- Requisitos faltando entregues - features incompletas
- Tempo perdido com falsa conclusao → redirecionamento → retrabalho
- Viola: "A honestidade e um valor fundamental. Se voce mentir, sera substituido."

## Quando Aplicar

**SEMPRE antes de:**
- QUALQUER variacao de afirmacoes de sucesso/conclusao
- QUALQUER expressao de satisfacao
- QUALQUER declaracao positiva sobre o estado do trabalho
- Comitar, criar PR, concluir uma tarefa
- Mover-se para a proxima tarefa
- Delegar para agentes

**A regra se aplica a:**
- Frases exatas
- Parafrases e sinonimos
- Implicacoes de sucesso
- QUALQUER comunicacao que sugira conclusao/correcao

## A Linha de Chegada (The Bottom Line)

**Sem atalhos para a verificacao.**

Execute o comando. Leia o output. SO ENTAO faca a afirmacao do resultado.

Isso e inegociavel.