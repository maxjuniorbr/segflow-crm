---
name: error-handling-patterns
description: Define padrões de tratamento de erros, propagação e degradação graciosa. Use ao implementar tratamento de exceções, projetar respostas de APIs ou melhorar a resiliência da aplicação.
---

# Padrões de Tratamento de Erros (Error Handling Patterns)

Construa aplicações resilientes com estratégias robustas de tratamento de erros que lidam elegantemente com falhas e fornecem excelentes experiências de depuração (debugging).

## Quando Usar Esta Skill

- Implementar tratamento de erros em novas funcionalidades (features)
- Projetar APIs resilientes a erros
- Debugar problemas em produção
- Melhorar a confiabilidade da aplicação
- Criar mensagens de erro melhores para usuários e desenvolvedores
- Implementar padrões de retry e circuit breaker
- Lidar com erros assíncronos/concorrentes
- Construir sistemas distribuídos tolerantes a falhas

## Conceitos Principais (Core Concepts)

### 1. Filosofias de Tratamento de Erros

**Exceções vs Tipos Result:**

- **Exceções (Exceptions)**: Try-catch tradicional, interrompe o fluxo de controle
- **Tipos Result (Result Types)**: Sucesso/falha explícitos, abordagem funcional
- **Códigos de Erro (Error Codes)**: Estilo C, exige disciplina
- **Tipos Option/Maybe**: Para valores anuláveis (nullable)

**Quando Usar Cada Um:**

- Exceções: Erros inesperados, condições excepcionais
- Tipos Result: Erros esperados, falhas de validação
- Panics/Crashes: Erros irrecuperáveis, bugs de programação

### 2. Categorias de Erros

**Erros Recuperáveis:**

- Timeouts de rede
- Arquivos ausentes
- Input de usuário inválido
- Limites de taxa (rate limits) de API

**Erros Irrecuperáveis:**

- Falta de memória (Out of memory)
- Estouro de pilha (Stack overflow)
- Bugs de programação (null pointer, etc.)

## Padrões Específicos por Linguagem

### Tratamento de Erros em Python

**Hierarquia de Exceções Customizadas:**

```python
class ApplicationError(Exception):
    """Exceção base para todos os erros da aplicação."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError):
    """Lançado quando a validação falha."""
    pass

class NotFoundError(ApplicationError):
    """Lançado quando o recurso não é encontrado."""
    pass

class ExternalServiceError(ApplicationError):
    """Lançado quando um serviço externo falha."""
    def __init__(self, message: str, service: str, **kwargs):
        super().__init__(message, **kwargs)
        self.service = service

# Uso
def get_user(user_id: str) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise NotFoundError(
            f"User not found",
            code="USER_NOT_FOUND",
            details={"user_id": user_id}
        )
    return user
```

**Gerenciadores de Contexto (Context Managers) para Limpeza:**

```python
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Garante que a transação receba commit ou rollback."""
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()

# Uso
with database_transaction(db.session) as session:
    user = User(name="Alice")
    session.add(user)
    # Commit ou rollback automático
```

**Retry com Exponential Backoff (Espera Exponencial):**

```python
import time
from functools import wraps
from typing import TypeVar, Callable

T = TypeVar('T')

def retry(
    max_attempts: int = 3,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """Decorator de retry com exponential backoff."""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        sleep_time = backoff_factor ** attempt
                        time.sleep(sleep_time)
                        continue
                    raise
            raise last_exception
        return wrapper
    return decorator

# Uso
@retry(max_attempts=3, exceptions=(NetworkError,))
def fetch_data(url: str) -> dict:
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    return response.json()
```

### Tratamento de Erros em TypeScript/JavaScript

**Classes de Erro Customizadas:**

```typescript
// Classes de erro customizadas
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} not found`, "NOT_FOUND", 404, { resource, id });
  }
}

// Uso
function getUser(id: string): User {
  const user = users.find((u) => u.id === id);
  if (!user) {
    throw new NotFoundError("User", id);
  }
  return user;
}
```

**Padrão Result Type:**

```typescript
// Tipo Result para tratamento explícito de erros
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// Funções de ajuda
function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Uso
function parseJSON<T>(json: string): Result<T, SyntaxError> {
  try {
    const value = JSON.parse(json) as T;
    return Ok(value);
  } catch (error) {
    return Err(error as SyntaxError);
  }
}

// Consumindo o Result
const result = parseJSON<User>(userJson);
if (result.ok) {
  console.log(result.value.name);
} else {
  console.error("Parse failed:", result.error.message);
}

