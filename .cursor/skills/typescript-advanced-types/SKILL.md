---
name: typescript-advanced-types
description: Domine o sistema de tipos avançado do TypeScript, incluindo genéricos (generics), tipos condicionais, tipos mapeados, literais de template (template literals) e tipos utilitários para construir aplicações com type-safety. Use ao implementar lógica de tipo complexa, criar utilitários de tipo reutilizáveis ou garantir type-safety em tempo de compilação em projetos TypeScript.
---

# Tipos Avançados de TypeScript (TypeScript Advanced Types)

Guia abrangente para dominar o sistema de tipos avançado do TypeScript, incluindo generics, tipos condicionais, tipos mapeados, tipos template literal e utilitários de tipos para construir aplicações robustas e type-safe.

## Quando Usar Esta Skill

- Construir bibliotecas ou frameworks type-safe
- Criar componentes genéricos reutilizáveis
- Implementar lógica complexa de inferência de tipos
- Projetar clientes de API type-safe
- Construir sistemas de validação de formulários
- Criar objetos de configuração fortemente tipados
- Implementar gerenciamento de estado type-safe
- Migrar código JavaScript para TypeScript em módulos TS (sem migrar o backend JS deste projeto)

## Conceitos Principais (Core Concepts)

### 1. Genéricos (Generics)

**Propósito:** Criar componentes reutilizáveis e flexíveis em relação aos tipos, mantendo a type-safety.

**Função Genérica Básica:**

```typescript
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42); // Tipo: number
const str = identity<string>("hello"); // Tipo: string
const auto = identity(true); // Tipo inferido: boolean
```

**Restrições Genéricas (Generic Constraints):**

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): T {
  console.log(item.length);
  return item;
}

logLength("hello"); // OK: string tem length
logLength([1, 2, 3]); // OK: array tem length
logLength({ length: 10 }); // OK: objeto tem length
// logLength(42);             // Erro: number não tem length
```

**Múltiplos Parâmetros de Tipo:**

```typescript
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const merged = merge({ name: "John" }, { age: 30 });
// Tipo: { name: string } & { age: number }
```

### 2. Tipos Condicionais (Conditional Types)

**Propósito:** Criar tipos que dependem de condições, permitindo lógica de tipos sofisticada.

**Tipo Condicional Básico:**

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```

**Extraindo Tipos de Retorno (Extracting Return Types):**

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: "John" };
}

type User = ReturnType<typeof getUser>;
// Tipo: { id: number; name: string; }
```

**Tipos Condicionais Distributivos:**

```typescript
type ToArray<T> = T extends any ? T[] : never;

type StrOrNumArray = ToArray<string | number>;
// Tipo: string[] | number[]
```

**Condições Aninhadas (Nested Conditions):**

```typescript
type TypeName<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : T extends boolean
      ? "boolean"
      : T extends undefined
        ? "undefined"
        : T extends Function
          ? "function"
          : "object";

type T1 = TypeName<string>; // "string"
type T2 = TypeName<() => void>; // "function"
```

### 3. Tipos Mapeados (Mapped Types)

**Propósito:** Transformar tipos existentes iterando sobre suas propriedades.

**Tipo Mapeado Básico:**

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  id: number;
  name: string;
}

type ReadonlyUser = Readonly<User>;
// Tipo: { readonly id: number; readonly name: string; }
```

**Propriedades Opcionais:**

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type PartialUser = Partial<User>;
// Tipo: { id?: number; name?: string; }
```

**Remapeamento de Chaves (Key Remapping):**

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// Tipo: { getName: () => string; getAge: () => number; }
```

**Filtrando Propriedades:**

```typescript
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface Mixed {
  id: number;
  name: string;
  age: number;
  active: boolean;
}

type OnlyNumbers = PickByType<Mixed, number>;
// Tipo: { id: number; age: number; }
```

### 4. Template Literal Types

**Propósito:** Criar tipos baseados em string com correspondência de padrão (pattern matching) e transformação.

**Template Literal Básico:**

