# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Quick Start

### Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run typecheck        # Type check without emitting

# Testing
npm test                 # Run Jest tests
npm test:watch           # Run tests in watch mode
npm test:coverage        # Generate coverage report

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create and apply migrations
npx prisma studio       # Open Prisma Studio GUI
npx prisma db seed      # Run seed script (prisma/seed.ts)
```

### Environment Setup

Create `.env.local` with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/sparta_energy
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_GENAI_API_KEY=your-api-key
```

## Project Architecture

### High-Level Overview

**Sparta Energy** is an energy audit management system for retail stores. It tracks equipment power consumption, generates audit reports, and provides AI-powered recommendations.

**Core Flows:**
1. **Audit Creation**: Auditors visit stores, record equipment details, operational hours
2. **Energy Calculation**: System estimates daily/monthly kWh consumption based on equipment specs
3. **Analysis**: Compares estimated vs actual PLN (utility) usage, identifies wastage
4. **Recommendations**: AI generates optimization suggestions (training, repairs, maintenance)
5. **Admin Dashboard**: Managers view audit summaries, store metrics, branch performance

### Directory Structure

```
app/                          # Next.js App Router
├── api/                      # API routes (auth, demo-session)
├── admin/                    # Admin dashboard pages
│   ├── dashboard/           # Admin metrics & charts
│   ├── audits/              # Audit management
│   ├── stores/              # Store management
│   ├── branches/            # Branch audit summaries
│   └── equipment/           # Equipment type/brand management
├── audit/                    # Audit creation flow (3-step wizard)
│   ├── start/               # Step 1: Store selection
│   ├── [id]/                # Step 2-3: Equipment & results
├── ac-estimation/           # AC power estimation tool
├── dashboard/               # User dashboard (recent audits, summary)
├── history/                 # Audit history view
├── settings/                # User settings & about
├── login/                   # Authentication page
└── layout.tsx               # Root layout with auth, theme, navigation

components/
├── ui/                      # shadcn/ui components (button, input, dialog, etc.)
├── admin/                   # Admin-specific components
│   ├── admin-*-table.tsx   # Data tables with filters/sorting
│   ├── admin-*-filters.tsx # Filter controls
│   ├── admin-metric-card.tsx
│   └── admin-dashboard-*.tsx
├── audit/                   # Audit wizard components
│   ├── step1.tsx           # Store selection
│   ├── step2.tsx           # Equipment entry
│   ├── step3.tsx           # Review & submit
│   ├── brand-combobox.tsx  # Equipment brand selector
│   └── store-combobox.tsx  # Store selector
├── dashboard/              # Dashboard components
├── ac-estimation/          # AC estimation tool components
└── [feature].tsx           # Feature-specific components

lib/
├── auth.ts                 # Server-side auth utilities (better-auth)
├── auth-client.ts          # Client-side auth client
├── admin-auth.ts           # Admin role verification
├── prisma.ts               # Prisma client singleton
├── db-pool.ts              # Database connection pooling
├── audit-kalkulator.ts     # Energy calculation logic
├── ai-recommendation.ts    # AI recommendation generation (Google GenAI)
├── admin-*.ts              # Admin query/filter utilities
├── error-handling.ts       # Error handling utilities
├── utils.ts                # General utilities
└── data/
    ├── demo-audit.ts       # Demo data for testing
    └── regular.ts          # Regular data fixtures

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seeding script
```

### Technology Stack

**Frontend:**
- Next.js 16 (App Router, Server Components)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix UI (accessible components)
- Zustand (state management)
- Recharts (charts & visualizations)
- Leaflet + react-leaflet (maps)
- Sonner (toast notifications)

**Backend:**
- Next.js API Routes (Server Actions)
- better-auth (authentication)
- Prisma ORM
- PostgreSQL

**AI/ML:**
- Google GenAI API (Gemini for recommendations)

**DevTools:**
- ESLint + TypeScript ESLint
- Prettier + Tailwind CSS plugin
- Jest + React Testing Library
- Serwist (PWA/Service Worker)

## Database & Prisma

### Schema Overview

**Core Models:**
- `User`: Auditors and admins (role-based: USER, ADMIN)
- `Store`: Retail locations with area specs (parking, terrace, sales, warehouse)
- `Audit`: Energy audit records linked to store & auditor
- `AuditItem`: Equipment entries within an audit (qty, operational hours, estimated kWh)
- `EquipmentType`: Equipment categories (AC, refrigerator, etc.) with default kW
- `EquipmentBrand`: Specific brands per equipment type with base kW
- `AuditPlnStdHistory`: Monthly PLN usage history for comparison
- `AuditRecommendation`: AI-generated recommendations (TRAINING, REPAIR, MAINTENANCE)

**Key Relationships:**
- Audit → Store (many audits per store)
- Audit → User (auditor)
- AuditItem → EquipmentType & EquipmentBrand (optional, for predefined equipment)
- Audit → AuditPlnStdHistory (monthly usage tracking)
- Audit → AuditRecommendation (AI suggestions)

### Common Queries

**Audit queries** are in `lib/admin-audit-queries.ts`:
- `getAuditDetail()`: Full audit with items, PLN history, recommendations
- `getAuditSummary()`: Lightweight audit info for lists
- `filterAudits()`: With date range, store, auditor filters

**Store queries** are in `lib/admin-store-queries.ts`:
- `getStoreDetail()`: Store with audit count, top wasteful audits
- `filterStores()`: With branch, type filters

**Equipment queries** are in `lib/admin-equipment-queries.ts`:
- `getEquipmentTypes()`: All types with brands
- `getEquipmentBrands()`: Brands for a type

## Authentication

### Flow