// Encadeando Results (Chaining)
function chain<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}
```

**Tratamento de Erros Assíncronos:**

```typescript
// Async/await com tratamento de erros adequado
async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    return orders;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return []; // Retorna array vazio para not found
    }
    if (error instanceof NetworkError) {
      // Lógica de retry
      return retryFetchOrders(userId);
    }
    // Lança novamente (re-throw) erros inesperados
    throw error;
  }
}

// Tratamento de erros com Promises
function fetchData(url: string): Promise<Data> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Fetch failed:", error);
      throw error;
    });
}
```

### Tratamento de Erros em Rust

**Tipos Result e Option:**

```rust
use std::fs::File;
use std::io::{self, Read};

// Tipo Result para operações que podem falhar
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;  // Operador ? propaga os erros
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// Tipos de erro customizados
#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(std::num::ParseIntError),
    NotFound(String),
    Validation(String),
}

impl From<io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError::Io(error)
    }
}

// Usando o tipo de erro customizado
fn read_number_from_file(path: &str) -> Result<i32, AppError> {
    let contents = read_file(path)?;  // Converte automaticamente io::Error
    let number = contents.trim().parse()
        .map_err(AppError::Parse)?;   // Converte ParseIntError explicitamente
    Ok(number)
}

// Option para valores anuláveis (nullable)
fn find_user(id: &str) -> Option<User> {
    users.iter().find(|u| u.id == id).cloned()
}

// Combinando Option e Result
fn get_user_age(id: &str) -> Result<u32, AppError> {
    find_user(id)
        .ok_or_else(|| AppError::NotFound(id.to_string()))
        .map(|user| user.age)
}
```

### Tratamento de Erros em Go

**Retornos de Erro Explícitos:**

```go
// Tratamento básico de erros
func getUser(id string) (*User, error) {
    user, err := db.QueryUser(id)
    if err != nil {
        return nil, fmt.Errorf("failed to query user: %w", err)
    }
    if user == nil {
        return nil, errors.New("user not found")
    }
    return user, nil
}

// Tipos de erro customizados
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed for %s: %s", e.Field, e.Message)
}

// Erros sentinelas (Sentinel errors) para comparação
var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrInvalidInput = errors.New("invalid input")
)

// Checagem de erros
user, err := getUser("123")
if err != nil {
    if errors.Is(err, ErrNotFound) {
        // Tratar not found
    } else {
        // Tratar outros erros
    }
}

// Envolver (Wrapping) e desempacotar (Unwrapping) erros
func processUser(id string) error {
    user, err := getUser(id)
    if err != nil {
        return fmt.Errorf("process user failed: %w", err)
    }
    // Processar user
    return nil
}

// Unwrap de erros
err := processUser("123")
if err != nil {
    var valErr *ValidationError
    if errors.As(err, &valErr) {
        fmt.Printf("Validation error: %s\n", valErr.Field)
    }
}
```

## Padrões Universais

### Padrão 1: Circuit Breaker

Previna falhas em cascata em sistemas distribuídos.

```python
from enum import Enum
from datetime import datetime, timedelta
from typing import Callable, TypeVar

T = TypeVar('T')

class CircuitState(Enum):
    CLOSED = "closed"       # Operação normal
    OPEN = "open"          # Falhando, rejeitar requisições
    HALF_OPEN = "half_open"  # Testando se recuperou

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout: timedelta = timedelta(seconds=60),
        success_threshold: int = 2
    ):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.success_threshold = success_threshold
        self.failure_count = 0
        self.success_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_time = None

    def call(self, func: Callable[[], T]) -> T:
        if self.state == CircuitState.OPEN:
            if datetime.now() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = func()
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise

    def on_success(self):
        self.failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
                self.success_count = 0

    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# Uso
circuit_breaker = CircuitBreaker()

def fetch_data():
    return circuit_breaker.call(lambda: external_api.get_data())
```

### Padrão 2: Agregação de Erros (Error Aggregation)

Colete múltiplos erros em vez de falhar no primeiro erro encontrado.

```typescript
class ErrorCollector {
  private errors: Error[] = [];

  add(error: Error): void {
    this.errors.push(error);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): Error[] {
    return [...this.errors];
  }

  throw(): never {
    if (this.errors.length === 1) {
      throw this.errors[0];
    }
    throw new AggregateError(
      this.errors,
      `${this.errors.length} errors occurred`,
    );
  }
}

