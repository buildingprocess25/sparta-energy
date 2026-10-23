# Graph Report - sparta-energy  (2026-10-23)

## Corpus Check
- 360 files · ~507,850 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 2801 nodes · 7873 edges · 137 communities (125 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d2fed782`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Master Data Queries
- prisma.ts
- CardContent
- Input
- Equipment Admin Queries
- Header
- Report Export Queries
- admin-equipment-table.tsx
- map.tsx
- Package & ESLint Config
- simple-time-picker.tsx
- Admin Audit Queries
- Runtime Dependencies
- ac-mapping-result-card.tsx
- Store Admin Queries
- AC Layout Tool (/ac-layout)
- cn
- lighting-audit-form.tsx
- CAD Import & AC Optimizer
- filters.tsx
- audit-validation.ts
- utils.ts
- Branch Audit Summaries
- admin-shell.tsx
- Dashboard Charts
- step-input.tsx
- admin-master-equipment-table.tsx
- add-default-brands.ts
- lighting-audit-form.tsx
- store-mep-simulator-client.tsx
- step-equipment.tsx
- AC Mapping Canvas
- Dev Dependencies
- Button
- requireAdmin
- shadcn components.json
- Admin Audit Detail Page
- Admin Dashboard Page
- Admin Store Detail Page
- sync-stores.ts
- light-estimation-client.tsx
- Audit Result & Metric Cards
- admin-store-detail.ts
- TypeScript Config
- Root Layout & Theme
- react
- DB Pool & Scripts
- Lamp Simulation Scripts
- Styling & Theming Rules
- Badge
- Tone & Voice
- light-estimation-client.tsx
- reports/export/route.ts
- step3.tsx
- antislop-layoutmobile
- admin-audits-table.tsx
- result-db.tsx
- admin-audit-filters.tsx
- route.spec.ts
- start-client.tsx
- contrast-check.py
- Disaster Engine & Store Impact Verification Flow
- Map Picker
- shadcn Forms & Composition
- prisma
- UploadThing File Upload
- kategori/page.tsx
- AdminMasterStoresTable
- npm Scripts
- field.tsx
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
- next
- dotenv
- audit-validation-queries.ts
- useLeaflet
- StateBlock
- PWA Icon Set
- MapLocateControl
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
- getAuditValidator
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- get-history.ts
- Group 3: Quality Locks (consistency)
- antislop
- ImportUserCsvDialog
- result-skeleton.tsx
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- Store Coordinates Sync Plan
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- save-ac-estimation-log.ts
- The Craftsmanship Standard
- store-combobox.tsx
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- generate-lamp-simulation.js
- export-store-data.ts
- MapDrawControl

## God Nodes (most connected - your core abstractions)
1. `cn()` - 294 edges
2. `Button()` - 165 edges
3. `react` - 118 edges
4. `next` - 116 edges
5. `@tabler/icons-react` - 102 edges
6. `Badge()` - 72 edges
7. `Card()` - 63 edges
8. `Header()` - 60 edges
9. `Input()` - 58 edges
10. `CardHeader()` - 54 edges

## Surprising Connections (you probably didn't know these)
- `parseCoordinates` --conceptually_related_to--> `parseStoreSheetRows()`  [AMBIGUOUS]
  docs/store_coordinates_plan.md → lib/jobs/sync-stores.ts
- `parseStoreSheetRows()` --implements--> `Store Google Sheet Contract (header aliases, normalization)`  [EXTRACTED]
  lib/jobs/sync-stores.ts → docs/superpowers/specs/2026-07-23-store-sync-cron-design.md
- `Insert-Only Idempotent Store Sync` --rationale_for--> `syncStoresFromSheet()`  [EXTRACTED]
  docs/superpowers/specs/2026-07-23-store-sync-cron-design.md → lib/jobs/sync-stores.ts
- `Dokploy Schedule Job (daily loopback invocation)` --calls--> `POST()`  [EXTRACTED]
  docs/superpowers/plans/2026-07-23-store-sync-cron.md → app/api/cron/sync-stores/route.ts
- `CRON_SECRET Bearer Auth with Exact-Path Proxy Bypass` --rationale_for--> `POST()`  [EXTRACTED]
  docs/superpowers/specs/2026-07-23-store-sync-cron-design.md → app/api/cron/sync-stores/route.ts

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

## Communities (137 total, 12 thin omitted)

### Community 0 - "Master Data Queries"
Cohesion: 0.05
Nodes (76): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+68 more)

### Community 1 - "prisma.ts"
Cohesion: 0.09
Nodes (25): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, ActionResult, SaveLightEstimationPayload, SaveLightEstimationResult, excludedBranchNames (+17 more)

### Community 2 - "CardContent"
Cohesion: 0.13
Nodes (24): AuditStepNavigate, AuditStep1(), Props, AreaItem, areaItems, AuditStep2(), AuditStep2Props, Step2AreaCard() (+16 more)

### Community 3 - "Input"
Cohesion: 0.11
Nodes (39): deleteAudit(), getAuditHistory(), getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), handleConfirmDelete() (+31 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.08
Nodes (54): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+46 more)

### Community 5 - "Header"
Cohesion: 0.18
Nodes (18): AcEstimationLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationDetailLoading(), AuditValidationLoading(), DashboardLoading(), HistoryLoading(), SettingsLoading() (+10 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.14
Nodes (32): addCommonWhere(), AdminReportCellValue, AdminReportStatus, AdminReportType, buildAuditHistoryDataset(), buildBranchSummaryDataset(), buildEquipmentDataset(), buildStoreDataDataset() (+24 more)

### Community 7 - "admin-equipment-table.tsx"
Cohesion: 0.25
Nodes (11): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+3 more)

### Community 8 - "map.tsx"
Cohesion: 0.07
Nodes (42): LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarkerClusterGroup, LeafletPolygon, LeafletPolyline (+34 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.04
Nodes (44): eslintConfig, name, packageManager, prisma, seed, private, type, version (+36 more)

### Community 10 - "simple-time-picker.tsx"
Cohesion: 0.26
Nodes (10): dateToTimeStr(), TimeRangeCards(), TimeRangeCardsProps, timeStrToDate(), buildTime(), BuildTimeOptions, SimpleTimeOption, SimpleTimePicker() (+2 more)

### Community 11 - "Admin Audit Queries"
Cohesion: 0.07
Nodes (52): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+44 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "ac-mapping-result-card.tsx"
Cohesion: 0.19
Nodes (11): AcMappingResultCard(), AcMappingResultCardData, AcMappingUnitDetail, Props, Row(), LightEstimationResultCard(), LightEstimationResultCardData, Props (+3 more)

### Community 14 - "Store Admin Queries"
Cohesion: 0.11
Nodes (34): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, AdminStoreFilters() (+26 more)

### Community 15 - "AC Layout Tool (/ac-layout)"
Cohesion: 0.07
Nodes (29): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), ASHRAE Handbook / Standard 55 / Standard 72, CalculatorGrid (+21 more)

### Community 16 - "cn"
Cohesion: 0.07
Nodes (51): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+43 more)

### Community 17 - "lighting-audit-form.tsx"
Cohesion: 0.14
Nodes (22): averageLux(), calculateLpd(), getCompletionIssues(), getLpdStatus(), getLuxStatus(), getZoneDefinition(), LIGHTING_ZONES, LightingAuditData (+14 more)

### Community 18 - "CAD Import & AC Optimizer"
Cohesion: 0.10
Nodes (32): PlacedAcUnit, ValidWallSpan, WallSegment, HistorySnapshot, PerimeterPathResult, WallSegment, ZoneSpanResult, CadImportDialogProps (+24 more)

### Community 19 - "filters.tsx"
Cohesion: 0.14
Nodes (31): AdminHeaderActions(), HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, FilterI18nConfig, FilterOperator, FilterOption (+23 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.15
Nodes (28): ActionResult, addAuditItem(), AddAuditItemInput, areaTargets, checkItemFields(), checkTechnical(), deleteAuditItem(), deleteAuditItems() (+20 more)

### Community 21 - "utils.ts"
Cohesion: 0.12
Nodes (25): AcEstimationClient(), AcEstimationClientProps, MapPicker, getRabData(), getTemperature(), EstimationResultCard(), EstimationResultCardData, Props (+17 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "admin-shell.tsx"
Cohesion: 0.06
Nodes (64): AdminLayout(), AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminSiteHeader() (+56 more)

### Community 24 - "Dashboard Charts"
Cohesion: 0.13
Nodes (21): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+13 more)

### Community 25 - "step-input.tsx"
Cohesion: 0.13
Nodes (23): AreaKey, areaLabels, areaOrder, formatHours(), formatKwh(), numberFormat, percentFormat, defaultUsage() (+15 more)

### Community 26 - "admin-master-equipment-table.tsx"
Cohesion: 0.13
Nodes (22): AdminMasterEquipmentTable(), SortableHeader(), updateSort(), formatDate(), formatNumber(), getNextSortOrder(), numberFormat, AdminUsersTable() (+14 more)

### Community 28 - "lighting-audit-form.tsx"
Cohesion: 0.14
Nodes (20): saveLightingAudit(), dateFormat, LightingAuditForm(), addLuxPoint(), goToStep(), save(), update(), updateZone() (+12 more)

### Community 29 - "store-mep-simulator-client.tsx"
Cohesion: 0.10
Nodes (39): deleteMepSimulationLog(), getLatestStoreMepSimulation(), getMepSimulationDetail(), getMepSimulationList(), MepSimulationListFilter, saveMepSimulationLog(), SaveMepSimulationPayload, SaveMepSimulationResult (+31 more)

### Community 30 - "step-equipment.tsx"
Cohesion: 0.08
Nodes (39): AuditTechnicalInput, StepActionBar(), areaCategory, buildRows(), ChecklistRow, MatchableItem, matchesType(), monthFormat (+31 more)

### Community 31 - "AC Mapping Canvas"
Cohesion: 0.12
Nodes (30): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+22 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "Button"
Cohesion: 0.17
Nodes (35): AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterStoreDialog(), AdminMasterStoreDialogProps, AdminReportActions(), handleOpenChange(), loadPreview(), AdminReportActionsProps (+27 more)

### Community 34 - "requireAdmin"
Cohesion: 0.06
Nodes (72): updateUser(), CalculatorLogsPage(), metadata, SearchParams, DELETE(), PUT(), POST(), DELETE() (+64 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "Admin Audit Detail Page"
Cohesion: 0.13
Nodes (24): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 37 - "Admin Dashboard Page"
Cohesion: 0.13
Nodes (24): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+16 more)

### Community 38 - "Admin Store Detail Page"
Cohesion: 0.13
Nodes (25): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 39 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 40 - "light-estimation-client.tsx"
Cohesion: 0.08
Nodes (40): saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), LightEstimationClientProps, SHAPES, SnapGuide (+32 more)

### Community 41 - "Audit Result & Metric Cards"
Cohesion: 0.18
Nodes (28): AdminReportsPage(), formatNumber(), getExportHref(), getPreviewHref(), ReportCard, reportCards, SearchParams, AdminMetricCard() (+20 more)

### Community 42 - "admin-store-detail.ts"
Cohesion: 0.17
Nodes (13): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getAdminStoreDetail(), getBrandName(), getEquipmentName(), isNonNegativeNumber() (+5 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.15
Nodes (15): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+7 more)

### Community 45 - "react"
Cohesion: 0.06
Nodes (32): LoginPage(), LoginToastNotice(), Page(), MenuRow(), SectionLabel(), SettingsPage(), Theme, THEMES (+24 more)

### Community 46 - "DB Pool & Scripts"
Cohesion: 0.23
Nodes (11): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, escapeCsv(), main(), pool (+3 more)

### Community 47 - "Lamp Simulation Scripts"
Cohesion: 0.15
Nodes (11): SimetrisResult, calcSimetris(), evaluateStatus(), run(), pool, test(), testFile(), dxfContent (+3 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "Badge"
Cohesion: 0.16
Nodes (16): AdminStoresTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getStatus() (+8 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "light-estimation-client.tsx"
Cohesion: 0.16
Nodes (18): checkLampObstacle(), formatDim(), getCashierZonePolygon(), getMaxInwardDepth(), getStoreScaleInfo(), MepFloorPlanCanvasPreview(), MepFloorPlanCanvasPreviewProps, PlacedAcUnit (+10 more)

### Community 52 - "reports/export/route.ts"
Cohesion: 0.25
Nodes (15): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+7 more)

### Community 53 - "step3.tsx"
Cohesion: 0.08
Nodes (40): getDemoAiRecommendation(), deleteAuditDraft(), getAuditDraft(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), submitAudit() (+32 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "admin-audits-table.tsx"
Cohesion: 0.18
Nodes (13): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+5 more)

### Community 56 - "result-db.tsx"
Cohesion: 0.14
Nodes (21): DemoResultPage(), AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore, AuditValidationInfo (+13 more)

### Community 57 - "admin-audit-filters.tsx"
Cohesion: 0.06
Nodes (39): AdminAuditFiltersProps, filterParamKeys, filterParamKeySet, monthOptions, AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams() (+31 more)

### Community 58 - "route.spec.ts"
Cohesion: 0.19
Nodes (9): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet(), guestOnlyRoutes (+1 more)

### Community 59 - "start-client.tsx"
Cohesion: 0.17
Nodes (13): excludedBranchNames, getStoreByCodeAction(), AuditStartPage(), excludedBranchNames, AuditStartClient(), AuditStepNavigateOptions, AuditStepTarget, Props (+5 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 62 - "Map Picker"
Cohesion: 0.26
Nodes (11): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+3 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "prisma"
Cohesion: 0.07
Nodes (20): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, deleteUser(), DeleteUserInput, ActionResult (+12 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "kategori/page.tsx"
Cohesion: 0.14
Nodes (27): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, dateFormat, EnergyAuditListPage(), first(), pageHref() (+19 more)

### Community 67 - "AdminMasterStoresTable"
Cohesion: 0.19
Nodes (10): AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate(), formatHours(), formatNumber(), getCompleteness(), getNextSortOrder() (+2 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "field.tsx"
Cohesion: 0.10
Nodes (24): AboutPage(), InfoRow(), ButtonGroupSeparator(), ButtonGroupText(), Field(), FieldContent(), FieldLegend(), FieldSeparator() (+16 more)

### Community 70 - "generate-lamp-analysis.js"
Cohesion: 0.83
Nodes (3): calcSimetris(), evaluateDetailed(), run()

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
Cohesion: 0.33
Nodes (8): GET(), isAdmin(), areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), xlsx

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
Cohesion: 0.11
Nodes (26): GET(), Context, GET(), ENERGY_AUDIT_CATEGORIES, EnergyAuditCategoryInfo, buildEnergyAuditRecapWorkbook(), LightingAudit, STATUS_LABEL (+18 more)

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
Cohesion: 0.21
Nodes (12): areaToZone, EnergyAuditListRow, EnergyAuditStore, getLampOptions(), getLightingAuditForm(), LampOption, RawListRow, createEmptyLightingAudit() (+4 more)

### Community 88 - "next"
Cohesion: 0.11
Nodes (18): SaveResult, AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), DashboardPage(), AcEstimationUnavailableNotice() (+10 more)

### Community 89 - "dotenv"
Cohesion: 0.15
Nodes (11): dotenv, prisma, @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma (+3 more)

### Community 90 - "audit-validation-queries.ts"
Cohesion: 0.14
Nodes (19): AuditValidationPage(), pageHref(), Props, activeStoreSql, firstValue(), getValidationAudits(), latestAuditPerStore, parseValidationFilters() (+11 more)

### Community 91 - "useLeaflet"
Cohesion: 0.15
Nodes (17): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+9 more)

### Community 92 - "StateBlock"
Cohesion: 0.27
Nodes (6): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), StateBlock()

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "MapLocateControl"
Cohesion: 0.29
Nodes (5): LeafletMarker, MapLocateControl(), MapLocatePulseIcon(), MapMarker(), useDebounceLoadingState()

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

### Community 115 - "getAuditValidator"
Cohesion: 0.25
Nodes (9): LightingAuditPage(), Props, AuditValidationDetailPage(), parseStep(), Props, ValidationStep, getAuditValidator(), getValidationAudit() (+1 more)

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

### Community 120 - "get-history.ts"
Cohesion: 0.29
Nodes (6): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, HistoryItem, HistoryResponse

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "ImportUserCsvDialog"
Cohesion: 0.43
Nodes (8): checkExistingEmails(), importUsersBulk(), ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv(), parseCsvLine()

### Community 124 - "result-skeleton.tsx"
Cohesion: 0.60
Nodes (3): AuditResultLoading(), DemoResultLoading(), AuditResultSkeleton()

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "save-ac-estimation-log.ts"
Cohesion: 0.47
Nodes (5): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "store-combobox.tsx"
Cohesion: 0.47
Nodes (4): searchStoresAction(), StoreCombobox(), StoreComboboxProps, StoreComboboxTrigger()

### Community 132 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 133 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 134 - "generate-lamp-simulation.js"
Cohesion: 0.83
Nodes (3): calcSimetris(), evaluateStatus(), run()

### Community 139 - "export-store-data.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

### Community 141 - "MapDrawControl"
Cohesion: 0.31
Nodes (9): ButtonGroup(), buttonGroupVariants, MapControlContainer(), MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapSearchControl() (+1 more)

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1019 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `Master Data Queries`, `prisma.ts`, `save-ac-estimation-log.ts`, `Input`, `Equipment Admin Queries`, `CardContent`, `Header`, `admin-equipment-table.tsx`, `Package & ESLint Config`, `Admin Audit Queries`, `Store Admin Queries`, `filters.tsx`, `audit-validation.ts`, `utils.ts`, `Branch Audit Summaries`, `admin-shell.tsx`, `step-input.tsx`, `admin-master-equipment-table.tsx`, `lighting-audit-form.tsx`, `store-mep-simulator-client.tsx`, `step-equipment.tsx`, `Button`, `requireAdmin`, `Admin Audit Detail Page`, `Admin Dashboard Page`, `Admin Store Detail Page`, `light-estimation-client.tsx`, `Audit Result & Metric Cards`, `Root Layout & Theme`, `react`, `Badge`, `reports/export/route.ts`, `step3.tsx`, `admin-audits-table.tsx`, `result-db.tsx`, `admin-audit-filters.tsx`, `route.spec.ts`, `start-client.tsx`, `prisma`, `kategori/page.tsx`, `AdminMasterStoresTable`, `field.tsx`, `Audit Detail Export`, `getAuditValidator`, `audit-validation-queries.ts`, `getAuditValidator`, `get-history.ts`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Master Data Queries` be split into smaller, more focused modules?**
  _Cohesion score 0.05359831376091539 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `Master Data Queries`, `CardContent`, `Input`, `Equipment Admin Queries`, `store-combobox.tsx`, `Header`, `admin-equipment-table.tsx`, `map.tsx`, `simple-time-picker.tsx`, `MapDrawControl`, `filters.tsx`, `utils.ts`, `admin-shell.tsx`, `Dashboard Charts`, `step-input.tsx`, `admin-master-equipment-table.tsx`, `lighting-audit-form.tsx`, `step-equipment.tsx`, `Button`, `Admin Audit Detail Page`, `Admin Store Detail Page`, `Audit Result & Metric Cards`, `Root Layout & Theme`, `react`, `Badge`, `step3.tsx`, `result-db.tsx`, `Map Picker`, `kategori/page.tsx`, `AdminMasterStoresTable`, `field.tsx`, `next`, `useLeaflet`, `MapLocateControl`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `prisma.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08826945412311266 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._