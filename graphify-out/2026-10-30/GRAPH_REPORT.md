# Graph Report - sparta-energy  (2026-10-30)

## Corpus Check
- 443 files · ~556,497 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3462 nodes · 10241 edges · 147 communities (136 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 91 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7fd77c7c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin-audits-table.tsx
- auth.ts
- item-form-dialog.tsx
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
- technical-form.tsx
- lighting-audit-form.tsx
- next
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- cn
- step3.tsx
- dotenv
- Badge
- ac-count-flag.tsx
- Button
- store-mep-simulator-client.tsx
- Point
- Button
- Dev Dependencies
- master-data/page.tsx
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
- energy-audit-export.ts
- db-utils.ts
- ref_path
- Styling & Theming Rules
- admin-store-queries.ts
- Tone & Voice
- reports/export/route.ts
- photos/route.ts
- mep-layout-canvas-preview.tsx
- antislop-layoutmobile
- audit-kalkulator.replay.test.ts
- gypsum-tile-calculator.ts
- AdminMasterStoreFilters
- lighting-audit-form.tsx
- contrast-check.py
- admin-master-equipment-table.tsx
- Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring
- shadcn Forms & Composition
- energy-audit-queries.ts
- UploadThing File Upload
- hvac-exhaust-zone-card.tsx
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
- AdminAuditFilters
- admin-store-detail.ts
- submit-audit.ts
- PWA Icon Set
- hvac-audit-export.ts
- admin-shell.tsx
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
- AdminMasterEquipmentFilters
- useLeaflet
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- hvac-audit.ts
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- The Craftsmanship Standard
- filters.tsx
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- export-store-data.ts
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- calculator-versions.ts
- admin-audit-date-filter.ts
- lib/admin-gap-filter.ts
- sync-stores.ts
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- hvac-audit-form.tsx
- export-audits.ts
- validation-detail.tsx
- AuditStartClient
- audit-kalkulator.test.ts
- MapDrawControl
- ref_crypto
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- energy-audit-export-dialog.tsx
- ac-estimation-client.tsx
- Disaster Engine & Store Impact Verification Flow
- master-data/page.tsx
- ImportUserCsvDialog
- backfill-audit-baseline.ts
- admin-master-categories-list.tsx
- generate-lamp-simulation.ts

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

## Communities (147 total, 11 thin omitted)

### Community 0 - "admin-audits-table.tsx"
Cohesion: 0.12
Nodes (30): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+22 more)

### Community 1 - "auth.ts"
Cohesion: 0.06
Nodes (51): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, updateUser(), UpdateUserInput, GET() (+43 more)

### Community 2 - "item-form-dialog.tsx"
Cohesion: 0.12
Nodes (22): AddEquipmentDialogProps, areaCategory, recordedQty(), EquipmentListProps, FormState, AreaKey, areaLabels, areaOrder (+14 more)

### Community 3 - "Input"
Cohesion: 0.12
Nodes (35): getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), BranchCombobox(), BranchComboboxProps, CreateUserDialog() (+27 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (48): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+40 more)