```typescript
type EventName = "click" | "focus" | "blur";
type EventHandler = `on${Capitalize<EventName>}`;
// Tipo: "onClick" | "onFocus" | "onBlur"
```

**Manipulação de String:**

```typescript
type UppercaseGreeting = Uppercase<"hello">; // "HELLO"
type LowercaseGreeting = Lowercase<"HELLO">; // "hello"
type CapitalizedName = Capitalize<"john">; // "John"
type UncapitalizedName = Uncapitalize<"John">; // "john"
```

**Construção de Caminhos (Path Building):**

```typescript
type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string ? `${K}` | `${K}.${Path<T[K]>}` : never;
    }[keyof T]
  : never;

interface Config {
  server: {
    host: string;
    port: number;
  };
  database: {
    url: string;
  };
}

type ConfigPath = Path<Config>;
// Tipo: "server" | "database" | "server.host" | "server.port" | "database.url"
```

### 5. Tipos Utilitários (Utility Types)

**Tipos Utilitários Embutidos (Built-in):**

```typescript
// Partial<T> - Torna todas as propriedades opcionais
type PartialUser = Partial<User>;

// Required<T> - Torna todas as propriedades obrigatórias
type RequiredUser = Required<PartialUser>;

// Readonly<T> - Torna todas as propriedades apenas leitura
type ReadonlyUser = Readonly<User>;

// Pick<T, K> - Seleciona propriedades específicas
type UserName = Pick<User, "name" | "email">;

// Omit<T, K> - Remove propriedades específicas
type UserWithoutPassword = Omit<User, "password">;

// Exclude<T, U> - Exclui tipos da união (union)
type T1 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"

// Extract<T, U> - Extrai tipos da união
type T2 = Extract<"a" | "b" | "c", "a" | "b">; // "a" | "b"

// NonNullable<T> - Exclui null e undefined
type T3 = NonNullable<string | null | undefined>; // string

// Record<K, T> - Cria um tipo de objeto com chaves K e valores T
type PageInfo = Record<"home" | "about", { title: string }>;
```

## Padrões Avançados (Advanced Patterns)

### Padrão 1: Emissor de Eventos (Event Emitter) Type-Safe

```typescript
type EventMap = {
  "user:created": { id: string; name: string };
  "user:updated": { id: string };
  "user:deleted": { id: string };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: Array<(data: T[K]) => void>;
  } = {};

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const callbacks = this.listeners[event];
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

const emitter = new TypedEventEmitter<EventMap>();

emitter.on("user:created", (data) => {
  console.log(data.id, data.name); // Type-safe!
});

emitter.emit("user:created", { id: "1", name: "John" });
// emitter.emit("user:created", { id: "1" });  // Erro: faltando 'name'
```

### Padrão 2: Cliente de API Type-Safe

```typescript
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

type EndpointConfig = {
  "/users": {
    GET: { response: User[] };
    POST: { body: { name: string; email: string }; response: User };
  };
  "/users/:id": {
    GET: { params: { id: string }; response: User };
    PUT: { params: { id: string }; body: Partial<User>; response: User };
    DELETE: { params: { id: string }; response: void };
  };
};

type ExtractParams<T> = T extends { params: infer P } ? P : never;
type ExtractBody<T> = T extends { body: infer B } ? B : never;
type ExtractResponse<T> = T extends { response: infer R } ? R : never;

class APIClient<Config extends Record<string, Record<HTTPMethod, any>>> {
  async request<Path extends keyof Config, Method extends keyof Config[Path]>(
    path: Path,
    method: Method,
    ...[options]: ExtractParams<Config[Path][Method]> extends never
      ? ExtractBody<Config[Path][Method]> extends never
        ? []
        : [{ body: ExtractBody<Config[Path][Method]> }]
      : [
          {
            params: ExtractParams<Config[Path][Method]>;
            body?: ExtractBody<Config[Path][Method]>;
          },
        ]
  ): Promise<ExtractResponse<Config[Path][Method]>> {
    // Implementação aqui
    return {} as any;
  }
}

const api = new APIClient<EndpointConfig>();

// Chamadas de API type-safe
const users = await api.request("/users", "GET");
// Tipo: User[]

const newUser = await api.request("/users", "POST", {
  body: { name: "John", email: "john@example.com" },
});
// Tipo: User

const user = await api.request("/users/:id", "GET", {
  params: { id: "123" },
});
// Tipo: User
```

