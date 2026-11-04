# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) and Antigravity when working with code in this repository.

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
- `Store`: Retail locations with area specs (parking, terrace, sales, warehouse, toilet, corridor/selasar)
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

## Knowledge Graph & Project Context (graphify)

This project has an active knowledge graph in `graphify-out/` with 3,600+ nodes, 10,600+ edges, 158 communities, and cross-file relationships (generated by `graphify`).

### Rules for Exploring Code:
- When `graphify-out/graph.json` exists, run `graphify query "<question>"` before your first grep, search, or broad source-file read for codebase questions.
- Use `graphify path "<Concept A>" "<Concept B>"` for tracing relationships between modules or concepts.
- Use `graphify explain "<concept>"` for focused explanations of a node or abstraction.
- Read raw files only for specific lines located by the graph or prior reads.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- Major project pillars & core communities in the graph:
  - **Audit Domain**: `Audit`, `AuditItem`, `AuditPlnStdHistory`, `audit-kalkulator.ts`, `ai-recommendation.ts`
  - **Store & Equipment Administration**: Stores, Branches, Equipment Types & Brands
  - **Store MEP Simulator & AC Optimizer**: `app/store-mep-simulator`, CAD import, canvas mapping & BTU temperature calculations
  - **Store Sync & Disaster Alerts**: Dokploy cron sync, Google Sheet store sync, BMKG disaster impact
  - **3-Pillar Smart Energy Ecosystem**: Sparta Energy (audit core), smart-energy-meter-vps (IoT VPS), smart-energy-monitoring

## Critical Project Memory (Domain, Architecture, UI/UX, & Calculators)

### 1. 3-Pillar Ecosystem & Live Database Safety (`ARCHITECTURE_PLAN.md`)
- **DB 1 (`energy` / `sparta_energy`)**: Owned exclusively by `sparta-energy`. Only `sparta-energy` may run Prisma migrations (`npx prisma migrate deploy`). `smart-energy-monitoring` and `smart-energy-meter-vps` only read DB 1.
- **WARNING — Live DB in Local `.env`**: Local `.env` points to the live database. **Never** run destructive migrations, `prisma db push --force-reset`, or seed scripts without explicit user permission.
- **Cross-Repo Contract View (`v_toko_sangat_boros`)**: Ranks top 12 wasteful stores (`is_boros = true`, latest `COMPLETED` audit, excludes `Head Office`). DEMO rows (`is_demo`) are ranked separately so they never take one of the 12 slots. Consumed by `smart-energy-monitoring` and `lib/audit-validation-queries.ts` / `lib/admin-sangat-boros.ts`. Adding columns is safe; renaming/removing columns requires cross-repo coordination (`docs/integrasi-sangat-boros-monitoring.md`).
- **IoT Status (`lib/iot-status.ts`)**: `sparta-energy` does **not** connect to DB 2 (`energy_meter`). It fetches `GET {ENERGY_MONITORING_URL}/api/stores` (with `x-internal-token: MONITORING_INTERNAL_TOKEN`, 5m cache, 5s timeout). If unreachable, display `"Status IoT tidak tersedia"`, never `"belum dipasang"`.

### 2. Roles, SSO, Proxy Session Cache, & Rate Limiting (`docs/akses-role-admin-auditor-gs-area.md`)
- **Role Access Map (`lib/role-access.ts`, `lib/current-role.ts`)**:
  - `ADMIN`: `/admin-entry` (Mode Auditor, Dashboard Admin, Smart Energy Meter) + full access.
  - `AUDITOR`: `/admin-entry`, can open Admin Dashboard across all branches and validate audits, but **cannot** open User & Akses, Master Data, or delete audits.
  - `GS`: Redirected straight to `smart-energy-monitoring` (assigned IoT devices only via `user_device_access`).
  - `AREA`: Redirected to `/admin/dashboard` (temporarily shares `ADMIN` access in Sparta; denied in IoT portal).
  - `USER`: Field auditor bound to 1 `branch`, redirected to `/dashboard`.
