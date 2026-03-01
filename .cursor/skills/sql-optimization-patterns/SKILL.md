---
name: sql-optimization-patterns
description: Domine a otimização de consultas (queries) SQL, estratégias de indexação e análise com EXPLAIN para melhorar drasticamente a performance do banco de dados e eliminar queries lentas. Use ao debugar queries lentas, projetar schemas de banco de dados ou otimizar a performance da aplicação.
---

# Padrões de Otimização SQL (SQL Optimization Patterns)

Transforme consultas de banco de dados lentas em operações ultrarrápidas através de otimização sistemática, indexação correta e análise de plano de execução (query plan).

## Quando Usar Esta Skill

- Debugar queries lentas
- Projetar schemas de banco de dados performáticos
- Otimizar tempos de resposta da aplicação
- Reduzir carga e custos do banco de dados
- Melhorar escalabilidade para datasets em crescimento
- Analisar planos de consulta EXPLAIN
- Implementar índices eficientes
- Resolver problemas de N+1 queries

## Conceitos Principais (Core Concepts)

### 1. Planos de Execução de Queries (Query Execution Plans - EXPLAIN)

Entender o output do EXPLAIN é fundamental para otimização.

**PostgreSQL EXPLAIN:**

```sql
-- Explain básico
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- Com estatísticas reais de execução
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com';

-- Output detalhado (verbose) com mais informações
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.*, o.order_total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days';
```

**Métricas Chave a Observar:**

- **Seq Scan**: Scan completo da tabela (geralmente lento para tabelas grandes)
- **Index Scan**: Usando índice (bom)
- **Index Only Scan**: Usando índice sem tocar na tabela (melhor)
- **Nested Loop**: Método de Join (ok para pequenos datasets)
- **Hash Join**: Método de Join (bom para grandes datasets)
- **Merge Join**: Método de Join (bom para dados ordenados)
- **Cost**: Custo estimado da query (quanto menor, melhor)
- **Rows**: Linhas estimadas retornadas
- **Actual Time**: Tempo de execução real

### 2. Estratégias de Índices

Índices são a ferramenta de otimização mais poderosa.

**Tipos de Índice:**

- **B-Tree**: Padrão, bom para consultas de igualdade e range (intervalo)
- **Hash**: Apenas para comparações de igualdade (=)
- **GIN**: Busca de texto completo (full-text search), queries de array, JSONB
- **GiST**: Dados geométricos, full-text search
- **BRIN**: Block Range INdex para tabelas muito grandes com correlação

```sql
-- Índice B-Tree padrão
CREATE INDEX idx_users_email ON users(email);

-- Índice composto (a ordem importa!)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Índice parcial (indexa subconjunto de linhas)
CREATE INDEX idx_active_users ON users(email)
WHERE status = 'active';

-- Índice de expressão
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- Índice de cobertura (inclui colunas adicionais)
CREATE INDEX idx_users_email_covering ON users(email)
INCLUDE (name, created_at);

-- Índice de busca de texto completo
CREATE INDEX idx_posts_search ON posts
USING GIN(to_tsvector('english', title || ' ' || body));

-- Índice JSONB
CREATE INDEX idx_metadata ON events USING GIN(metadata);
```

### 3. Padrões de Otimização de Consultas (Query Optimization Patterns)

**Evite SELECT \*:**

```sql
-- Ruim: Busca colunas desnecessárias
SELECT * FROM users WHERE id = 123;

-- Bom: Busca apenas o que você precisa
SELECT id, email, name FROM users WHERE id = 123;
```

**Use a Cláusula WHERE de Forma Eficiente:**

```sql
-- Ruim: A função previne o uso de índices
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Bom: Crie um índice funcional ou use match exato
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
-- Então:
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Ou armazene dados normalizados
SELECT * FROM users WHERE email = 'user@example.com';
```

**Otimize JOINs:**

```sql
-- Ruim: Produto cartesiano e depois filtra
SELECT u.name, o.total
FROM users u, orders o
WHERE u.id = o.user_id AND u.created_at > '2024-01-01';

-- Bom: Filtre antes de fazer o join
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01';

-- Melhor: Filtre ambas as tabelas
SELECT u.name, o.total
FROM (SELECT * FROM users WHERE created_at > '2024-01-01') u
JOIN orders o ON u.id = o.user_id;
```

## Padrões de Otimização

### Padrão 1: Eliminar Consultas N+1 (Eliminate N+1 Queries)

**Problema: Anti-Padrão N+1 Query**

```python
# Ruim: Executa N+1 queries
users = db.query("SELECT * FROM users LIMIT 10")
for user in users:
    orders = db.query("SELECT * FROM orders WHERE user_id = ?", user.id)
    # Processar pedidos
```

**Solução: Usar JOINs ou Carregamento em Lote (Batch Loading)**

```sql
-- Solução 1: JOIN
SELECT
    u.id, u.name,
    o.id as order_id, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.id IN (1, 2, 3, 4, 5);

-- Solução 2: Batch query
SELECT * FROM orders
WHERE user_id IN (1, 2, 3, 4, 5);
```

