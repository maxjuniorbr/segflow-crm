---
name: auth-implementation-patterns
description: Define padrões para implementação de autenticação e autorização (JWT, RBAC, sessões). Use ao implementar sistemas de login, proteger rotas ou resolver problemas de segurança e controle de acesso.
---

# Padrões de Implementação de Autenticação e Autorização

Construa sistemas de autenticação e autorização seguros e escaláveis usando padrões da indústria e melhores práticas modernas.

## Quando Usar Esta Skill

- Implementar sistemas de autenticação de usuário
- Proteger APIs REST ou GraphQL
- Adicionar OAuth2/login social
- Implementar controle de acesso baseado em funções (Role-Based Access Control - RBAC)
- Projetar gerenciamento de sessão (session management)
- Migrar sistemas de autenticação
- Debugar problemas de autenticação
- Implementar SSO (Single Sign-On) ou multi-tenancy

## Contexto Obrigatório do SegFlow CRM

- **Backend em JavaScript**: no SegFlow CRM o backend permanece em JavaScript com JSDoc + `checkJs`; use exemplos TypeScript desta skill apenas como referência e converta para JS ao implementar.
- **Arquitetura limpa**: preserve o fluxo `routes -> controllers -> useCases -> repositories -> entities`; não colocar regra de negócio em controller nem acesso direto ao banco em rotas.
- **Fluxo de auth oficial do projeto**: manter JWT de curta duração + refresh token com rotação automática, refresh token com hash no banco e cookies `httpOnly` (`segflow_token` e `segflow_refresh` com `path` restrito em `/api/auth`).
- **Validação e erros**: validar entrada com Zod + middleware `validate`; erros de negócio via `AppError` e subclasses (`UnauthorizedError`, `ValidationError`, etc.).
- **Escopo de mudanças**: não introduzir sessão com `express-session`, OAuth2/passport ou RBAC novo sem requisito explícito do usuário e sem aderência ao stack atual do repositório.

## Conceitos Principais (Core Concepts)

### 1. Autenticação vs Autorização

**Autenticação (AuthN)**: Quem é você?

- Verificação de identidade (usuário/senha, OAuth, biometria)
- Emissão de credenciais (sessões, tokens)
- Gerenciamento de login/logout

**Autorização (AuthZ)**: O que você pode fazer?

- Checagem de permissões
- Controle de acesso baseado em funções (RBAC)
- Validação de posse do recurso
- Imposição de políticas (Policy enforcement)

### 2. Estratégias de Autenticação

**Baseada em Sessão (Session-Based):**

- O servidor armazena o estado da sessão
- O ID da sessão fica no cookie
- Tradicional, simples, com estado (stateful)

**Baseada em Token (JWT):**

- Sem estado (stateless), autossuficiente
- Escala horizontalmente
- Pode armazenar "claims" (reivindicações)

**OAuth2/OpenID Connect:**

- Delegação de autenticação
- Login social (Google, GitHub)
- SSO Corporativo

## Autenticação JWT

### Padrão 1: Implementação de JWT

```typescript
// Estrutura do JWT: header.payload.signature
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Gera JWT
function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }, // Curta duração
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }, // Longa duração
  );

  return { accessToken, refreshToken };
}

// Verifica JWT
function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
}

// Middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyToken(token);
    req.user = payload; // Anexa usuário à requisição
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Uso
app.get("/api/profile", authenticate, (req, res) => {
  res.json({ user: req.user });
});
```

### Padrão 2: Fluxo do Refresh Token

