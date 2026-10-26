# Graph Report - sparta-energy  (2026-10-26)

## Corpus Check
- 375 files · ~514,725 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 2895 nodes · 8285 edges · 153 communities (141 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 71 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b02d0048`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin-master-data-queries.ts
- auth.ts
- start-client.tsx
- Input
- Equipment Admin Queries
- Card
- Report Export Queries
- admin-users-table.tsx
- map.tsx
- Package & ESLint Config
- AdminUserFilters
- Admin Audit Queries
- Runtime Dependencies
- result-db.tsx
- reports/page.tsx
- AC Layout Tool (/ac-layout)
- prisma.ts
- lighting-audit.ts
- CAD Import & AC Optimizer
- dropdown-menu.tsx
- audit-validation.ts
- sheet.tsx
- Branch Audit Summaries
- admin-shell.tsx
- Dashboard Charts
- step-equipment.tsx
- lib/admin-gap-filter.ts
- cn
- AdminStoreFilters
- store-mep-simulator-client.tsx
- sync-stores.ts
- field.tsx
- Dev Dependencies
- Input
- admin-user-queries.ts
- shadcn components.json
- Admin Audit Detail Page
- Admin Dashboard Page
- Badge
- admin-master-data-mutations.ts
- light-estimation-client.tsx
- ac-mapping-client.tsx
- admin-store-detail.ts
- TypeScript Config
- Root Layout & Theme
- Button
- DB Pool & Scripts
- Lamp Simulation Scripts
- Styling & Theming Rules
- admin-store-queries.ts
- Tone & Voice
- admin-equipment-filters.tsx
- step2-detail.tsx
- step3.tsx
- antislop-layoutmobile
- admin-calculator-queries.ts
- useLeaflet
- filters.tsx
- admin-stores-table.tsx
- Changelog - Lamp Estimation Calculator
- contrast-check.py
- lighting-audit-form.tsx
- Map Picker
- shadcn Forms & Composition
- next
- UploadThing File Upload
- kategori/page.tsx
- get-history.ts
- npm Scripts
- ImportUserCsvDialog
- generate-lamp-analysis.js
- shadcn CLI & MCP
- Deploy Pipeline & Agent Guides
- Audit Domain Concepts
- admin-master-equipment-table.tsx
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
- mep-layout-canvas-preview.tsx
- dotenv
- admin-entry/page.tsx
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- place-autocomplete.tsx
- PWA Icon Set
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
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
- MapDrawControl
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- hash-password.ts
- Group 3: Quality Locks (consistency)
- antislop
- Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring
- @prisma/client
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- step-skeleton.tsx
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- mep-simulation-actions.ts
- The Craftsmanship Standard
- iot-status.ts
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- admin-audit-filters.tsx
- admin-audit-date-filter.ts
- admin-equipment-table.tsx
- save-ac-estimation-log.ts
- admin-master-stores-table.tsx
- export-store-data.ts
- AdminMasterEquipmentFilters
- lighting-audit.test.ts
- store-combobox.tsx
- admin-dashboard-filters.tsx
- route.spec.ts
- admin-report-filters.tsx
- reports/export/route.ts
- Disaster Engine & Store Impact Verification Flow
- avatar.tsx
- Store Coordinates Sync Plan
- AdminAuditFilters
- MapLocateControl
- generate-lamp-simulation.js

## God Nodes (most connected - your core abstractions)
1. `cn()` - 302 edges
2. `Button()` - 167 edges
3. `react` - 121 edges
4. `next` - 118 edges
5. `@tabler/icons-react` - 106 edges
6. `Badge()` - 75 edges
7. `Card()` - 65 edges
8. `Header()` - 60 edges
9. `Input()` - 60 edges
10. `CardHeader()` - 56 edges

## Surprising Connections (you probably didn't know these)
- `parseCoordinates` --conceptually_related_to--> `parseStoreSheetRows()`  [AMBIGUOUS]
  docs/store_coordinates_plan.md → lib/jobs/sync-stores.ts
- `4. Pekerjaan di smart-energy-monitoring` --references--> `getSangatBorosStores()`  [INFERRED]
  docs/integrasi-sangat-boros-monitoring.md → lib/admin-sangat-boros.ts
- `3. Pekerjaan di sparta-energy` --references--> `isSangatBorosAudit()`  [INFERRED]
  docs/integrasi-sangat-boros-monitoring.md → lib/audit-validation-queries.ts
- `parseStoreSheetRows()` --implements--> `Store Google Sheet Contract (header aliases, normalization)`  [EXTRACTED]
  lib/jobs/sync-stores.ts → docs/superpowers/specs/2026-07-23-store-sync-cron-design.md
- `Insert-Only Idempotent Store Sync` --rationale_for--> `syncStoresFromSheet()`  [EXTRACTED]
  docs/superpowers/specs/2026-07-23-store-sync-cron-design.md → lib/jobs/sync-stores.ts

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

## Communities (153 total, 12 thin omitted)

### Community 0 - "admin-master-data-queries.ts"
Cohesion: 0.06
Nodes (71): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+63 more)

### Community 1 - "auth.ts"
Cohesion: 0.10
Nodes (15): ActionResult, SaveLightEstimationPayload, SaveLightEstimationResult, excludedBranchNames, excludedBranchNames, GET(), isAdmin(), GET (+7 more)

### Community 2 - "start-client.tsx"
Cohesion: 0.12
Nodes (23): getStoreByCodeAction(), AuditStartClient(), AuditStepNavigate, AuditStepNavigateOptions, AuditStepTarget, Props, DemoPage(), DemoResultPage() (+15 more)

### Community 3 - "Input"
Cohesion: 0.12
Nodes (30): deleteAudit(), getAuditHistory(), getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), handleConfirmDelete() (+22 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (48): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+40 more)

### Community 5 - "Card"
Cohesion: 0.06
Nodes (72): AcEstimationLoading(), AuditResultLoading(), EnergyAuditError(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationError(), AuditValidationDetailLoading(), AuditValidationLoading() (+64 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.13
Nodes (34): addCommonWhere(), AdminReportColumn, AdminReportDataset, AdminReportStatus, buildAuditHistoryDataset(), buildBranchSummaryDataset(), buildEquipmentDataset(), buildStoreDataDataset() (+26 more)

### Community 7 - "admin-users-table.tsx"
Cohesion: 0.13
Nodes (23): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+15 more)

### Community 8 - "map.tsx"
Cohesion: 0.07
Nodes (38): LeafletCircle, LeafletCircleMarker, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon, LeafletPolyline, LeafletPopup (+30 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.04
Nodes (45): eslintConfig, name, packageManager, prisma, seed, private, type, version (+37 more)

### Community 10 - "AdminUserFilters"
Cohesion: 0.16
Nodes (19): AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams(), dateToTimeStr() (+11 more)

### Community 11 - "Admin Audit Queries"
Cohesion: 0.09
Nodes (45): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+37 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "result-db.tsx"
Cohesion: 0.14
Nodes (19): AuditResultPage(), AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore, AuditValidationInfo (+11 more)

### Community 14 - "reports/page.tsx"
Cohesion: 0.16
Nodes (20): GET(), isAdmin(), AdminReportsPage(), formatNumber(), getExportHref(), getPreviewHref(), ReportCard, reportCards (+12 more)

### Community 15 - "AC Layout Tool (/ac-layout)"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "prisma.ts"
Cohesion: 0.09
Nodes (19): ActionResult, hashPassword(), ImportUserInput, GET(), Props, AuditStartPage(), excludedBranchNames, AuditValidationDetailPage() (+11 more)

### Community 17 - "lighting-audit.ts"
Cohesion: 0.10
Nodes (36): saveLightingAudit(), SaveResult, cellTone, cellAverage(), numberFormat, averageLux(), calculateLpd(), createDefaultLuxRows() (+28 more)

### Community 18 - "CAD Import & AC Optimizer"
Cohesion: 0.10
Nodes (32): PlacedAcUnit, ValidWallSpan, WallSegment, HistorySnapshot, PerimeterPathResult, WallSegment, ZoneSpanResult, CadImportDialogProps (+24 more)

### Community 19 - "dropdown-menu.tsx"
Cohesion: 0.23
Nodes (16): HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup() (+8 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.12
Nodes (34): ActionResult, addAuditItem(), AddAuditItemInput, areaTargets, AuditTechnicalInput, checkItemFields(), checkTechnical(), deleteAuditItem() (+26 more)

### Community 21 - "sheet.tsx"
Cohesion: 0.26
Nodes (9): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle() (+1 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "admin-shell.tsx"
Cohesion: 0.07
Nodes (50): AdminHeaderActions(), AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminSiteHeader() (+42 more)

### Community 24 - "Dashboard Charts"
Cohesion: 0.13
Nodes (21): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+13 more)

### Community 25 - "step-equipment.tsx"
Cohesion: 0.07
Nodes (57): AboutPage(), InfoRow(), AreaKey, areaLabels, areaOrder, formatHours(), formatKwh(), numberFormat (+49 more)

### Community 26 - "lib/admin-gap-filter.ts"
Cohesion: 0.29
Nodes (10): AdminLayout(), getAdminGapFilterEnabled, getAdminGapHiddenCount(), gapFilteredAuditIdsSql(), getSangatBorosAuditIdsSql(), getSangatBorosStores(), SangatBorosStore, ADMIN_GAP_FILTER_COOKIE (+2 more)

### Community 27 - "cn"
Cohesion: 0.12
Nodes (28): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+20 more)

### Community 28 - "AdminStoreFilters"
Cohesion: 0.53
Nodes (6): AdminStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 29 - "store-mep-simulator-client.tsx"
Cohesion: 0.10
Nodes (38): deleteMepSimulationLog(), getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation() (+30 more)

### Community 30 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 31 - "field.tsx"
Cohesion: 0.09
Nodes (26): Brand, BrandComboboxProps, ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, FieldContent(), FieldError() (+18 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "Input"
Cohesion: 0.16
Nodes (32): BranchCombobox(), BranchComboboxProps, AdminMasterStoreDialog(), AdminMasterStoreDialogProps, AdminReportActions(), handleOpenChange(), loadPreview(), AdminReportActionsProps (+24 more)

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.15
Nodes (27): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+19 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "Admin Audit Detail Page"
Cohesion: 0.13
Nodes (26): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+18 more)

### Community 37 - "Admin Dashboard Page"
Cohesion: 0.13
Nodes (24): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+16 more)

### Community 38 - "Badge"
Cohesion: 0.13
Nodes (25): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.24
Nodes (20): ApiMutationResult, areaTargets, createMasterEquipment(), createMasterStore(), deleteMasterEquipment(), deleteMasterStore(), deleteUploadThingFile(), getBoolean() (+12 more)

### Community 40 - "light-estimation-client.tsx"
Cohesion: 0.12
Nodes (30): getRabData(), saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), SHAPES, SnapGuide (+22 more)

### Community 41 - "ac-mapping-client.tsx"
Cohesion: 0.10
Nodes (34): AcMappingClient(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim(), getCashierZonePolygon() (+26 more)

### Community 42 - "admin-store-detail.ts"
Cohesion: 0.17
Nodes (13): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getAdminStoreDetail(), getBrandName(), getEquipmentName(), isNonNegativeNumber() (+5 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (17): dynamic, fontMono, geist, metadata, RootLayout(), viewport, OfflineIndicator(), isPlainLeftClick() (+9 more)

### Community 45 - "Button"
Cohesion: 0.12
Nodes (18): LoginPage(), LoginToastNotice(), AdminEquipmentFiltersProps, areaOptions, filterParamKeys, filterParamKeySet, AdminMasterStoreFiltersProps, filterParamKeys (+10 more)

### Community 46 - "DB Pool & Scripts"
Cohesion: 0.23
Nodes (11): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, escapeCsv(), main(), pool (+3 more)

### Community 47 - "Lamp Simulation Scripts"
Cohesion: 0.15
Nodes (11): SimetrisResult, calcSimetris(), evaluateStatus(), run(), pool, test(), testFile(), dxfContent (+3 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.10
Nodes (40): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, getAdminGapFilterSql() (+32 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "admin-equipment-filters.tsx"
Cohesion: 0.53
Nodes (6): AdminEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 52 - "step2-detail.tsx"
Cohesion: 0.11
Nodes (27): AcEstimationClient(), AcEstimationClientProps, MapPicker, EstimationResultCard(), EstimationResultCardData, Props, Row(), BrandCombobox() (+19 more)

### Community 53 - "step3.tsx"
Cohesion: 0.09
Nodes (36): getDemoAiRecommendation(), deleteAuditDraft(), getAuditDraft(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), submitAudit() (+28 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 56 - "useLeaflet"
Cohesion: 0.15
Nodes (17): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+9 more)

### Community 57 - "filters.tsx"
Cohesion: 0.20
Nodes (15): FilterI18nConfig, FilterOperator, FilterOption, Filters(), FiltersProps, getFieldMap(), getValueLabel(), removeFilter() (+7 more)

### Community 58 - "admin-stores-table.tsx"
Cohesion: 0.18
Nodes (17): AdminStoresTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getStatus() (+9 more)

### Community 59 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.18
Nodes (10): Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1), KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0) (+2 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "lighting-audit-form.tsx"
Cohesion: 0.11
Nodes (17): dateFormat, LightingAuditFormProps, lpdTone, luxTone, newId(), numberFormat, parseNumber(), StatusBadge() (+9 more)

### Community 62 - "Map Picker"
Cohesion: 0.26
Nodes (11): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+3 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "next"
Cohesion: 0.11
Nodes (21): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, deleteUser(), DeleteUserInput, ActionResult (+13 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "kategori/page.tsx"
Cohesion: 0.19
Nodes (19): dateFormat, EnergyAuditListPage(), first(), pageHref(), Props, ValidationStoreList(), ValidationStoreListProps, AuditCard() (+11 more)

### Community 67 - "get-history.ts"
Cohesion: 0.25
Nodes (7): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, HistoryItem, HistoryResponse, ActionError

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "ImportUserCsvDialog"
Cohesion: 0.36
Nodes (9): checkExistingEmails(), importUsersBulk(), CsvUserRow, ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv() (+1 more)

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

### Community 74 - "admin-master-equipment-table.tsx"
Cohesion: 0.11
Nodes (26): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterEquipmentTable(), SortableHeader() (+18 more)

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
Cohesion: 0.16
Nodes (21): GET(), Context, GET(), buildEnergyAuditRecapWorkbook(), LightingAudit, STATUS_LABEL, StatusRow, getEnergyAuditStatusRows() (+13 more)

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
Nodes (14): LightingAuditPage(), Props, getAuditValidator(), activeStoreSql, areaToZone, ENERGY_AUDIT_PAGE_SIZE, EnergyAuditListRow, EnergyAuditStore (+6 more)

### Community 88 - "mep-layout-canvas-preview.tsx"
Cohesion: 0.14
Nodes (20): checkLampObstacle(), formatDim(), getCashierZonePolygon(), getMaxInwardDepth(), getStoreScaleInfo(), MepFloorPlanCanvasPreview(), MepFloorPlanCanvasPreviewProps, PlacedAcUnit (+12 more)

### Community 89 - "dotenv"
Cohesion: 0.15
Nodes (11): dotenv, prisma, @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma (+3 more)

### Community 90 - "admin-entry/page.tsx"
Cohesion: 0.09
Nodes (29): AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), AuditValidationPage(), pageHref(), Props (+21 more)

### Community 91 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.29
Nodes (7): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator, saveAcEstimationLog, saveLightEstimationLog

### Community 92 - "place-autocomplete.tsx"
Cohesion: 0.16
Nodes (18): Command(), CommandEmpty(), CommandGroup(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut(), buildSearchUrl() (+10 more)

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

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

### Community 115 - "MapDrawControl"
Cohesion: 0.21
Nodes (12): LeafletFeatureGroup, LeafletLayerGroup, MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapFeatureGroup(), MapLayerGroup() (+4 more)

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

### Community 123 - "Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring"
Cohesion: 0.22
Nodes (8): 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 3. Pekerjaan di sparta-energy, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka, Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring, isSangatBorosAudit()

### Community 124 - "@prisma/client"
Cohesion: 0.22
Nodes (11): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, formatGap(), AuditStatusBadge(), EnergyAuditCategoryStatusList(), EnergyAuditCategoryStatusListProps (+3 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "step-skeleton.tsx"
Cohesion: 0.36
Nodes (9): AuditStepSkeleton(), AuditStepSkeletonProps, AuditStepSkeletonVariant, skeletonLabels, Step1Skeleton(), Step2DetailSkeleton(), Step2Skeleton(), Step3Skeleton() (+1 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "mep-simulation-actions.ts"
Cohesion: 0.15
Nodes (14): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, getMepSimulationDetail(), MepSimulationListFilter, SaveMepSimulationPayload, SaveMepSimulationResult (+6 more)

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "iot-status.ts"
Cohesion: 0.18
Nodes (14): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), isAdminSangatBoros(), buildIotLookup(), getStoreIot() (+6 more)

### Community 132 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 133 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 134 - "admin-audit-filters.tsx"
Cohesion: 0.20
Nodes (12): AdminAuditFiltersProps, filterParamKeys, filterParamKeySet, monthOptions, iotFilterField, priorityFilterField, validationFilterField, AdminStoreFiltersProps (+4 more)

### Community 135 - "admin-audit-date-filter.ts"
Cohesion: 0.43
Nodes (6): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear()

### Community 136 - "admin-equipment-table.tsx"
Cohesion: 0.24
Nodes (11): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+3 more)

### Community 137 - "save-ac-estimation-log.ts"
Cohesion: 0.47
Nodes (5): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult

### Community 138 - "admin-master-stores-table.tsx"
Cohesion: 0.19
Nodes (10): AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate(), formatHours(), formatNumber(), getCompleteness(), getNextSortOrder() (+2 more)

### Community 139 - "export-store-data.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

### Community 140 - "AdminMasterEquipmentFilters"
Cohesion: 0.27
Nodes (10): AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminMasterEquipmentFiltersProps, filterParamKeys, filterParamKeySet (+2 more)

### Community 141 - "lighting-audit.test.ts"
Cohesion: 0.14
Nodes (10): LightingAuditData, LightingZoneKey, csv, data, empty, explained, legacy, sales (+2 more)

### Community 142 - "store-combobox.tsx"
Cohesion: 0.22
Nodes (9): AcMappingClientProps, searchStoresAction(), StoreData, LightEstimationClientProps, StoreMepSimulatorClientProps, StoreCombobox(), StoreComboboxProps, StoreComboboxTrigger() (+1 more)

### Community 143 - "admin-dashboard-filters.tsx"
Cohesion: 0.24
Nodes (10): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminDashboardFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+2 more)

### Community 144 - "route.spec.ts"
Cohesion: 0.27
Nodes (7): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet()

### Community 145 - "admin-report-filters.tsx"
Cohesion: 0.27
Nodes (9): AdminReportFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminReportFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+1 more)

### Community 146 - "reports/export/route.ts"
Cohesion: 0.36
Nodes (6): GET(), isAdmin(), applyColumnFormats(), buildWorkbookBuffer(), getColumnWidths(), xlsx

### Community 147 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 148 - "avatar.tsx"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 149 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 150 - "AdminAuditFilters"
Cohesion: 0.53
Nodes (6): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 151 - "MapLocateControl"
Cohesion: 0.33
Nodes (4): MapControlContainer(), MapLocateControl(), MapSearchControl(), MapZoomControl()

### Community 152 - "generate-lamp-simulation.js"
Cohesion: 0.83
Nodes (3): calcSimetris(), evaluateStatus(), run()

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1047 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `admin-master-data-queries.ts`, `mep-simulation-actions.ts`, `auth.ts`, `start-client.tsx`, `Equipment Admin Queries`, `Card`, `Input`, `admin-audit-filters.tsx`, `admin-users-table.tsx`, `save-ac-estimation-log.ts`, `admin-equipment-table.tsx`, `Admin Audit Queries`, `AdminMasterEquipmentFilters`, `admin-master-stores-table.tsx`, `reports/page.tsx`, `admin-dashboard-filters.tsx`, `prisma.ts`, `lighting-audit.ts`, `reports/export/route.ts`, `route.spec.ts`, `audit-validation.ts`, `admin-report-filters.tsx`, `Branch Audit Summaries`, `admin-shell.tsx`, `dropdown-menu.tsx`, `step-equipment.tsx`, `lib/admin-gap-filter.ts`, `Input`, `admin-user-queries.ts`, `Admin Audit Detail Page`, `Admin Dashboard Page`, `Badge`, `light-estimation-client.tsx`, `Root Layout & Theme`, `Button`, `Package & ESLint Config`, `admin-store-queries.ts`, `step2-detail.tsx`, `step3.tsx`, `admin-stores-table.tsx`, `lighting-audit-form.tsx`, `kategori/page.tsx`, `get-history.ts`, `result-db.tsx`, `admin-master-equipment-table.tsx`, `getAuditValidator`, `energy-audit-queries.ts`, `admin-entry/page.tsx`, `@prisma/client`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin-master-data-queries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05727605727605728 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `admin-master-data-queries.ts`, `start-client.tsx`, `Input`, `Equipment Admin Queries`, `Card`, `admin-users-table.tsx`, `admin-equipment-table.tsx`, `map.tsx`, `admin-master-stores-table.tsx`, `AdminUserFilters`, `result-db.tsx`, `store-combobox.tsx`, `lighting-audit.ts`, `dropdown-menu.tsx`, `avatar.tsx`, `sheet.tsx`, `admin-shell.tsx`, `Dashboard Charts`, `step-equipment.tsx`, `MapLocateControl`, `field.tsx`, `Input`, `Admin Audit Detail Page`, `Badge`, `Root Layout & Theme`, `Button`, `step2-detail.tsx`, `step3.tsx`, `useLeaflet`, `filters.tsx`, `admin-stores-table.tsx`, `lighting-audit-form.tsx`, `Map Picker`, `kategori/page.tsx`, `admin-master-equipment-table.tsx`, `admin-entry/page.tsx`, `place-autocomplete.tsx`, `MapDrawControl`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10256410256410256 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._