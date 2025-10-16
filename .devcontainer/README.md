# Dev Container Setup

This project includes a complete development environment using Dev Containers that provides:

- ✅ Node.js 18 with TypeScript support
- ✅ PostgreSQL 15 database
- ✅ All project dependencies pre-installed
- ✅ VS Code extensions configured
- ✅ Port forwarding for development servers
- ✅ Database migrations and seeding

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- VS Code with the "Dev Containers" extension

### Setup Steps

1. **Open in Dev Container**:
   - Open VS Code
   - Open this project folder
   - VS Code should prompt to "Reopen in Container"
   - Or use: `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"

2. **Wait for Setup**:
   - The container will build automatically
   - Dependencies will be installed
   - Database will be initialized
   - This takes a few minutes on first run

3. **Start Development**:

   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run dev:client  # Frontend on http://localhost:3000
   npm run dev:server  # Backend on http://localhost:2022
   ```

## What's Included

### Services

- **App Container**: Node.js development environment
- **Database**: PostgreSQL 15 with persistent data

### VS Code Extensions

- TypeScript/JavaScript support
- Prettier formatting
- ESLint linting
- Tailwind CSS IntelliSense
- GitHub Copilot
- Playwright testing
- Path IntelliSense

### Environment Variables

- Pre-configured for development
- Database connection to container PostgreSQL
- CORS enabled for local development

### Ports

- `3000`: Frontend (Vite dev server)
- `2022`: Backend (Fastify API)
- `5432`: PostgreSQL database

## Useful Commands

```bash
# Database operations
npm run push          # Run migrations
npm run seed          # Seed database

# Development
npm run dev           # Start both client & server
npm run dev:client    # Frontend only
npm run dev:server    # Backend only

# Building
npm run build:all     # Build everything
npm run build:client  # Build frontend
npm run build:server  # Backend only

# Testing
npm run test          # Run E2E tests
```

### PostgreSQL Database Commands

The dev container includes PostgreSQL 15. Use these commands to interact with the database:

```bash
# List all databases
psql postgresql://postgres:password@db:5432/finance_tracker_dev -c "\l"

# List databases with sizes
psql postgresql://postgres:password@db:5432/finance_tracker_dev -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) as size FROM pg_database;"

# Connect to interactive PostgreSQL shell
psql postgresql://postgres:password@db:5432/finance_tracker_dev

# Connect to a specific database
psql postgresql://postgres:password@db:5432/database_name
```

**Inside psql interactive shell:**

```sql
\l              -- List databases
\c database     -- Connect to database
\dt             -- List tables in current database
\d table_name   -- Describe table structure
\q              -- Quit psql
```

**Database connection details:**

- Host: `db` (container service name)
- Port: `5432`
- Username: `postgres`
- Password: `password`
- Default database: `finance_tracker_dev`

## Troubleshooting

### Container Won't Start

- Ensure Docker Desktop is running
- Check for port conflicts (3000, 2022, 5432)
- Try rebuilding: `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

### Database Connection Issues

- The database takes a moment to initialize on first run
- Check logs: `docker-compose logs db`
- Restart the database service if needed

### Hot Reload Not Working

- Ensure files are being watched correctly
- Try restarting the dev server
- Check that volumes are mounted properly

## Manual Setup (Alternative)

If you prefer not to use dev containers:

1. Install PostgreSQL locally
2. Copy `.devcontainer/dev.env` to `server.env`
3. Copy `.devcontainer/client.env` to `client/client.env`
4. Update database connection in `server.env`
5. Run `npm install && npm run dev`
