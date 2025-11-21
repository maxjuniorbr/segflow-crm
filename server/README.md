# SegFlow CRM - Server

Backend API for SegFlow CRM built with Node.js, Express, and PostgreSQL.

## Architecture

This server follows **Clean Architecture** principles with clear separation of concerns:

```
server/
├── src/
│   ├── domain/              # Business entities and core logic
│   │   └── entities/        # Domain models (User, Client, Document)
│   ├── infrastructure/      # External dependencies
│   │   ├── database/        # Database connection
│   │   └── repositories/    # Data access layer
│   ├── application/         # Use cases / business logic
│   │   └── use-cases/       # Specific business operations
│   └── presentation/        # HTTP layer
│       ├── controllers/     # Request handlers
│       ├── middleware/      # Auth, validation
│       └── routes/          # Route definitions
├── controllers/             # Current controllers (to be migrated)
├── middleware/              # Current middleware
├── routes/                  # Current routes
├── schemas/                 # Validation schemas (Zod)
├── scripts/                 # Database initialization
└── tests/                   # Test suites
    ├── unit/                # Unit tests
    └── integration/         # Integration tests
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+

### Installation

```bash
cd server
npm install
```

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3001
DATABASE_URL=postgres://username:password@localhost:5432/segflow_crm
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

> **Security Note**: Always use a strong, randomly generated JWT_SECRET in production. You can generate one using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Database Initialization

Run the database initialization script to create the schema:

```bash
node scripts/initDb.js
```

This will:
1. Create the `segflow_crm` database if it doesn't exist
2. Create the required tables (users, clients, documents)
3. **No default users are created** - you must register via the API

## Running the Server

### Development Mode

```bash
npm  run dev
```

Server runs on `http://localhost:3001` with hot reload via nodemon.

### Production Mode

```bash
npm start
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "email": "user@example.com",
    "username": "user",
    "isAuthenticated": true
  }
}
```

### Protected Routes

All routes below require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

#### Clients

- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### Documents

- `GET /api/documents` - List all documents
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with UI

```bash
npm run test:ui
```

### Test Coverage

Coverage reports are generated in the `coverage/` directory after running tests.

### Test Structure

- **Unit Tests** (`tests/unit/`): Test individual entities and business logic
- **Integration Tests** (`tests/integration/`): Test API endpoints and database interactions

## Code Quality

### Linting

```bash
npx eslint .
```

### Formatting

Check formatting:
```bash
npx prettier --check .
```

Auto-fix formatting:
```bash
npx prettier --write .
```

## Security Features

✅ **Password Hashing**: All passwords are hashed using bcryptjs (cost factor: 10)
✅ **JWT Authentication**: Secure token-based authentication with 1-hour expiration
✅ **Input Validation**: Request validation using Zod schemas
✅ **CORS Protection**: Configured allowed origins
✅ **SQL Injection Protection**: Parameterized queries via pg library
✅ **Environment Variables**: Sensitive data in `.env` (gitignored)

## Project Structure Highlights

### Domain Entities

Entities represent core business objects with no dependencies on external frameworks:

- `User`: Application users with authentication
- `Client`: Customer records with personal information
- `Document`: Insurance documents linked to clients

Each entity includes:
- Constructor for creating instances
- `fromDatabase()` static method for database → entity transformation
- `toJSON()` / `toPublicJSON()` for entity → API response transformation

### Current Migration Status

The codebase is in a transition state:
- ✅ Domain entities created in `src/domain/entities/`
- ✅ Infrastructure layer started in `src/infrastructure/`
- 🔄 Controllers still in root `controllers/` (to be migrated to `src/presentation/controllers/`)
- 🔄 Direct database calls in controllers (to be moved to repositories and use cases)

This architecture provides a foundation for:
- Easy testing (entities are framework-independent)
- Clear separation of concerns
- Flexibility to change infrastructure without affecting business logic

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify DATABASE_URL in `.env` is correct  
3. Check that the `segflow_crm` database exists

### Authentication Failures

1. Ensure JWT_SECRET is set in `.env`
2. Check token hasn't expired (1-hour limit)
3. Verify token format: `Bearer <token>`

## Contributing

When adding new features:

1. **Create entities first** in `src/domain/entities/`
2. **Add repositories** in `src/infrastructure/repositories/`
3. **Implement use cases** in `src/application/use-cases/`
4. **Add controllers** in `src/presentation/controllers/`
5. **Write tests** in `tests/unit/` and `tests/integration/`
6. **Update schemas** in `schemas/` for validation

Follow existing patterns for consistency.
