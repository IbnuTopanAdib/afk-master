# Production-Ready Backend API

A scalable, production-ready backend built with Node.js, TypeScript, Express.js, Drizzle ORM, and PostgreSQL following clean architecture principles.

## 🏗️ Architecture

This project follows a **modular/feature-based architecture** where each module is self-contained and includes all necessary components:

- **Controller** - HTTP layer (request/response handling)
- **Service** - Business logic and data access
- **Routes** - Route definitions
- **Validation** - Zod schemas for input validation
- **Schema** - Drizzle ORM table definitions
- **Types** - TypeScript type definitions

### Key Architecture Decisions

#### No Repository Layer
This implementation does **NOT** include a separate repository layer. Drizzle ORM acts as the data access layer and is used directly within services. This approach:
- Reduces unnecessary abstraction
- Leverages Drizzle's type-safe query builder
- Simplifies the codebase while maintaining clean separation of concerns

#### Clean Architecture Principles
- **Controllers** handle only HTTP concerns (parsing requests, sending responses)
- **Services** contain all business logic and interact directly with Drizzle
- **Validation** is handled with Zod before reaching services
- **Error handling** is centralized through middleware

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/                    # Feature modules
│   │   └── user/
│   │       ├── user.controller.ts  # HTTP layer
│   │       ├── user.service.ts     # Business logic + Drizzle access
│   │       ├── user.routes.ts      # Route definitions
│   │       ├── user.validation.ts  # Zod schemas
│   │       ├── user.schema.ts      # Drizzle table definition
│   │       └── user.types.ts       # TypeScript types
│   ├── infrastructure/             # Infrastructure layer
│   │   └── database/
│   │       └── index.ts            # Database connection & Drizzle setup
│   ├── config/                     # Configuration
│   │   └── env.ts                  # Typed environment config
│   ├── middleware/                 # Global middleware
│   │   ├── error.middleware.ts     # Error handling
│   │   ├── logger.middleware.ts    # Request logging
│   │   └── validation.middleware.ts # Validation middleware
│   ├── app.ts                      # Express app configuration
│   └── server.ts                   # Server entry point
├── drizzle/                        # Generated migrations (auto-created)
├── logs/                           # Application logs (auto-created)
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── .gitignore
├── VALIDATION_MIDDLEWARE_GUIDE.md  # Validation middleware usage guide
└── README.md
```

## 🚀 Technology Stack

- **Runtime**: Node.js 20.x LTS
- **Language**: TypeScript 5.7.x (strict mode)
- **Framework**: Express.js 4.21.x
- **ORM**: Drizzle ORM 0.36.x
- **Database**: PostgreSQL (pg driver 8.13.x)
- **Validation**: Zod 3.24.x
- **Logging**: Winston 3.17.x
- **Password Hashing**: bcrypt 5.1.x

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- npm or yarn

### Steps

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   LOG_LEVEL=info
   ```

5. **Create PostgreSQL database**
   ```bash
   createdb database_name
   ```

6. **Generate and run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Development Workflow

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **The server will start on** `http://localhost:3000`

3. **Check health endpoint**
   ```bash
   curl http://localhost:3000/health
   ```

## 📚 API Documentation

### User Endpoints

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-05T07:09:14.000Z",
    "updatedAt": "2026-02-05T07:09:14.000Z"
  }
}
```

#### Get All Users
```http
GET /api/users
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-02-05T07:09:14.000Z",
      "updatedAt": "2026-02-05T07:09:14.000Z"
    }
  ]
}
```

#### Get User by ID
```http
GET /api/users/:id
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-05T07:09:14.000Z",
    "updatedAt": "2026-02-05T07:09:14.000Z"
  }
}
```

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "createdAt": "2026-02-05T07:09:14.000Z",
    "updatedAt": "2026-02-05T07:10:00.000Z"
  }
}
```

#### Delete User
```http
DELETE /api/users/:id
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-05T07:09:14.000Z",
    "updatedAt": "2026-02-05T07:09:14.000Z"
  }
}
```

### Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

## 🧩 Adding New Modules

To add a new feature module, follow this structure:

1. **Create module directory**
   ```
   src/modules/your-module/
   ```

2. **Create required files**
   - `your-module.schema.ts` - Drizzle table definition
   - `your-module.validation.ts` - Zod validation schemas
   - `your-module.types.ts` - TypeScript types
   - `your-module.service.ts` - Business logic
   - `your-module.controller.ts` - HTTP handlers
   - `your-module.routes.ts` - Route definitions

3. **Mount routes in `app.ts`**
   ```typescript
   import yourModuleRoutes from './modules/your-module/your-module.routes';
   app.use('/api/your-module', yourModuleRoutes);
   ```

4. **Generate and run migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## 🔒 Security Best Practices

- ✅ Passwords are hashed using bcrypt
- ✅ Environment variables for sensitive data
- ✅ Input validation with Zod
- ✅ SQL injection prevention via Drizzle ORM
- ✅ Centralized error handling
- ✅ Request logging for audit trails

## 📝 Logging

Logs are written to:
- **Console** - All logs with color coding
- **logs/combined.log** - All logs
- **logs/error.log** - Error logs only

Log levels: `error`, `warn`, `info`, `debug`

Configure via `LOG_LEVEL` environment variable.

## 🧪 Testing

The project structure supports easy testing:

- **Unit tests** - Test services in isolation
- **Integration tests** - Test API endpoints
- **Database tests** - Use a test database

(Testing framework setup is left for future implementation)

## 🚢 Production Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=your_production_database_url
   LOG_LEVEL=warn
   ```

3. **Run migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong database credentials
- [ ] Enable SSL for database connections
- [ ] Set up proper logging and monitoring
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up process manager (PM2/systemd)
- [ ] Enable CORS if needed
- [ ] Set up rate limiting
- [ ] Configure firewall rules

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain TypeScript strict mode compliance
3. Add proper error handling
4. Document complex logic with comments
5. Keep modules self-contained

## 📄 License

ISC

---

**Built with ❤️ using modern Node.js best practices**
