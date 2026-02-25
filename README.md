# Acme Analytics

Product analytics platform for SaaS companies. Track events, analyze funnels, and understand user behavior in real time.

![Acme Analytics Dashboard](docs/screenshot-placeholder.png)

## Tech Stack

- **Framework:** Next.js 14+ (App Router, SSR + React Server Components)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (custom build)
- **State Management:** Zustand (client), TanStack Query (server)
- **Data Fetching:** TanStack Query with REST API + GraphQL
- **Authentication:** Clerk (middleware pattern)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Realtime:** WebSocket (live visitor count)

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional, for containerized development)
- Access to the backend services (REST API, GraphQL, WebSocket)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Clerk keys and backend URLs in `.env.local`.

3. Start the backend services:

   ```bash
   # From the repository root
   docker compose up -d
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and layouts
│   ├── (marketing)/      # Public marketing pages
│   ├── dashboard/        # Authenticated dashboard pages
│   ├── sign-in/          # Clerk sign-in
│   └── sign-up/          # Clerk sign-up
├── components/
│   ├── dashboard/        # Dashboard-specific components
│   ├── layout/           # Header, sidebar, navigation
│   ├── marketing/        # Landing page sections
│   ├── shared/           # Shared components (error boundary, skeletons)
│   └── ui/               # shadcn/ui primitives
├── hooks/                # Custom React hooks (useApi, useWebSocket)
├── lib/                  # Utilities, API client, helpers
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
└── middleware.ts         # Clerk auth middleware
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page path | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page path | Yes |
| `NEXT_PUBLIC_REST_API_URL` | REST API base URL | No (default: `http://localhost:4000`) |
| `NEXT_PUBLIC_GRAPHQL_API_URL` | GraphQL API URL | No (default: `http://localhost:4001`) |
| `NEXT_PUBLIC_WS_API_URL` | WebSocket URL | No (default: `ws://localhost:4002`) |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint across the codebase |

## Contributing

1. Create a feature branch from `main`.
2. Make your changes and ensure `npm run lint` passes.
3. Write or update tests as needed.
4. Open a pull request with a clear description of the changes.

## License

MIT