- **Local Role Simulation**: `POST /api/dev-login` sets the `dev_role` cookie (`NODE_ENV=development` only) without mutating user roles in the live DB.
- **Proxy & Security (`proxy.ts`, `lib/request-guard.ts`, `lib/proxy-session-cache.ts`, `lib/auth.ts`)**:
  - `guardRequestRate()` runs before any session/DB query in `proxy.ts` (per-IP 1-min windows: `auth` 60, `upload` 60, `tiles` 1200, `api` 300, `page` 600; 3 exceeded windows in 10m locks IP for 2m; honors `RATE_LIMIT_ALLOWLIST`).
  - `getProxySession()` caches resolved session & role in memory for 60s (`TTL_MS = 60_000`), invalidated by `forgetProxySession()` on sign-out.
  - `lib/auth.ts` enforces per-email sign-in lockout (`signInLockout`: 5 failed attempts in 15m locks that email for 2m) so auditors sharing a store/mobile IP are not blocked by one person's typo.

### 3. Energy Audit Domain & Validation Rules (`AI_CONTEXT.md`)
- **Exact Calculation (`lib/audit-kalkulator.ts`, `lib/audit-recalculate.ts`)**:
  - `estimatedMonthlyKwh = estimatedDailyKwh * 30` (fixed 30 days).
  - `calcMethod`: `STANDARD` uses brand base kW (`kws * qty * hours`); `TRANSACTION` / `BATCH` calculates running hours `(usage * duration) / 3600` capped at operational hours + 5% standby kW for remaining hours.
  - Average actual PLN only averages months where `kWh > 0`.
  - **Boros Classification**: `avgActualPln > estimatedMonthlyKwh * 1.05` (`BOROS_TOLERANCE = 1.05`, 5% tolerance). Otherwise **Hemat**.
  - **AI Recommendation Type**: Hemat → `MAINTENANCE`; Boros + AC running ≥ store open hours + 2h (non-24h store) → `TRAINING`; other Boros → `REPAIR`.
- **Admin Gap Filter ±20% (`lib/audit-gap-filter.ts`, `lib/admin-gap-filter.ts`)**:
  - Toggled via `"Gap ±20%"` switch in admin header (stored in `admin-gap-filter` cookie). Hides outlier audits outside ±20% gap in admin views only (never in Auditor mode or Validation page, and never alters stored Hemat/Boros status). Admin queries must read filter state via `getAdminGapFilterSql()` / `getAdminGapFilterEnabled()`.
- **Audit Validation (`/audit/validation/[id]`, `app/actions/audit-validation.ts`)**:
  - First correction snapshots original values to `audits.original_*` and logs every change in `audit_corrections`.
  - Editing `plnCustomerId` updates `stores.pln_customer_id` immediately (`TECHNICAL_UPDATED`). Store address is hidden in validation/lighting forms (replaced by PLN ID) but kept in DB & Excel export.
- **Equipment Categories (`lib/equipment-categories.ts`)**:
  - Locked by DB CHECK constraint to 5 exact values: `Sistem Tata Cahaya`, `Sistem Tata Udara dan Ventilasi` (includes AC & Exhaust Fan), `Sistem Refrigerasi`, `Sistem Beanspot`, `Lainnya`.
- **Store Areas**:
  - Store has 6 area fields (`parkingAreaM2`, `terraceAreaM2`, `salesAreaM2`, `warehouseAreaM2`, `toiletAreaM2`, `corridorAreaM2`/selasar), while equipment grouping uses 4 `AreaTarget` enums (`SALES`, `TERRACE`, `PARKING`, `WAREHOUSE` = `"Gudang, Toilet & Selasar"`).
- **Lighting Audit & Lux Photos (`lib/lighting-audit.ts`, `components/energy-audit/lux-plan.tsx`)**:
  - Each measured lux point requires ≥ 1 photo (max 3) before completion, uploaded via `/api/energy-audit/photos` (HMAC-signed refs; `DEMO` branch stored in `.local-uploads/`, real stores in Google Drive `DOKUMEN SPARTA`).
  - Lux color levels (`getLuxLevel`): green `>= luxMin`, yellow within 20% below `luxMin` (`LUX_NEAR_RATIO = 0.8`), red below that (notes only required on red points).
  - **DO NOT MODIFY `lib/lamp-calculator.ts`** (owned by Wardan; used as-is by `/light-estimation` and `lux-plan.tsx`).