### Padrão 3: Padrão Builder com Type Safety

```typescript
type BuilderState<T> = {
  [K in keyof T]: T[K] | undefined;
};

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type IsComplete<T, S> =
  RequiredKeys<T> extends keyof S
    ? S[RequiredKeys<T>] extends undefined
      ? false
      : true
    : false;

class Builder<T, S extends BuilderState<T> = {}> {
  private state: S = {} as S;

  set<K extends keyof T>(key: K, value: T[K]): Builder<T, S & Record<K, T[K]>> {
    this.state[key] = value;
    return this as any;
  }

  build(this: IsComplete<T, S> extends true ? this : never): T {
    return this.state as T;
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

const builder = new Builder<User>();

const user = builder
  .set("id", "1")
  .set("name", "John")
  .set("email", "john@example.com")
  .build(); // OK: todos os campos obrigatórios definidos

// const incomplete = builder
//   .set("id", "1")
//   .build();  // Erro: faltando campos obrigatórios
```

### Padrão 4: Deep Readonly / Partial

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[P]>
    : T[P];
};

interface Config {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
    };
  };
}

type ReadonlyConfig = DeepReadonly<Config>;
// Todas as propriedades aninhadas são readonly

type PartialConfig = DeepPartial<Config>;
// Todas as propriedades aninhadas são opcionais
```

### Padrão 5: Validação de Formulários Type-Safe

```typescript
type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type FieldValidation<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

type ValidationErrors<T> = {
  [K in keyof T]?: string[];
};

class FormValidator<T extends Record<string, any>> {
  constructor(private rules: FieldValidation<T>) {}

  validate(data: T): ValidationErrors<T> | null {
    const errors: ValidationErrors<T> = {};
    let hasErrors = false;

    for (const key in this.rules) {
      const fieldRules = this.rules[key];
      const value = data[key];

      if (fieldRules) {
        const fieldErrors: string[] = [];

        for (const rule of fieldRules) {
          if (!rule.validate(value)) {
            fieldErrors.push(rule.message);
          }
        }

        if (fieldErrors.length > 0) {
          errors[key] = fieldErrors;
          hasErrors = true;
        }
      }
    }

    return hasErrors ? errors : null;
  }
}

interface LoginForm {
  email: string;
  password: string;
}

const validator = new FormValidator<LoginForm>({
  email: [
    {
      validate: (v) => v.includes("@"),
      message: "O email deve conter @",
    },
    {
      validate: (v) => v.length > 0,
      message: "E-mail é obrigatório",
    },
  ],
  password: [
    {
      validate: (v) => v.length >= 8,
      message: "A senha deve ter pelo menos 8 caracteres",
    },
  ],
});

const errors = validator.validate({
  email: "invalido",
  password: "curta",
});
// Tipo: { email?: string[]; password?: string[]; } | null
```

### Padrão 6: Uniões Discriminadas (Discriminated Unions)

```typescript
type Success<T> = {
  status: "success";
  data: T;
};

type Error = {
  status: "error";
  error: string;
};

type Loading = {
  status: "loading";
};

type AsyncState<T> = Success<T> | Error | Loading;

function handleState<T>(state: AsyncState<T>): void {
  switch (state.status) {
    case "success":
      console.log(state.data); // Tipo: T
      break;
    case "error":
      console.log(state.error); // Tipo: string
      break;
    case "loading":
      console.log("Carregando...");
      break;
  }
}

// Máquina de estados type-safe
type State =
  | { type: "idle" }
  | { type: "fetching"; requestId: string }
  | { type: "success"; data: any }
  | { type: "error"; error: Error };

