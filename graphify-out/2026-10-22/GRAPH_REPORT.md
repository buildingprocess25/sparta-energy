# Graph Report - sparta-energy  (2026-10-22)

## Corpus Check
- 331 files · ~485,431 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 2591 nodes · 7070 edges · 138 communities (127 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a335b11`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Master Data Queries
- prisma.ts
- cn
- item-form-dialog.tsx
- Equipment Admin Queries
- admin-store-filters.tsx
- Report Export Queries
- Admin Dialogs & Forms
- Leaflet Map Wrapper
- Package & ESLint Config
- ac-estimation-client.tsx
- Admin Audit Queries
- Runtime Dependencies
- Loading States & Settings
- Store Admin Queries
- AC Mapping Calculator Proposal
- place-autocomplete.tsx
- sheet.tsx
- CAD Import & AC Optimizer
- Header Menu & Filters
- calculator-logs-client.tsx
- Lamp Calculator Engine
- Branch Audit Summaries
- Admin Shell Layout
- Dashboard Charts
- admin-users-table.tsx
- create-user.ts
- admin-users-table.tsx
- User Admin Queries
- Store MEP Simulator
- step1.tsx
- AC Mapping Canvas
- Dev Dependencies
- react
- Master Data Mutations
- shadcn components.json
- Admin Audit Detail Page
- Admin Dashboard Page
- Admin Store Detail Page
- sync-stores.ts
- Audit Start & Store Lookup
- Audit Result & Metric Cards
- Map Draw Controls
- TypeScript Config
- Root Layout & Theme
- combobox.tsx
- DB Pool & Scripts
- Lamp Simulation Scripts
- Styling & Theming Rules
- draft-list-section.tsx
- Tone & Voice
- utils.ts
- Audit Card & Item UI
- step3.tsx
- antislop-layoutmobile
- dxf-parser.ts
- step2.tsx
- useLeaflet
- Lamp Calculator Rules (Docs)
- Audit Drafts
- contrast-check.py
- Field
- Map Picker
- shadcn Forms & Composition
- validation-detail.tsx
- UploadThing File Upload
- Admin Audit Filters
- Button
- npm Scripts
- brand-combobox.tsx
- app/dashboard/page.tsx
- shadcn CLI & MCP
- Deploy Pipeline & Agent Guides
- Audit Domain Concepts
- Audit Detail Export
- PWA Service Worker
- PWA Manifest
- DOCX Generator Script
- 3-Pillar Ecosystem Architecture
- admin-dashboard-filters.tsx
- Landing Hero Illustration
- antislop-human
- Store Sync Docs & Import
- Prisma Seed
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- Polygon Utilities
- audit-validation-queries.ts
- dotenv
- MapLocateControl
- admin-master-store-filters.tsx
- AC Mapping Calculator Proposal
- PWA Icon Set
- Lamp Analysis Script
- ref_crypto
- Audit Export Script
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- Import Users Script
- shadcn Composition Rules
- Icon Rules
- PostCSS Config
- Alfamart Brand Assets
- shadcn Presets
- shadcn Logo
- Auth Client Exports
- Comments That Add Nothing
- Group 1: Hard Gate (absolute, no exceptions)
- Group 2: Purpose-Gate (technique allowed, purpose required)
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- admin-equipment-filters.tsx
- Group 3: Quality Locks (consistency)
- antislop
- admin-audit-date-filter.ts
- AdminUserFilters
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- Changelog - Lamp Estimation Calculator
- result-skeleton.tsx
- save-ac-estimation-log.ts
- The Craftsmanship Standard
- db-pool.ts
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- input-group.tsx
- actions/import-users.ts
- generate-lamp-simulation.ts
- export-store-data.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 286 edges
2. `Button()` - 152 edges
3. `react` - 112 edges
4. `next` - 104 edges
5. `@tabler/icons-react` - 92 edges
6. `Badge()` - 58 edges
7. `Card()` - 55 edges
8. `Input()` - 54 edges
9. `Header()` - 52 edges
10. `prisma` - 50 edges

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
- **AC Calculator Rounding Model Variants over Temperature Clusters** — docs_ac_calculator_logic_analysis_v1_1_0_strict_minimum, docs_ac_calculator_logic_analysis_v1_2_0_closest_deviation, docs_ac_calculator_logic_analysis_v1_2_adj_asymmetric, docs_ac_calculator_logic_analysis_interpolasi_2027, docs_ac_calculator_logic_analysis_temperature_btu_clusters [EXTRACTED 1.00]
- **shadcn Critical Rule Set** — _agents_skills_shadcn_rules_styling_styling_rules, _agents_skills_shadcn_rules_forms_forms_rules, _agents_skills_shadcn_rules_composition_composition_rules, _agents_skills_shadcn_rules_icons_icons_rules, _agents_skills_shadcn_rules_base_vs_radix_base_vs_radix [EXTRACTED 1.00]
- **Store Sync Cron Flow (Dokploy -> proxy -> route -> sync module)** — docs_superpowers_plans_2026_07_23_store_sync_cron_dokploy_schedule_job, proxy, app_api_cron_sync_stores_route_post, lib_jobs_sync_stores_syncstoresfromsheet, lib_jobs_sync_stores_fetchstoresheet, lib_jobs_sync_stores_parsestoresheetrows, lib_jobs_sync_stores_filternewstores [EXTRACTED 1.00]
- **3-Pillar Smart Energy Ecosystem Projects** — claude_sparta_energy, architecture_plan_smart_energy_meter_vps, architecture_plan_smart_energy_monitoring [EXTRACTED 1.00]
- **AC Placement Constraint System (restricted zones, wall space, clearance, CAD zone detection)** — docs_ac_layout_mapping_design_specification_restricted_zones, docs_ac_layout_mapping_design_specification_wall_space_constraints, docs_ac_layout_mapping_design_specification_ac_clearance_rules, docs_cad_import_layout_specification_dxf_hatch_anatomy, docs_ac_mapping_calculator_proposal_edge_boundary_detection [INFERRED 0.85]
- **Alfamart Brand Logo Variants** — public_assets_alfamart_emblem_small_alfamart_emblem_small, public_assets_alfamart_emblem_alfamart_emblem, public_assets_logoalfamart_alfamart_logo [INFERRED 0.85]
- **Store energy audit scene: auditor inspects equipment and PLN meter** — assets_landing2_field_auditor, assets_landing2_handheld_energy_meter, assets_landing2_retail_store_equipment, assets_landing2_pln_electric_panel, assets_landing2_audit_completion_checkmark [INFERRED 0.85]
- **Auditor inspecting store equipment for energy savings** — assets_landing_auditor_with_tablet, assets_landing_store_refrigerator_shelves, assets_landing_hemat_sign, assets_landing_store_energy_audit_concept [INFERRED 0.85]
- **Energy Audit Analysis Pipeline** — claude_audit_creation_flow, claude_energy_calculation, ai_context_pln_std_history, ai_context_hemat_boros_classification, claude_ai_recommendations [INFERRED 0.85]
- **Sparta Energy PWA / Favicon Icon Set (building shield logo)** — public_assets_building_logo_building_logo, public_assets_android_chrome_192x192_pwa_icon_192, public_assets_android_chrome_512x512_pwa_icon_512, public_assets_apple_touch_icon_apple_touch_icon, public_assets_favicon_16x16_favicon, public_assets_favicon_32x32_favicon [INFERRED 0.85]

## Communities (138 total, 11 thin omitted)

### Community 0 - "Master Data Queries"
Cohesion: 0.07
Nodes (62): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+54 more)

### Community 1 - "prisma.ts"
Cohesion: 0.07
Nodes (26): ActionResult, ActionResult, deleteUser(), DeleteUserInput, SaveLightEstimationPayload, SaveLightEstimationResult, ActionResult, updateUser() (+18 more)

### Community 2 - "cn"
Cohesion: 0.08
Nodes (34): AvatarBadge(), AvatarGroup(), AvatarGroupCount(), ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, CommandSeparator() (+26 more)

### Community 3 - "item-form-dialog.tsx"
Cohesion: 0.13
Nodes (26): deleteAudit(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), handleConfirmDelete(), MonthYearCell(), FormErrors (+18 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (48): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+40 more)

### Community 5 - "admin-store-filters.tsx"
Cohesion: 0.09
Nodes (30): AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminMasterEquipmentFiltersProps, filterParamKeys, filterParamKeySet (+22 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.11
Nodes (44): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+36 more)

### Community 7 - "Admin Dialogs & Forms"
Cohesion: 0.18
Nodes (27): BranchCombobox(), BranchComboboxProps, AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterStoreDialog(), AdminMasterStoreDialogProps, CreateUserDialog(), DeleteUserConfirmDialog() (+19 more)

### Community 8 - "Leaflet Map Wrapper"
Cohesion: 0.07
Nodes (38): LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletPolygon, LeafletPolyline, LeafletPopup (+30 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.05
Nodes (42): eslintConfig, name, packageManager, prisma, seed, private, type, version (+34 more)

### Community 10 - "ac-estimation-client.tsx"
Cohesion: 0.12
Nodes (27): AcEstimationClient(), AcEstimationClientProps, MapPicker, getTemperature(), EstimationResultCard(), EstimationResultCardData, Props, Row() (+19 more)

### Community 11 - "Admin Audit Queries"
Cohesion: 0.10
Nodes (39): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+31 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "Loading States & Settings"
Cohesion: 0.15
Nodes (22): AcEstimationLoading(), AuditStartLoading(), AuditValidationLoading(), HistoryLoading(), SettingsLoading(), AuditStepSkeleton(), AuditStepSkeletonProps, AuditStepSkeletonVariant (+14 more)

### Community 14 - "Store Admin Queries"
Cohesion: 0.11
Nodes (33): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, AdminStoreFilters (+25 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.23
Nodes (11): AC Layout Tool (/ac-layout), CalculatorGrid, AC Estimation Calculator (/ac-estimation), Light Estimation Calculator (/light-estimation), Open-Meteo API, CAD (.DXF) Import Layout Specification, Client-side DXF Parser, DXF Object Anatomy (GOST_GLASS, ANSI32, ANSI37, AR-SAND, AR-CONC, P1, double swing) (+3 more)

### Community 16 - "place-autocomplete.tsx"
Cohesion: 0.16
Nodes (20): Command(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), InputGroup(), InputGroupAddon() (+12 more)

### Community 17 - "sheet.tsx"
Cohesion: 0.26
Nodes (9): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle() (+1 more)

### Community 18 - "CAD Import & AC Optimizer"
Cohesion: 0.12
Nodes (22): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+14 more)

### Community 19 - "Header Menu & Filters"
Cohesion: 0.14
Nodes (31): AdminHeaderActions(), HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, FilterI18nConfig, FilterOperator, FilterOption (+23 more)

### Community 20 - "calculator-logs-client.tsx"
Cohesion: 0.17
Nodes (20): AdminMasterDataNav(), AdminUserFiltersProps, CalculatorLogsClient(), CalculatorLogsClientProps, formatDateIndo(), MONTH_OPTIONS, buildTime(), BuildTimeOptions (+12 more)

### Community 21 - "Lamp Calculator Engine"
Cohesion: 0.11
Nodes (33): getRabData(), saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), LightEstimationClientProps, SHAPES (+25 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "Admin Shell Layout"
Cohesion: 0.09
Nodes (44): AdminLayout(), AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminSiteHeader() (+36 more)

### Community 24 - "Dashboard Charts"
Cohesion: 0.09
Nodes (31): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+23 more)

### Community 25 - "admin-users-table.tsx"
Cohesion: 0.19
Nodes (12): AdminMasterEquipmentTable(), SortableHeader(), updateSort(), formatDate(), formatNumber(), getNextSortOrder(), numberFormat, BranchCell() (+4 more)

### Community 26 - "create-user.ts"
Cohesion: 0.40
Nodes (5): ActionResult, createUser(), CreateUserInput, hashPassword(), handleSubmit()

### Community 27 - "admin-users-table.tsx"
Cohesion: 0.06
Nodes (58): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+50 more)

### Community 28 - "User Admin Queries"
Cohesion: 0.15
Nodes (27): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+19 more)

### Community 29 - "Store MEP Simulator"
Cohesion: 0.11
Nodes (35): ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle(), checkStandards(), ForbiddenInterval, formatDim() (+27 more)

### Community 30 - "step1.tsx"
Cohesion: 0.13
Nodes (18): getSingleDuration(), saveAuditDraft(), toAreaTarget(), searchStoresAction(), AuditStepNavigate, AuditStep1(), beanspotStoreTypeOptions, otherStoreTypeOptions (+10 more)

### Community 31 - "AC Mapping Canvas"
Cohesion: 0.12
Nodes (31): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+23 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "react"
Cohesion: 0.20
Nodes (11): Checkbox(), FieldDescription(), FieldGroup(), FieldLabel(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants (+3 more)

### Community 34 - "Master Data Mutations"
Cohesion: 0.10
Nodes (41): CalculatorLogsPage(), metadata, SearchParams, DELETE(), PUT(), POST(), DELETE(), PUT() (+33 more)

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

### Community 39 - "sync-stores.ts"
Cohesion: 0.05
Nodes (44): POST(), duplicateStores, incompleteStores, stores, Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned) (+36 more)

### Community 40 - "Audit Start & Store Lookup"
Cohesion: 0.11
Nodes (24): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, excludedBranchNames, getStoreByCodeAction(), AuditStartPage(), excludedBranchNames (+16 more)

### Community 41 - "Audit Result & Metric Cards"
Cohesion: 0.11
Nodes (40): AdminReportsPage(), formatNumber(), getExportHref(), getPreviewHref(), ReportCard, reportCards, SearchParams, AuditResultPage() (+32 more)

### Community 42 - "Map Draw Controls"
Cohesion: 0.17
Nodes (12): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+4 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "combobox.tsx"
Cohesion: 0.13
Nodes (16): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+8 more)

### Community 46 - "DB Pool & Scripts"
Cohesion: 0.22
Nodes (10): getPoolConfig(), pg, main(), pool, printUsage(), sha256(), escapeCsv(), main() (+2 more)

### Community 47 - "Lamp Simulation Scripts"
Cohesion: 0.15
Nodes (10): calcSimetris(), evaluateStatus(), run(), fmt(), main(), url, dxfContent, dxfPath (+2 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "draft-list-section.tsx"
Cohesion: 0.18
Nodes (15): deleteAuditDraft(), getAuditDraft(), AdminReportActions(), handleOpenChange(), loadPreview(), AdminReportActionsProps, formatCell(), PreviewResponse (+7 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "utils.ts"
Cohesion: 0.17
Nodes (13): MenuRow(), SectionLabel(), SettingsPage(), Theme, THEMES, BottomNavigationItem, BottomNavigationProps, navItems (+5 more)

### Community 52 - "Audit Card & Item UI"
Cohesion: 0.22
Nodes (16): ValidationStoreList(), ValidationStoreListProps, AuditCard(), AuditCardProps, AuditStatus, Item(), ItemActions(), ItemContent() (+8 more)

### Community 53 - "step3.tsx"
Cohesion: 0.06
Nodes (54): ActionResult, addAuditItem(), AddAuditItemInput, areaTargets, checkItemFields(), deleteAuditItem(), findBrandStandbyKw(), getEditableAudit() (+46 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "dxf-parser.ts"
Cohesion: 0.21
Nodes (15): CadStoreMetrics, CadWallType, chainLinesIntoPolygon(), dist(), DxfCodeValue, DxfEntity, getLoopArea(), getLoopBounds() (+7 more)

### Community 56 - "step2.tsx"
Cohesion: 0.19
Nodes (15): AreaItem, areaItems, AuditStep2(), AuditStep2Props, Step2AreaCard(), AuditStepIndicator(), AuditStepIndicatorProps, OfflineIndicator() (+7 more)

### Community 57 - "useLeaflet"
Cohesion: 0.17
Nodes (16): LeafletMarkerClusterGroup, MapControlContainer(), MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapFullscreenControl(), MapMarkerClusterGroup() (+8 more)

### Community 58 - "Lamp Calculator Rules (Docs)"
Cohesion: 0.28
Nodes (6): Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0), calculatePenalties (weighted 100x/10x/1x), JB Distribution Analysis (40,401 room combinations, 84% ideal)

### Community 59 - "Audit Drafts"
Cohesion: 0.16
Nodes (14): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, getAuditHistory(), getAvailableYears(), HistoryItem, HistoryResponse (+6 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "Field"
Cohesion: 0.47
Nodes (5): AboutPage(), InfoRow(), Field(), fieldVariants, lucide-react

### Community 62 - "Map Picker"
Cohesion: 0.27
Nodes (10): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+2 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "validation-detail.tsx"
Cohesion: 0.23
Nodes (13): AreaKey, areaLabels, areaOrder, formatGap(), formatHours(), formatKwh(), numberFormat, percentFormat (+5 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "Admin Audit Filters"
Cohesion: 0.25
Nodes (10): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+2 more)

### Community 67 - "Button"
Cohesion: 0.13
Nodes (14): AdminEntryPage(), DemoResultPage(), LoginPage(), LoginToastNotice(), Page(), AdminEntryLogoutButton(), DemoLoginButton(), LoginForm() (+6 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "brand-combobox.tsx"
Cohesion: 0.29
Nodes (4): Brand, BrandCombobox(), BrandComboboxProps, @radix-ui/react-popover

### Community 70 - "app/dashboard/page.tsx"
Cohesion: 0.16
Nodes (11): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditItem, RecentAuditSection(), RecentAuditSectionProps, RecentAuditStatus (+3 more)

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

### Community 79 - "admin-dashboard-filters.tsx"
Cohesion: 0.24
Nodes (10): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminDashboardFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+2 more)

### Community 80 - "Landing Hero Illustration"
Cohesion: 0.32
Nodes (8): Audit Completion Checkmark, Lime Green / Dark Teal Brand Palette, Field Auditor with Clipboard, Handheld Measuring Device / Thermometer Gun, Landing Hero Illustration (Store Energy Audit), Electrical Panel with kWh Meter and Breakers, Retail Store Equipment (Fridge, Lights, CCTV, Cashier), Rooftop Solar Panels

### Community 81 - "antislop-human"
Cohesion: 0.10
Nodes (20): antislop-human, Broken Tab Order, Color & Contrast, Color-Only Feedback, Focus & States, How to use this skill, Human Skill Checklist, Keyboard (+12 more)

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

### Community 88 - "audit-validation-queries.ts"
Cohesion: 0.13
Nodes (22): AuditValidationDetailPage(), Props, AuditValidationPage(), pageHref(), Props, getAuditValidator(), firstValue(), getValidationAudit() (+14 more)

### Community 89 - "dotenv"
Cohesion: 0.15
Nodes (11): dotenv, prisma, @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma (+3 more)

### Community 90 - "MapLocateControl"
Cohesion: 0.29
Nodes (5): LeafletMarker, MapLocateControl(), MapLocatePulseIcon(), MapMarker(), useDebounceLoadingState()

### Community 91 - "admin-master-store-filters.tsx"
Cohesion: 0.29
Nodes (9): AdminMasterStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminMasterStoreFiltersProps, filterParamKeys, filterParamKeySet (+1 more)

### Community 92 - "AC Mapping Calculator Proposal"
Cohesion: 0.22
Nodes (6): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, lib/ac-placement-calculator.ts (planned)

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "Lamp Analysis Script"
Cohesion: 0.60
Nodes (4): xlsx, calcSimetris(), evaluateDetailed(), run()

### Community 95 - "ref_crypto"
Cohesion: 0.25
Nodes (5): hash, password, main(), pool, sha256()

### Community 96 - "Audit Export Script"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDate(), main(), pool

### Community 97 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.39
Nodes (5): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator

### Community 99 - "Import Users Script"
Cohesion: 0.60
Nodes (4): main(), parseBranches(), pool, sha256()

### Community 101 - "Icon Rules"
Cohesion: 0.67
Nodes (4): data-icon Attribute for Button Icons, Configured iconLibrary, Icons Rules, @tabler/icons-react Iconography

### Community 103 - "Alfamart Brand Assets"
Cohesion: 0.67
Nodes (3): Alfamart Emblem, Alfamart Emblem (small), Alfamart Wordmark Logo

### Community 112 - "Comments That Add Nothing"
Cohesion: 0.11
Nodes (17): antislop-code, Code Comment Checklist, Comments That Add Nothing, Decorative Emoji, Decorative Separators, Empty Labels, End Markers, How It Should Read (+9 more)

### Community 113 - "Group 1: Hard Gate (absolute, no exceptions)"
Cohesion: 0.11
Nodes (18): Group 1: Hard Gate (absolute, no exceptions), R-02 — Copywriting, R-03 — Mobile Responsiveness, R-17 — Data & Numbers, R-18 — Testimonials, R-23 — Clarification & Visual Assets, R-24 — Navigation, R-25 — Color Contrast (+10 more)

### Community 114 - "Group 2: Purpose-Gate (technique allowed, purpose required)"
Cohesion: 0.15
Nodes (13): Group 2: Purpose-Gate (technique allowed, purpose required), R-01 — Color & Gradients, R-04 — Icons, R-06 — Typography, R-07 — Background, R-08 — Button Arrows, R-09 — Badges, R-10 — Glassmorphism (+5 more)

### Community 115 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 116 - "Decorative Elements"
Cohesion: 0.17
Nodes (12): AI Capsule Badges, Colored Left Stripe, Decorative Elements, Decorative Status Dot, Emoji as Decoration, Eyebrow Badge Above the Headline, Fake Terminal Window, Generic AI Icons (+4 more)

### Community 117 - "antislop-ui"
Cohesion: 0.18
Nodes (10): antislop-ui, Dead Navigation, Endless Pulses and Loops, How to use this skill, Motion, Non-Functional Controls, Sections That Fill a Template, Structural & Flow (+2 more)

### Community 118 - "Layout & Components"
Cohesion: 0.18
Nodes (11): 4-Column Template Footer, Bento Grid, Copy-Paste Feature Cards, Demo Without a Product, "How It Works" Always 3 Steps, Layout & Components, Monotonous Template Layout, "Most Popular" Pricing Card (+3 more)

### Community 119 - "Visual & Color"
Cohesion: 0.18
Nodes (11): Background Grid, Dark Mode Default for No Reason, Excessive Accent Color, Excessive Border Radius, Excessive Glassmorphism, Generic Blue-Purple Gradient, Glow Everywhere, Overly Soft Shadows (+3 more)

### Community 120 - "admin-equipment-filters.tsx"
Cohesion: 0.25
Nodes (10): AdminEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminEquipmentFiltersProps, areaOptions, filterParamKeys (+2 more)

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "admin-audit-date-filter.ts"
Cohesion: 0.43
Nodes (6): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear()

### Community 124 - "AdminUserFilters"
Cohesion: 0.22
Nodes (14): checkExistingEmails(), AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams() (+6 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.29
Nodes (6): saveAcEstimationLog, Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, saveLightEstimationLog, Lamps-per-Row Trial Sampling (Max/Min/Min-1)

### Community 128 - "result-skeleton.tsx"
Cohesion: 0.60
Nodes (3): AuditResultLoading(), DemoResultLoading(), AuditResultSkeleton()

### Community 129 - "save-ac-estimation-log.ts"
Cohesion: 0.47
Nodes (5): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "db-pool.ts"
Cohesion: 0.36
Nodes (6): createDbPool(), dbPool, getPositiveIntegerEnv(), globalForDbPool, main(), mapCategoryToArea()

### Community 132 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 133 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 134 - "input-group.tsx"
Cohesion: 0.47
Nodes (4): inputGroupAddonVariants, InputGroupText(), InputGroupTextarea(), Textarea()

### Community 135 - "actions/import-users.ts"
Cohesion: 0.50
Nodes (4): ActionResult, hashPassword(), ImportUserInput, importUsersBulk()

### Community 136 - "generate-lamp-simulation.ts"
Cohesion: 0.60
Nodes (4): SimetrisResult, calcSimetris(), evaluateStatus(), run()

### Community 139 - "export-store-data.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

## Ambiguous Edges - Review These
- `parseStoreSheetRows()` → `parseCoordinates`  [AMBIGUOUS]
  docs/store_coordinates_plan.md · relation: conceptually_related_to
- `Alfamart Emblem` → `Alfamart Emblem (small)`  [AMBIGUOUS]
  public/assets/Alfamart-Emblem-small.png · relation: semantically_similar_to
- `Alfamart Emblem` → `Alfamart Wordmark Logo`  [AMBIGUOUS]
  public/assets/logoalfamart.png · relation: semantically_similar_to
- `shadcn Logo` → `shadcn Logo (small)`  [AMBIGUOUS]
  .agents/skills/shadcn/assets/shadcn-small.png · relation: semantically_similar_to
- `Bottom Navigation Pattern` → `Styling & Tailwind Rules`  [AMBIGUOUS]
  DESIGN.md · relation: conceptually_related_to
- `No space-x/space-y, Use gap-*` → `Mobile-first max-w-sm Single Column Layout`  [AMBIGUOUS]
  DESIGN.md · relation: conceptually_related_to
- `Android Chrome PWA Icon 192x192` → `Android Chrome PWA Icon 512x512`  [AMBIGUOUS]
  public/assets/android-chrome-512x512.png · relation: semantically_similar_to
- `Apple Touch Icon` → `Sparta Energy Building Shield Logo`  [AMBIGUOUS]
  public/assets/apple-touch-icon.png · relation: semantically_similar_to
- `Favicon 16x16` → `Favicon 32x32`  [AMBIGUOUS]
  public/assets/favicon-16x16.png · relation: semantically_similar_to

## Knowledge Gaps
- **74 isolated node(s):** `@radix-ui/react-select`, `@types/pg`, `shadcn`, `tw-animate-css`, `@eslint/eslintrc` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 948 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Master Data Queries`, `cn`, `item-form-dialog.tsx`, `admin-store-filters.tsx`, `input-group.tsx`, `Admin Dialogs & Forms`, `Leaflet Map Wrapper`, `Package & ESLint Config`, `ac-estimation-client.tsx`, `Loading States & Settings`, `place-autocomplete.tsx`, `sheet.tsx`, `Header Menu & Filters`, `calculator-logs-client.tsx`, `Lamp Calculator Engine`, `Branch Audit Summaries`, `Admin Shell Layout`, `Dashboard Charts`, `admin-users-table.tsx`, `admin-users-table.tsx`, `Store MEP Simulator`, `step1.tsx`, `AC Mapping Canvas`, `Admin Audit Detail Page`, `Admin Store Detail Page`, `Audit Start & Store Lookup`, `Audit Result & Metric Cards`, `Root Layout & Theme`, `combobox.tsx`, `draft-list-section.tsx`, `utils.ts`, `Audit Card & Item UI`, `step3.tsx`, `step2.tsx`, `Map Picker`, `validation-detail.tsx`, `Admin Audit Filters`, `Button`, `brand-combobox.tsx`, `app/dashboard/page.tsx`, `admin-dashboard-filters.tsx`, `admin-master-store-filters.tsx`, `admin-equipment-filters.tsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Master Data Queries` be split into smaller, more focused modules?**
  _Cohesion score 0.06603346901854365 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `item-form-dialog.tsx`, `Equipment Admin Queries`, `input-group.tsx`, `Admin Dialogs & Forms`, `Leaflet Map Wrapper`, `ac-estimation-client.tsx`, `Loading States & Settings`, `place-autocomplete.tsx`, `sheet.tsx`, `Header Menu & Filters`, `calculator-logs-client.tsx`, `Admin Shell Layout`, `Dashboard Charts`, `admin-users-table.tsx`, `admin-users-table.tsx`, `step1.tsx`, `react`, `Admin Audit Detail Page`, `Admin Store Detail Page`, `Audit Result & Metric Cards`, `Map Draw Controls`, `Root Layout & Theme`, `combobox.tsx`, `utils.ts`, `Audit Card & Item UI`, `step3.tsx`, `step2.tsx`, `useLeaflet`, `Field`, `validation-detail.tsx`, `Button`, `brand-combobox.tsx`, `MapLocateControl`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Should `prisma.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._