### 4. Standardized Indonesian Terminology & Copywriting
Always use these standardized Indonesian domain terms across UI labels, validation messages, and Excel exports:
- **Kalkulasi** (for consumption calculator `Audit` in Admin UI) vs **Pemeriksaan** (for 7-category technical `EnergyAudit`) vs **Auditor** (user role).
- **Merek** (never *"Brand"* or *"Merek / Brand"*)
- **Aktual PLN** (never *"Actual PLN"*)
- **Parkiran** (for `PARKING` area label, never *"Parkir"*)
- **Luas area sales** (never *"Luas sales"* or *"Luas sales area"*)
- **Luas lantai** (in Lighting Audit / Tata Cahaya forms & exports, never *"Luas zona"*)
- **Riwayat** (never *"History"*)
- **Unduh Excel** / **Laporan & Unduhan** / **Cakupan unduhan** (never *"Download .xlsx"* or *"Export ..."*)
- **Tutup**, **Cari**, **Memuat**, **Kelengkapan** (for UI primitives `Close`, `Search`, `Loading`, `Completeness`).

### 5. UI, Design Tokens, & shadcn/ui Rules (`DESIGN.md`, `.agents/skills/shadcn/SKILL.md`)
- **shadcn-First & Reusable**: Always check/use `components/ui/*` (`FieldGroup` + `Field`, `InputGroup`, `ToggleGroup`, `Alert`, `Empty`, `Badge`, `Separator`, `Skeleton`) before custom markup.
- **No Manual Spacing on shadcn Components & No `space-y-*`**: Never add manual padding/margin to `Card`, `CardHeader`, `CardContent`, `Button`, `Input`, `Dialog`, etc. Never use `space-x-*` or `space-y-*`; always use `flex flex-col gap-*` on container wrappers.
- **Icons (`@tabler/icons-react`)**: Inside `Button`, always use `data-icon="inline-start"` or `data-icon="inline-end"` on the icon and **do not** add sizing classes (`size-4`, `w-4 h-4`). Use `size-*` instead of `w-* h-*` when width equals height.
- **Design System (`DESIGN.md`)**:
  - Auditor field views are mobile-first single-column (`max-w-sm` / 384px, `pb-32` for bottom nav clearance).
  - Fonts: `Geist` and `Geist Mono` only; never use font weight below `font-medium` for numerical data at 10–11px.
  - Semantic colors only (`bg-primary` `#2c7a57` / dark `#4caf80`, `status-hemat` `#2c7a57`, `status-boros` `#d85a53`, `chart-1`..`chart-5` teal ramp). Never hardcode raw Tailwind palette classes (`bg-emerald-500`) or manual `dark:` color overrides.

### 6. Calculators & Store MEP Simulator Specs (`docs/`)
- **AC Calculator (`v1.2.0` Official 2026 Standard, `docs/ac_calculator_logic_analysis.md`)**:
  - Reference unit: Daikin 2 PK Split Wall (`18,000 BTU/h`, indoor width `1.05 m`, min wall `1.05 m`, recommended wall `1.55 m`, spread angle `70°`, throw zones `0–2.5m` / `2.5–5.5m` / `5.5–7.5m`).
  - Temperature clusters: `< 27°C` → `450 BTU/m²`, `27–35°C` → `600 BTU/m²`, `> 35°C` → `751 BTU/m²` using **closest deviation** rounding.
- **CAD (.DXF) Import & AC Restricted Zones (`docs/cad_import_layout_specification.md`)**:
  - `Net Sales Area = Gross Area - Chiller Area (ANSI37) - Cashier Area (ANSI32) - Column Area (AR-CONC)`.
  - AC placement is strictly forbidden on: front glass walls (`GOST_GLASS`), main entrance (`double swing`/`pv180`), warehouse door (`P1`), above open chillers (`ANSI37`), directly over cashier (`ANSI32`), and mid-room columns (`AR-CONC`).
- **Gypsum Tile Ceiling Calculator (`lib/gypsum-tile-calculator.ts`, `docs/gypsum_tile_calculator_specification.md`)**:
  - Module `1.2 m × 0.6 m` (Exposed T-Bar, centered grid).
  - **Half-Tile Rule (>= 50%)**: Border cuts must be `>= 50%` of module size (`>= 30 cm` on 60 cm side, `>= 60 cm` on 120 cm side). If `< 50%`, subtract 1 full panel and split `(remainder + module) / 2`.
  - Jayaboard procurement standard (`Koefisien 1.75`, item `821848` Gyptile Natura 9mm): `1.75 sheets/m²`, Main Tee `0.2625/m²`, Cross Tee `1.4000/m²`, Wall Angle `0.4375/m²` (no extra 5% manual waste on T-Bar frame).

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.claude/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.claude/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.claude/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.claude/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.claude/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.claude/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->
