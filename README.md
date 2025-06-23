# Labsy Backend

Labsy is a GCC-focused print-on-demand (POD) platform that connects creators with local print factories to sell custom merchandise. It solves the lack of accessible, localized POD services in the Middle East by supporting Arabic language, local payment methods, and regional fulfillment.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Database Migrations & Seeds](#database-migrations--seeds)
- [Deployment](#deployment)
- [Code Quality & Linting](#code-quality--linting)
- [API Documentation](#api-documentation)
- [Useful Commands](#useful-commands)
- [Changelog](#changelog)
- [Resources](#resources)
- [Support](#support)

---

## Project Overview
Labsy enables creators to launch and manage custom merchandise stores, with seamless integration to local print factories and logistics. The backend is built with NestJS and TypeScript, following a modular architecture for scalability and maintainability.

## Architecture
- **Modular Structure:** Each feature is encapsulated in its own module (e.g., `auth`, `users`, `catalog`, `uploads`).
- **Dependency Injection:** Services and repositories are injected using NestJS's DI system.
- **Database:** PostgreSQL with TypeORM for ORM and migrations.
- **Authentication:** Firebase for user authentication and authorization.
- **File Uploads:** Google Cloud Storage for handling file uploads.
- **Validation:** DTOs with `class-validator` and `class-transformer`.
- **Configuration:** Managed via `@nestjs/config` and environment variables.

## Tech Stack
- **Backend:** [NestJS](https://nestjs.com/) (TypeScript)
- **Database:** PostgreSQL + TypeORM
- **Authentication:** Firebase
- **File Storage:** Google Cloud Storage
- **Package Manager:** Yarn
- **API Docs:** Swagger (`@nestjs/swagger`)
- **Validation:** `class-validator`, `class-transformer`
- **Reactive Programming:** `rxjs`

## Getting Started

### 1. Clone the repository
```bash
git clone <repo-url>
cd labsy-backend
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Set up environment variables
Copy `.env.example` to `.env` and fill in the required values (see [Environment Variables](#environment-variables)).

### 4. Run the database (PostgreSQL)
You can use Docker Compose:
```bash
yarn run db:up
```
Or manually start your PostgreSQL instance.

### 5. Run database migrations
```bash
yarn run typeorm migration:run
```

### 6. Start the development server
```bash
yarn start:dev
```

The server will start on the port specified in your `.env` file (default: 3000).

## Environment Variables
Create a `.env` file in the root directory. Key variables include:
- `DATABASE_URL` – PostgreSQL connection string
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` – Firebase credentials
- `GCS_BUCKET_NAME`, `GCS_KEYFILE_PATH` – Google Cloud Storage config
- `PORT` – API server port
- `NODE_ENV` – `development` | `production`

Refer to `.env.example` for the full list and descriptions.

## Development Workflow
- Use the NestJS CLI to generate modules, controllers, and services:
  ```bash
  yarn nest generate module <name>
  yarn nest generate controller <name>
  yarn nest generate service <name>
  ```
- Follow the modular architecture: keep related files together in their module folder.
- Use DTOs for all request/response validation.
- Use dependency injection for all services and repositories.
- Use async/await for all asynchronous operations.
- Use environment variables for all configuration/secrets.
- Write unit tests for all services and controllers.
- Document API endpoints with Swagger decorators.

## Testing
- **Unit tests:**
  ```bash
  yarn test
  ```
- **End-to-end (e2e) tests:**
  ```bash
  yarn test:e2e
  ```
- **Test coverage:**
  ```bash
  yarn test:cov
  ```

## Database Migrations & Seeds
- **Run migrations:**
  ```bash
  yarn run typeorm migration:run
  ```
- **Revert last migration:**
  ```bash
  yarn run typeorm migration:revert
  ```
- **Seed data:**
  See scripts in `src/seeds/` and run as needed.

## Deployment
- Build the project:
  ```bash
  yarn build
  ```
- Start in production mode:
  ```bash
  yarn start:prod
  ```
- For Docker-based deployment, use the provided `docker-compose.yml`.

## Code Quality & Linting
- Lint the codebase:
  ```bash
  yarn lint
  ```
- ESLint is configured; use `// eslint-disable-next-line` for exceptions.

## API Documentation
- Swagger UI is available at `/api/docs` when the server is running.
- Use `@nestjs/swagger` decorators to document endpoints.

## Useful Commands
- `yarn start:dev` – Start development server with hot reload
- `yarn test` – Run unit tests
- `yarn test:e2e` – Run e2e tests
- `yarn lint` – Lint codebase
- `yarn run typeorm migration:run` – Run DB migrations
- `yarn run db:up` – Start DB via Docker Compose

## Changelog
See `CHANGELOG.md` for a history of changes. Please update the changelog with every PR.

## Resources
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Storage Node.js Client](https://cloud.google.com/nodejs/docs/reference/storage/latest)
- [Class Validator](https://github.com/typestack/class-validator)
- [Swagger for NestJS](https://docs.nestjs.com/openapi/introduction)

## Support
For questions, open an issue or contact the team.

---

© 2025 Labsy. All rights reserved.