1. **better-auth** handles session management (JWT-based)
2. `lib/auth.ts`: Server-side utilities (verify session, get current user)
3. `lib/auth-client.ts`: Client-side auth client (useAuth hook, signOut, etc.)
4. `lib/admin-auth.ts`: Admin role verification middleware

### Protected Routes

- Admin routes (`/admin/*`): Require ADMIN role
- Audit routes (`/audit/*`): Require authenticated USER
- Public routes: `/login`, `/demo`, `/ac-estimation`

### Demo Mode

- `app/api/demo-session/route.ts`: Creates demo session for testing
- `lib/demo-config.ts`: Demo user & store data
- Used in `/demo` page for unauthenticated testing

## Code Organization Patterns

### Server vs Client Components

- **Server Components** (default): Data fetching, database queries, auth checks
  - Use in `app/` pages and layouts
  - Can call Prisma directly
  - Cannot use hooks (useState, useEffect)

- **Client Components** (`"use client"`): Interactive UI, forms, state
  - Use in `components/` for interactive features
  - Can use hooks and event handlers
  - Import from server components via props

### Data Fetching

- **Server Components**: Direct Prisma queries in page.tsx
- **Server Actions**: Mutations (create, update, delete) via `"use server"`
- **API Routes**: For external integrations (Google GenAI, PLN data)

### State Management

- **Zustand**: Global UI state (theme, filters, sidebar)
- **React State**: Local component state (form inputs, modals)
- **Server State**: Prisma queries (no client-side caching layer)

### Component Patterns

**UI Components** (`components/ui/`):
- Reusable, unstyled or minimally styled
- Accept className prop for customization
- No business logic

**Feature Components** (`components/[feature]/`):
- Domain-specific (audit, admin, dashboard)
- May contain business logic
- Composed from UI components

**Page Components** (`app/*/page.tsx`):
- Fetch data in server component
- Pass data to client components via props
- Handle layout and routing

## Testing

### Jest Configuration

- `jest.config.js`: Configured for Next.js + TypeScript
- `jest-environment-jsdom`: For DOM testing
- `@testing-library/react`: For component testing

### Test Files

- Colocated with source: `lib/admin-store-detail.test.ts`
- Run: `npm test` or `npm test:watch`

### Testing Patterns

- Unit tests for utilities (`lib/*.test.ts`)
- Component tests for complex UI (`components/*.test.tsx`)
- Integration tests for data flows (audit creation, filtering)

## Important Patterns & Conventions

### Naming

- **Components**: PascalCase (`AdminAuditTable.tsx`)
- **Utilities**: camelCase (`getAuditDetail.ts`)
- **Database fields**: snake_case in schema, camelCase in TypeScript
- **Enums**: UPPERCASE (`AuditStatus.DRAFT`)

### Error Handling

- `lib/error-handling.ts`: Centralized error utilities
- Server actions throw errors; client catches and displays via Sonner toast
- API routes return JSON with error field

### Calculations

- `lib/audit-kalkulator.ts`: Energy consumption calculations
  - `estimatedDailyKwh = baseKw * qty * operationalHours`
  - `estimatedMonthlyKwh = estimatedDailyKwh * 30`
- Used in audit creation and admin dashboard

### AI Recommendations

- `lib/ai-recommendation.ts`: Calls Google GenAI API
- Generates recommendations based on audit data (wastage, equipment age, etc.)
- Types: TRAINING, REPAIR, MAINTENANCE

### Admin Filters & Sorting

- `components/admin/admin-*-filters.tsx`: Filter UI
- `lib/admin-*-queries.ts`: Filter logic (date range, search, sorting)
- Filters passed as query params or form state

### Maps

- `components/ui/map.tsx`: Leaflet map wrapper
- `components/ac-estimation/map-picker.tsx`: Location picker for AC estimation
- Used in audit start (store location) and AC tool

## Development Workflow

### Adding a New Feature

1. **Plan**: Identify data model changes (Prisma schema)
2. **Database**: Create migration if needed (`npx prisma migrate dev`)
3. **Backend**: Add API route or server action
4. **Frontend**: Create page/component with server + client parts
5. **Test**: Write tests, verify in dev server
6. **Admin**: Add admin page/filters if needed

### Adding a New Admin Page

1. Create page in `app/admin/[feature]/page.tsx`
2. Create table component in `components/admin/admin-[feature]-table.tsx`
3. Create filter component in `components/admin/admin-[feature]-filters.tsx`
4. Add query utilities in `lib/admin-[feature]-queries.ts`
5. Use `AdminShell` layout for consistent styling

### Modifying Audit Flow

- Step 1 (store selection): `components/audit/step1.tsx`
- Step 2 (equipment entry): `components/audit/step2.tsx`
- Step 3 (review): `components/audit/step3.tsx`
- Calculation logic: `lib/audit-kalkulator.ts`
- Database: `Audit`, `AuditItem`, `AuditPlnStdHistory` models

### Debugging

- **Dev Server**: `npm run dev` with browser DevTools
- **Database**: `npx prisma studio` to inspect data
- **Logs**: Check terminal for server errors
- **Type Errors**: `npm run typecheck` for full type checking

## Performance Considerations

- **Server Components**: Fetch data server-side to reduce client bundle
- **Image Optimization**: Use Next.js `<Image>` component
- **Code Splitting**: Dynamic imports for large components
- **Database**: Use Prisma select to fetch only needed fields
- **PWA**: Serwist configured for offline support (disabled in dev)

## Security Notes

- **Authentication**: better-auth handles session tokens securely
- **Authorization**: Admin routes check role in `lib/admin-auth.ts`
- **Database**: Prisma prevents SQL injection
- **Environment**: Sensitive keys in `.env.local` (never commit)
- **API**: Server actions validate input before database operations
