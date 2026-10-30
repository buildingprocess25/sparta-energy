# Graph Report - sparta-energy  (2026-10-30)

## Corpus Check
- 438 files · ~554,388 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3410 nodes · 10142 edges · 168 communities (157 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `528c6fe2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin-audits-table.tsx
- auth.ts
- admin-users-table.tsx
- Input
- Equipment Admin Queries
- Header
- Report Export Queries
- @tabler/icons-react
- map.tsx
- Package & ESLint Config
- Changelog - Lamp Estimation Calculator
- admin-audit-queries.ts
- Runtime Dependencies
- DialogContent
- hvac-audit-export.ts
- AC Mapping Calculator Proposal
- result-db.tsx
- lighting-audit-form.tsx
- prisma
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- cn
- step3.tsx
- prisma.ts
- kategori/page.tsx
- Badge
- Button
- store-mep-simulator-client.tsx
- Point
- Button
- Dev Dependencies
- admin-master-stores-table.tsx
- admin-user-queries.ts
- shadcn components.json
- audits/[id]/page.tsx
- admin/dashboard/page.tsx
- Badge
- admin-master-data-mutations.ts
- light-estimation-client.tsx
- ac-mapping-client.tsx
- cn
- TypeScript Config
- Root Layout & Theme
- lighting-audit-export.ts
- db-utils.ts
- ref_path
- Styling & Theming Rules
- admin-store-queries.ts
- Tone & Voice
- reports/preview/route.ts
- photos/route.ts
- mep-layout-canvas-preview.tsx
- antislop-layoutmobile
- admin-calculator-queries.ts
- gypsum-tile-calculator.ts
- filters.tsx
- validation-summary.tsx
- admin-stores-table.tsx
- contrast-check.py
- admin-master-equipment-table.tsx
- Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring
- shadcn Forms & Composition
- energy-audit-queries.ts
- UploadThing File Upload
- lighting-audit-form.tsx
- AdminMasterStoreFilters
- npm Scripts
- map-picker.tsx
- getAuditValidator
- shadcn CLI & MCP
- Deploy Pipeline & Agent Guides
- Audit Domain Concepts
- Dokumentasi Spesifikasi Kalkulator Plafon Gypsum Tile
- PWA Service Worker
- PWA Manifest
- DOCX Generator Script
- 3-Pillar Ecosystem Architecture
- reports/page.tsx
- Landing Hero Illustration
- antislop-human
- Store Sync Docs & Import
- Prisma Seed
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- admin-shell.tsx
- iot-status.ts
- dotenv
- admin-audit-filters.tsx
- admin-store-detail.ts
- save-draft.ts
- PWA Icon Set
- state-block.tsx
- hvac-audit-export.ts
- get-equipment-for-area.ts
- sidebar.tsx
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
- CardContent
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- scripts/get-temperature.ts
- Group 3: Quality Locks (consistency)
- antislop
- AdminMasterEquipmentFilters
- useLeaflet
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- hvac-audit.ts
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- admin-dashboard-filters.tsx
- The Craftsmanship Standard
- admin-report-filters.tsx
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- export-store-data.ts
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- calculator-versions.ts
- breadcrumb.tsx
- item-form-dialog.tsx
- admin-audit-date-filter.ts
- device-access.ts
- lib/admin-gap-filter.ts
- sync-stores.ts
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- hvac-audit-form.tsx
- step1.tsx
- export-audits.ts
- submit-audit.ts
- app/dashboard/page.tsx
- ai-recommendation.ts
- MapDrawControl
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- create-user.ts
- settings/page.tsx
- energy-audit-export-dialog.tsx
- ac-estimation-client.tsx
- route.spec.ts
- result-skeleton.tsx
- AdminAuditFilters
- Disaster Engine & Store Impact Verification Flow
- AdminEquipmentFilters
- Store Coordinates Sync Plan
- AdminStoreFilters
- master-data/page.tsx
- ImportUserCsvDialog
- generate-lamp-analysis.js
- generate-lamp-simulation.js

## God Nodes (most connected - your core abstractions)
1. `cn()` - 308 edges
2. `Button()` - 184 edges
3. `react` - 134 edges
4. `next` - 123 edges
5. `@tabler/icons-react` - 116 edges
6. `Badge()` - 89 edges
7. `Input()` - 76 edges
8. `Card()` - 73 edges
9. `CardHeader()` - 64 edges
10. `Header()` - 62 edges

## Surprising Connections (you probably didn't know these)
- `parseCoordinates` --conceptually_related_to--> `parseStoreSheetRows()`  [AMBIGUOUS]
  docs/store_coordinates_plan.md → lib/jobs/sync-stores.ts
- `5. Rencana Integrasi ke Store MEP Simulator` --references--> `GypsumTileResultCard()`  [INFERRED]
  docs/gypsum_tile_calculator_specification.md → components/audit/gypsum-tile-result-card.tsx
- `4. Pekerjaan di smart-energy-monitoring` --references--> `getSangatBorosStores()`  [INFERRED]
  docs/integrasi-sangat-boros-monitoring.md → lib/admin-sangat-boros.ts
- `3. Pekerjaan di sparta-energy` --references--> `isSangatBorosAudit()`  [INFERRED]
  docs/integrasi-sangat-boros-monitoring.md → lib/audit-validation-queries.ts
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

## Communities (168 total, 11 thin omitted)

### Community 0 - "admin-audits-table.tsx"
Cohesion: 0.17
Nodes (14): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+6 more)

### Community 1 - "auth.ts"
Cohesion: 0.12
Nodes (32): GET(), GET(), POST(), readSimulatedRole(), 12. Status sisi sparta-energy (26 Oktober 2026), resolveSession(), ADMIN_ACCESS, DEV_ROLE_COOKIE (+24 more)

### Community 2 - "admin-users-table.tsx"
Cohesion: 0.10
Nodes (32): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+24 more)

### Community 3 - "Input"
Cohesion: 0.12
Nodes (35): getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), BranchCombobox(), CreateUserDialog(), handleRoleChange() (+27 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (46): GET(), getFilter(), parseArea(), AdminEquipmentPage(), averagePerStore(), formatNumber(), getFilter(), parseArea() (+38 more)

### Community 5 - "Header"
Cohesion: 0.12
Nodes (31): AcEstimationLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationDetailLoading(), AuditValidationLoading(), AuditValidationPage(), pageHref(), Props (+23 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.10
Nodes (43): addCommonWhere(), AdminReportColumn, AdminReportDataset, AdminReportStatus, allMasterEquipmentFilters, buildAuditHistoryDataset(), buildBranchSummaryDataset(), buildEquipmentDataset() (+35 more)

### Community 7 - "@tabler/icons-react"
Cohesion: 0.16
Nodes (18): AuditPhotoContext, AuditPhotos(), remove(), upload(), AuditPhotosProps, compressPhoto(), photoUrl(), WebcamCapture() (+10 more)

### Community 8 - "map.tsx"
Cohesion: 0.06
Nodes (44): LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon (+36 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.04
Nodes (45): eslintConfig, name, packageManager, prisma, seed, private, type, version (+37 more)

### Community 10 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.17
Nodes (9): Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1), KALKULATOR LAMPU SIMETRIS sheet, calculatePenalties (weighted 100x/10x/1x) (+1 more)

### Community 11 - "admin-audit-queries.ts"
Cohesion: 0.10
Nodes (40): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+32 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "DialogContent"
Cohesion: 0.12
Nodes (42): AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoreExportFilterProps, numberFormat, AdminReportActions(), handleOpenChange(), loadPreview(), AdminReportActionsProps (+34 more)

### Community 14 - "hvac-audit-export.ts"
Cohesion: 0.12
Nodes (28): Context, GET(), getHvacAuditsForExport(), average(), COP_TARGET, AC_HEADER, acChecklistRows(), acCountRows() (+20 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "result-db.tsx"
Cohesion: 0.09
Nodes (27): AuditResultPage(), AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore, AuditValidationInfo (+19 more)

### Community 17 - "lighting-audit-form.tsx"
Cohesion: 0.06
Nodes (50): cellTone, LuxSubZoneGuide(), cellAverage(), numberFormat, averageLux(), calculateLpd(), createDefaultLuxRows(), createEmptyLightingAudit() (+42 more)

### Community 18 - "prisma"
Cohesion: 0.07
Nodes (53): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, ActionResult, deleteAudit(), AuditHistoryRow, AuditStatus (+45 more)

### Community 19 - "Card"
Cohesion: 0.25
Nodes (21): AdminMetricCard(), AdminMetricTone, metricToneStyles, CorrectionEntry, CorrectionHistory(), dateTimeFormat, AcEstimationCard(), EnergyAuditCard() (+13 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.11
Nodes (38): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+30 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.13
Nodes (22): consumptionChartConfig, ConsumptionTrendChart(), ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue() (+14 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "cn"
Cohesion: 0.14
Nodes (23): Logo(), LogoProps, ButtonGroupSeparator(), ButtonGroupText(), FieldContent(), FieldError(), FieldLegend(), FieldSeparator() (+15 more)

### Community 24 - "step3.tsx"
Cohesion: 0.19
Nodes (17): submitAudit(), toAreaTarget(), AreaTarget, AuditStep3(), handleSubmit(), AuditStep3Props, buildDemoAuditResult(), currentYear (+9 more)

### Community 25 - "prisma.ts"
Cohesion: 0.06
Nodes (32): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult, SaveLightEstimationPayload, SaveLightEstimationResult, ActionResult (+24 more)

### Community 26 - "kategori/page.tsx"
Cohesion: 0.16
Nodes (25): dateFormat, EnergyAuditListPage(), first(), pageHref(), Props, formatGap(), ValidationStoreList(), ValidationStoreListProps (+17 more)

### Community 27 - "Badge"
Cohesion: 0.14
Nodes (21): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, Page(), ResultStatusBadge(), ResultStatusBadgeProps, SangatBorosBadge() (+13 more)

### Community 28 - "Button"
Cohesion: 0.09
Nodes (24): LoginPage(), LoginToastNotice(), BranchComboboxProps, AdminEquipmentFiltersProps, areaOptions, filterParamKeys, filterParamKeySet, AdminMasterStoreDialogProps (+16 more)

### Community 29 - "store-mep-simulator-client.tsx"
Cohesion: 0.11
Nodes (33): getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle() (+25 more)

### Community 30 - "Point"
Cohesion: 0.09
Nodes (35): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+27 more)

### Community 31 - "Button"
Cohesion: 0.14
Nodes (23): AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams(), CalculatorLogsClient() (+15 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "admin-master-stores-table.tsx"
Cohesion: 0.19
Nodes (10): AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate(), formatHours(), formatNumber(), getNextSortOrder(), numberFormat (+2 more)

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.14
Nodes (28): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+20 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "audits/[id]/page.tsx"
Cohesion: 0.13
Nodes (24): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 37 - "admin/dashboard/page.tsx"
Cohesion: 0.13
Nodes (24): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+16 more)

### Community 38 - "Badge"
Cohesion: 0.13
Nodes (24): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.10
Nodes (38): ActionResult, deleteUser(), DeleteUserInput, ActionResult, checkExistingEmails(), hashPassword(), ImportUserInput, importUsersBulk() (+30 more)

### Community 40 - "light-estimation-client.tsx"
Cohesion: 0.12
Nodes (31): saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), LightEstimationClientProps, SHAPES, SnapGuide (+23 more)

### Community 41 - "ac-mapping-client.tsx"
Cohesion: 0.09
Nodes (36): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+28 more)

### Community 42 - "cn"
Cohesion: 0.13
Nodes (24): Command(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+16 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "lighting-audit-export.ts"
Cohesion: 0.07
Nodes (53): GET(), GET(), Context, GET(), CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap(), CATEGORY_EXPORT_LOADERS (+45 more)

### Community 46 - "db-utils.ts"
Cohesion: 0.23
Nodes (11): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, escapeCsv(), main(), pool (+3 more)

### Community 47 - "ref_path"
Cohesion: 0.15
Nodes (11): SimetrisResult, calcSimetris(), evaluateStatus(), run(), pool, test(), testFile(), dxfContent (+3 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.10
Nodes (37): GET(), getFilter(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, AdminStoreFilters, AdminStoreRow (+29 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "reports/preview/route.ts"
Cohesion: 0.29
Nodes (12): GET(), GET(), isAdmin(), serializeCell(), AdminReportCellValue, AdminReportFilters, buildAdminReportDataset(), getAdminReportFilter() (+4 more)

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (43): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+35 more)

### Community 53 - "mep-layout-canvas-preview.tsx"
Cohesion: 0.16
Nodes (18): checkLampObstacle(), formatDim(), getCashierZonePolygon(), getMaxInwardDepth(), getStoreScaleInfo(), MepFloorPlanCanvasPreview(), MepFloorPlanCanvasPreviewProps, PlacedAcUnit (+10 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 56 - "gypsum-tile-calculator.ts"
Cohesion: 0.13
Nodes (18): GypsumTileResultCard(), GypsumTileResultCardProps, AxisTileResult, calcTile1D(), calculateGypsumTileLayout(), CROSS_TEE_LENGTH_M, GYPSUM_LENGTH_M, GYPSUM_WIDTH_M (+10 more)

### Community 57 - "filters.tsx"
Cohesion: 0.20
Nodes (15): FilterI18nConfig, FilterOperator, FilterOption, Filters(), FiltersProps, getFieldMap(), getValueLabel(), removeFilter() (+7 more)

### Community 58 - "validation-summary.tsx"
Cohesion: 0.22
Nodes (16): formatKwh(), Comparison(), dateFormat, statusLabel(), ValidationPreview, ValidationSummary(), ValidationSummaryProps, DraftRestoreAlert() (+8 more)

### Community 59 - "admin-stores-table.tsx"
Cohesion: 0.19
Nodes (14): AdminStoresTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getStatus() (+6 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "admin-master-equipment-table.tsx"
Cohesion: 0.18
Nodes (12): AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterEquipmentFiltersProps, filterParamKeys, filterParamKeySet, numberFormat, MasterEquipmentRow, MasterEquipmentTypeOption (+4 more)

### Community 62 - "Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring"
Cohesion: 0.29
Nodes (6): 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka, Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "energy-audit-queries.ts"
Cohesion: 0.09
Nodes (28): LightingAuditPage(), Props, HvacAuditPage(), Props, AVAILABLE_ENERGY_AUDIT_CATEGORIES, CategoryStatusMap, ENERGY_AUDIT_CATEGORIES, EnergyAuditCategoryInfo (+20 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "lighting-audit-form.tsx"
Cohesion: 0.09
Nodes (37): saveLightingAudit(), AboutPage(), InfoRow(), dateFormat, LightingAuditForm(), goToStep(), restoreBackup(), save() (+29 more)

### Community 67 - "AdminMasterStoreFilters"
Cohesion: 0.53
Nodes (6): AdminMasterStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "map-picker.tsx"
Cohesion: 0.23
Nodes (12): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+4 more)

### Community 70 - "getAuditValidator"
Cohesion: 0.10
Nodes (24): AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), AdminEntryLogoutButton(), firstValue(), parseValidationFilters() (+16 more)

### Community 71 - "shadcn CLI & MCP"
Cohesion: 0.25
Nodes (8): shadcn add Command (dry-run/diff/view), components.json Configuration, shadcn info Command, shadcn CLI Reference, Component Registries (@shadcn, custom), shadcn MCP Server, shadcn Project Context Key Fields, Next.js shadcn Template README

### Community 72 - "Deploy Pipeline & Agent Guides"
Cohesion: 0.25
Nodes (8): Build and Deploy GitHub Workflow, Dokploy Deploy Webhook, GHCR Docker Image (latest), AGENTS.md (Codex Guide), Admin Dashboard & Filters, CLAUDE.md (Claude Code Guide), Demo Mode (demo-session), Sparta Energy Audit System

### Community 73 - "Audit Domain Concepts"
Cohesion: 0.31
Nodes (9): AI Context - SPARTA Energy, Hemat/Boros Store Classification, PLN & STD 6-Month History Input, Waste Source Signals (Pelatihan Tim / Perbaikan Equipment), AI Recommendations (Google GenAI: TRAINING/REPAIR/MAINTENANCE), Audit Creation Wizard Flow, Energy Calculation (dailyKwh = baseKw*qty*hours; monthly = daily*30), Prisma Core Models (User, Store, Audit, AuditItem, EquipmentType, EquipmentBrand, AuditPlnStdHistory, AuditRecommendation) (+1 more)

### Community 74 - "Dokumentasi Spesifikasi Kalkulator Plafon Gypsum Tile"
Cohesion: 0.12
Nodes (16): 1. Parameter Baku & Dimensi Panel, 2. Aturan Baku Pemasangan (Golden Rules), 3. Analisis File Excel Konsep & Koreksi Bug, 4. Desain Output & Pembedahan Panel, 5. Rencana Integrasi ke Store MEP Simulator, 6. Standar Acuan Baru: Koefisien Fix Jayaboard (Sheet "Koefisien 1.75"), 7. Catatan Mengenai Harga Satuan Material (Regional Pricing), A. Contoh Kasus Sisi 60 cm (Lebar Toko 5.0 m, Modul 0.6 m) (+8 more)

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

### Community 79 - "reports/page.tsx"
Cohesion: 0.21
Nodes (15): AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams(), ReportCard (+7 more)

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

### Community 87 - "admin-shell.tsx"
Cohesion: 0.08
Nodes (47): AdminHeaderActions(), AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminUser (+39 more)

### Community 88 - "iot-status.ts"
Cohesion: 0.18
Nodes (14): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), buildIotLookup(), getIotStatusLookup(), getStoreIot() (+6 more)

### Community 89 - "dotenv"
Cohesion: 0.15
Nodes (11): dotenv, prisma, @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma (+3 more)

### Community 90 - "admin-audit-filters.tsx"
Cohesion: 0.20
Nodes (12): AdminAuditFiltersProps, filterParamKeys, filterParamKeySet, monthOptions, iotFilterField, priorityFilterField, validationFilterField, AdminStoreFiltersProps (+4 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.17
Nodes (13): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getAdminStoreDetail(), getBrandName(), getEquipmentName(), isNonNegativeNumber() (+5 more)

### Community 92 - "save-draft.ts"
Cohesion: 0.21
Nodes (12): deleteAuditDraft(), getAuditDraft(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), handleDelete(), handleResume() (+4 more)

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "state-block.tsx"
Cohesion: 0.25
Nodes (8): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), StateBlock(), StateBlockAction, StateBlockProps

### Community 95 - "hvac-audit-export.ts"
Cohesion: 0.06
Nodes (28): createAcUnit(), HvacExportAudit, acHeaderIndex, audit, exHeaderIndex, readings, recap, reopened (+20 more)

### Community 96 - "get-equipment-for-area.ts"
Cohesion: 0.23
Nodes (9): AuditValidationDetailPage(), Props, DemoPage(), 3. Pekerjaan di sparta-energy, getValidationAudit(), isSangatBorosAudit(), demoStores, EquipmentBrandItem (+1 more)

### Community 97 - "sidebar.tsx"
Cohesion: 0.13
Nodes (23): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarInput() (+15 more)

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

### Community 115 - "CardContent"
Cohesion: 0.24
Nodes (10): AreaItem, areaItems, AuditStep2(), AuditStep2Props, Step2AreaCard(), AuditItem, AuditListSection(), AuditListSectionProps (+2 more)

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

### Community 120 - "scripts/get-temperature.ts"
Cohesion: 0.40
Nodes (3): fmt(), main(), url

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "AdminMasterEquipmentFilters"
Cohesion: 0.53
Nodes (6): AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 124 - "useLeaflet"
Cohesion: 0.15
Nodes (17): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+9 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "hvac-audit.ts"
Cohesion: 0.06
Nodes (52): copTone, deltaTone, HvacAcUnitCard(), HvacAcUnitCardProps, roomTone, HvacExhaustZoneCard(), HvacExhaustZoneCardProps, ventilationTone (+44 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "admin-dashboard-filters.tsx"
Cohesion: 0.25
Nodes (10): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminDashboardFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+2 more)

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "admin-report-filters.tsx"
Cohesion: 0.24
Nodes (10): AdminReportFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminReportFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+2 more)

### Community 132 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 133 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 134 - "export-store-data.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

### Community 135 - "Konsep Akses Role: Admin, Auditor, GS General Service, dan Area"
Cohesion: 0.15
Nodes (15): 10. Keputusan (26 Oktober 2026), 11. Simulasi role untuk testing lokal, 1. Siapa masuk ke mana, 2. Kondisi sekarang, 3. Login: satu cookie untuk semua subdomain, 4. Data izin (di DB 1, dibuat oleh sparta-energy), 5. Pembagian kerja, 6. Alur (+7 more)

### Community 136 - "calculator-versions.ts"
Cohesion: 0.21
Nodes (8): GypsumTileExportCardData, Props, LightEstimationResultCard(), LightEstimationResultCardData, Props, Row(), GYPSUM_CALCULATOR_VERSION, LAMP_CALCULATOR_VERSION

### Community 137 - "breadcrumb.tsx"
Cohesion: 0.27
Nodes (10): AdminSiteHeader(), getBreadcrumbItems(), getCurrentPage(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+2 more)

### Community 138 - "item-form-dialog.tsx"
Cohesion: 0.12
Nodes (25): AddEquipmentDialog(), AddEquipmentDialogProps, areaCategory, recordedQty(), EquipmentListProps, FormState, AreaKey, areaLabels (+17 more)

### Community 139 - "admin-audit-date-filter.ts"
Cohesion: 0.31
Nodes (8): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear(), addAuditWhereAnd(), getAdminAuditWhere()

### Community 140 - "device-access.ts"
Cohesion: 0.27
Nodes (10): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), handleSave(), getMonitoringDevices() (+2 more)

### Community 141 - "lib/admin-gap-filter.ts"
Cohesion: 0.30
Nodes (11): getAdminGapFilterEnabled, getAdminGapFilterSql(), getAdminGapHiddenCount(), gapFilteredAuditIdsSql(), getSangatBorosAuditIdsSql(), getSangatBorosStores(), isAdminSangatBoros(), SangatBorosStore (+3 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 143 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.29
Nodes (7): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator, saveAcEstimationLog, saveLightEstimationLog

### Community 144 - "hvac-audit-form.tsx"
Cohesion: 0.09
Nodes (43): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), SaveResult, areaFormat, createUnitLike() (+35 more)

### Community 145 - "step1.tsx"
Cohesion: 0.29
Nodes (7): AuditStepNavigate, DemoResultPage(), AuditStep1(), Props, AuditStepIndicator(), AuditStepIndicatorProps, useAuditStore

### Community 146 - "export-audits.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDate(), main(), pool

### Community 147 - "submit-audit.ts"
Cohesion: 0.17
Nodes (14): SubmitAuditInput, BOROS_TOLERANCE, calculateGapPercent(), calculateItemDailyKwh(), DAYS_PER_MONTH, ItemKwhInput, summarizeAuditItems(), calc (+6 more)

### Community 148 - "app/dashboard/page.tsx"
Cohesion: 0.16
Nodes (11): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditItem, RecentAuditSection(), RecentAuditSectionProps, RecentAuditStatus (+3 more)

### Community 149 - "ai-recommendation.ts"
Cohesion: 0.36
Nodes (6): getDemoAiRecommendation(), AiRecommendationResponse, generateRecommendationWithFallback(), getAiClient(), MODEL_WATERFALL, @google/genai

### Community 150 - "MapDrawControl"
Cohesion: 0.18
Nodes (12): ButtonGroup(), buttonGroupVariants, MapControlContainer(), MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapLocateControl() (+4 more)

### Community 151 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 153 - "create-user.ts"
Cohesion: 0.20
Nodes (7): ActionResult, createUser(), CreateUserInput, hashPassword(), handleSubmit(), hash, password

### Community 154 - "settings/page.tsx"
Cohesion: 0.38
Nodes (5): MenuRow(), SectionLabel(), SettingsPage(), Theme, THEMES

### Community 155 - "energy-audit-export-dialog.tsx"
Cohesion: 0.11
Nodes (29): AdminMasterDataNav(), EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips(), ComboboxChipsInput() (+21 more)

### Community 156 - "ac-estimation-client.tsx"
Cohesion: 0.08
Nodes (36): AcEstimationClient(), AcEstimationClientProps, MapPicker, getRabData(), getTemperature(), EstimationResultCard(), EstimationResultCardData, Props (+28 more)

### Community 157 - "route.spec.ts"
Cohesion: 0.27
Nodes (7): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet()

### Community 158 - "result-skeleton.tsx"
Cohesion: 0.60
Nodes (3): AuditResultLoading(), DemoResultLoading(), AuditResultSkeleton()

### Community 159 - "AdminAuditFilters"
Cohesion: 0.53
Nodes (6): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 161 - "AdminEquipmentFilters"
Cohesion: 0.53
Nodes (6): AdminEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 162 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 163 - "AdminStoreFilters"
Cohesion: 0.53
Nodes (6): AdminStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 164 - "master-data/page.tsx"
Cohesion: 0.07
Nodes (59): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+51 more)

### Community 165 - "ImportUserCsvDialog"
Cohesion: 0.53
Nodes (6): ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv(), parseCsvLine()

### Community 166 - "generate-lamp-analysis.js"
Cohesion: 0.83
Nodes (3): calcSimetris(), evaluateDetailed(), run()

### Community 167 - "generate-lamp-simulation.js"
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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1205 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `app/dashboard/page.tsx` to `admin-audits-table.tsx`, `auth.ts`, `admin-dashboard-filters.tsx`, `Input`, `admin-users-table.tsx`, `Header`, `admin-report-filters.tsx`, `Package & ESLint Config`, `item-form-dialog.tsx`, `admin-audit-queries.ts`, `device-access.ts`, `DialogContent`, `hvac-audit-export.ts`, `Button`, `hvac-audit-form.tsx`, `step1.tsx`, `prisma`, `submit-audit.ts`, `audit-validation.ts`, `result-db.tsx`, `Branch Audit Summaries`, `Card`, `step3.tsx`, `create-user.ts`, `prisma.ts`, `Badge`, `ac-estimation-client.tsx`, `route.spec.ts`, `kategori/page.tsx`, `Button`, `settings/page.tsx`, `energy-audit-export-dialog.tsx`, `admin-user-queries.ts`, `admin-master-stores-table.tsx`, `audits/[id]/page.tsx`, `admin/dashboard/page.tsx`, `master-data/page.tsx`, `admin-master-data-mutations.ts`, `Badge`, `light-estimation-client.tsx`, `Root Layout & Theme`, `lighting-audit-export.ts`, `reports/preview/route.ts`, `admin-stores-table.tsx`, `admin-master-equipment-table.tsx`, `energy-audit-queries.ts`, `lighting-audit-form.tsx`, `getAuditValidator`, `lib/admin-gap-filter.ts`, `admin-shell.tsx`, `admin-audit-filters.tsx`, `save-draft.ts`, `state-block.tsx`, `get-equipment-for-area.ts`, `CardContent`, `cn`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `admin-audits-table.tsx`, `admin-users-table.tsx`, `Input`, `Equipment Admin Queries`, `Header`, `@tabler/icons-react`, `map.tsx`, `breadcrumb.tsx`, `item-form-dialog.tsx`, `DialogContent`, `result-db.tsx`, `step1.tsx`, `hvac-audit-form.tsx`, `Card`, `lighting-audit-form.tsx`, `admin-dashboard-charts.tsx`, `MapDrawControl`, `step3.tsx`, `settings/page.tsx`, `kategori/page.tsx`, `Button`, `ac-estimation-client.tsx`, `Badge`, `Button`, `energy-audit-export-dialog.tsx`, `admin-master-stores-table.tsx`, `audits/[id]/page.tsx`, `Badge`, `ac-mapping-client.tsx`, `cn`, `Root Layout & Theme`, `filters.tsx`, `validation-summary.tsx`, `admin-stores-table.tsx`, `admin-master-equipment-table.tsx`, `lighting-audit-form.tsx`, `map-picker.tsx`, `getAuditValidator`, `admin-shell.tsx`, `sidebar.tsx`, `CardContent`, `useLeaflet`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `admin-users-table.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09634551495016612 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._