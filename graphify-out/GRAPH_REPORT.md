# Graph Report - sparta-energy  (2026-10-22)

## Corpus Check
- 320 files · ~451,978 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 8, .ico 2, .css 1)

## Summary
- 2227 nodes · 6324 edges · 112 communities (101 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.86)
- Token cost: 399,972 input · 1,400 output

## Community Hubs (Navigation)
- Master Data Queries
- API Routes & Calculator Logs
- Store Sync & Disaster Alerts
- Audit History & Filters UI
- Equipment Admin Queries
- Admin Dashboard Filters
- Report Export Queries
- Admin Dialogs & Forms
- Leaflet Map Wrapper
- Package & ESLint Config
- AC Estimation Tool
- Admin Audit Queries
- Runtime Dependencies
- Loading States & Settings
- Store Admin Queries
- AC Calculator Models (Docs)
- Combobox UI
- Admin Sidebar & Sheet
- CAD Import & AC Optimizer
- Header Menu & Filters
- User Filters & Time Picker
- Lamp Calculator Engine
- Branch Audit Summaries
- Admin Shell Layout
- Dashboard Charts
- Login, Demo & About Pages
- User Management Actions
- Equipment Admin Table
- User Admin Queries
- Store MEP Simulator
- Master Equipment Table
- AC Mapping Canvas
- Dev Dependencies
- Step Indicator & Fields UI
- Master Data Mutations
- shadcn components.json
- Admin Audit Detail Page
- Admin Dashboard Page
- Admin Store Detail Page
- Command Palette UI
- Audit Start & Store Lookup
- Audit Result & Metric Cards
- Map Draw Controls
- TypeScript Config
- Root Layout & Theme
- Admin Audits Table
- DB Pool & Scripts
- Lamp Simulation Scripts
- Styling & Theming Rules
- Master Stores Table
- History & Date Filters
- Calculator Log Queries
- Audit Card & Item UI
- Audit Step 3 Submit
- Calculator Entry Pages
- Calculator Result Cards
- Audit Step 2 Areas
- Map Feature Layers
- Lamp Calculator Rules (Docs)
- Audit Drafts
- Audit Store & Kalkulator
- User Dashboard Page
- Map Picker
- shadcn Forms & Composition
- Admin Reports Page
- UploadThing File Upload
- Admin Audit Filters
- Master Equipment Filters
- npm Scripts
- Store Combobox & Search
- Error & Not-Found Pages
- shadcn CLI & MCP
- Deploy Pipeline & Agent Guides
- Audit Domain Concepts
- Audit Detail Export
- PWA Service Worker
- PWA Manifest
- DOCX Generator Script
- 3-Pillar Ecosystem Architecture
- AI Recommendations (Gemini)
- Landing Hero Illustration
- Offline Indicator & Alert
- Store Sync Docs & Import
- Prisma Seed
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- Polygon Utilities
- Prisma Config & Equipment Export
- Change Role Script
- Result Loading Skeletons
- Landing Page & Logo
- Temperature Fetch Script
- PWA Icon Set
- Lamp Analysis Script
- Create Admin Script
- Audit Export Script
- Store Export Script
- Import Users Script
- shadcn Composition Rules
- Icon Rules
- PostCSS Config
- Alfamart Brand Assets
- shadcn Presets
- shadcn Logo
- Auth Client Exports

## God Nodes (most connected - your core abstractions)
1. `cn()` - 282 edges
2. `Button()` - 140 edges
3. `react` - 110 edges
4. `next` - 94 edges
5. `@tabler/icons-react` - 86 edges
6. `Badge()` - 52 edges
7. `Input()` - 50 edges
8. `Card()` - 49 edges
9. `StoreMepSimulatorClient()` - 48 edges
10. `prisma` - 46 edges

## Surprising Connections (you probably didn't know these)
- `parseCoordinates` --conceptually_related_to--> `parseStoreSheetRows()`  [AMBIGUOUS]
  docs/store_coordinates_plan.md → lib/jobs/sync-stores.ts
- `Dokploy Schedule Job (daily loopback invocation)` --calls--> `POST()`  [EXTRACTED]
  docs/superpowers/plans/2026-07-23-store-sync-cron.md → app/api/cron/sync-stores/route.ts