```python
# Bom: Query única com JOIN ou batch load
# Usando JOIN
results = db.query("""
    SELECT u.id, u.name, o.id as order_id, o.total
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id IN (1, 2, 3, 4, 5)
""")

# Ou batch load
users = db.query("SELECT * FROM users LIMIT 10")
user_ids = [u.id for u in users]
orders = db.query(
    "SELECT * FROM orders WHERE user_id IN (?)",
    user_ids
)
# Agrupar pedidos por user_id
orders_by_user = {}
for order in orders:
    orders_by_user.setdefault(order.user_id, []).append(order)
```

### Padrão 2: Otimizar Paginação

**Ruim: OFFSET em Tabelas Grandes**

```sql
-- Lento para offsets grandes
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 100000;  -- Muito lento!
```

**Bom: Paginação Baseada em Cursor (Cursor-Based Pagination)**

```sql
-- Muito mais rápido: Usar cursor (último ID visto)
SELECT * FROM users
WHERE created_at < '2024-01-15 10:30:00'  -- Último cursor
ORDER BY created_at DESC
LIMIT 20;

-- Com ordenação composta (composite sorting)
SELECT * FROM users
WHERE (created_at, id) < ('2024-01-15 10:30:00', 12345)
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Exige índice
CREATE INDEX idx_users_cursor ON users(created_at DESC, id DESC);
```

### Padrão 3: Agrupar Eficientemente (Aggregate Efficiently)

**Otimizar Consultas COUNT:**

```sql
-- Ruim: Conta todas as linhas
SELECT COUNT(*) FROM orders;  -- Lento em tabelas grandes

-- Bom: Use estimativas para contagens aproximadas
SELECT reltuples::bigint AS estimate
FROM pg_class
WHERE relname = 'orders';

-- Bom: Filtre antes de contar
SELECT COUNT(*) FROM orders
WHERE created_at > NOW() - INTERVAL '7 days';

-- Melhor: Use index-only scan
CREATE INDEX idx_orders_created ON orders(created_at);
SELECT COUNT(*) FROM orders
WHERE created_at > NOW() - INTERVAL '7 days';
```

**Otimizar GROUP BY:**