// Uso: Validar múltiplos campos
function validateUser(data: any): User {
  const errors = new ErrorCollector();

  if (!data.email) {
    errors.add(new ValidationError("Email is required"));
  } else if (!isValidEmail(data.email)) {
    errors.add(new ValidationError("Email is invalid"));
  }

  if (!data.name || data.name.length < 2) {
    errors.add(new ValidationError("Name must be at least 2 characters"));
  }

  if (!data.age || data.age < 18) {
    errors.add(new ValidationError("Age must be 18 or older"));
  }

  if (errors.hasErrors()) {
    errors.throw();
  }

  return data as User;
}
```

### Padrão 3: Degradação Graciosa (Graceful Degradation)

Forneça funcionalidade de fallback (alternativa) quando ocorrerem erros.

```python
from typing import Optional, Callable, TypeVar

T = TypeVar('T')

def with_fallback(
    primary: Callable[[], T],
    fallback: Callable[[], T],
    log_error: bool = True
) -> T:
    """Tenta a função primary, cai para fallback em caso de erro."""
    try:
        return primary()
    except Exception as e:
        if log_error:
            logger.error(f"Primary function failed: {e}")
        return fallback()

# Uso
def get_user_profile(user_id: str) -> UserProfile:
    return with_fallback(
        primary=lambda: fetch_from_cache(user_id),
        fallback=lambda: fetch_from_database(user_id)
    )

# Múltiplos fallbacks
def get_exchange_rate(currency: str) -> float:
    return (
        try_function(lambda: api_provider_1.get_rate(currency))
        or try_function(lambda: api_provider_2.get_rate(currency))
        or try_function(lambda: cache.get_rate(currency))
        or DEFAULT_RATE
    )

def try_function(func: Callable[[], Optional[T]]) -> Optional[T]:
    try:
        return func()
    except Exception:
        return None
```

## Melhores Práticas

1. **Fail Fast (Falhe Rápido)**: Valide a entrada cedo, falhe rapidamente
2. **Preserve o Contexto**: Inclua stack traces, metadados e timestamps
3. **Mensagens Significativas**: Explique o que aconteceu e como consertar
4. **Logue Apropriadamente**: Erro real = logue; falha esperada = não inunde (spam) os logs
5. **Trate no Nível Certo**: Faça o catch onde você possa tratar o erro de forma significativa
6. **Limpe os Recursos**: Use try-finally, context managers, ou defer
7. **Não Engula Erros (Don't Swallow Errors)**: Logue ou relance (re-throw), não ignore silenciosamente
8. **Erros Tipados (Type-Safe Errors)**: Use erros tipados quando possível

```python
# Bom exemplo de tratamento de erro
def process_order(order_id: str) -> Order:
    """Processa o pedido com tratamento de erro abrangente."""
    try:
        # Valida input
        if not order_id:
            raise ValidationError("Order ID is required")

        # Busca pedido
        order = db.get_order(order_id)
        if not order:
            raise NotFoundError("Order", order_id)

        # Processa pagamento
        try:
            payment_result = payment_service.charge(order.total)
        except PaymentServiceError as e:
            # Loga e envolve (wrap) o erro do serviço externo
            logger.error(f"Payment failed for order {order_id}: {e}")
            raise ExternalServiceError(
                f"Payment processing failed",
                service="payment_service",
                details={"order_id": order_id, "amount": order.total}
            ) from e

        # Atualiza pedido
        order.status = "completed"
        order.payment_id = payment_result.id
        db.save(order)

        return order

    except ApplicationError:
        # Relança os erros de aplicação conhecidos
        raise
    except Exception as e:
        # Loga erros inesperados
        logger.exception(f"Unexpected error processing order {order_id}")
        raise ApplicationError(
            "Order processing failed",
            code="INTERNAL_ERROR"
        ) from e
```

## Armadilhas Comuns (Common Pitfalls)

- **Tratar de Forma Muito Ampla**: `except Exception` mascara os bugs
- **Blocos Catch Vazios**: Engolir os erros silenciosamente
- **Logar e Relançar (Re-throw)**: Cria entradas de log duplicadas
- **Não Limpar (Cleanup)**: Esquecer de fechar arquivos e conexões
- **Mensagens de Erro Ruins**: "Ocorreu um erro" não ajuda
- **Retornar Códigos de Erro**: Use exceções ou tipos Result
- **Ignorar Erros Assíncronos**: Rejeições de promises não tratadas (unhandled promise rejections)

## Recursos

- **references/exception-hierarchy-design.md**: Design de hierarquias de classes de erro
- **references/error-recovery-strategies.md**: Padrões de recuperação para diferentes cenários
- **references/async-error-handling.md**: Tratamento de erros em código concorrente
- **assets/error-handling-checklist.md**: Checklist de revisão para tratamento de erros
- **assets/error-message-guide.md**: Como escrever mensagens de erro úteis
- **scripts/error-analyzer.py**: Analisar padrões de erro em logs