- `CRON_SECRET Bearer Auth with Exact-Path Proxy Bypass` --rationale_for--> `POST()`  [EXTRACTED]
  docs/superpowers/specs/2026-07-23-store-sync-cron-design.md → app/api/cron/sync-stores/route.ts
- `Centralized pendingStep Navigation (onNavigate)` --rationale_for--> `AuditStartClient()`  [EXTRACTED]
  docs/superpowers/specs/2026-04-29-audit-step-skeleton-design.md → app/audit/start/start-client.tsx
- `parseStoreSheetRows()` --implements--> `Store Google Sheet Contract (header aliases, normalization)`  [EXTRACTED]
  lib/jobs/sync-stores.ts → docs/superpowers/specs/2026-07-23-store-sync-cron-design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **shadcn Critical Rule Set** — _agents_skills_shadcn_rules_styling_styling_rules, _agents_skills_shadcn_rules_forms_forms_rules, _agents_skills_shadcn_rules_composition_composition_rules, _agents_skills_shadcn_rules_icons_icons_rules, _agents_skills_shadcn_rules_base_vs_radix_base_vs_radix [EXTRACTED 1.00]
- **Energy Audit Analysis Pipeline** — claude_audit_creation_flow, claude_energy_calculation, ai_context_pln_std_history, ai_context_hemat_boros_classification, claude_ai_recommendations [INFERRED 0.85]
- **3-Pillar Smart Energy Ecosystem Projects** — claude_sparta_energy, architecture_plan_smart_energy_meter_vps, architecture_plan_smart_energy_monitoring [EXTRACTED 1.00]
- **AC Calculator Rounding Model Variants over Temperature Clusters** — docs_ac_calculator_logic_analysis_v1_1_0_strict_minimum, docs_ac_calculator_logic_analysis_v1_2_0_closest_deviation, docs_ac_calculator_logic_analysis_v1_2_adj_asymmetric, docs_ac_calculator_logic_analysis_interpolasi_2027, docs_ac_calculator_logic_analysis_temperature_btu_clusters [EXTRACTED 1.00]
- **Store Sync Cron Flow (Dokploy -> proxy -> route -> sync module)** — docs_superpowers_plans_2026_07_23_store_sync_cron_dokploy_schedule_job, proxy, app_api_cron_sync_stores_route_post, lib_jobs_sync_stores_syncstoresfromsheet, lib_jobs_sync_stores_fetchstoresheet, lib_jobs_sync_stores_parsestoresheetrows, lib_jobs_sync_stores_filternewstores [EXTRACTED 1.00]
- **AC Placement Constraint System (restricted zones, wall space, clearance, CAD zone detection)** — docs_ac_layout_mapping_design_specification_restricted_zones, docs_ac_layout_mapping_design_specification_wall_space_constraints, docs_ac_layout_mapping_design_specification_ac_clearance_rules, docs_cad_import_layout_specification_dxf_hatch_anatomy, docs_ac_mapping_calculator_proposal_edge_boundary_detection [INFERRED 0.85]
- **Auditor inspecting store equipment for energy savings** — assets_landing_auditor_with_tablet, assets_landing_store_refrigerator_shelves, assets_landing_hemat_sign, assets_landing_store_energy_audit_concept [INFERRED 0.85]
- **Store energy audit scene: auditor inspects equipment and PLN meter** — assets_landing2_field_auditor, assets_landing2_handheld_energy_meter, assets_landing2_retail_store_equipment, assets_landing2_pln_electric_panel, assets_landing2_audit_completion_checkmark [INFERRED 0.85]
- **Sparta Energy PWA / Favicon Icon Set (building shield logo)** — public_assets_building_logo_building_logo, public_assets_android_chrome_192x192_pwa_icon_192, public_assets_android_chrome_512x512_pwa_icon_512, public_assets_apple_touch_icon_apple_touch_icon, public_assets_favicon_16x16_favicon, public_assets_favicon_32x32_favicon [INFERRED 0.85]
- **Alfamart Brand Logo Variants** — public_assets_alfamart_emblem_small_alfamart_emblem_small, public_assets_alfamart_emblem_alfamart_emblem, public_assets_logoalfamart_alfamart_logo [INFERRED 0.85]

## Communities (112 total, 11 thin omitted)

### Community 0 - "Master Data Queries"
Cohesion: 0.07
Nodes (63): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+55 more)