type Event =
  | { type: "FETCH"; requestId: string }
  | { type: "SUCCESS"; data: any }
  | { type: "ERROR"; error: Error }
  | { type: "RESET" };

function reducer(state: State, event: Event): State {
  switch (state.type) {
    case "idle":
      return event.type === "FETCH"
        ? { type: "fetching", requestId: event.requestId }
        : state;
    case "fetching":
      if (event.type === "SUCCESS") {
        return { type: "success", data: event.data };
      }
      if (event.type === "ERROR") {
        return { type: "error", error: event.error };
      }
      return state;
    case "success":
    case "error":
      return event.type === "RESET" ? { type: "idle" } : state;
  }
}
```

## Técnicas de Inferência de Tipo

### 1. Palavra-chave Infer

```typescript
// Extrair tipo do elemento do array
type ElementType<T> = T extends (infer U)[] ? U : never;

type NumArray = number[];
type Num = ElementType<NumArray>; // number

// Extrair tipo da promise
type PromiseType<T> = T extends Promise<infer U> ? U : never;

type AsyncNum = PromiseType<Promise<number>>; // number

// Extrair parâmetros da função
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function foo(a: string, b: number) {}
type FooParams = Parameters<typeof foo>; // [string, number]
```

### 2. Type Guards

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

const data: unknown = ["a", "b", "c"];

if (isArrayOf(data, isString)) {
  data.forEach((s) => s.toUpperCase()); // Tipo: string[]
}
```

### 3. Funções de Asserção (Assertion Functions)

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Não é uma string");
  }
}

function processValue(value: unknown) {
  assertIsString(value);
  // value agora é tipado como string
  console.log(value.toUpperCase());
}
```

## Melhores Práticas

1. **Use `unknown` em vez de `any`**: Impõe checagem de tipo
2. **Prefira `interface` para formas de objetos**: Mensagens de erro melhores
3. **Use `type` para uniões (unions) e tipos complexos**: Mais flexível
4. **Aproveite a inferência de tipo**: Deixe o TypeScript inferir quando possível
5. **Crie helper types**: Construa utilitários de tipo reutilizáveis
6. **Use asserções const (const assertions)**: Preserve tipos literais
7. **Evite type assertions (`as Type`)**: Use type guards como alternativa
8. **Documente tipos complexos**: Adicione comentários JSDoc
9. **Use o strict mode**: Habilite todas as opções estritas do compilador
10. **Teste seus tipos**: Use testes de tipo para verificar o comportamento deles

## Teste de Tipos (Type Testing)

```typescript
// Testes de asserção de tipo
type AssertEqual<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;

type Test1 = AssertEqual<string, string>; // true
type Test2 = AssertEqual<string, number>; // false
type Test3 = AssertEqual<string | number, string>; // false

// Helper de erro esperado
type ExpectError<T extends never> = T;

// Exemplo de uso
type ShouldError = ExpectError<AssertEqual<string, number>>;
```

## Armadilhas Comuns (Common Pitfalls)

1. **Uso excessivo de `any`**: Anula o propósito do TypeScript
2. **Ignorar strict null checks**: Pode levar a erros em tempo de execução
3. **Tipos excessivamente complexos**: Pode deixar a compilação lenta
4. **Não usar uniões discriminadas (discriminated unions)**: Perde oportunidades de type narrowing
5. **Esquecer os modificadores readonly**: Permite mutações não intencionais
6. **Referências circulares de tipo**: Pode causar erros no compilador
7. **Não tratar edge cases**: Como arrays vazios ou valores null

## Considerações de Performance

- Evite tipos condicionais muito aninhados
- Use tipos simples quando possível
- Faça cache de computações de tipos complexos
- Limite a profundidade de recursão em tipos recursivos
- Use ferramentas de build para pular a checagem de tipos em produção

## Recursos (Resources)

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **Type Challenges**: https://github.com/type-challenges/type-challenges
- **TypeScript Deep Dive**: https://basarat.gitbook.io/typescript/
- **Effective TypeScript**: Livro por Dan Vanderkam
