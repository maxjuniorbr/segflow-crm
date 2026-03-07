# Defesa em Profundidade (Após a Causa Raiz)

Após corrigir a origem do problema, adicione salvaguardas leves nas camadas adjacentes:

- Validação de input na fronteira (API/controller).
- Checagens de invariantes de domínio na lógica de negócios.
- Constraints/índices de persistência onde aplicável.
- Monitoramento/alertas para sinais de recorrência.

Regras:
- Não substitua a correção da causa raiz apenas por guardrails (salvaguardas).
- Mantenha as salvaguardas específicas e mensuráveis.
