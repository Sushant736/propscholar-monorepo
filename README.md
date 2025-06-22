# PropScholar Monorepo

This is a Turborepo monorepo containing three applications:

- **Client** (`apps/client`) - Next.js 14 client-side application running on port 3001
- **Admin** (`apps/admin`) - Next.js 14 admin-side application running on port 3002  
- **API** (`apps/api`) - Node.js TypeScript Express server running on port 3000

## Structure

```
propscholar-monorepo/
├── apps/
│   ├── client/          # Next.js 14 client app (port 3001)
│   ├── admin/           # Next.js 14 admin app (port 3002)
│   └── api/             # Node.js TypeScript Express API (port 3000)
├── packages/
│   ├── eslint-config/   # Shared ESLint configurations
│   ├── typescript-config/ # Shared TypeScript configurations
│   └── ui/              # Shared UI components
└── turbo.json           # Turborepo configuration
```

## Development

### Prerequisites

- Node.js 18+
- pnpm package manager

### Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start all applications in development mode:
```bash
pnpm dev
```

This will start:
- Client app at http://localhost:3001
- Admin app at http://localhost:3002
- API server at http://localhost:3000

### Individual Development

Start specific applications:

```bash
# Start only client app
pnpm dev:client

# Start only admin app
pnpm dev:admin

# Start only API server
pnpm dev:api
```

## Building

Build all applications:
```bash
pnpm build
```

## Production

Start all applications in production mode:
```bash
pnpm start
```

## API Project Details

The API project follows the [DigitalOcean Node.js TypeScript tutorial](https://www.digitalocean.com/community/tutorials/setting-up-a-node-project-with-typescript) and includes:

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Compiled output** - TypeScript compiles to `dist/` directory

### API Development

The API server includes:
- **Hot reload** - Auto-restart on file changes using `tsx watch`
- TypeScript compilation with source maps
- ESLint configuration for TypeScript
- Express server setup
- Development and production scripts

**Development mode**: `pnpm dev:api` - Runs with file watching and automatic restart
**Production mode**: `pnpm start` - Compiles TypeScript and runs the built JavaScript

## Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all applications
- `pnpm start` - Start all apps in production mode
- `pnpm lint` - Lint all applications
- `pnpm dev:client` - Start client app only
- `pnpm dev:admin` - Start admin app only
- `pnpm dev:api` - Start API server only (with hot reload)

## Tech Stack

### Client & Admin Apps
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

### API Server
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **ESLint** - Code linting with TypeScript rules
- **tsx** - TypeScript execution with hot reload for development

### Monorepo Tools
- **Turborepo** - Build system and task runner
- **pnpm** - Package manager with workspaces
- **Shared packages** - Common configurations and components