### Community 5 - "Header"
Cohesion: 0.05
Nodes (63): AcEstimationLoading(), AuditResultLoading(), EnergyAuditListLoading(), dateFormat, EnergyAuditListPage(), first(), pageHref(), Props (+55 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.10
Nodes (46): addCommonWhere(), AdminReportCellValue, AdminReportColumn, AdminReportDataset, AdminReportStatus, allMasterEquipmentFilters, buildAdminReportDataset(), buildAuditHistoryDataset() (+38 more)

### Community 7 - "@tabler/icons-react"
Cohesion: 0.15
Nodes (19): AuditPhotoContext, AuditPhotos(), remove(), upload(), AuditPhotosProps, compressPhoto(), photoUrl(), WebcamCapture() (+11 more)

### Community 8 - "map.tsx"
Cohesion: 0.06
Nodes (43): LeafletCircle, LeafletCircleMarker, LeafletLayerGroup, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon, LeafletPolyline (+35 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.05
Nodes (43): eslintConfig, name, packageManager, prisma, seed, private, type, version (+35 more)

### Community 10 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.15
Nodes (12): saveAcEstimationLog, Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, saveLightEstimationLog, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1) (+4 more)

### Community 11 - "admin-audit-queries.ts"
Cohesion: 0.10
Nodes (41): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+33 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "DialogContent"
Cohesion: 0.11
Nodes (42): AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate(), formatHours(), formatNumber() (+34 more)

### Community 14 - "hvac-audit-export.ts"
Cohesion: 0.14
Nodes (25): average(), COP_TARGET, AC_HEADER, acChecklistRows(), acCountRows(), average(), ecoAndPhotoRows(), EXHAUST_HEADER (+17 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "technical-form.tsx"
Cohesion: 0.17
Nodes (12): PlnDraftRow, AreaField, areaFields, TechnicalDraft, TechnicalForm(), TechnicalFormProps, UnitInput(), LoginForm() (+4 more)

### Community 17 - "lighting-audit-form.tsx"
Cohesion: 0.05
Nodes (72): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveLightingAudit(), SaveResult, Context, GET() (+64 more)

### Community 18 - "next"
Cohesion: 0.06
Nodes (56): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, ActionResult, deleteAudit(), AuditHistoryRow, AuditStatus (+48 more)

### Community 19 - "Card"
Cohesion: 0.11
Nodes (41): EnergyAuditError(), AuditValidationError(), AuditValidationDetailLoading(), GlobalError(), Forbidden(), NotFound(), AdminMetricCard(), AdminMetricTone (+33 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.09
Nodes (43): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+35 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.08
Nodes (37): AuditResultPage(), consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue() (+29 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "cn"
Cohesion: 0.08
Nodes (50): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, AdminSiteHeader(), BranchCell(), AvatarBadge(), AvatarGroup() (+42 more)

### Community 24 - "step3.tsx"
Cohesion: 0.12
Nodes (24): getDemoAiRecommendation(), submitAudit(), AreaTarget, AuditStep3(), handleSubmit(), AuditStep3Props, buildDemoAuditResult(), currentYear (+16 more)

### Community 25 - "dotenv"
Cohesion: 0.33
Nodes (5): dbPool, dotenv, prisma, main(), mapCategoryToArea()

### Community 26 - "Badge"
Cohesion: 0.13
Nodes (25): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, AdminStoresTable(), SortableHeader(), updateSort(), calculateGapPercent() (+17 more)

### Community 27 - "ac-count-flag.tsx"
Cohesion: 0.21
Nodes (10): AcCountFlag(), AcCountFlagProps, toneByStatus, CategorySummary(), CategorySummaryProps, statusTone, AcCountStatus, parseAcSummaryStatus() (+2 more)

### Community 28 - "Button"
Cohesion: 0.12
Nodes (23): DemoResultPage(), LoginPage(), LoginToastNotice(), AdminMasterStoreDialogProps, AdminMasterStoreExportFilterProps, numberFormat, AdminMasterStoreFiltersProps, filterParamKeys (+15 more)

### Community 29 - "store-mep-simulator-client.tsx"
Cohesion: 0.09
Nodes (40): deleteMepSimulationLog(), getLatestStoreMepSimulation(), getMepSimulationDetail(), getMepSimulationList(), MepSimulationListFilter, saveMepSimulationLog(), SaveMepSimulationPayload, SaveMepSimulationResult (+32 more)

### Community 30 - "Point"
Cohesion: 0.08
Nodes (38): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+30 more)

### Community 31 - "Button"
Cohesion: 0.12
Nodes (23): AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams(), dateToTimeStr() (+15 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "master-data/page.tsx"
Cohesion: 0.15
Nodes (26): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, getEquipmentFromSql() (+18 more)

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.11
Nodes (36): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUsersTable(), AdminUsersTableProps (+28 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "audits/[id]/page.tsx"
Cohesion: 0.13
Nodes (24): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 37 - "admin/dashboard/page.tsx"
Cohesion: 0.08
Nodes (42): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+34 more)

### Community 38 - "Badge"
Cohesion: 0.13
Nodes (24): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.06
Nodes (63): ActionResult, deleteUser(), DeleteUserInput, findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult (+55 more)

### Community 40 - "light-estimation-client.tsx"
Cohesion: 0.11
Nodes (32): AcMappingClientProps, saveLightEstimationLog(), StoreData, checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), LightEstimationClientProps (+24 more)

### Community 41 - "ac-mapping-client.tsx"
Cohesion: 0.14
Nodes (26): AcMappingClient(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim(), getCashierZonePolygon() (+18 more)

### Community 42 - "cn"
Cohesion: 0.12
Nodes (29): ComboboxClear(), ComboboxInput(), ComboboxTrigger(), Command(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+21 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "energy-audit-export.ts"
Cohesion: 0.07
Nodes (51): GET(), GET(), Context, GET(), detail, AVAILABLE_ENERGY_AUDIT_CATEGORIES, CategoryStatusMap, ENERGY_AUDIT_CATEGORIES (+43 more)

### Community 46 - "db-utils.ts"
Cohesion: 0.16
Nodes (14): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, adapter, pool, prisma (+6 more)

### Community 47 - "ref_path"
Cohesion: 0.12
Nodes (14): calcSimetris(), evaluateDetailed(), run(), calcSimetris(), evaluateStatus(), run(), fmt(), main() (+6 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.10
Nodes (39): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, getAdminGapFilterSql() (+31 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "reports/export/route.ts"
Cohesion: 0.28
Nodes (14): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+6 more)

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (43): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+35 more)

### Community 53 - "mep-layout-canvas-preview.tsx"
Cohesion: 0.17
Nodes (18): checkLampObstacle(), formatDim(), getCashierZonePolygon(), getMaxInwardDepth(), getStoreScaleInfo(), MepFloorPlanCanvasPreview(), MepFloorPlanCanvasPreviewProps, PlacedAcUnit (+10 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "audit-kalkulator.replay.test.ts"
Cohesion: 0.28
Nodes (8): AREA_NAMES, endTimeFor(), ExportRow, replay(), store, TF67, toEquipments(), W441

### Community 56 - "gypsum-tile-calculator.ts"
Cohesion: 0.13
Nodes (18): GypsumTileResultCard(), GypsumTileResultCardProps, AxisTileResult, calcTile1D(), calculateGypsumTileLayout(), CROSS_TEE_LENGTH_M, GYPSUM_LENGTH_M, GYPSUM_WIDTH_M (+10 more)

### Community 57 - "AdminMasterStoreFilters"
Cohesion: 0.53
Nodes (6): AdminMasterStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 58 - "lighting-audit-form.tsx"
Cohesion: 0.08
Nodes (40): formatKwh(), StepActionBar(), Comparison(), dateFormat, statusLabel(), ValidationPreview, ValidationSummary(), ValidationSummaryProps (+32 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "admin-master-equipment-table.tsx"
Cohesion: 0.12
Nodes (17): AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterEquipmentFiltersProps, filterParamKeys, filterParamKeySet, AdminMasterEquipmentTable(), SortableHeader(), updateSort() (+9 more)

### Community 62 - "Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring"
Cohesion: 0.25
Nodes (7): 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 3. Pekerjaan di sparta-energy, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka, Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "energy-audit-queries.ts"
Cohesion: 0.14
Nodes (19): LightingAuditPage(), Props, HvacAuditPage(), Props, isSangatBorosAudit(), areaToZone, availableCategoryKeys, borosValidatedSql (+11 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "hvac-exhaust-zone-card.tsx"
Cohesion: 0.11
Nodes (30): AboutPage(), InfoRow(), HvacAcUnitCard(), HvacExhaustZoneCard(), HvacExhaustZoneCardProps, ventilationTone, formatValue(), NumberField() (+22 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "map-picker.tsx"
Cohesion: 0.26
Nodes (11): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+3 more)

### Community 70 - "getAuditValidator"
Cohesion: 0.10
Nodes (26): AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), AuditValidationPage(), pageHref(), Props (+18 more)

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
Cohesion: 0.20
Nodes (15): AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams(), ReportCard (+7 more)

### Community 80 - "Landing Hero Illustration"
Cohesion: 0.32
Nodes (8): Audit Completion Checkmark, Lime Green / Dark Teal Brand Palette, Field Auditor with Clipboard, Handheld Measuring Device / Thermometer Gun, Landing Hero Illustration (Store Energy Audit), Electrical Panel with kWh Meter and Breakers, Retail Store Equipment (Fridge, Lights, CCTV, Cashier), Rooftop Solar Panels

### Community 81 - "antislop-human"
Cohesion: 0.10
Nodes (20): antislop-human, Broken Tab Order, Color & Contrast, Color-Only Feedback, Focus & States, How to use this skill, Human Skill Checklist, Keyboard (+12 more)

### Community 82 - "Store Sync Docs & Import"
Cohesion: 0.14
Nodes (12): Store Sync Cron Implementation Plan, Store Sync Cron Endpoint Design Spec, SPARTA Maintenance (reference sync implementation), @prisma/adapter-pg, adapter, main(), pool, printUsage() (+4 more)

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

### Community 90 - "AdminAuditFilters"
Cohesion: 0.53
Nodes (6): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.22
Nodes (11): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getBrandName(), getEquipmentName(), isNonNegativeNumber(), isPositiveNumber() (+3 more)

### Community 92 - "submit-audit.ts"
Cohesion: 0.13
Nodes (19): deleteAuditDraft(), getAuditDraft(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), SubmitAuditInput, toAreaTarget() (+11 more)

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 95 - "hvac-audit-export.ts"
Cohesion: 0.06
Nodes (33): createAcUnit(), createExhaustZone(), HvacExportAudit, acHeaderIndex, audit, exHeaderIndex, readings, recap (+25 more)

### Community 97 - "admin-shell.tsx"
Cohesion: 0.09
Nodes (44): AdminHeaderActions(), AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminUser (+36 more)

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
Cohesion: 0.08
Nodes (36): copTone, deltaTone, HvacAcUnitCardProps, roomTone, AC_UNIT_BTU, calculateAcUnits(), getClusterBtu(), LampOption (+28 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "filters.tsx"
Cohesion: 0.05
Nodes (64): AdminAuditFiltersProps, filterParamKeys, filterParamKeySet, monthOptions, AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams() (+56 more)

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
Cohesion: 0.13
Nodes (14): AcMappingResultCard(), AcMappingResultCardData, AcMappingUnitDetail, Props, Row(), GypsumTileExportCardData, Props, LightEstimationResultCard() (+6 more)

### Community 139 - "admin-audit-date-filter.ts"
Cohesion: 0.31
Nodes (8): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear(), addAuditWhereAnd(), getAdminAuditWhere()

### Community 141 - "lib/admin-gap-filter.ts"
Cohesion: 0.28
Nodes (11): AdminLayout(), requireAdmin(), getAdminGapFilterEnabled, getAdminGapHiddenCount(), gapFilteredAuditIdsSql(), getSangatBorosAuditIdsSql(), getSangatBorosStores(), SangatBorosStore (+3 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.15
Nodes (19): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), fetchAccessToken(), fetchStoreSheet(), filterNewStores() (+11 more)

### Community 143 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.39
Nodes (5): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator

### Community 144 - "hvac-audit-form.tsx"
Cohesion: 0.11
Nodes (32): saveHvacAudit(), areaFormat, createUnitLike(), dateFormat, formatCoord(), HvacAuditForm(), addUnit(), calculateStandard() (+24 more)

### Community 146 - "export-audits.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDate(), main(), pool

### Community 147 - "validation-detail.tsx"
Cohesion: 0.23
Nodes (13): PlnHistoryEditor(), PlnHistoryEditorProps, toNumberOrZero(), yearOptions(), draftFromAudit(), toDraftInput(), toInput(), ValidationDetail() (+5 more)

### Community 148 - "AuditStartClient"
Cohesion: 0.22
Nodes (9): getStoreByCodeAction(), AuditStartClient(), AuditValidationDetailPage(), Props, DemoPage(), Audit Step Skeleton and Result Loading Design, getValidationAudit(), demoStores (+1 more)

### Community 149 - "audit-kalkulator.test.ts"
Cohesion: 0.10
Nodes (25): AuditItemRow, buildAuditItemRows(), CalcMethodInfo, isAirConditioner(), isUsageBased(), ac, acRows, chiller (+17 more)

### Community 150 - "MapDrawControl"
Cohesion: 0.18
Nodes (11): LeafletFeatureGroup, MapControlContainer(), MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapLocateControl(), MapLocatePulseIcon() (+3 more)

### Community 151 - "ref_crypto"
Cohesion: 0.24
Nodes (6): main(), pool, printUsage(), sha256(), hash, password

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 155 - "energy-audit-export-dialog.tsx"
Cohesion: 0.12
Nodes (28): AdminMasterDataNav(), EnergyAuditExportDialog(), EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips() (+20 more)

### Community 156 - "ac-estimation-client.tsx"
Cohesion: 0.07
Nodes (41): AcEstimationClient(), AcEstimationClientProps, MapPicker, getRabData(), AuditStepNavigate, AuditStepNavigateOptions, AuditStepTarget, Props (+33 more)

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.13
Nodes (12): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API, Store Coordinates Sync Plan (+4 more)

### Community 164 - "master-data/page.tsx"
Cohesion: 0.09
Nodes (30): GET(), getFilter(), CountRow, defaultMasterDataOrder, defaultMasterEquipmentSort, defaultMasterStoreSort, EquipmentArea, getMasterStoreRows() (+22 more)

### Community 165 - "ImportUserCsvDialog"
Cohesion: 0.53
Nodes (6): ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv(), parseCsvLine()

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.13
Nodes (20): BackfillAuditRow, BackfillChange, backfillCsv(), csvCell(), MIN_DIFF_KWH, planBaselineBackfill(), statusLabel(), csv (+12 more)

### Community 168 - "admin-master-categories-list.tsx"
Cohesion: 0.40
Nodes (5): AdminMasterCategoriesList(), AdminMasterCategoriesListProps, CategoryItem, formatNumber(), numberFormat

### Community 169 - "generate-lamp-simulation.ts"
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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1236 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `admin-audits-table.tsx`, `auth.ts`, `item-form-dialog.tsx`, `Input`, `Equipment Admin Queries`, `Header`, `filters.tsx`, `Package & ESLint Config`, `admin-audit-queries.ts`, `lib/admin-gap-filter.ts`, `sync-stores.ts`, `DialogContent`, `hvac-audit-form.tsx`, `lighting-audit-form.tsx`, `Card`, `audit-validation.ts`, `AuditStartClient`, `Branch Audit Summaries`, `admin-dashboard-charts.tsx`, `step3.tsx`, `validation-detail.tsx`, `Badge`, `energy-audit-export-dialog.tsx`, `ac-estimation-client.tsx`, `store-mep-simulator-client.tsx`, `Button`, `master-data/page.tsx`, `admin-user-queries.ts`, `audits/[id]/page.tsx`, `admin/dashboard/page.tsx`, `master-data/page.tsx`, `admin-master-data-mutations.ts`, `Badge`, `light-estimation-client.tsx`, `Root Layout & Theme`, `energy-audit-export.ts`, `admin-store-queries.ts`, `reports/export/route.ts`, `lighting-audit-form.tsx`, `admin-master-equipment-table.tsx`, `energy-audit-queries.ts`, `hvac-exhaust-zone-card.tsx`, `getAuditValidator`, `submit-audit.ts`, `admin-shell.tsx`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin-audits-table.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1166429587482219 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `admin-audits-table.tsx`, `item-form-dialog.tsx`, `Input`, `Equipment Admin Queries`, `Header`, `filters.tsx`, `@tabler/icons-react`, `map.tsx`, `DialogContent`, `hvac-audit-form.tsx`, `lighting-audit-form.tsx`, `technical-form.tsx`, `Card`, `validation-detail.tsx`, `admin-dashboard-charts.tsx`, `MapDrawControl`, `step3.tsx`, `Badge`, `ac-count-flag.tsx`, `ac-estimation-client.tsx`, `Button`, `energy-audit-export-dialog.tsx`, `Button`, `audits/[id]/page.tsx`, `Badge`, `cn`, `Root Layout & Theme`, `lighting-audit-form.tsx`, `admin-master-equipment-table.tsx`, `hvac-exhaust-zone-card.tsx`, `map-picker.tsx`, `getAuditValidator`, `admin-shell.tsx`, `useLeaflet`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0636523266022827 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._