```sql
-- Ruim: Agrupar e depois filtrar
SELECT user_id, COUNT(*) as order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 10;

-- Melhor: Filtrar primeiro, então agrupar (se possível)
SELECT user_id, COUNT(*) as order_count
FROM orders
WHERE status = 'completed'
GROUP BY user_id
HAVING COUNT(*) > 10;

-- O Melhor: Use índice de cobertura (covering index)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

### Padrão 4: Otimização de Subconsultas (Subquery Optimization)

**Transformar Subconsultas Correlacionadas:**

```sql
-- Ruim: Subconsulta correlacionada (roda para cada linha)
SELECT u.name, u.email,
    (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count
FROM users u;

-- Bom: JOIN com agregação
SELECT u.name, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name, u.email;

-- Melhor: Usar funções de janela (window functions)
SELECT DISTINCT ON (u.id)
    u.name, u.email,
    COUNT(o.id) OVER (PARTITION BY u.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

**Use CTEs para Clareza:**

```sql
-- Usando Common Table Expressions
WITH recent_users AS (
    SELECT id, name, email
    FROM users
    WHERE created_at > NOW() - INTERVAL '30 days'
),
user_order_counts AS (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY user_id
)
SELECT ru.name, ru.email, COALESCE(uoc.order_count, 0) as orders
FROM recent_users ru
LEFT JOIN user_order_counts uoc ON ru.id = uoc.user_id;
```

### Padrão 5: Operações em Lote (Batch Operations)

**Batch INSERT:**

```sql
-- Ruim: Múltiplos inserts individuais
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');
INSERT INTO users (name, email) VALUES ('Carol', 'carol@example.com');

-- Bom: Batch insert
INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com'),
    ('Carol', 'carol@example.com');

-- Melhor: Use COPY para inserts em massa (PostgreSQL)
-- Nota: o COPY no lado do servidor requer privilégios elevados.
-- Para importações locais/cliente, prefira psql \copy.
COPY users (name, email) FROM '/tmp/users.csv' CSV HEADER;
```

**Batch UPDATE:**

```sql
-- Ruim: Update em loop
UPDATE users SET status = 'active' WHERE id = 1;
UPDATE users SET status = 'active' WHERE id = 2;
-- ... repete para muitos IDs

-- Bom: Único UPDATE com cláusula IN
UPDATE users
SET status = 'active'
WHERE id IN (1, 2, 3, 4, 5, ...);

-- Melhor: Use tabela temporária para batches grandes
CREATE TEMP TABLE temp_user_updates (id INT, new_status TEXT);
INSERT INTO temp_user_updates VALUES (1, 'active'), (2, 'active'), ...;

UPDATE users u
SET status = t.new_status
FROM temp_user_updates t
WHERE u.id = t.id;
```

## Técnicas Avançadas

### Views Materializadas (Materialized Views)

Pré-compute queries caras.

```sql
-- Criar materialized view
CREATE MATERIALIZED VIEW user_order_summary AS
SELECT
    u.id,
    u.name,
    COUNT(o.id) as total_orders,
    SUM(o.total) as total_spent,
    MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Adicionar índice à materialized view
CREATE INDEX idx_user_summary_spent ON user_order_summary(total_spent DESC);

-- Atualizar materialized view
REFRESH MATERIALIZED VIEW user_order_summary;

-- Atualização concorrente (PostgreSQL)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_summary;

-- Consultar materialized view (muito rápido)
SELECT * FROM user_order_summary
WHERE total_spent > 1000
ORDER BY total_spent DESC;
```

### Particionamento

Divida tabelas grandes para melhor performance.

```sql
-- Particionamento de intervalo por data (PostgreSQL)
CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    user_id INT,
    total DECIMAL,
    created_at TIMESTAMPTZ
) PARTITION BY RANGE (created_at);

-- Criar partições
CREATE TABLE orders_2024_q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE orders_2024_q2 PARTITION OF orders
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- As queries usam automaticamente a partição adequada
SELECT * FROM orders
WHERE created_at BETWEEN '2024-02-01' AND '2024-02-28';
-- Só faz o scan na partição orders_2024_q1
```

### Ajustes de Planner e Diagnóstico (PostgreSQL)

PostgreSQL não possui hints nativas por query (como `USE INDEX`). Para investigação, faça ajustes locais de planner e valide com `EXPLAIN ANALYZE`.

```sql
-- Ajuste local de paralelismo para teste
BEGIN;
SET LOCAL max_parallel_workers_per_gather = 4;
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM large_table WHERE condition;
ROLLBACK;

-- Teste de estratégia de join (somente diagnóstico)
BEGIN;
SET LOCAL enable_nestloop = OFF;
EXPLAIN (ANALYZE, BUFFERS)
SELECT u.id, o.id
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days';
ROLLBACK;
```

## Melhores Práticas

1. **Indexe de Forma Seletiva**: Muitos índices deixam os writes (escritas) mais lentos.
2. **Monitore a Performance das Consultas**: Use slow query logs.
3. **Mantenha as Estatísticas Atualizadas**: Rode `ANALYZE` regularmente.
4. **Use os Tipos de Dados Adequados**: Tipos menores = melhor performance.
5. **Normalize com Cuidado**: Equilibre normalização vs performance.
6. **Faça Cache de Dados Muito Acessados**: Use cache em nível de aplicação.
7. **Pool de Conexões (Connection Pooling)**: Reutilize conexões de banco de dados.
8. **Manutenção Regular**: `VACUUM`, `ANALYZE`, reconstruir índices.

```sql
-- Atualizar estatísticas
ANALYZE users;
ANALYZE VERBOSE orders;

-- Vacuum (PostgreSQL)
VACUUM ANALYZE users;
VACUUM FULL users;  -- Recuperar espaço (trava a tabela)

-- Reindex
REINDEX INDEX idx_users_email;
REINDEX TABLE users;
```

## Armadilhas Comuns (Common Pitfalls)

- **Excesso de Índices (Over-Indexing)**: Cada índice torna INSERT/UPDATE/DELETE mais lentos
- **Índices Não Utilizados**: Desperdiçam espaço e lentificam escritas
- **Índices Faltando**: Queries lentas, full table scans
- **Conversão de Tipo Implícita**: Previne o uso de índice
- **Condições OR**: Não conseguem usar índices de forma eficiente
- **LIKE com Curinga no Começo (Leading Wildcard)**: `LIKE '%abc'` não pode usar índice
- **Função no WHERE**: Previne o uso de índice a menos que exista um índice funcional correspondente

## Monitoramento de Consultas

```sql
-- Encontrar queries lentas (PostgreSQL)
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Encontrar índices faltando (PostgreSQL)
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan AS avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 10;

-- Encontrar índices não utilizados (PostgreSQL)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

## Notas de 2026

- `pg_stat_statements` exige `shared_preload_libraries = 'pg_stat_statements'` em `postgresql.conf` + restart; depois, habilite com `CREATE EXTENSION pg_stat_statements` e `compute_query_id` em `auto`/`on`.
- PostgreSQL não possui atualização incremental nativa (incremental refresh) de materialized views; `REFRESH` substitui todo o conteúdo.
- Use `EXPLAIN (ANALYZE, BUFFERS, SETTINGS, WAL)` para um diagnóstico mais completo possível (disponível em PostgreSQL 14+, que é a base do projeto).

## Recursos Oficiais

- PostgreSQL EXPLAIN: https://www.postgresql.org/docs/current/sql-explain.html
- PostgreSQL pg_stat_statements: https://www.postgresql.org/docs/current/pgstatstatements.html
- PostgreSQL REFRESH MATERIALIZED VIEW: https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html