### Community 1 - "API Routes & Calculator Logs"
Cohesion: 0.06
Nodes (30): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult, SaveLightEstimationPayload, SaveLightEstimationResult, excludedBranchNames (+22 more)

### Community 2 - "Store Sync & Disaster Alerts"
Cohesion: 0.05
Nodes (44): POST(), duplicateStores, incompleteStores, stores, Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned) (+36 more)

### Community 3 - "Audit History & Filters UI"
Cohesion: 0.10
Nodes (33): getAuditHistory(), getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), BranchCombobox(), BranchComboboxProps (+25 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (48): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+40 more)

### Community 5 - "Admin Dashboard Filters"
Cohesion: 0.06
Nodes (43): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminDashboardFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+35 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.11
Nodes (44): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+36 more)

### Community 7 - "Admin Dialogs & Forms"
Cohesion: 0.17
Nodes (36): checkExistingEmails(), AdminMasterStoreDialog(), AdminMasterStoreDialogProps, AdminReportActions(), handleOpenChange(), loadPreview(), AdminReportActionsProps, formatCell() (+28 more)

### Community 8 - "Leaflet Map Wrapper"
Cohesion: 0.07
Nodes (36): LeafletCircle, LeafletCircleMarker, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon, LeafletPolyline, LeafletPopup (+28 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.05
Nodes (43): eslintConfig, name, packageManager, prisma, seed, private, type, version (+35 more)

### Community 10 - "AC Estimation Tool"
Cohesion: 0.09
Nodes (32): AcEstimationClient(), AcEstimationClientProps, MapPicker, getRabData(), EstimationResultCard(), EstimationResultCardData, Props, Row() (+24 more)

### Community 11 - "Admin Audit Queries"
Cohesion: 0.10
Nodes (40): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+32 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "Loading States & Settings"
Cohesion: 0.11
Nodes (30): AcEstimationLoading(), AuditStartLoading(), DashboardLoading(), HistoryLoading(), SettingsLoading(), MenuRow(), SectionLabel(), SettingsPage() (+22 more)

### Community 14 - "Store Admin Queries"
Cohesion: 0.10
Nodes (38): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, AdminStoreFilters() (+30 more)

### Community 15 - "AC Calculator Models (Docs)"
Cohesion: 0.07
Nodes (29): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), ASHRAE Handbook / Standard 55 / Standard 72, CalculatorGrid (+21 more)

### Community 16 - "Combobox UI"
Cohesion: 0.10
Nodes (34): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+26 more)

### Community 17 - "Admin Sidebar & Sheet"
Cohesion: 0.09
Nodes (35): AdminSidebar(), AdminSidebarItem(), getInitials(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+27 more)

### Community 18 - "CAD Import & AC Optimizer"
Cohesion: 0.09
Nodes (35): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+27 more)

### Community 19 - "Header Menu & Filters"
Cohesion: 0.14
Nodes (30): HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, FilterI18nConfig, FilterOperator, FilterOption, Filters() (+22 more)

### Community 20 - "User Filters & Time Picker"
Cohesion: 0.12
Nodes (22): AdminUserFiltersProps, CalculatorLogsClient(), CalculatorLogsClientProps, formatDateIndo(), MONTH_OPTIONS, DemoLoginButton(), buildTime(), BuildTimeOptions (+14 more)

### Community 21 - "Lamp Calculator Engine"
Cohesion: 0.11
Nodes (33): saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), SHAPES, SnapGuide, StandardCheckResult (+25 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "Admin Shell Layout"
Cohesion: 0.10
Nodes (30): AdminLayout(), AdminHeaderActions(), AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSiteHeader(), AdminUser (+22 more)

### Community 24 - "Dashboard Charts"
Cohesion: 0.09
Nodes (31): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+23 more)

### Community 25 - "Login, Demo & About Pages"
Cohesion: 0.10
Nodes (25): AuditStepNavigate, DemoResultPage(), LoginPage(), LoginToastNotice(), AboutPage(), InfoRow(), AuditStep1(), beanspotStoreTypeOptions (+17 more)

### Community 26 - "User Management Actions"
Cohesion: 0.10
Nodes (21): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, deleteUser(), DeleteUserInput, ActionResult (+13 more)

### Community 27 - "Equipment Admin Table"
Cohesion: 0.14
Nodes (25): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+17 more)

### Community 28 - "User Admin Queries"
Cohesion: 0.15
Nodes (27): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+19 more)

