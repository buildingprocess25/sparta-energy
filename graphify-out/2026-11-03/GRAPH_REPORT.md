# Graph Report - sparta-energy  (2026-11-03)

## Corpus Check
- 467 files · ~385,402 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3687 nodes · 10897 edges · 180 communities (160 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 93 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `40a07aea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hvac-audit-export.ts
- auth.ts
- prisma
- Input
- Equipment Admin Queries
- calculator-logs-client.tsx
- Report Export Queries
- AdminMasterEquipmentFilters
- map.tsx
- Package & ESLint Config
- cn
- admin/dashboard/page.tsx
- Runtime Dependencies
- Button
- admin-master-data-queries.ts
- AC Mapping Calculator Proposal
- hvac-audit-form.tsx
- energy-audit-export-filters.ts
- store-mep-simulator-client.tsx
- Card
- audit-validation.ts
- result-db.tsx
- Branch Audit Summaries
- equipment-list.tsx
- step3.tsx
- ac-estimation-client.tsx
- AdminMasterEquipmentTable
- admin/stores/data/route.ts
- energy-audit-export-dialog.tsx
- LightEstimationClient
- validation/page.tsx
- audit-kalkulator.test.ts
- eslint.config.mjs
- audit-validation-queries.ts
- admin-user-queries.ts
- shadcn components.json
- 20260604000000_baseline_before_power_modes/migration.sql
- Badge
- Badge
- admin-master-data-mutations.ts
- lighting-audit.ts
- audits/[id]/page.tsx
- Header
- TypeScript Config
- Root Layout & Theme
- energy-audit-queries.ts
- dxf-parser.ts
- ref_path
- Styling & Theming Rules
- admin-store-queries.ts
- Tone & Voice
- ai-recommendation.ts
- photos/route.ts
- kategori/page.tsx
- antislop-layoutmobile
- audits/data/route.ts
- energy-audit-export.ts
- lib/custom-equipment.ts
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- admin-calculator-queries.ts
- contrast-check.py
- technical-form.tsx
- custom-equipment-review.ts
- shadcn Forms & Composition
- HvacAuditForm
- request-guard.ts
- map-picker.tsx
- admin-equipment-table.tsx
- npm Scripts
- app/dashboard/page.tsx
- gypsum-tile-calculator.ts
- shadcn CLI & MCP
- Deploy Pipeline & Agent Guides
- Audit Domain Concepts
- Dokumentasi Spesifikasi Kalkulator Plafon Gypsum Tile
- PWA Service Worker
- PWA Manifest
- DOCX Generator Script
- 3-Pillar Ecosystem Architecture
- admin-users-table.tsx
- Landing Hero Illustration
- antislop-human
- import-stores.ts
- Prisma Seed
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- audit-recalculate.ts
- admin-entry/page.tsx
- change-user-role.ts
- energy-audit.ts
- admin-store-detail.ts
- route.spec.ts
- PWA Icon Set
- react
- hvac-audit.ts
- admin-report-filters.tsx
- admin-shell.tsx
- export-store-data.ts
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
- lib/admin-gap-filter.ts
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- audit-kalkulator.ts
- Group 3: Quality Locks (consistency)
- antislop
- core.ts
- reports/preview/route.ts
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- step-skeleton.tsx
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- filters.tsx
- The Craftsmanship Standard
- with
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- kategori/[id]/page.tsx
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- reports/page.tsx
- Changelog - Lamp Estimation Calculator
- AuditStartClient
- admin-dashboard-charts.tsx
- hvac-audit-export.test.ts
- admin-audit-detail.ts
- sync-stores.ts
- create-user.ts
- Logo
- admin-master-equipment-dialog.tsx
- AdminMasterStoreFilters
- submit-audit.ts
- CardContent
- scripts/import-users.ts
- Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- lighting-audit-form.tsx
- change-user-role.ts
- Alert
- allowBuilds
- master-data/stores/data/route.ts
- settings/page.tsx
- Store Coordinates Sync Plan
- Disaster Engine & Store Impact Verification Flow
- result-skeleton.tsx
- admin-master-categories-list.tsx
- role-access.ts
- master-data/page.tsx
- AdminStoreFilters
- interface
- backfill-audit-baseline.ts
- auth.ts
- scripts/get-temperature.ts
- dotenv
- prisma
- store-types.ts
- prisma

## God Nodes (most connected - your core abstractions)
1. `cn()` - 312 edges
2. `Button()` - 189 edges
3. `react` - 139 edges
4. `next` - 127 edges
5. `@tabler/icons-react` - 120 edges
6. `Badge()` - 91 edges
7. `Input()` - 79 edges
8. `Card()` - 71 edges
9. `Header()` - 62 edges
10. `CardHeader()` - 62 edges

## Surprising Connections (you probably didn't know these)
- `parseCoordinates` --conceptually_related_to--> `parseStoreSheetRows()`  [AMBIGUOUS]
  docs/store_coordinates_plan.md → lib/jobs/sync-stores.ts
- `5. Rencana Integrasi ke Store MEP Simulator` --references--> `GypsumTileResultCard()`  [INFERRED]
  docs/gypsum_tile_calculator_specification.md → components/audit/gypsum-tile-result-card.tsx
- `4. Pekerjaan di smart-energy-monitoring` --references--> `getSangatBorosStores()`  [INFERRED]
  docs/integrasi-sangat-boros-monitoring.md → lib/admin-sangat-boros.ts
- `6. Keputusan terbuka` --references--> `getSangatBorosStores()`  [INFERRED]
  docs/integrasi-sangat-boros-monitoring.md → lib/admin-sangat-boros.ts
- `3. Pekerjaan di sparta-energy` --references--> `isSangatBorosAudit()`  [INFERRED]
  docs/integrasi-sangat-boros-monitoring.md → lib/audit-validation-queries.ts

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

## Communities (180 total, 20 thin omitted)

### Community 0 - "hvac-audit-export.ts"
Cohesion: 0.12
Nodes (28): Context, GET(), getHvacAuditsForExport(), average(), COP_TARGET, AC_HEADER, acChecklistRows(), acCountRows() (+20 more)

### Community 1 - "auth.ts"
Cohesion: 0.09
Nodes (34): GET(), resolveSession(), globalForPrisma, cache, forgetProxySession(), getProxySession(), keyFor(), ProxySession (+26 more)

### Community 2 - "prisma"
Cohesion: 0.18
Nodes (15): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, getMepSimulationDetail(), AuditStartPage(), excludedBranchNames, excludedBranchNames (+7 more)

### Community 3 - "Input"
Cohesion: 0.08
Nodes (51): getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), BranchCombobox(), AdminCustomEquipmentReviewProps, AREA_LABELS (+43 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.08
Nodes (52): GET(), getFilter(), parseArea(), AdminEquipmentPage(), averagePerStore(), formatNumber(), getFilter(), parseArea() (+44 more)

### Community 5 - "calculator-logs-client.tsx"
Cohesion: 0.13
Nodes (23): AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams(), CalculatorLogsClient() (+15 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.09
Nodes (47): addCommonWhere(), AdminReportCellValue, AdminReportColumn, AdminReportDataset, AdminReportStatus, AdminReportType, allMasterEquipmentFilters, buildAuditHistoryDataset() (+39 more)

### Community 7 - "AdminMasterEquipmentFilters"
Cohesion: 0.53
Nodes (6): AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 8 - "map.tsx"
Cohesion: 0.04
Nodes (70): LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon (+62 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.05
Nodes (54): devDependencies, @eslint/eslintrc@^3, jest@^30.3.0, jest-environment-jsdom@^30.3.0, postcss@^8, prettier@^3.8.1, prettier-plugin-tailwindcss@^0.7.2, tailwindcss@^4.2.1 (+46 more)

### Community 10 - "cn"
Cohesion: 0.08
Nodes (50): AvatarGroupCount(), ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, ComboboxClear(), ComboboxInput(), ComboboxTrigger() (+42 more)

### Community 11 - "admin/dashboard/page.tsx"
Cohesion: 0.13
Nodes (24): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+16 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, @base-ui/react@^1.4.1, better-auth@^1.6.5, clsx@^2.1.1, cmdk@^1.1.1, date-fns@^4.1.0, leaflet.markercluster@^1.5.3, next@16.1.7 (+33 more)

### Community 13 - "Button"
Cohesion: 0.08
Nodes (77): AcMappingClient(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim(), getCashierZonePolygon() (+69 more)

### Community 14 - "admin-master-data-queries.ts"
Cohesion: 0.08
Nodes (30): CountRow, defaultMasterDataOrder, defaultMasterEquipmentSort, defaultMasterStoreSort, EquipmentArea, getEquipmentFromSql(), getEquipmentOrderBySql(), getEquipmentWhereSql() (+22 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "hvac-audit-form.tsx"
Cohesion: 0.10
Nodes (43): AboutPage(), InfoRow(), copTone, deltaTone, HvacAcUnitCard(), HvacAcUnitCardProps, roomTone, areaFormat (+35 more)

### Community 17 - "energy-audit-export-filters.ts"
Cohesion: 0.15
Nodes (19): AVAILABLE_ENERGY_AUDIT_CATEGORIES, CategoryStatusMap, ENERGY_AUDIT_CATEGORIES, EnergyAuditCategoryInfo, EnergyAuditCategoryProgress, progress, toCategoryProgress(), defaultExportFilters() (+11 more)

### Community 18 - "store-mep-simulator-client.tsx"
Cohesion: 0.06
Nodes (54): AcMappingClientProps, getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), StoreData, LightEstimationClientProps, ActiveTool, applyCashierBoxToPolygon() (+46 more)

### Community 19 - "Card"
Cohesion: 0.15
Nodes (29): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), AdminMetricCard(), AdminMetricTone, metricToneStyles (+21 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.11
Nodes (39): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+31 more)

### Community 21 - "result-db.tsx"
Cohesion: 0.07
Nodes (37): EfficiencyBreakdownChart(), AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore, AuditValidationInfo (+29 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "equipment-list.tsx"
Cohesion: 0.16
Nodes (16): AddEquipmentDialogProps, areaCategory, recordedQty(), EquipmentListProps, FormState, AreaKey, areaLabels, areaOrder (+8 more)

### Community 24 - "step3.tsx"
Cohesion: 0.09
Nodes (31): deleteAuditDraft(), getAuditDraft(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), AuditStepNavigate, AuditStepNavigateOptions (+23 more)

### Community 25 - "ac-estimation-client.tsx"
Cohesion: 0.08
Nodes (38): AcEstimationClient(), AcEstimationClientProps, MapPicker, EstimationResultCard(), EstimationResultCardData, Props, Row(), Brand (+30 more)

### Community 26 - "AdminMasterEquipmentTable"
Cohesion: 0.20
Nodes (6): AdminMasterEquipmentTable(), SortableHeader(), updateSort(), formatDate(), formatNumber(), getNextSortOrder()

### Community 27 - "admin/stores/data/route.ts"
Cohesion: 0.25
Nodes (17): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, adminStoresPageSize (+9 more)

### Community 28 - "energy-audit-export-dialog.tsx"
Cohesion: 0.13
Nodes (25): AdminMasterDataNav(), EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips(), ComboboxChipsInput() (+17 more)

### Community 29 - "LightEstimationClient"
Cohesion: 0.08
Nodes (48): getRabData(), saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), SHAPES, SnapGuide (+40 more)

### Community 30 - "validation/page.tsx"
Cohesion: 0.20
Nodes (12): AuditValidationPage(), pageHref(), Props, firstValue(), parseValidationFilters(), SearchParamValue, ValidationGapFilter, ValidationListFilters (+4 more)

### Community 31 - "audit-kalkulator.test.ts"
Cohesion: 0.15
Nodes (11): ac, acRows, chiller, chillerCalc, coffee, freezer, lateAc, masterStandard (+3 more)

### Community 32 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9.39.4, eslint-config-next@16.1.7, eslint, eslint-config-next

### Community 33 - "audit-validation-queries.ts"
Cohesion: 0.13
Nodes (17): AuditValidationDetailPage(), Props, 3. Pekerjaan di sparta-energy, activeStoreSql, getValidationAudit(), isSangatBorosAudit(), latestAuditPerStore, RawValidationRow (+9 more)

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.14
Nodes (28): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+20 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "20260604000000_baseline_before_power_modes/migration.sql"
Cohesion: 0.10
Nodes (29): "account", "session", "verification", "account", "audit_items", "audit_pln_std_history", "audit_recommendations", "audits" (+21 more)

### Community 37 - "Badge"
Cohesion: 0.12
Nodes (27): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+19 more)

### Community 38 - "Badge"
Cohesion: 0.13
Nodes (25): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.11
Nodes (35): ActionResult, deleteUser(), DeleteUserInput, ActionResult, checkExistingEmails(), hashPassword(), ImportUserInput, importUsersBulk() (+27 more)

### Community 40 - "lighting-audit.ts"
Cohesion: 0.04
Nodes (74): restoreBackup(), boxTone, decimalFormat, labelRowsTop(), labelTone, LampLayout, LuxPlan(), pointAverage() (+66 more)

### Community 41 - "audits/[id]/page.tsx"
Cohesion: 0.13
Nodes (25): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 42 - "Header"
Cohesion: 0.18
Nodes (18): AcEstimationLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationDetailLoading(), AuditValidationLoading(), DashboardLoading(), HistoryLoading(), SettingsLoading() (+10 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "energy-audit-queries.ts"
Cohesion: 0.09
Nodes (28): LightingAuditPage(), Props, HvacAuditPage(), Props, exportDateRange(), AC_TYPES, areaToZone, availableCategoryKeys (+20 more)

### Community 46 - "dxf-parser.ts"
Cohesion: 0.08
Nodes (38): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+30 more)

### Community 47 - "ref_path"
Cohesion: 0.13
Nodes (15): calcSimetris(), evaluateDetailed(), run(), calcSimetris(), evaluateStatus(), run(), SimetrisResult, calcSimetris() (+7 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.11
Nodes (22): AdminStoreFilters, AdminStoreRow, AdminStoreSortKey, BranchRow, CountRow, defaultAdminStoreOrder, defaultAdminStoreSort, getAdminStoreCount() (+14 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "ai-recommendation.ts"
Cohesion: 0.31
Nodes (7): getDemoAiRecommendation(), AiRecommendationResponse, generateRecommendationWithFallback(), getAiClient(), MODEL_WATERFALL, @google/genai@^1.50.1, @google/genai

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (43): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+35 more)

### Community 53 - "kategori/page.tsx"
Cohesion: 0.17
Nodes (23): dateFormat, EnergyAuditListPage(), first(), pageHref(), Props, ValidationStoreList(), ValidationStoreListProps, AuditCard() (+15 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "audits/data/route.ts"
Cohesion: 0.06
Nodes (58): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+50 more)

### Community 56 - "energy-audit-export.ts"
Cohesion: 0.09
Nodes (36): GET(), GET(), Context, GET(), CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap(), CATEGORY_EXPORT_LOADERS (+28 more)

### Community 57 - "lib/custom-equipment.ts"
Cohesion: 0.26
Nodes (12): AREA_TYPE_CATEGORY, isUploadThingUrl(), normalizeName(), selectCustomEquipment(), syncCustomEquipmentSubmissions(), equipment(), fakeTx(), master (+4 more)

### Community 58 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.29
Nodes (7): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator, saveAcEstimationLog, saveLightEstimationLog

### Community 59 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "technical-form.tsx"
Cohesion: 0.24
Nodes (10): PlnDraftRow, AreaField, areaFields, TechnicalDraft, TechnicalForm(), TechnicalFormProps, UnitInput(), FieldGroup() (+2 more)

### Community 62 - "custom-equipment-review.ts"
Cohesion: 0.23
Nodes (13): ActionResult, approveCustomEquipmentAction(), rejectCustomEquipmentAction(), run(), approve(), handleResult(), reject(), approveCustomEquipment() (+5 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "HvacAuditForm"
Cohesion: 0.25
Nodes (15): formatCoord(), HvacAuditForm(), addUnit(), calculateStandard(), goToStep(), removeUnit(), restoreBackup(), save() (+7 more)

### Community 65 - "request-guard.ts"
Cohesion: 0.17
Nodes (17): countInWindow(), createLockout(), createRateLimiter(), getClientIp(), prune(), retryAfterSeconds(), limiter, lockout (+9 more)

### Community 66 - "map-picker.tsx"
Cohesion: 0.26
Nodes (11): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+3 more)

### Community 67 - "admin-equipment-table.tsx"
Cohesion: 0.24
Nodes (11): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+3 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "app/dashboard/page.tsx"
Cohesion: 0.12
Nodes (13): AuditResultPage(), Props, DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditItem, RecentAuditSection() (+5 more)

### Community 70 - "gypsum-tile-calculator.ts"
Cohesion: 0.11
Nodes (24): GypsumTileResultCard(), GypsumTileResultCardProps, AxisTileResult, calcTile1D(), calculateGypsumTileLayout(), ccw(), checkIsIrregular(), classifyCellAgainstPoly() (+16 more)

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
Cohesion: 0.11
Nodes (17): 0. Penanganan Denah Asimetris / Poligon (Trapesium, Huruf L, Sudut Serong), 1. Parameter Baku & Dimensi Panel, 2. Aturan Baku Pemasangan (Golden Rules), 3. Analisis File Excel Konsep & Koreksi Bug, 4. Desain Output & Pembedahan Panel, 5. Rencana Integrasi ke Store MEP Simulator, 6. Standar Acuan Baru: Koefisien Fix Jayaboard (Sheet "Koefisien 1.75"), 7. Catatan Mengenai Harga Satuan Material (Regional Pricing) (+9 more)

### Community 75 - "PWA Service Worker"
Cohesion: 0.18
Nodes (8): serwist, WorkerGlobalScope, nextConfig, withSerwist, serwist@^9.5.7, @serwist/next@^9.5.7, serwist, @serwist/next

### Community 76 - "PWA Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 77 - "DOCX Generator Script"
Cohesion: 0.39
Nodes (7): Escape-Xml(), Make-Box(), Make-Bullet(), Make-Heading1(), Make-Heading2(), Make-P(), Make-Table()

### Community 78 - "3-Pillar Ecosystem Architecture"
Cohesion: 0.25
Nodes (6): Auditor/Admin Role & Branch Access Model, smart-energy-meter-vps (IoT Ingestion), smart-energy-monitoring (Visualization Portal), Centralized SSO via sparta_energy users/sessions, 3-Pillar Smart Energy & Audit Ecosystem, better-auth Authentication Flow

### Community 79 - "admin-users-table.tsx"
Cohesion: 0.11
Nodes (26): AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate(), formatHours(), formatNumber(), getNextSortOrder(), numberFormat (+18 more)

### Community 80 - "Landing Hero Illustration"
Cohesion: 0.32
Nodes (8): Audit Completion Checkmark, Lime Green / Dark Teal Brand Palette, Field Auditor with Clipboard, Handheld Measuring Device / Thermometer Gun, Landing Hero Illustration (Store Energy Audit), Electrical Panel with kWh Meter and Breakers, Retail Store Equipment (Fridge, Lights, CCTV, Cashier), Rooftop Solar Panels

### Community 81 - "antislop-human"
Cohesion: 0.10
Nodes (20): antislop-human, Broken Tab Order, Color & Contrast, Color-Only Feedback, Focus & States, How to use this skill, Human Skill Checklist, Keyboard (+12 more)

### Community 82 - "import-stores.ts"
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

### Community 87 - "audit-recalculate.ts"
Cohesion: 0.26
Nodes (10): BOROS_TOLERANCE, calculateGapPercent(), calculateItemDailyKwh(), DAYS_PER_MONTH, isBorosFor(), ItemKwhInput, summarizeAuditItems(), calc (+2 more)

### Community 88 - "admin-entry/page.tsx"
Cohesion: 0.27
Nodes (10): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), handleSave(), getMonitoringDevices() (+2 more)

### Community 89 - "change-user-role.ts"
Cohesion: 0.22
Nodes (12): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, escapeCsv(), formatDate(), main() (+4 more)

### Community 90 - "energy-audit.ts"
Cohesion: 0.18
Nodes (16): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), saveLightingAudit(), SaveResult, getTemperature() (+8 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.18
Nodes (13): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getAdminStoreDetail(), getBrandName(), getEquipmentName(), isNonNegativeNumber() (+5 more)

### Community 92 - "route.spec.ts"
Cohesion: 0.27
Nodes (7): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet()

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "react"
Cohesion: 0.05
Nodes (55): LoginPage(), LoginToastNotice(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet, monthOptions, BranchComboboxProps, AdminEquipmentFiltersProps (+47 more)

### Community 95 - "hvac-audit.ts"
Cohesion: 0.05
Nodes (51): AcUnitSummary, CopStatus, createAcUnit(), createEmptyHvacAudit(), createExhaustZone(), currentOption(), DEFAULT_FAN_FLOW, DEFAULT_FAN_MODEL (+43 more)

### Community 96 - "admin-report-filters.tsx"
Cohesion: 0.27
Nodes (9): AdminReportFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminReportFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+1 more)

### Community 97 - "admin-shell.tsx"
Cohesion: 0.06
Nodes (62): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, AdminNavGroup, AdminNavItem, AdminShellProps, AdminSidebar() (+54 more)

### Community 99 - "export-store-data.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

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

### Community 115 - "lib/admin-gap-filter.ts"
Cohesion: 0.28
Nodes (12): AdminLayout(), AdminShell(), getAdminGapFilterEnabled, getAdminGapFilterSql(), getAdminGapHiddenCount(), gapFilteredAuditIdsSql(), getSangatBorosAuditIdsSql(), isAdminSangatBoros() (+4 more)

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

### Community 120 - "audit-kalkulator.ts"
Cohesion: 0.16
Nodes (20): submitAudit(), toAreaTarget(), handleSubmit(), buildDemoAuditResult(), toAreaTarget(), AuditItemRow, buildAuditItemRows(), CalcMethodInfo (+12 more)

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "core.ts"
Cohesion: 0.14
Nodes (18): discardCustomEquipmentPhoto(), f, imageOnly, ourFileRouter, OurFileRouter, requireMasterDataManager(), requireSignedIn(), GET (+10 more)

### Community 124 - "reports/preview/route.ts"
Cohesion: 0.30
Nodes (14): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+6 more)

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

### Community 129 - "filters.tsx"
Cohesion: 0.10
Nodes (42): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminDashboardFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+34 more)

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "with"
Cohesion: 0.09
Nodes (21): permissions, runs-on, steps, jobs, build, name, on, push (+13 more)

### Community 132 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 133 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 134 - "kategori/[id]/page.tsx"
Cohesion: 0.13
Nodes (20): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, formatGap(), ResultStatusBadge(), AcCountFlag(), AcCountFlagProps (+12 more)

### Community 135 - "Konsep Akses Role: Admin, Auditor, GS General Service, dan Area"
Cohesion: 0.15
Nodes (15): 10. Keputusan (26 Oktober 2026), 11. Simulasi role untuk testing lokal, 1. Siapa masuk ke mana, 2. Kondisi sekarang, 3. Login: satu cookie untuk semua subdomain, 4. Data izin (di DB 1, dibuat oleh sparta-energy), 5. Pembagian kerja, 6. Alur (+7 more)

### Community 136 - "reports/page.tsx"
Cohesion: 0.27
Nodes (12): AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams(), ReportCard (+4 more)

### Community 137 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.18
Nodes (10): Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1), KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0) (+2 more)

### Community 138 - "AuditStartClient"
Cohesion: 0.32
Nodes (5): getStoreByCodeAction(), AuditStartClient(), DemoPage(), Audit Step Skeleton and Result Loading Design, demoStores

### Community 139 - "admin-dashboard-charts.tsx"
Cohesion: 0.29
Nodes (7): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat

### Community 140 - "hvac-audit-export.test.ts"
Cohesion: 0.14
Nodes (10): HvacExportAudit, acHeaderIndex, audit, exHeaderIndex, plnRow, readings, recap, reopened (+2 more)

### Community 141 - "admin-audit-detail.ts"
Cohesion: 0.19
Nodes (14): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), buildIotLookup(), getIotStatusLookup(), getStoreIot() (+6 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 143 - "create-user.ts"
Cohesion: 0.11
Nodes (17): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, updateUser(), UpdateUserInput, POST() (+9 more)

### Community 144 - "Logo"
Cohesion: 0.47
Nodes (3): Page(), Logo(), LogoProps

### Community 145 - "admin-master-equipment-dialog.tsx"
Cohesion: 0.16
Nodes (16): AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterEquipmentFiltersProps, filterParamKeys, filterParamKeySet, PhotoUploadField(), setUploadingState(), upload() (+8 more)

### Community 146 - "AdminMasterStoreFilters"
Cohesion: 0.53
Nodes (6): AdminMasterStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 147 - "submit-audit.ts"
Cohesion: 0.16
Nodes (10): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, HistoryItem, HistoryResponse, SubmitAuditInput, DEMO_EMAIL (+2 more)

### Community 148 - "CardContent"
Cohesion: 0.32
Nodes (7): AuditStep2(), Step2AreaCard(), AuditStepIndicator(), AuditItem, AuditListSection(), AuditListSectionProps, CardContent()

### Community 149 - "scripts/import-users.ts"
Cohesion: 0.60
Nodes (4): main(), parseBranches(), pool, sha256()

### Community 150 - "Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring"
Cohesion: 0.29
Nodes (7): 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka, Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring, getSangatBorosStores()

### Community 151 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 153 - "lighting-audit-form.tsx"
Cohesion: 0.11
Nodes (26): StepActionBar(), dateFormat, LightingAuditForm(), goToStep(), save(), selectLuxPoint(), update(), updateZone() (+18 more)

### Community 154 - "change-user-role.ts"
Cohesion: 0.17
Nodes (10): @prisma/adapter-pg@^7.7.0, @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma, adapter (+2 more)

### Community 155 - "Alert"
Cohesion: 0.22
Nodes (16): formatKwh(), Comparison(), dateFormat, statusLabel(), ValidationPreview, ValidationSummary(), ValidationSummaryProps, DraftRestoreAlert() (+8 more)

### Community 156 - "allowBuilds"
Cohesion: 0.18
Nodes (10): allowBuilds, esbuild, msgpackr-extract, msw, prisma, @prisma/engines, protobufjs, sharp (+2 more)

### Community 157 - "master-data/stores/data/route.ts"
Cohesion: 0.39
Nodes (7): GET(), getFilter(), getMasterStoreRows(), getStoreOrderBySql(), masterStoresPageSize, parseMasterStoreHours(), parseMasterStoreSort()

### Community 158 - "settings/page.tsx"
Cohesion: 0.38
Nodes (5): MenuRow(), SectionLabel(), SettingsPage(), Theme, THEMES

### Community 159 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 161 - "result-skeleton.tsx"
Cohesion: 0.60
Nodes (3): AuditResultLoading(), DemoResultLoading(), AuditResultSkeleton()

### Community 162 - "admin-master-categories-list.tsx"
Cohesion: 0.40
Nodes (5): AdminMasterCategoriesList(), AdminMasterCategoriesListProps, CategoryItem, formatNumber(), numberFormat

### Community 163 - "role-access.ts"
Cohesion: 0.09
Nodes (40): ActionResult, deleteAudit(), getAuditHistory(), deleteMepSimulationLog(), MepSimulationListFilter, SaveMepSimulationPayload, SaveMepSimulationResult, excludedBranchNames (+32 more)

### Community 164 - "master-data/page.tsx"
Cohesion: 0.18
Nodes (21): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, getMasterDataSummary() (+13 more)

### Community 165 - "AdminStoreFilters"
Cohesion: 0.53
Nodes (6): AdminStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 166 - "interface"
Cohesion: 0.33
Nodes (5): interface, display_name, icon_large, icon_small, short_description

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.13
Nodes (20): BackfillAuditRow, BackfillChange, backfillCsv(), csvCell(), MIN_DIFF_KWH, planBaselineBackfill(), statusLabel(), csv (+12 more)

### Community 168 - "auth.ts"
Cohesion: 0.09
Nodes (18): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult, SaveLightEstimationPayload, SaveLightEstimationResult, GET (+10 more)

### Community 169 - "scripts/get-temperature.ts"
Cohesion: 0.40
Nodes (3): fmt(), main(), url

### Community 170 - "dotenv"
Cohesion: 0.40
Nodes (5): dotenv@^17.4.2, dotenv, escapeCsv(), main(), pool

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
- **46 isolated node(s):** `{ signIn, signOut, useSession }`, `Toast via sonner`, `Alfamart Emblem (small)`, `Alfamart Wordmark Logo`, `shadcn Presets (named, code, URL)` (+41 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1228 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `app/dashboard/page.tsx` to `hvac-audit-export.ts`, `auth.ts`, `prisma`, `Input`, `filters.tsx`, `calculator-logs-client.tsx`, `kategori/[id]/page.tsx`, `lighting-audit-form.tsx`, `Package & ESLint Config`, `admin/dashboard/page.tsx`, `Runtime Dependencies`, `Button`, `create-user.ts`, `Logo`, `hvac-audit-form.tsx`, `admin-master-equipment-dialog.tsx`, `submit-audit.ts`, `audit-validation.ts`, `result-db.tsx`, `Branch Audit Summaries`, `equipment-list.tsx`, `step3.tsx`, `ac-estimation-client.tsx`, `Card`, `admin/stores/data/route.ts`, `energy-audit-export-dialog.tsx`, `master-data/stores/data/route.ts`, `validation/page.tsx`, `LightEstimationClient`, `settings/page.tsx`, `audit-validation-queries.ts`, `admin-user-queries.ts`, `role-access.ts`, `master-data/page.tsx`, `Badge`, `Badge`, `admin-master-data-mutations.ts`, `auth.ts`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `energy-audit-queries.ts`, `kategori/page.tsx`, `audits/data/route.ts`, `energy-audit-export.ts`, `custom-equipment-review.ts`, `admin-equipment-table.tsx`, `admin-users-table.tsx`, `admin-entry/page.tsx`, `energy-audit.ts`, `route.spec.ts`, `react`, `admin-report-filters.tsx`, `admin-shell.tsx`, `lib/admin-gap-filter.ts`, `core.ts`, `reports/preview/route.ts`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `{ signIn, signOut, useSession }`, `Toast via sonner`, `Alfamart Emblem (small)` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hvac-audit-export.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12096774193548387 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `filters.tsx`, `Input`, `Equipment Admin Queries`, `calculator-logs-client.tsx`, `kategori/[id]/page.tsx`, `map.tsx`, `Button`, `hvac-audit-form.tsx`, `admin-master-equipment-dialog.tsx`, `Logo`, `Card`, `CardContent`, `result-db.tsx`, `equipment-list.tsx`, `step3.tsx`, `ac-estimation-client.tsx`, `AdminMasterEquipmentTable`, `Alert`, `lighting-audit-form.tsx`, `energy-audit-export-dialog.tsx`, `settings/page.tsx`, `role-access.ts`, `Badge`, `Badge`, `lighting-audit.ts`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `kategori/page.tsx`, `technical-form.tsx`, `HvacAuditForm`, `map-picker.tsx`, `admin-equipment-table.tsx`, `admin-users-table.tsx`, `react`, `admin-shell.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09494949494949495 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._