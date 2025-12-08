# Finance App

Personal finance dashboard integrating Plaid API with a modern Next.js frontend.

## Architecture

```
finance-app/
├── backend/     # Go API server + PostgreSQL (Plaid integration)
└── frontend/    # Next.js App Router dashboard
```

## Quick Start

### 1. Start the database

```bash
cd backend
docker-compose up db
```

### 2. Start the Go backend (port 8000)

```bash
cd backend
make go-air
```

### 3. Start the Next.js frontend (port 3000)

```bash
cd frontend
pnpm install
pnpm dev
```

## URLs

- Frontend: http://localhost:3000
- Go API: http://localhost:8000
- PostgreSQL: localhost:5432
  - Username: postgres
  - Password: password
  - Database: postgres

## Environment

Backend `.env` is in `backend/.env` (contains Plaid credentials).
Frontend `.env.local` is in `frontend/.env.local`.