### Community 29 - "Store MEP Simulator"
Cohesion: 0.13
Nodes (29): ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle(), checkStandards(), ForbiddenInterval, formatDim() (+21 more)

### Community 30 - "Master Equipment Table"
Cohesion: 0.12
Nodes (21): AdminMasterEquipmentTable(), SortableHeader(), updateSort(), formatDate(), formatNumber(), getNextSortOrder(), numberFormat, AdminUsersTable() (+13 more)

### Community 31 - "AC Mapping Canvas"
Cohesion: 0.13
Nodes (27): AcMappingClient(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim(), getCashierZonePolygon() (+19 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "Step Indicator & Fields UI"
Cohesion: 0.11
Nodes (21): AuditStepIndicatorProps, ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, FieldContent(), FieldError(), FieldLegend() (+13 more)

### Community 34 - "Master Data Mutations"
Cohesion: 0.18
Nodes (24): DELETE(), PUT(), DELETE(), PUT(), ApiMutationResult, areaTargets, createMasterEquipment(), createMasterStore() (+16 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "Admin Audit Detail Page"
Cohesion: 0.13
Nodes (25): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 37 - "Admin Dashboard Page"
Cohesion: 0.12
Nodes (24): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+16 more)

### Community 38 - "Admin Store Detail Page"
Cohesion: 0.13
Nodes (24): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 39 - "Command Palette UI"
Cohesion: 0.16
Nodes (18): Command(), CommandEmpty(), CommandGroup(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut(), buildSearchUrl() (+10 more)

### Community 40 - "Audit Start & Store Lookup"
Cohesion: 0.17
Nodes (14): excludedBranchNames, getStoreByCodeAction(), AuditStartPage(), excludedBranchNames, AuditStartClient(), AuditStepNavigateOptions, AuditStepTarget, Props (+6 more)

### Community 41 - "Audit Result & Metric Cards"
Cohesion: 0.31
Nodes (15): AuditResultPage(), AdminMetricCard(), AdminMetricTone, metricToneStyles, AuditResultDB(), AcEstimationCard(), HeroCard(), LightEstimationCard() (+7 more)

### Community 42 - "Map Draw Controls"
Cohesion: 0.15
Nodes (17): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+9 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.15
Nodes (15): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+7 more)

### Community 45 - "Admin Audits Table"
Cohesion: 0.17
Nodes (15): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+7 more)

### Community 46 - "DB Pool & Scripts"
Cohesion: 0.17
Nodes (12): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, adapter, pool, prisma (+4 more)

### Community 47 - "Lamp Simulation Scripts"
Cohesion: 0.15
Nodes (13): calcSimetris(), evaluateStatus(), run(), SimetrisResult, calcSimetris(), evaluateStatus(), run(), test() (+5 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "Master Stores Table"
Cohesion: 0.16
Nodes (12): AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate(), formatHours(), formatNumber(), getCompleteness(), getNextSortOrder() (+4 more)

### Community 50 - "History & Date Filters"
Cohesion: 0.17
Nodes (13): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, HistoryItem, HistoryResponse, AuditDateRange, getAdminAuditDateWhere() (+5 more)

### Community 51 - "Calculator Log Queries"
Cohesion: 0.23
Nodes (14): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+6 more)

### Community 52 - "Audit Card & Item UI"
Cohesion: 0.21
Nodes (14): AuditCard(), AuditCardProps, AuditStatus, Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter() (+6 more)

### Community 53 - "Audit Step 3 Submit"
Cohesion: 0.22
Nodes (14): submitAudit(), AreaTarget, handleSubmit(), AuditStep3Props, buildDemoAuditResult(), currentYear, makeBlankRows(), MONTH_NAMES (+6 more)

### Community 54 - "Calculator Entry Pages"
Cohesion: 0.23
Nodes (9): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, excludedBranchNames, LightEstimationPage(), excludedBranchNames, StoreMepSimulatorPage() (+1 more)

### Community 55 - "Calculator Result Cards"
Cohesion: 0.19
Nodes (11): AcMappingResultCard(), AcMappingResultCardData, AcMappingUnitDetail, Props, Row(), LightEstimationResultCard(), LightEstimationResultCardData, Props (+3 more)

### Community 56 - "Audit Step 2 Areas"
Cohesion: 0.22
Nodes (11): AreaItem, areaItems, AuditStep2(), AuditStep2Props, Step2AreaCard(), AuditStepIndicator(), AuditItem, AuditListSection() (+3 more)

### Community 57 - "Map Feature Layers"
Cohesion: 0.18
Nodes (14): LeafletFeatureGroup, LeafletLayerGroup, LeafletTileLayer, MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapFeatureGroup() (+6 more)

### Community 58 - "Lamp Calculator Rules (Docs)"
Cohesion: 0.18
Nodes (10): Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1), KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0) (+2 more)

