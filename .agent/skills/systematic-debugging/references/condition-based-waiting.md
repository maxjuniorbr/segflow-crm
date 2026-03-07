# Espera Baseada em Condições (Condition-Based Waiting)

Prefira fazer polling de condições explícitas em vez de pausas (sleeps) fixas.

Padrão:
1. Defina a condição de pronto.
2. Faça polling em intervalos curtos com timeout.
3. Pare imediatamente quando a condição for verdadeira.
4. Falhe com evidência clara de timeout se nunca for verdadeira.

Benefícios:
- Feedback mais rápido do que esperas longas e estáticas.
- Menos falhas intermitentes (flaky failures) em cenários assíncronos ou de integração.
