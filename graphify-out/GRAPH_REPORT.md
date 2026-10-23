# Graph Report - sparta-energy  (2026-10-23)

## Corpus Check
- 358 files · ~507,255 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 2790 nodes · 7832 edges · 136 communities (123 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `47b1272c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Master Data Queries
- next
- step2.tsx
- Input
- Equipment Admin Queries
- Header
- Report Export Queries
- admin-master-equipment-table.tsx
- map.tsx
- Package & ESLint Config
- simple-time-picker.tsx
- Admin Audit Queries
- Runtime Dependencies
- ac-estimation-client.tsx
- Store Admin Queries
- AC Layout Tool (/ac-layout)
- cn
- lighting-audit-form.tsx
- CAD Import & AC Optimizer
- filters.tsx
- audit-validation.ts
- step2-detail.tsx
- Branch Audit Summaries
- Admin Shell Layout
- Dashboard Charts
- Badge
- audit-recalculate.test.ts
- admin-audits-table.tsx
- User Admin Queries
- store-mep-simulator-client.tsx
- utils.ts
- AC Mapping Canvas
- Dev Dependencies
- Button
- requireAdmin
- shadcn components.json
- Admin Audit Detail Page
- Admin Dashboard Page
- Admin Store Detail Page
- sync-stores.ts
- login/page.tsx
- Audit Result & Metric Cards
- AC Mapping Calculator Proposal
- TypeScript Config
- Root Layout & Theme
- field.tsx
- DB Pool & Scripts
- Lamp Simulation Scripts
- Styling & Theming Rules
- admin-calculator-queries.ts
- Tone & Voice
- light-estimation-client.tsx
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- submit-audit.ts
- antislop-layoutmobile
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- lighting-audit-form.tsx
- admin-audit-filters.tsx
- Lamp Calculator Rules (Docs)
- contrast-check.py
- Changelog - Lamp Estimation Calculator
- Map Picker
- shadcn Forms & Composition
- create-user.ts
- UploadThing File Upload
- kategori/page.tsx
- [...all]/route.ts
- npm Scripts
- utils.ts
- generate-lamp-analysis.js
- shadcn CLI & MCP
- Deploy Pipeline & Agent Guides
- Audit Domain Concepts
- Audit Detail Export
- PWA Service Worker
- PWA Manifest
- DOCX Generator Script
- 3-Pillar Ecosystem Architecture
- getAuditValidator
- Landing Hero Illustration
- antislop-human
- Store Sync Docs & Import
- Prisma Seed
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- energy-audit-queries.ts
- app/dashboard/page.tsx
- change-user-role.ts
- audit-validation-queries.ts
- useLeaflet
- recent-audit-section.tsx
- PWA Icon Set
- create-admin-user.ts
- Audit Export Script
- scripts/get-temperature.ts
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
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- Group 3: Quality Locks (consistency)
- antislop
- AdminUserFilters
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- mep-simulation-actions.ts
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- The Craftsmanship Standard
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- dotenv
- save-ac-estimation-log.ts
- item-form-dialog.tsx
- sheet.tsx
- export-store-data.ts
- MapDrawControl
- MapLocateControl

## God Nodes (most connected - your core abstractions)
1. `cn()` - 294 edges
2. `Button()` - 165 edges
3. `react` - 118 edges
4. `next` - 116 edges
5. `@tabler/icons-react` - 101 edges
6. `Badge()` - 70 edges
7. `Card()` - 63 edges
8. `Header()` - 60 edges
9. `Input()` - 58 edges
10. `CardHeader()` - 54 edges

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

## Communities (136 total, 13 thin omitted)

### Community 0 - "Master Data Queries"
Cohesion: 0.06
Nodes (67): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+59 more)

### Community 1 - "next"
Cohesion: 0.08
Nodes (33): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, ActionResult, getMepSimulationDetail(), SaveLightEstimationPayload, SaveLightEstimationResult (+25 more)

### Community 2 - "step2.tsx"
Cohesion: 0.12
Nodes (29): saveAuditDraft(), getStoreByCodeAction(), AuditStartClient(), AuditStepNavigate, AuditStepNavigateOptions, AuditStepTarget, Props, AuditStep1() (+21 more)

### Community 3 - "Input"
Cohesion: 0.10
Nodes (37): deleteAudit(), getAuditHistory(), getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), handleConfirmDelete() (+29 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (48): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+40 more)

### Community 5 - "Header"
Cohesion: 0.10
Nodes (34): AcEstimationLoading(), AuditResultLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationDetailLoading(), AuditValidationLoading(), DashboardLoading(), DemoResultLoading() (+26 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.11
Nodes (45): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+37 more)

### Community 7 - "admin-master-equipment-table.tsx"
Cohesion: 0.10
Nodes (35): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+27 more)

### Community 8 - "map.tsx"
Cohesion: 0.07
Nodes (43): LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon (+35 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.05
Nodes (43): eslintConfig, name, packageManager, prisma, seed, private, type, version (+35 more)

### Community 10 - "simple-time-picker.tsx"
Cohesion: 0.21
Nodes (12): buildTime(), BuildTimeOptions, SimpleTimeOption, SimpleTimePicker(), TimeItem(), Popover(), PopoverContent(), PopoverDescription() (+4 more)

### Community 11 - "Admin Audit Queries"
Cohesion: 0.08
Nodes (45): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+37 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "ac-estimation-client.tsx"
Cohesion: 0.19
Nodes (18): AcEstimationClient(), AcEstimationClientProps, MapPicker, EstimationResultCard(), EstimationResultCardData, Props, Row(), Drawer() (+10 more)

### Community 14 - "Store Admin Queries"
Cohesion: 0.07
Nodes (48): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, AdminStoreFilters() (+40 more)

### Community 15 - "AC Layout Tool (/ac-layout)"
Cohesion: 0.23
Nodes (11): AC Layout Tool (/ac-layout), CalculatorGrid, AC Estimation Calculator (/ac-estimation), Light Estimation Calculator (/light-estimation), Open-Meteo API, CAD (.DXF) Import Layout Specification, Client-side DXF Parser, DXF Object Anatomy (GOST_GLASS, ANSI32, ANSI37, AR-SAND, AR-CONC, P1, double swing) (+3 more)

### Community 16 - "cn"
Cohesion: 0.09
Nodes (45): AlertAction(), ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup() (+37 more)

### Community 17 - "lighting-audit-form.tsx"
Cohesion: 0.10
Nodes (30): saveLightingAudit(), SaveResult, averageLux(), calculateLpd(), getCompletionIssues(), getLpdStatus(), getLuxStatus(), LIGHTING_STANDARD_NOTE (+22 more)

### Community 18 - "CAD Import & AC Optimizer"
Cohesion: 0.09
Nodes (36): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+28 more)

### Community 19 - "filters.tsx"
Cohesion: 0.11
Nodes (42): AdminHeaderActions(), AdminSidebar(), getInitials(), HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, CalculatorLogsClient() (+34 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.17
Nodes (26): ActionResult, addAuditItem(), AddAuditItemInput, areaTargets, AuditTechnicalInput, checkItemFields(), checkTechnical(), deleteAuditItem() (+18 more)

### Community 21 - "step2-detail.tsx"
Cohesion: 0.16
Nodes (14): AuditStep2Detail(), CATEGORY_ICONS, EquipmentItem, EquipmentRow(), EquipmentRowProps, formatKw(), getAverageDailyRuntime(), getSingleDuration() (+6 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.10
Nodes (35): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+27 more)

### Community 23 - "Admin Shell Layout"
Cohesion: 0.07
Nodes (45): AdminNavGroup, AdminNavItem, AdminShellProps, AdminSidebarItem(), AdminSiteHeader(), AdminUser, dashboardNavItem, getBreadcrumbItems() (+37 more)

### Community 24 - "Dashboard Charts"
Cohesion: 0.13
Nodes (21): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+13 more)

### Community 25 - "Badge"
Cohesion: 0.24
Nodes (11): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, AuditItem, AuditListSection(), AuditListSectionProps, AuditStatusBadge() (+3 more)

### Community 26 - "audit-recalculate.test.ts"
Cohesion: 0.29
Nodes (8): calculateGapPercent(), calculateItemDailyKwh(), DAYS_PER_MONTH, ItemKwhInput, summarizeAuditItems(), calc, stored, summary

### Community 27 - "admin-audits-table.tsx"
Cohesion: 0.18
Nodes (13): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+5 more)

### Community 28 - "User Admin Queries"
Cohesion: 0.15
Nodes (27): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+19 more)

### Community 29 - "store-mep-simulator-client.tsx"
Cohesion: 0.09
Nodes (42): ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle(), checkStandards(), ForbiddenInterval, formatDim() (+34 more)

### Community 30 - "utils.ts"
Cohesion: 0.07
Nodes (50): AuditValidationDetailPage(), parseStep(), Props, DemoPage(), AreaKey, areaLabels, areaOrder, formatHours() (+42 more)

### Community 31 - "AC Mapping Canvas"
Cohesion: 0.10
Nodes (33): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+25 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "Button"
Cohesion: 0.10
Nodes (46): deleteAuditDraft(), getAuditDraft(), AdminMasterStoreDialog(), AdminMasterStoreDialogProps, AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate() (+38 more)

### Community 34 - "requireAdmin"
Cohesion: 0.10
Nodes (37): ActionResult, deleteUser(), DeleteUserInput, ActionResult, updateUser(), UpdateUserInput, AdminLayout(), DELETE() (+29 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "Admin Audit Detail Page"
Cohesion: 0.13
Nodes (24): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 37 - "Admin Dashboard Page"
Cohesion: 0.12
Nodes (25): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+17 more)

### Community 38 - "Admin Store Detail Page"
Cohesion: 0.13
Nodes (24): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 39 - "sync-stores.ts"
Cohesion: 0.05
Nodes (44): POST(), duplicateStores, incompleteStores, stores, Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned) (+36 more)

### Community 40 - "login/page.tsx"
Cohesion: 0.36
Nodes (5): LoginPage(), LoginToastNotice(), Page(), Logo(), LogoProps

### Community 41 - "Audit Result & Metric Cards"
Cohesion: 0.13
Nodes (35): AdminReportsPage(), formatNumber(), getExportHref(), getPreviewHref(), ReportCard, reportCards, SearchParams, EnergyAuditError() (+27 more)

### Community 42 - "AC Mapping Calculator Proposal"
Cohesion: 0.22
Nodes (6): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, lib/ac-placement-calculator.ts (planned)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "field.tsx"
Cohesion: 0.13
Nodes (15): AboutPage(), InfoRow(), DemoLoginButton(), LoginForm(), Field(), FieldContent(), FieldDescription(), FieldError() (+7 more)

### Community 46 - "DB Pool & Scripts"
Cohesion: 0.17
Nodes (12): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, adapter, pool, prisma (+4 more)

### Community 47 - "Lamp Simulation Scripts"
Cohesion: 0.15
Nodes (13): calcSimetris(), evaluateStatus(), run(), SimetrisResult, calcSimetris(), evaluateStatus(), run(), test() (+5 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "light-estimation-client.tsx"
Cohesion: 0.08
Nodes (46): getRabData(), saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), SHAPES, SnapGuide (+38 more)

### Community 52 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.39
Nodes (5): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator

### Community 53 - "submit-audit.ts"
Cohesion: 0.08
Nodes (35): getDemoAiRecommendation(), AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, HistoryItem, HistoryResponse, getSingleDuration() (+27 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 56 - "lighting-audit-form.tsx"
Cohesion: 0.08
Nodes (38): AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore, AuditValidationInfo, getAreaLabel() (+30 more)

### Community 57 - "admin-audit-filters.tsx"
Cohesion: 0.05
Nodes (60): DemoResultPage(), AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys (+52 more)

### Community 58 - "Lamp Calculator Rules (Docs)"
Cohesion: 0.28
Nodes (6): Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0), calculatePenalties (weighted 100x/10x/1x), JB Distribution Analysis (40,401 room combinations, 84% ideal)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.29
Nodes (6): saveAcEstimationLog, Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, saveLightEstimationLog, Lamps-per-Row Trial Sampling (Max/Min/Min-1)

### Community 62 - "Map Picker"
Cohesion: 0.27
Nodes (10): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+2 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "create-user.ts"
Cohesion: 0.12
Nodes (12): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, checkExistingEmails(), hashPassword(), ImportUserInput (+4 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "kategori/page.tsx"
Cohesion: 0.15
Nodes (26): dateFormat, EnergyAuditListPage(), first(), pageHref(), Props, formatGap(), ValidationStoreList(), ValidationStoreListProps (+18 more)

### Community 67 - "[...all]/route.ts"
Cohesion: 0.40
Nodes (4): GET, POST, GET(), better-auth

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "utils.ts"
Cohesion: 0.09
Nodes (28): AdminMasterDataNav(), AvatarBadge(), AvatarGroup(), AvatarGroupCount(), ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants (+20 more)

### Community 70 - "generate-lamp-analysis.js"
Cohesion: 0.60
Nodes (4): xlsx, calcSimetris(), evaluateDetailed(), run()

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
Cohesion: 0.36
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

### Community 79 - "getAuditValidator"
Cohesion: 0.22
Nodes (14): GET(), Context, GET(), getAuditValidator(), getLightingAuditsForExport(), appendSheet(), buildLightingAuditWorkbook(), buildLightingRecapWorkbook() (+6 more)

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

### Community 87 - "energy-audit-queries.ts"
Cohesion: 0.16
Nodes (14): LightingAuditPage(), Props, activeStoreSql, latestAuditPerStore, areaToZone, EnergyAuditListRow, EnergyAuditStore, getLampOptions() (+6 more)

### Community 88 - "app/dashboard/page.tsx"
Cohesion: 0.31
Nodes (7): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditSection(), canValidateAudit(), getEnergyAuditPendingCount()

### Community 89 - "change-user-role.ts"
Cohesion: 0.33
Nodes (6): @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma

### Community 90 - "audit-validation-queries.ts"
Cohesion: 0.13
Nodes (23): AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), AuditValidationPage(), pageHref(), Props (+15 more)

### Community 91 - "useLeaflet"
Cohesion: 0.17
Nodes (12): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+4 more)

### Community 92 - "recent-audit-section.tsx"
Cohesion: 0.50
Nodes (3): RecentAuditItem, RecentAuditSectionProps, RecentAuditStatus

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 95 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 96 - "Audit Export Script"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDate(), main(), pool

### Community 97 - "scripts/get-temperature.ts"
Cohesion: 0.40
Nodes (3): fmt(), main(), url

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

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 124 - "AdminUserFilters"
Cohesion: 0.53
Nodes (6): ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv(), parseCsvLine()

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "mep-simulation-actions.ts"
Cohesion: 0.25
Nodes (7): deleteMepSimulationLog(), getLatestStoreMepSimulation(), getMepSimulationList(), MepSimulationListFilter, saveMepSimulationLog(), SaveMepSimulationPayload, SaveMepSimulationResult

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 132 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 133 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 134 - "dotenv"
Cohesion: 0.33
Nodes (5): dotenv, prisma, escapeCsv(), main(), pool

### Community 135 - "save-ac-estimation-log.ts"
Cohesion: 0.47
Nodes (5): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult

### Community 137 - "item-form-dialog.tsx"
Cohesion: 0.16
Nodes (13): Brand, BrandCombobox(), BrandComboboxProps, defaultUsage(), FormErrors, ItemFormDialog(), handleSubmit(), validate() (+5 more)

### Community 138 - "sheet.tsx"
Cohesion: 0.26
Nodes (9): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle() (+1 more)

### Community 139 - "export-store-data.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

### Community 141 - "MapDrawControl"
Cohesion: 0.23
Nodes (13): MapControlContainer(), MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapFullscreenControl(), MapSearchControl(), MapZoomControl() (+5 more)

### Community 144 - "MapLocateControl"
Cohesion: 0.40
Nodes (3): MapLocateControl(), MapLocatePulseIcon(), useDebounceLoadingState()

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1016 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `Master Data Queries`, `step2.tsx`, `Input`, `Equipment Admin Queries`, `Header`, `Report Export Queries`, `save-ac-estimation-log.ts`, `admin-master-equipment-table.tsx`, `item-form-dialog.tsx`, `Package & ESLint Config`, `Admin Audit Queries`, `ac-estimation-client.tsx`, `Store Admin Queries`, `lighting-audit-form.tsx`, `filters.tsx`, `audit-validation.ts`, `Branch Audit Summaries`, `Admin Shell Layout`, `Badge`, `admin-audits-table.tsx`, `User Admin Queries`, `utils.ts`, `Button`, `requireAdmin`, `Admin Audit Detail Page`, `Admin Dashboard Page`, `Admin Store Detail Page`, `sync-stores.ts`, `login/page.tsx`, `Audit Result & Metric Cards`, `Root Layout & Theme`, `field.tsx`, `light-estimation-client.tsx`, `submit-audit.ts`, `lighting-audit-form.tsx`, `admin-audit-filters.tsx`, `admin/page.tsx`, `create-user.ts`, `kategori/page.tsx`, `utils.ts`, `getAuditValidator`, `energy-audit-queries.ts`, `app/dashboard/page.tsx`, `audit-validation-queries.ts`, `recent-audit-section.tsx`, `[...slug]/route.ts`, `mep-simulation-actions.ts`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Master Data Queries` be split into smaller, more focused modules?**
  _Cohesion score 0.060641627543035995 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Button` to `Master Data Queries`, `next`, `step2.tsx`, `Input`, `Header`, `admin-master-equipment-table.tsx`, `map.tsx`, `item-form-dialog.tsx`, `simple-time-picker.tsx`, `sheet.tsx`, `Package & ESLint Config`, `ac-estimation-client.tsx`, `Store Admin Queries`, `cn`, `filters.tsx`, `step2-detail.tsx`, `Branch Audit Summaries`, `Admin Shell Layout`, `Dashboard Charts`, `Badge`, `admin-audits-table.tsx`, `store-mep-simulator-client.tsx`, `utils.ts`, `AC Mapping Canvas`, `requireAdmin`, `Admin Audit Detail Page`, `Admin Store Detail Page`, `login/page.tsx`, `Audit Result & Metric Cards`, `Root Layout & Theme`, `field.tsx`, `light-estimation-client.tsx`, `lighting-audit-form.tsx`, `admin-audit-filters.tsx`, `Map Picker`, `kategori/page.tsx`, `utils.ts`, `app/dashboard/page.tsx`, `audit-validation-queries.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.07759562841530054 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._