### Community 59 - "Audit Drafts"
Cohesion: 0.23
Nodes (11): deleteAuditDraft(), getAuditDraft(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), handleDelete(), handleResume() (+3 more)

### Community 60 - "Audit Store & Kalkulator"
Cohesion: 0.23
Nodes (9): SubmitAuditInput, toAreaTarget(), DEMO_EMAIL, zustand, AuditState, DemoAuditResult, EquipmentState, PlnRowState (+1 more)

### Community 61 - "User Dashboard Page"
Cohesion: 0.24
Nodes (8): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditItem, RecentAuditSection(), RecentAuditSectionProps, RecentAuditStatus

### Community 62 - "Map Picker"
Cohesion: 0.26
Nodes (11): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+3 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.20
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "Admin Reports Page"
Cohesion: 0.27
Nodes (10): AdminReportsPage(), formatNumber(), getExportHref(), getPreviewHref(), ReportCard, reportCards, SearchParams, CardAction() (+2 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "Admin Audit Filters"
Cohesion: 0.25
Nodes (10): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+2 more)

### Community 67 - "Master Equipment Filters"
Cohesion: 0.25
Nodes (10): AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminMasterEquipmentFiltersProps, filterParamKeys, filterParamKeySet (+2 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "Store Combobox & Search"
Cohesion: 0.24
Nodes (8): AcMappingClientProps, searchStoresAction(), StoreData, LightEstimationClientProps, StoreMepSimulatorClientProps, StoreCombobox(), StoreComboboxProps, StoreComboboxTrigger()

### Community 70 - "Error & Not-Found Pages"
Cohesion: 0.33
Nodes (6): GlobalError(), Forbidden(), NotFound(), StateBlock(), StateBlockAction, StateBlockProps

### Community 71 - "shadcn CLI & MCP"
Cohesion: 0.25
Nodes (8): shadcn add Command (dry-run/diff/view), components.json Configuration, shadcn info Command, shadcn CLI Reference, Component Registries (@shadcn, custom), shadcn MCP Server, shadcn Project Context Key Fields, Next.js shadcn Template README

### Community 72 - "Deploy Pipeline & Agent Guides"
Cohesion: 0.25
Nodes (8): Build and Deploy GitHub Workflow, Dokploy Deploy Webhook, GHCR Docker Image (latest), AGENTS.md (Codex Guide), Admin Dashboard & Filters, CLAUDE.md (Claude Code Guide), Demo Mode (demo-session), Sparta Energy Audit System

### Community 73 - "Audit Domain Concepts"
Cohesion: 0.31
Nodes (9): AI Context - SPARTA Energy, Hemat/Boros Store Classification, PLN & STD 6-Month History Input, Waste Source Signals (Pelatihan Tim / Perbaikan Equipment), AI Recommendations (Google GenAI: TRAINING/REPAIR/MAINTENANCE), Audit Creation Wizard Flow, Energy Calculation (dailyKwh = baseKw*qty*hours; monthly = daily*30), Prisma Core Models (User, Store, Audit, AuditItem, EquipmentType, EquipmentBrand, AuditPlnStdHistory, AuditRecommendation) (+1 more)

### Community 74 - "Audit Detail Export"
Cohesion: 0.39
Nodes (7): GET(), isAdmin(), areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber()

### Community 75 - "PWA Service Worker"
Cohesion: 0.22
Nodes (6): serwist, WorkerGlobalScope, nextConfig, withSerwist, serwist, @serwist/next

### Community 76 - "PWA Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 77 - "DOCX Generator Script"
Cohesion: 0.39
Nodes (7): Escape-Xml(), Make-Box(), Make-Bullet(), Make-Heading1(), Make-Heading2(), Make-P(), Make-Table()

### Community 78 - "3-Pillar Ecosystem Architecture"
Cohesion: 0.25
Nodes (6): Auditor/Admin Role & Branch Access Model, smart-energy-meter-vps (IoT Ingestion), smart-energy-monitoring (Visualization Portal), Centralized SSO via sparta_energy users/sessions, 3-Pillar Smart Energy & Audit Ecosystem, better-auth Authentication Flow

### Community 79 - "AI Recommendations (Gemini)"
Cohesion: 0.36
Nodes (6): getDemoAiRecommendation(), AiRecommendationResponse, generateRecommendationWithFallback(), getAiClient(), MODEL_WATERFALL, @google/genai

### Community 80 - "Landing Hero Illustration"
Cohesion: 0.32
Nodes (8): Audit Completion Checkmark, Lime Green / Dark Teal Brand Palette, Field Auditor with Clipboard, Handheld Measuring Device / Thermometer Gun, Landing Hero Illustration (Store Energy Audit), Electrical Panel with kWh Meter and Breakers, Retail Store Equipment (Fridge, Lights, CCTV, Cashier), Rooftop Solar Panels

### Community 81 - "Offline Indicator & Alert"
Cohesion: 0.50
Nodes (6): OfflineIndicator(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 82 - "Store Sync Docs & Import"
Cohesion: 0.25
Nodes (6): Store Sync Cron Implementation Plan, Store Sync Cron Endpoint Design Spec, SPARTA Maintenance (reference sync implementation), adapter, pool, prisma

### Community 83 - "Prisma Seed"
Cohesion: 0.29
Nodes (7): adapter, BrandEntry, equipmentData, hashPassword(), main(), pool, prisma

### Community 84 - "Docs Builder Script"
Cohesion: 0.46
Nodes (7): Escape-Xml(), Make-Box(), Make-Bullet(), Make-Heading1(), Make-Heading2(), Make-P(), Make-Table()

### Community 85 - "Update Password Script"
Cohesion: 0.32
Nodes (7): branchRaw, email, main(), normalizeBranches(), password, pool, sha256()

### Community 86 - "Landing Line-Art Illustration"
Cohesion: 0.38
Nodes (6): Field Auditor Using Tablet, Green Energy Motif (Leaf, Lightning, Power Outlet), HEMAT (Energy Saving) Store Sign, Landing Page Illustration, In-Store Energy Audit, Retail Store Refrigerator and Shelves

### Community 87 - "Polygon Utilities"
Cohesion: 0.33
Nodes (4): BoundingBox, getWallInwardNormal(), isPointInsidePolygon(), pointInPolygon()

### Community 88 - "Prisma Config & Equipment Export"
Cohesion: 0.33
Nodes (5): dotenv, prisma, escapeCsv(), main(), pool

### Community 89 - "Change Role Script"
Cohesion: 0.33
Nodes (6): @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma

### Community 90 - "Result Loading Skeletons"
Cohesion: 0.60
Nodes (3): AuditResultLoading(), DemoResultLoading(), AuditResultSkeleton()

### Community 91 - "Landing Page & Logo"
Cohesion: 0.47
Nodes (3): Page(), Logo(), LogoProps

### Community 92 - "Temperature Fetch Script"
Cohesion: 0.40
Nodes (3): fmt(), main(), url

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "Lamp Analysis Script"
Cohesion: 0.60
Nodes (4): xlsx, calcSimetris(), evaluateDetailed(), run()

### Community 95 - "Create Admin Script"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 96 - "Audit Export Script"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDate(), main(), pool

### Community 97 - "Store Export Script"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

### Community 99 - "Import Users Script"
Cohesion: 0.60
Nodes (4): main(), parseBranches(), pool, sha256()

### Community 101 - "Icon Rules"
Cohesion: 0.67
Nodes (4): data-icon Attribute for Button Icons, Configured iconLibrary, Icons Rules, @tabler/icons-react Iconography

### Community 103 - "Alfamart Brand Assets"
Cohesion: 0.67
Nodes (3): Alfamart Emblem, Alfamart Emblem (small), Alfamart Wordmark Logo

## Ambiguous Edges - Review These
- `parseStoreSheetRows()` → `parseCoordinates`  [AMBIGUOUS]
  docs/store_coordinates_plan.md · relation: conceptually_related_to
- `Styling & Tailwind Rules` → `Bottom Navigation Pattern`  [AMBIGUOUS]
  DESIGN.md · relation: conceptually_related_to
- `No space-x/space-y, Use gap-*` → `Mobile-first max-w-sm Single Column Layout`  [AMBIGUOUS]
  DESIGN.md · relation: conceptually_related_to
- `shadcn Logo (small)` → `shadcn Logo`  [AMBIGUOUS]
  .agents/skills/shadcn/assets/shadcn-small.png · relation: semantically_similar_to
- `Alfamart Emblem (small)` → `Alfamart Emblem`  [AMBIGUOUS]
  public/assets/Alfamart-Emblem-small.png · relation: semantically_similar_to
- `Alfamart Emblem` → `Alfamart Wordmark Logo`  [AMBIGUOUS]
  public/assets/logoalfamart.png · relation: semantically_similar_to
- `Sparta Energy Building Shield Logo` → `Apple Touch Icon`  [AMBIGUOUS]
  public/assets/apple-touch-icon.png · relation: semantically_similar_to
- `Android Chrome PWA Icon 192x192` → `Android Chrome PWA Icon 512x512`  [AMBIGUOUS]
  public/assets/android-chrome-512x512.png · relation: semantically_similar_to
- `Favicon 16x16` → `Favicon 32x32`  [AMBIGUOUS]
  public/assets/favicon-16x16.png · relation: semantically_similar_to

## Knowledge Gaps
- **74 isolated node(s):** `@radix-ui/react-select`, `@types/pg`, `shadcn`, `tw-animate-css`, `@eslint/eslintrc` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 713 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Combobox UI` to `Master Data Queries`, `Audit History & Filters UI`, `Equipment Admin Queries`, `Admin Dialogs & Forms`, `Leaflet Map Wrapper`, `AC Estimation Tool`, `Loading States & Settings`, `Admin Sidebar & Sheet`, `Header Menu & Filters`, `User Filters & Time Picker`, `Admin Shell Layout`, `Dashboard Charts`, `Login, Demo & About Pages`, `Equipment Admin Table`, `Master Equipment Table`, `Step Indicator & Fields UI`, `Admin Audit Detail Page`, `Admin Store Detail Page`, `Command Palette UI`, `Audit Result & Metric Cards`, `Map Draw Controls`, `Root Layout & Theme`, `Admin Audits Table`, `Master Stores Table`, `Audit Card & Item UI`, `Audit Step 3 Submit`, `Audit Step 2 Areas`, `Map Feature Layers`, `Map Picker`, `Admin Reports Page`, `Store Combobox & Search`, `Offline Indicator & Alert`, `Landing Page & Logo`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Master Data Queries` be split into smaller, more focused modules?**
  _Cohesion score 0.06583850931677018 - nodes in this community are weakly interconnected._
- **Why does `next` connect `User Management Actions` to `Master Data Queries`, `API Routes & Calculator Logs`, `Store Sync & Disaster Alerts`, `Audit History & Filters UI`, `Equipment Admin Queries`, `Admin Dashboard Filters`, `Report Export Queries`, `Admin Dialogs & Forms`, `Package & ESLint Config`, `AC Estimation Tool`, `Admin Audit Queries`, `Loading States & Settings`, `Store Admin Queries`, `Header Menu & Filters`, `User Filters & Time Picker`, `Lamp Calculator Engine`, `Branch Audit Summaries`, `Admin Shell Layout`, `Dashboard Charts`, `Login, Demo & About Pages`, `Equipment Admin Table`, `User Admin Queries`, `Master Equipment Table`, `Master Data Mutations`, `Admin Audit Detail Page`, `Admin Dashboard Page`, `Admin Store Detail Page`, `Audit Start & Store Lookup`, `Audit Result & Metric Cards`, `Root Layout & Theme`, `Admin Audits Table`, `Master Stores Table`, `History & Date Filters`, `Audit Card & Item UI`, `Audit Step 3 Submit`, `Calculator Entry Pages`, `Audit Step 2 Areas`, `Audit Drafts`, `Audit Store & Kalkulator`, `User Dashboard Page`, `Admin Audit Filters`, `Master Equipment Filters`, `Error & Not-Found Pages`, `Audit Detail Export`, `Landing Page & Logo`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Should `API Routes & Calculator Logs` be split into smaller, more focused modules?**
  _Cohesion score 0.05868118572292801 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Styling & Tailwind Rules` and `Bottom Navigation Pattern`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._