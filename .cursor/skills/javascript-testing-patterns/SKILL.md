---
name: javascript-testing-patterns
description: Define estratégias de testes (unitários, integração, e2e) com Vitest/Jest e Testing Library. Use ao escrever testes automatizados, configurar mocks/fixtures ou implementar rotinas de teste.
---

# Padrões de Teste em JavaScript

Guia abrangente para implementar estratégias de teste robustas em aplicações JavaScript/TypeScript utilizando frameworks modernos e as melhores práticas do mercado.

## Quando Usar Esta Skill

- Configurar a infraestrutura de testes para novos projetos
- Escrever testes unitários (unit tests) para funções e classes
- Criar testes de integração para APIs e serviços
- Implementar testes ponta-a-ponta (E2E) para fluxos de usuário
- Fazer mock de dependências externas e APIs
- Testar componentes React, Vue ou outros componentes frontend
- Implementar Desenvolvimento Orientado a Testes (TDD)
- Configurar testes contínuos em pipelines de CI/CD

## Frameworks de Teste

### Jest - Framework Completo (Full-Featured)

**Configuração (Setup):**

```typescript
// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.interface.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
};

export default config;
```

### Vitest - Rápido, Teste Nativo para Vite

**Configuração (Setup):**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/*.d.ts", "**/*.config.ts", "**/dist/**"],
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

## Padrões de Teste Unitário (Unit Testing Patterns)

### Padrão 1: Testando Funções Puras

```typescript
// utils/calculator.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Divisão por zero");
  }
  return a / b;
}

// utils/calculator.test.ts
import { describe, it, expect } from "vitest";
import { add, divide } from "./calculator";

describe("Calculator", () => {
  describe("add", () => {
    it("deve somar dois números positivos", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("deve somar números negativos", () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it("deve lidar com o zero", () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });
  });

  describe("divide", () => {
    it("deve dividir dois números", () => {
      expect(divide(10, 2)).toBe(5);
    });

    it("deve lidar com resultados decimais", () => {
      expect(divide(5, 2)).toBe(2.5);
    });

    it("deve lançar erro ao dividir por zero", () => {
      expect(() => divide(10, 0)).toThrow("Divisão por zero");
    });
  });
});
```

### Padrão 2: Testando Classes

```typescript
// services/user.service.ts
export class UserService {
  private users: Map<string, User> = new Map();

  create(user: User): User {
    if (this.users.has(user.id)) {
      throw new Error("Usuário já existe");
    }
    this.users.set(user.id, user);
    return user;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  update(id: string, updates: Partial<User>): User {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.users.delete(id);
  }
}

// services/user.service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe("create", () => {
    it("deve criar um novo usuário", () => {
      const user = { id: "1", name: "John", email: "john@example.com" };
      const created = service.create(user);

      expect(created).toEqual(user);
      expect(service.findById("1")).toEqual(user);
    });

    it("deve lançar erro se o usuário já existir", () => {
      const user = { id: "1", name: "John", email: "john@example.com" };
      service.create(user);

      expect(() => service.create(user)).toThrow("Usuário já existe");
    });
  });

  describe("update", () => {
    it("deve atualizar usuário existente", () => {
      const user = { id: "1", name: "John", email: "john@example.com" };
      service.create(user);

      const updated = service.update("1", { name: "Jane" });

      expect(updated.name).toBe("Jane");
      expect(updated.email).toBe("john@example.com");
    });

    it("deve lançar erro se o usuário não for encontrado", () => {
      expect(() => service.update("999", { name: "Jane" })).toThrow(
        "Usuário não encontrado",
      );
    });
  });
});
```

### Padrão 3: Testando Funções Assíncronas (Async)

```typescript
// services/api.service.ts
export class ApiService {
  async fetchUser(id: string): Promise<User> {
    const response = await fetch(`https://api.example.com/users/${id}`);
    if (!response.ok) {
      throw new Error("Usuário não encontrado");
    }
    return response.json();
  }

  async createUser(user: CreateUserDTO): Promise<User> {
    const response = await fetch("https://api.example.com/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    return response.json();
  }
}

// services/api.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiService } from "./api.service";

// Faz o mock do fetch globalmente
global.fetch = vi.fn();

describe("ApiService", () => {
  let service: ApiService;

  beforeEach(() => {
    service = new ApiService();
    vi.clearAllMocks();
  });

  describe("fetchUser", () => {
    it("deve buscar o usuário com sucesso", async () => {
      const mockUser = { id: "1", name: "John", email: "john@example.com" };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const user = await service.fetchUser("1");

      expect(user).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith("https://api.example.com/users/1");
    });

    it("deve lançar erro se o usuário não for encontrado", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      await expect(service.fetchUser("999")).rejects.toThrow("Usuário não encontrado");
    });
  });

  describe("createUser", () => {
    it("deve criar o usuário com sucesso", async () => {
      const newUser = { name: "John", email: "john@example.com" };
      const createdUser = { id: "1", ...newUser };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createdUser,
      });

      const user = await service.createUser(newUser);

      expect(user).toEqual(createdUser);
      expect(fetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newUser),
        }),
      );
    });
  });
});
```

## Padrões de Mocking

### Padrão 1: Mock de Módulos

```typescript
// services/email.service.ts
import nodemailer from "nodemailer";

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  }
}

// services/email.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "./email.service";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "123" }),
    })),
  },
}));

describe("EmailService", () => {
  let service: EmailService;

  beforeEach(() => {
    service = new EmailService();
  });

  it("deve enviar email com sucesso", async () => {
    await service.sendEmail(
      "test@example.com",
      "Subject de Teste",
      "<p>Corpo de Teste</p>",
    );

    expect(service["transporter"].sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Subject de Teste",
      }),
    );
  });
});
```

### Padrão 2: Injeção de Dependências para Testes

```typescript
// services/user.service.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    return user;
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    // Lógica de negócios aqui
    const user = { id: generateId(), ...userData };
    return this.userRepository.create(user);
  }
}

// services/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService, IUserRepository } from "./user.service";

describe("UserService", () => {
  let service: UserService;
  let mockRepository: IUserRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      create: vi.fn(),
    };
    service = new UserService(mockRepository);
  });

  describe("getUser", () => {
    it("deve retornar o usuário caso encontrado", async () => {
      const mockUser = { id: "1", name: "John", email: "john@example.com" };
      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);

      const user = await service.getUser("1");

      expect(user).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith("1");
    });

    it("deve lançar erro se o usuário não for encontrado", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(service.getUser("999")).rejects.toThrow("Usuário não encontrado");
    });
  });

  describe("createUser", () => {
    it("deve criar o usuário com sucesso", async () => {
      const userData = { name: "John", email: "john@example.com" };
      const createdUser = { id: "1", ...userData };

      vi.mocked(mockRepository.create).mockResolvedValue(createdUser);

      const user = await service.createUser(userData);

      expect(user).toEqual(createdUser);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });
});
```

### Padrão 3: Spies (Espionar Funções)

```typescript
// utils/logger.ts
export const logger = {
  info: (message: string) => console.log(`INFO: ${message}`),
  error: (message: string) => console.error(`ERROR: ${message}`),
};

// services/order.service.ts
import { logger } from "../utils/logger";

export class OrderService {
  async processOrder(orderId: string): Promise<void> {
    logger.info(`Processando pedido ${orderId}`);
    // Lógica de processamento do pedido
    logger.info(`Pedido ${orderId} processado com sucesso`);
  }
}

// services/order.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OrderService } from "./order.service";
import { logger } from "../utils/logger";

describe("OrderService", () => {
  let service: OrderService;
  let loggerSpy: any;

  beforeEach(() => {
    service = new OrderService();
    loggerSpy = vi.spyOn(logger, "info");
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it("deve logar o processamento do pedido", async () => {
    await service.processOrder("123");

    expect(loggerSpy).toHaveBeenCalledWith("Processando pedido 123");
    expect(loggerSpy).toHaveBeenCalledWith("Pedido 123 processado com sucesso");
    expect(loggerSpy).toHaveBeenCalledTimes(2);
  });
});
```

## Testes de Integração (Integration Testing)

### Padrão 1: Testes de Integração de API

```typescript
// tests/integration/user.api.test.ts
import request from "supertest";
import { app } from "../../src/app";
import { pool } from "../../src/config/database";

describe("Testes de Integração API de User", () => {
  beforeAll(async () => {
    // Configurar banco de dados de teste
    await pool.query("CREATE TABLE IF NOT EXISTS users (...)");
  });

  afterAll(async () => {
    // Cleanup (limpeza final)
    await pool.query("DROP TABLE IF EXISTS users");
    await pool.end();
  });

  beforeEach(async () => {
    // Limpar os dados antes de cada teste
    await pool.query("TRUNCATE TABLE users CASCADE");
  });

  describe("POST /api/users", () => {
    it("deve criar um novo usuário", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: userData.name,
        email: userData.email,
      });
      expect(response.body).toHaveProperty("id");
      expect(response.body).not.toHaveProperty("password");
    });

    it("deve retornar 400 se o email for inválido", async () => {
      const userData = {
        name: "John Doe",
        email: "email-invalido",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("deve retornar 409 se o email já existe", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      await request(app).post("/api/users").send(userData);

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain("already exists");
    });
  });

  describe("GET /api/users/:id", () => {
    it("deve obter o usuário pelo ID", async () => {
      const createResponse = await request(app).post("/api/users").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      const userId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        name: "John Doe",
        email: "john@example.com",
      });
    });

    it("deve retornar 404 se usuário não encontrado", async () => {
      await request(app).get("/api/users/999").expect(404);
    });
  });

  describe("Autenticação", () => {
    it("deve exigir autenticação para rotas protegidas", async () => {
      await request(app).get("/api/users/me").expect(401);
    });

    it("deve permitir o acesso com token válido", async () => {
      // Criar o usuário e fazer login
      await request(app).post("/api/users").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "john@example.com",
        password: "password123",
      });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe("john@example.com");
    });
  });
});
```

### Padrão 2: Testes de Integração de Banco de Dados

```typescript
// tests/integration/user.repository.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { UserRepository } from "../../src/repositories/user.repository";

describe("Testes de Integração de UserRepository", () => {
  let pool: Pool;
  let repository: UserRepository;

  beforeAll(async () => {
    pool = new Pool({
      host: "localhost",
      port: 5432,
      database: "test_db",
      user: "test_user",
      password: "test_password",
    });

    repository = new UserRepository(pool);

    // Criar as tabelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  afterAll(async () => {
    await pool.query("DROP TABLE IF EXISTS users");
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE users CASCADE");
  });

  it("deve criar um usuário", async () => {
    const user = await repository.create({
      name: "John Doe",
      email: "john@example.com",
      password: "hashed_password",
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
  });

  it("deve encontrar usuário por email", async () => {
    await repository.create({
      name: "John Doe",
      email: "john@example.com",
      password: "hashed_password",
    });

    const user = await repository.findByEmail("john@example.com");

    expect(user).toBeTruthy();
    expect(user?.name).toBe("John Doe");
  });

  it("deve retornar nulo se o usuário não for encontrado", async () => {
    const user = await repository.findByEmail("nonexistent@example.com");
    expect(user).toBeNull();
  });
});
```

## Testes Frontend com Testing Library

### Padrão 1: Testes de Componentes React

```typescript
// components/UserForm.tsx
import { useState } from 'react';

interface Props {
  onSubmit: (user: { name: string; email: string }) => void;
}

export function UserForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        data-testid="name-input"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="email-input"
      />
      <button type="submit">Enviar</button>
    </form>
  );
}

// components/UserForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserForm } from './UserForm';

describe('UserForm', () => {
  it('deve renderizar os inputs do formulário', () => {
    render(<UserForm onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('deve atualizar os valores dos inputs', () => {
    render(<UserForm onSubmit={vi.fn()} />);

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
  });

  it('deve chamar onSubmit com os dados do formulário', () => {
    const onSubmit = vi.fn();
    render(<UserForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

### Padrão 2: Testes de Hooks

```typescript
// hooks/useCounter.ts
import { useState, useCallback } from "react";

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}

// hooks/useCounter.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("deve inicializar com valor padrão", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("deve inicializar com valor customizado", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("deve incrementar o count", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("deve decrementar o count", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it("deve resetar ao valor inicial", () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(12);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

## Test Fixtures e Factories

```typescript
// tests/fixtures/user.fixture.ts
import { faker } from "@faker-js/faker";

export function createUserFixture(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.past(),
    ...overrides,
  };
}

export function createUsersFixture(count: number): User[] {
  return Array.from({ length: count }, () => createUserFixture());
}

// Uso nos testes
import {
  createUserFixture,
  createUsersFixture,
} from "../fixtures/user.fixture";

describe("UserService", () => {
  it("deve processar o usuário", () => {
    const user = createUserFixture({ name: "John Doe" });
    // Usar o user no teste
  });

  it("deve lidar com múltiplos usuários", () => {
    const users = createUsersFixture(10);
    // Usar os users no teste
  });
});
```

## Testes de Snapshot

```typescript
// components/UserCard.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('deve corresponder ao snapshot', () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
    };

    const { container } = render(<UserCard user={user} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('deve corresponder ao snapshot no estado de loading', () => {
    const { container } = render(<UserCard loading />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

## Relatórios de Cobertura (Coverage)

```typescript
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Melhores Práticas

1. **Siga o Padrão AAA**: Arrange (Preparar), Act (Agir), Assert (Validar).
2. **Uma asserção por teste**: Ou asserções logicamente relacionadas.
3. **Nomes de testes descritivos**: Devem descrever o que está sendo testado.
4. **Use beforeEach/afterEach**: Para as fases de setup (preparação) e teardown (limpeza).
5. **Faça mock de dependências externas**: Mantenha os testes isolados.
6. **Teste casos limite (edge cases)**: Não teste apenas os caminhos felizes (happy paths).
7. **Evite testar detalhes de implementação**: Teste o comportamento, não o detalhe da implementação.
8. **Use test factories**: Para criar dados de teste consistentes.
9. **Mantenha os testes rápidos**: Faça mock de operações lentas.
10. **Escreva testes primeiro (TDD)**: Sempre que possível.
11. **Mantenha uma alta cobertura de testes (coverage)**: Mire em mais de 80% de cobertura.
12. **Use TypeScript quando aplicável**: Em projetos JS, mantenha type-safety com JSDoc + `checkJs`.
13. **Teste o tratamento de erros**: Não teste apenas os casos de sucesso.
14. **Use `data-testid` com moderação**: Prefira queries semânticas (`getByRole`).
15. **Limpe após os testes**: Previna poluição nos testes entre rodadas.

## Padrões Comuns

### Organização de Testes

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("deve criar usuário com sucesso", () => {});
    it("deve lançar erro se o email existir", () => {});
    it("deve gerar o hash da senha", () => {});
  });

  describe("updateUser", () => {
    it("deve atualizar o usuário", () => {});
    it("deve lançar erro se não encontrar", () => {});
  });
});
```

### Testando Promises

```typescript
// Usando async/await
it("deve buscar o usuário", async () => {
  const user = await service.fetchUser("1");
  expect(user).toBeDefined();
});

// Testando rejeições (rejections)
it("deve lançar erro", async () => {
  await expect(service.fetchUser("invalido")).rejects.toThrow("Not found");
});
```

### Testando Timers (Temporizadores)

```typescript
import { vi } from "vitest";

it("deve chamar a função depois do delay", () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  expect(callback).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

## Recursos

- **Documentação Jest**: https://jestjs.io/
- **Documentação Vitest**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Kent C. Dodds Testing Blog**: https://kentcdodds.com/blog/