```typescript
interface StoredRefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

class RefreshTokenService {
  // Armazenar o refresh token no banco de dados
  async storeRefreshToken(userId: string, refreshToken: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.refreshTokens.create({
      token: await hash(refreshToken), // Faça hash antes de armazenar
      userId,
      expiresAt,
    });
  }

  // Renovar o access token
  async refreshAccessToken(refreshToken: string) {
    // Verificar o refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
      };
    } catch {
      throw new Error("Invalid refresh token");
    }

    // Checar se o token existe no banco de dados
    const storedToken = await db.refreshTokens.findOne({
      where: {
        token: await hash(refreshToken),
        userId: payload.userId,
        expiresAt: { $gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new Error("Refresh token not found or expired");
    }

    // Obter o usuário
    const user = await db.users.findById(payload.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Gerar um novo access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    return { accessToken };
  }

  // Revogar o refresh token (logout)
  async revokeRefreshToken(refreshToken: string) {
    await db.refreshTokens.deleteOne({
      token: await hash(refreshToken),
    });
  }

  // Revogar todos os tokens do usuário (deslogar todos os dispositivos)
  async revokeAllUserTokens(userId: string) {
    await db.refreshTokens.deleteMany({ userId });
  }
}

// Endpoints da API
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const { accessToken } =
      await refreshTokenService.refreshAccessToken(refreshToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

app.post("/api/auth/logout", authenticate, async (req, res) => {
  const { refreshToken } = req.body;
  await refreshTokenService.revokeRefreshToken(refreshToken);
  res.json({ message: "Logged out successfully" });
});
```

## Autenticação Baseada em Sessão

### Padrão 1: Express Session

```typescript
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

// Configurar o Redis para armazenamento da sessão
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
await redisClient.connect();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Apenas HTTPS
      httpOnly: true, // Sem acesso via JavaScript
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: "strict", // Proteção CSRF
    },
  }),
);

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.users.findOne({ email });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Armazenar o usuário na sessão
  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

// Middleware da sessão
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// Rota protegida
app.get("/api/profile", requireAuth, async (req, res) => {
  const user = await db.users.findById(req.session.userId);
  res.json({ user });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});
```

## OAuth2 / Login Social

### Padrão 1: OAuth2 com Passport.js

```typescript
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";

// Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Encontrar ou criar usuário
        let user = await db.users.findOne({
          googleId: profile.id,
        });

        if (!user) {
          user = await db.users.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    },
  ),
);

// Rotas
app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Gerar JWT
    const tokens = generateTokens(req.user.id, req.user.email, req.user.role);
    // Redirecionar para o frontend com o token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}`,
    );
  },
);
```

## Padrões de Autorização

### Padrão 1: Role-Based Access Control (RBAC)

```typescript
enum Role {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

const roleHierarchy: Record<Role, Role[]> = {
  [Role.ADMIN]: [Role.ADMIN, Role.MODERATOR, Role.USER],
  [Role.MODERATOR]: [Role.MODERATOR, Role.USER],
  [Role.USER]: [Role.USER],
};

function hasRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole].includes(requiredRole);
}

// Middleware
function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.some((role) => hasRole(req.user.role, role))) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

// Uso
app.delete(
  "/api/users/:id",
  authenticate,
  requireRole(Role.ADMIN),
  async (req, res) => {
    // Apenas admins podem deletar usuários
    await db.users.delete(req.params.id);
    res.json({ message: "User deleted" });
  },
);
```

### Padrão 2: Controle de Acesso Baseado em Permissão (Permission-Based)

```typescript
enum Permission {
  READ_USERS = "read:users",
  WRITE_USERS = "write:users",
  DELETE_USERS = "delete:users",
  READ_POSTS = "read:posts",
  WRITE_POSTS = "write:posts",
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [Permission.READ_POSTS, Permission.WRITE_POSTS],
  [Role.MODERATOR]: [
    Permission.READ_POSTS,
    Permission.WRITE_POSTS,
    Permission.READ_USERS,
  ],
  [Role.ADMIN]: Object.values(Permission),
};

function hasPermission(userRole: Role, permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false;
}

