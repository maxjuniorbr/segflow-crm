# Anti-Padrões de Teste (Testing Anti-Patterns)

Evite esses padrões em fluxos de trabalho de TDD:

- Testar detalhes internos (internals) de mocks em vez de comportamento observável.
- Adicionar ramificações/métodos apenas para testes em código de produção.
- Asserções fracas que sempre passam.
- Editar testes no estado GREEN apenas para forçar o status de aprovação.

Abordagem preferida:
- RED: defina o comportamento com um teste que falha.
- GREEN: implementação mínima para o teste passar.
- REFACTOR: melhore o teste/código enquanto preserva o comportamento.
