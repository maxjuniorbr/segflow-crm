# Rastreamento da Causa Raiz (Root Cause Tracing)

Use o rastreamento reverso quando a falha aparecer nas profundezas da stack.

1. Comece no ponto da falha e capture evidências concretas (valor, tipo, estado).
2. Identifique o caller imediato que produziu esse valor.
3. Repita de caller em caller até encontrar a primeira decisão ou input incorreto.
4. Corrija no ponto incorreto mais inicial, e não onde o sintoma aparece.

Checklist:
- Confirme os passos de reprodução.
- Capture logs/traces em cada fronteira.
- Valide as premissas com evidências em tempo de execução (runtime).
- Execute novamente a reprodução original após a correção.