function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const hasAllPermissions = permissions.every((permission) =>
      hasPermission(req.user.role, permission),
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

// Uso
app.get(
  "/api/users",
  authenticate,
  requirePermission(Permission.READ_USERS),
  async (req, res) => {
    const users = await db.users.findAll();
    res.json({ users });
  },
);
```

### Padrão 3: Posse do Recurso (Resource Ownership)

```typescript
// Checar se o usuário é dono do recurso
async function requireOwnership(
  resourceType: "post" | "comment",
  resourceIdParam: string = "id",
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const resourceId = req.params[resourceIdParam];

    // Admins podem acessar qualquer coisa
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    // Checar posse
    let resource;
    if (resourceType === "post") {
      resource = await db.posts.findById(resourceId);
    } else if (resourceType === "comment") {
      resource = await db.comments.findById(resourceId);
    }

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    if (resource.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    next();
  };
}

// Uso
app.put(
  "/api/posts/:id",
  authenticate,
  requireOwnership("post"),
  async (req, res) => {
    // O usuário só pode atualizar os seus próprios posts
    const post = await db.posts.update(req.params.id, req.body);
    res.json({ post });
  },
);
```

## Melhores Práticas de Segurança

### Padrão 1: Segurança de Senha

```typescript
import bcrypt from "bcrypt";
import { z } from "zod";

// Schema de validação de senha
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/[0-9]/, "Password must contain number")
  .regex(/[^A-Za-z0-9]/, "Password must contain special character");

// Fazer o hash da senha
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // 2^12 iterações
  return bcrypt.hash(password, saltRounds);
}

// Verificar a senha
async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Cadastro (Registration) com validação de senha
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar a senha
    passwordSchema.parse(password);

    // Checar se o usuário já existe
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Criar o usuário
    const user = await db.users.create({
      email,
      passwordHash,
    });

    // Gerar tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    res.status(201).json({
      user: { id: user.id, email: user.email },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});
```

### Padrão 2: Rate Limiting

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

// Limitador de taxa (Rate limiter) para login
const loginLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador de taxa (Rate limiter) para API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  standardHeaders: true,
});

// Aplicar nas rotas
app.post("/api/auth/login", loginLimiter, async (req, res) => {
  // Lógica de login
});

app.use("/api/", apiLimiter);
```

## Melhores Práticas

1. **Nunca Armazene Senhas em Texto Puro**: Sempre faça hash com bcrypt/argon2
2. **Use HTTPS**: Criptografe os dados em trânsito
3. **Access Tokens de Curta Duração**: 15-30 minutos no máximo
4. **Cookies Seguros**: As flags `httpOnly`, `secure` e `sameSite`
5. **Valide Todo o Input**: Formato de e-mail, força da senha
6. **Faça Rate Limit nos Endpoints de Auth**: Previna ataques de força bruta (brute force attacks)
7. **Implemente Proteção contra CSRF**: Obrigatório para auth baseada em sessão
8. **Rotacione Segredos Regularmente**: Os secrets do JWT e secrets da sessão
9. **Logue os Eventos de Segurança**: Tentativas de login, autenticações que falharam
10. **Use MFA Quando Possível**: Uma camada extra de segurança

## Armadilhas Comuns (Common Pitfalls)

- **Senhas Fracas**: Faça cumprir políticas de senhas fortes
- **JWT no localStorage**: Fica vulnerável a XSS. Use cookies `httpOnly`
- **Nenhuma Expiração no Token**: Todos os tokens devem expirar
- **Checagem de Auth Só no Client-Side**: Sempre valide do lado do servidor
- **Redefinição de Senha Insegura**: Use tokens seguros que expiram
- **Ausência de Rate Limiting**: Fica vulnerável à força bruta
- **Confiar nos Dados do Client**: Sempre faça a validação no servidor

## Recursos

- **`server/src/application/useCases/authUseCases.js`**: Regras reais de login, refresh com rotação e revogação de token
- **`server/src/application/controllers/authController.js`**: Configuração de cookies `httpOnly` para access/refresh token
- **`server/middleware/index.js`**: `authMiddleware` atual (Bearer e fallback por cookie)
- **`server/src/infrastructure/repositories/refreshTokenRepository.js`**: Persistência/revogação de refresh token com hash
- **RFC 7519 (JWT)**: https://www.rfc-editor.org/rfc/rfc7519
- **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **OWASP Session Management Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- **MDN - Cookies Security**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security
