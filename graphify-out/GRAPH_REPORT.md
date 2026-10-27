# Graph Report - sparta-energy  (2026-10-27)

## Corpus Check
- 397 files · ~527,704 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3056 nodes · 8939 edges · 150 communities (139 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7766d662`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin-master-data-queries.ts
- index.ts
- audit-validation-queries.ts
- Input
- Equipment Admin Queries
- Header
- Report Export Queries
- admin-users-table.tsx
- map.tsx
- Package & ESLint Config
- calculator-logs-client.tsx
- audits/data/route.ts
- Runtime Dependencies
- validation-summary.tsx
- admin-master-equipment-dialog.tsx
- AC Layout Tool (/ac-layout)
- create-user.ts
- lighting-audit.ts
- CAD Import & AC Optimizer
- Card
- audit-validation.ts
- sidebar.tsx
- Branch Audit Summaries
- admin-shell.tsx
- Dashboard Charts
- step3.tsx
- lib/admin-gap-filter.ts
- cn
- next
- store-mep-simulator-client.tsx
- item-form-dialog.tsx
- Button
- Dev Dependencies
- Button
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
- utils.ts
- DB Pool & Scripts
- ref_path
- Styling & Theming Rules
- admin-store-queries.ts
- Tone & Voice
- start-client.tsx
- step2-detail.tsx
- submit-audit.ts
- antislop-layoutmobile
- admin-calculator-queries.ts
- mep-layout-canvas-preview.tsx
- admin-audit-filters.tsx
- admin-audit-date-filter.ts
- Changelog - Lamp Estimation Calculator
- contrast-check.py
- lighting-audit-form.tsx
- AdminStoreFilters
- shadcn Forms & Composition
- prisma.ts
- UploadThing File Upload
- kategori/page.tsx
- role-access.ts
- npm Scripts
- reports/page.tsx
- getAuditValidator
- shadcn CLI & MCP
- Deploy Pipeline & Agent Guides
- Audit Domain Concepts
- Badge
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
- Badge
- admin-entry/page.tsx
- change-user-role.ts
- state-block.tsx
- admin-user-import-dialog.tsx
- calculator-versions.ts
- PWA Icon Set
- filters.tsx
- MapDrawControl
- Audit Export Script
- admin-equipment-table.tsx
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
- MapDrawShapeButton
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- simple-time-picker.tsx
- Group 3: Quality Locks (consistency)
- antislop
- sync-stores.ts
- create-admin-user.ts
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- CardContent
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- prisma.ts
- The Craftsmanship Standard
- iot-status.ts
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- map-picker.tsx
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- AdminMasterEquipmentTable
- AdminDashboardFilters
- route.spec.ts
- export-store-data.ts
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- technical-form.tsx
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- store-combobox.tsx
- tabs.tsx
- Disaster Engine & Store Impact Verification Flow
- Store Coordinates Sync Plan
- Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring
- dotenv
- generate-lamp-simulation.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 304 edges
2. `Button()` - 170 edges
3. `react` - 124 edges
4. `next` - 118 edges
5. `@tabler/icons-react` - 109 edges
6. `Badge()` - 79 edges
7. `Card()` - 67 edges
8. `Input()` - 64 edges
9. `Header()` - 60 edges
10. `CardHeader()` - 58 edges

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

## Communities (150 total, 11 thin omitted)

### Community 0 - "admin-master-data-queries.ts"
Cohesion: 0.07
Nodes (56): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+48 more)

### Community 1 - "index.ts"
Cohesion: 0.14
Nodes (26): createFolder(), driveFetch(), DriveFile, ensureFolder(), escapeQuery(), findCityFolder(), findStoreFolder(), folderCache (+18 more)

### Community 2 - "audit-validation-queries.ts"
Cohesion: 0.07
Nodes (32): LightingAuditPage(), Props, 3. Pekerjaan di sparta-energy, activeStoreSql, firstValue(), isSangatBorosAudit(), latestAuditPerStore, parseValidationFilters() (+24 more)

### Community 3 - "Input"
Cohesion: 0.12
Nodes (34): getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), CreateUserDialog(), handleRoleChange(), EditUserDialog() (+26 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.10
Nodes (45): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+37 more)

### Community 5 - "Header"
Cohesion: 0.08
Nodes (40): AcEstimationLoading(), AuditResultLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationLoading(), AuditValidationPage(), pageHref(), Props (+32 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.10
Nodes (46): defaultMasterEquipmentSort, defaultMasterStoreSort, MasterEquipmentFilters, addCommonWhere(), AdminReportCellValue, AdminReportStatus, allMasterEquipmentFilters, buildAdminReportDataset() (+38 more)

### Community 7 - "admin-users-table.tsx"
Cohesion: 0.10
Nodes (30): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+22 more)

### Community 8 - "map.tsx"
Cohesion: 0.06
Nodes (39): LeafletCircle, LeafletCircleMarker, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon, LeafletPolyline, LeafletPopup (+31 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.05
Nodes (43): eslintConfig, name, packageManager, prisma, seed, private, type, version (+35 more)

### Community 10 - "calculator-logs-client.tsx"
Cohesion: 0.20
Nodes (16): AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams(), CalculatorLogsClient() (+8 more)

### Community 11 - "audits/data/route.ts"
Cohesion: 0.09
Nodes (44): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+36 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "validation-summary.tsx"
Cohesion: 0.27
Nodes (13): formatKwh(), Comparison(), dateFormat, statusLabel(), ValidationPreview, ValidationSummary(), ValidationSummaryProps, OfflineIndicator() (+5 more)

### Community 14 - "admin-master-equipment-dialog.tsx"
Cohesion: 0.16
Nodes (16): AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminMasterEquipmentFiltersProps (+8 more)

### Community 15 - "AC Layout Tool (/ac-layout)"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "create-user.ts"
Cohesion: 0.13
Nodes (12): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, checkExistingEmails(), hashPassword(), ImportUserInput (+4 more)

### Community 17 - "lighting-audit.ts"
Cohesion: 0.06
Nodes (46): cellTone, cellAverage(), numberFormat, averageLux(), calculateLpd(), createDefaultLuxRows(), createEmptyLightingAudit(), DEFAULT_LUX_ROWS (+38 more)

### Community 18 - "CAD Import & AC Optimizer"
Cohesion: 0.08
Nodes (38): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+30 more)

### Community 19 - "Card"
Cohesion: 0.23
Nodes (23): AuditValidationDetailLoading(), AdminMetricCard(), AdminMetricTone, metricToneStyles, CorrectionEntry, CorrectionHistory(), dateTimeFormat, AcEstimationCard() (+15 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.08
Nodes (48): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+40 more)

### Community 21 - "sidebar.tsx"
Cohesion: 0.15
Nodes (19): compressPhoto(), LuxPhotoContext, LuxRowPhotos(), remove(), upload(), LuxRowPhotosProps, photoUrl(), WebcamCapture() (+11 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "admin-shell.tsx"
Cohesion: 0.06
Nodes (65): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps (+57 more)

### Community 24 - "Dashboard Charts"
Cohesion: 0.07
Nodes (38): AuditResultPage(), DemoResultPage(), consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK() (+30 more)

### Community 25 - "step3.tsx"
Cohesion: 0.14
Nodes (22): getDemoAiRecommendation(), submitAudit(), toAreaTarget(), AreaTarget, AuditStep3(), handleSubmit(), AuditStep3Props, buildDemoAuditResult() (+14 more)

### Community 26 - "lib/admin-gap-filter.ts"
Cohesion: 0.25
Nodes (13): getAdminGapFilterEnabled, getAdminGapFilterSql(), getAdminGapHiddenCount(), gapFilteredAuditIdsSql(), getSangatBorosAuditIdsSql(), getSangatBorosStores(), SangatBorosStore, getAdminStoreCount() (+5 more)

### Community 27 - "cn"
Cohesion: 0.08
Nodes (47): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+39 more)

### Community 28 - "next"
Cohesion: 0.16
Nodes (11): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditItem, RecentAuditSection(), RecentAuditSectionProps, RecentAuditStatus (+3 more)

### Community 29 - "store-mep-simulator-client.tsx"
Cohesion: 0.12
Nodes (32): getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle() (+24 more)

### Community 30 - "item-form-dialog.tsx"
Cohesion: 0.11
Nodes (25): AddEquipmentDialogProps, areaCategory, recordedQty(), EquipmentListProps, FormState, AreaKey, areaLabels, areaOrder (+17 more)

### Community 31 - "Button"
Cohesion: 0.12
Nodes (19): LoginPage(), LoginToastNotice(), BranchCombobox(), BranchComboboxProps, AdminMasterCategoriesListProps, CategoryItem, numberFormat, AdminMasterStoreDialogProps (+11 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "Button"
Cohesion: 0.16
Nodes (37): numberFormat, AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoreExportFilterProps, numberFormat, AdminReportActions(), handleOpenChange(), loadPreview() (+29 more)

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.15
Nodes (27): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+19 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "Admin Audit Detail Page"
Cohesion: 0.13
Nodes (24): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 37 - "Admin Dashboard Page"
Cohesion: 0.12
Nodes (25): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+17 more)

### Community 38 - "Badge"
Cohesion: 0.13
Nodes (25): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.12
Nodes (33): ActionResult, deleteUser(), DeleteUserInput, AdminLayout(), DELETE(), PUT(), POST(), DELETE() (+25 more)

### Community 40 - "light-estimation-client.tsx"
Cohesion: 0.12
Nodes (30): getRabData(), saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), SHAPES, SnapGuide (+22 more)

### Community 41 - "ac-mapping-client.tsx"
Cohesion: 0.11
Nodes (32): AcMappingClient(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim(), getCashierZonePolygon() (+24 more)

### Community 42 - "admin-store-detail.ts"
Cohesion: 0.17
Nodes (13): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getAdminStoreDetail(), getBrandName(), getEquipmentName(), isNonNegativeNumber() (+5 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "utils.ts"
Cohesion: 0.11
Nodes (20): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, FieldSeparator(), ItemSeparator(), MapZoomControl(), PopoverDescription() (+12 more)

### Community 46 - "DB Pool & Scripts"
Cohesion: 0.20
Nodes (11): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, adapter, pool, prisma (+3 more)

### Community 47 - "ref_path"
Cohesion: 0.13
Nodes (11): calcSimetris(), evaluateStatus(), run(), fmt(), main(), url, pool, dxfContent (+3 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.11
Nodes (36): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, AdminStoreFilters (+28 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "start-client.tsx"
Cohesion: 0.14
Nodes (17): getStoreByCodeAction(), AuditStartClient(), AuditStepNavigate, AuditStepNavigateOptions, AuditStepTarget, Props, AuditValidationDetailPage(), Props (+9 more)

### Community 52 - "step2-detail.tsx"
Cohesion: 0.15
Nodes (22): AcEstimationClient(), AcEstimationClientProps, MapPicker, AuditStep2Detail(), CATEGORY_ICONS, EquipmentItem, EquipmentRow(), EquipmentRowProps (+14 more)

### Community 53 - "submit-audit.ts"
Cohesion: 0.10
Nodes (26): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, getAuditHistory(), HistoryItem, HistoryResponse, deleteAuditDraft() (+18 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 56 - "mep-layout-canvas-preview.tsx"
Cohesion: 0.15
Nodes (19): checkLampObstacle(), formatDim(), getCashierZonePolygon(), getMaxInwardDepth(), getStoreScaleInfo(), MepFloorPlanCanvasPreview(), MepFloorPlanCanvasPreviewProps, PlacedAcUnit (+11 more)

### Community 57 - "admin-audit-filters.tsx"
Cohesion: 0.06
Nodes (51): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+43 more)

### Community 58 - "admin-audit-date-filter.ts"
Cohesion: 0.31
Nodes (8): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear(), addAuditWhereAnd(), getAdminAuditWhere()

### Community 59 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.18
Nodes (10): Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1), KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0) (+2 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "lighting-audit-form.tsx"
Cohesion: 0.09
Nodes (31): saveLightingAudit(), SaveResult, Brand, BrandCombobox(), BrandComboboxProps, AuditStepIndicator(), AuditStepIndicatorProps, StepActionBar() (+23 more)

### Community 62 - "AdminStoreFilters"
Cohesion: 0.53
Nodes (6): AdminStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "prisma.ts"
Cohesion: 0.13
Nodes (10): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult, Props, dbPool, globalForPrisma (+2 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "kategori/page.tsx"
Cohesion: 0.15
Nodes (27): EnergyAuditStorePage(), dateFormat, EnergyAuditListPage(), first(), pageHref(), Props, formatGap(), ResultStatusBadge() (+19 more)

### Community 67 - "role-access.ts"
Cohesion: 0.14
Nodes (22): ActionResult, updateUser(), UpdateUserInput, GET(), POST(), readSimulatedRole(), handleSubmit(), 12. Status sisi sparta-energy (26 Oktober 2026) (+14 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "reports/page.tsx"
Cohesion: 0.11
Nodes (30): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), AdminReportsPage(), describeList(), describeMasterStoreScope() (+22 more)

### Community 70 - "getAuditValidator"
Cohesion: 0.24
Nodes (13): DELETE(), fail(), GET(), jakartaDate, jakartaTime, POST(), readPhotoParams(), getAuditValidator() (+5 more)

### Community 71 - "shadcn CLI & MCP"
Cohesion: 0.25
Nodes (8): shadcn add Command (dry-run/diff/view), components.json Configuration, shadcn info Command, shadcn CLI Reference, Component Registries (@shadcn, custom), shadcn MCP Server, shadcn Project Context Key Fields, Next.js shadcn Template README

### Community 72 - "Deploy Pipeline & Agent Guides"
Cohesion: 0.25
Nodes (8): Build and Deploy GitHub Workflow, Dokploy Deploy Webhook, GHCR Docker Image (latest), AGENTS.md (Codex Guide), Admin Dashboard & Filters, CLAUDE.md (Claude Code Guide), Demo Mode (demo-session), Sparta Energy Audit System

### Community 73 - "Audit Domain Concepts"
Cohesion: 0.31
Nodes (9): AI Context - SPARTA Energy, Hemat/Boros Store Classification, PLN & STD 6-Month History Input, Waste Source Signals (Pelatihan Tim / Perbaikan Equipment), AI Recommendations (Google GenAI: TRAINING/REPAIR/MAINTENANCE), Audit Creation Wizard Flow, Energy Calculation (dailyKwh = baseKw*qty*hours; monthly = daily*30), Prisma Core Models (User, Store, Audit, AuditItem, EquipmentType, EquipmentBrand, AuditPlnStdHistory, AuditRecommendation) (+1 more)

### Community 74 - "Badge"
Cohesion: 0.19
Nodes (16): AdminStoresTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getStatus() (+8 more)

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
Nodes (28): GET(), Context, GET(), buildEnergyAuditRecapWorkbook(), LightingAudit, STATUS_LABEL, StatusRow, getEnergyAuditStatusRows() (+20 more)

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

### Community 87 - "Badge"
Cohesion: 0.26
Nodes (8): categoryIcons, dateFormat, Props, AuditStatusBadge(), EnergyAuditCategoryStatusList(), EnergyAuditCategoryStatusListProps, ENERGY_AUDIT_CATEGORIES, EnergyAuditCategoryInfo

### Community 88 - "admin-entry/page.tsx"
Cohesion: 0.22
Nodes (10): AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), AdminEntryLogoutButton(), getPendingValidationCount(), getValidationAudits() (+2 more)

### Community 89 - "change-user-role.ts"
Cohesion: 0.33
Nodes (6): @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma

### Community 90 - "state-block.tsx"
Cohesion: 0.25
Nodes (8): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), StateBlock(), StateBlockAction, StateBlockProps

### Community 91 - "admin-user-import-dialog.tsx"
Cohesion: 0.53
Nodes (6): ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv(), parseCsvLine()

### Community 92 - "calculator-versions.ts"
Cohesion: 0.21
Nodes (10): EstimationResultCard(), EstimationResultCardData, Props, Row(), LightEstimationResultCard(), LightEstimationResultCardData, Props, Row() (+2 more)

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "filters.tsx"
Cohesion: 0.14
Nodes (31): AdminHeaderActions(), HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, FilterI18nConfig, FilterOperator, FilterOption (+23 more)

### Community 95 - "MapDrawControl"
Cohesion: 0.21
Nodes (12): LeafletFeatureGroup, LeafletLayerGroup, MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapFeatureGroup(), MapLayerGroup() (+4 more)

### Community 96 - "Audit Export Script"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDate(), main(), pool

### Community 97 - "admin-equipment-table.tsx"
Cohesion: 0.21
Nodes (11): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+3 more)

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

### Community 115 - "MapDrawShapeButton"
Cohesion: 0.15
Nodes (17): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+9 more)

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

### Community 120 - "simple-time-picker.tsx"
Cohesion: 0.23
Nodes (11): dateToTimeStr(), TimeRangeCards(), TimeRangeCardsProps, timeStrToDate(), buildTime(), BuildTimeOptions, SimpleTimeOption, SimpleTimePicker() (+3 more)

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 124 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "CardContent"
Cohesion: 0.23
Nodes (10): AreaItem, areaItems, AuditStep2(), AuditStep2Props, Step2AreaCard(), AuditItem, AuditListSection(), AuditListSectionProps (+2 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "prisma.ts"
Cohesion: 0.09
Nodes (42): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, ActionResult, deleteAudit(), deleteMepSimulationLog(), getMepSimulationDetail() (+34 more)

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "iot-status.ts"
Cohesion: 0.18
Nodes (15): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), isAdminSangatBoros(), buildIotLookup(), getIotStatusLookup() (+7 more)

### Community 132 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 133 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 134 - "map-picker.tsx"
Cohesion: 0.26
Nodes (11): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+3 more)

### Community 135 - "Konsep Akses Role: Admin, Auditor, GS General Service, dan Area"
Cohesion: 0.13
Nodes (14): 10. Keputusan (26 Oktober 2026), 11. Simulasi role untuk testing lokal, 1. Siapa masuk ke mana, 2. Kondisi sekarang, 3. Login: satu cookie untuk semua subdomain, 4. Data izin (di DB 1, dibuat oleh sparta-energy), 5. Pembagian kerja, 6. Alur (+6 more)

### Community 136 - "AdminMasterEquipmentTable"
Cohesion: 0.20
Nodes (6): AdminMasterEquipmentTable(), SortableHeader(), updateSort(), formatDate(), formatNumber(), getNextSortOrder()

### Community 137 - "AdminDashboardFilters"
Cohesion: 0.47
Nodes (6): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), getParam(), DashboardGlobalFilters()

### Community 138 - "route.spec.ts"
Cohesion: 0.27
Nodes (7): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet()

### Community 139 - "export-store-data.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

### Community 140 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.29
Nodes (7): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator, saveAcEstimationLog, saveLightEstimationLog

### Community 141 - "technical-form.tsx"
Cohesion: 0.14
Nodes (20): AboutPage(), InfoRow(), AreaField, areaFields, TechnicalDraft, TechnicalForm(), TechnicalFormProps, UnitInput() (+12 more)

### Community 142 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 143 - "store-combobox.tsx"
Cohesion: 0.25
Nodes (7): AcMappingClientProps, StoreData, LightEstimationClientProps, StoreMepSimulatorClientProps, StoreCombobox(), StoreComboboxProps, StoreComboboxTrigger()

### Community 144 - "tabs.tsx"
Cohesion: 0.50
Nodes (6): AdminMasterDataNav(), Tabs(), TabsList(), tabsListVariants, TabsTrigger(), MasterDataTab

### Community 145 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 146 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 147 - "Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring"
Cohesion: 0.29
Nodes (6): 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka, Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring

### Community 148 - "dotenv"
Cohesion: 0.33
Nodes (5): dotenv, prisma, escapeCsv(), main(), pool

### Community 149 - "generate-lamp-simulation.ts"
Cohesion: 0.60
Nodes (4): SimetrisResult, calcSimetris(), evaluateStatus(), run()

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1088 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `admin-master-data-queries.ts`, `prisma.ts`, `audit-validation-queries.ts`, `Input`, `Equipment Admin Queries`, `Header`, `admin-users-table.tsx`, `Package & ESLint Config`, `route.spec.ts`, `audits/data/route.ts`, `calculator-logs-client.tsx`, `technical-form.tsx`, `admin-master-equipment-dialog.tsx`, `create-user.ts`, `tabs.tsx`, `Card`, `audit-validation.ts`, `Branch Audit Summaries`, `admin-shell.tsx`, `Dashboard Charts`, `step3.tsx`, `lib/admin-gap-filter.ts`, `item-form-dialog.tsx`, `Button`, `Button`, `admin-user-queries.ts`, `Admin Audit Detail Page`, `Admin Dashboard Page`, `Badge`, `admin-master-data-mutations.ts`, `light-estimation-client.tsx`, `Root Layout & Theme`, `admin-store-queries.ts`, `start-client.tsx`, `step2-detail.tsx`, `submit-audit.ts`, `admin-audit-filters.tsx`, `lighting-audit-form.tsx`, `prisma.ts`, `kategori/page.tsx`, `role-access.ts`, `reports/page.tsx`, `Badge`, `getAuditValidator`, `Badge`, `admin-entry/page.tsx`, `state-block.tsx`, `filters.tsx`, `admin-equipment-table.tsx`, `CardContent`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin-master-data-queries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07486338797814207 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `Input`, `Equipment Admin Queries`, `Header`, `map-picker.tsx`, `admin-users-table.tsx`, `AdminMasterEquipmentTable`, `map.tsx`, `calculator-logs-client.tsx`, `validation-summary.tsx`, `admin-master-equipment-dialog.tsx`, `store-combobox.tsx`, `technical-form.tsx`, `lighting-audit.ts`, `tabs.tsx`, `Card`, `sidebar.tsx`, `admin-shell.tsx`, `Dashboard Charts`, `step3.tsx`, `item-form-dialog.tsx`, `Button`, `Button`, `Admin Audit Detail Page`, `Admin Dashboard Page`, `Badge`, `Root Layout & Theme`, `utils.ts`, `step2-detail.tsx`, `lighting-audit-form.tsx`, `kategori/page.tsx`, `Badge`, `admin-entry/page.tsx`, `filters.tsx`, `MapDrawControl`, `MapDrawShapeButton`, `simple-time-picker.tsx`, `CardContent`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14193548387096774 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._