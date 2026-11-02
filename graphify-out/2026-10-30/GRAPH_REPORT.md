# Graph Report - sparta-energy  (2026-10-30)

## Corpus Check
- 456 files · ~564,193 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3561 nodes · 10617 edges · 158 communities (147 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `daa1d3de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin-master-equipment-table.tsx
- auth.ts
- start-client.tsx
- Input
- Equipment Admin Queries
- start-client.tsx
- Report Export Queries
- admin-custom-equipment-review.tsx
- map.tsx
- Package & ESLint Config
- place-autocomplete.tsx
- admin/dashboard/page.tsx
- Runtime Dependencies
- Button
- admin-master-data-queries.ts
- AC Mapping Calculator Proposal
- hvac-audit.ts
- lighting-audit.ts
- store-mep-simulator-client.tsx
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- lux-measurement-table.tsx
- Header
- ac-estimation-client.tsx
- cn
- energy-audit-export-dialog.tsx
- calculator-logs-client.tsx
- LightEstimationClient
- ac-mapping-client.tsx
- admin-audit-filters.tsx
- Dev Dependencies
- Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring
- admin-user-queries.ts
- shadcn components.json
- submit-audit.ts
- EnergyAuditExportDialog
- Badge
- admin-master-data-mutations.ts
- useLeaflet
- audits/[id]/page.tsx
- audit-validation-queries.ts
- TypeScript Config
- Root Layout & Theme
- energy-audit-queries.ts
- dxf-parser.ts
- ref_path
- Styling & Theming Rules
- admin-store-queries.ts
- Tone & Voice
- step3.tsx
- photos/route.ts
- kategori/page.tsx
- antislop-layoutmobile
- audits/data/route.ts
- energy-audit-export.ts
- use-audit-store.ts
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- admin-calculator-queries.ts
- contrast-check.py
- hvac-audit-form.tsx
- custom-equipment-review.ts
- shadcn Forms & Composition
- lighting-audit-form.tsx
- dotenv
- admin-gap-filter-toggle.tsx
- react
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
- item-form-dialog.tsx
- Landing Hero Illustration
- antislop-human
- import-stores.ts
- Prisma Seed
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- calculator-versions.ts
- admin-entry/page.tsx
- change-user-role.ts
- HvacAuditForm
- admin-store-detail.ts
- MapDrawControl
- PWA Icon Set
- audit-photos.tsx
- map-picker.tsx
- light-estimation-client.tsx
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
- lib/admin-gap-filter.ts
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- audit-kalkulator.test.ts
- Group 3: Quality Locks (consistency)
- antislop
- energy-audit-categories.ts
- reports/preview/route.ts
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- filters.tsx
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- AdminDashboardFilters
- The Craftsmanship Standard
- route.spec.ts
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- step-skeleton.tsx
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- Badge
- admin-audit-date-filter.ts
- utils.ts
- audit-kalkulator.replay.test.ts
- Store Coordinates Sync Plan
- admin-audit-detail.ts
- sync-stores.ts
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- admin-master-categories-list.tsx
- AdminStoreFilters
- time-range-cards.tsx
- prisma.ts
- generate-lamp-simulation.js
- xlsx
- generate-lamp-simulation.ts
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- create-user.ts
- Disaster Engine & Store Impact Verification Flow
- role-access.ts
- master-data/page.tsx
- backfill-audit-baseline.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 312 edges
2. `Button()` - 189 edges
3. `react` - 138 edges
4. `next` - 125 edges
5. `@tabler/icons-react` - 119 edges
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

## Communities (158 total, 11 thin omitted)

### Community 0 - "admin-master-equipment-table.tsx"
Cohesion: 0.19
Nodes (8): AdminMasterEquipmentTable(), SortableHeader(), updateSort(), formatDate(), formatNumber(), getNextSortOrder(), numberFormat, MasterEquipmentRow

### Community 1 - "auth.ts"
Cohesion: 0.10
Nodes (33): GET, POST, GET(), GET(), GetSessionResult, resolveSession(), Session, User (+25 more)

### Community 2 - "start-client.tsx"
Cohesion: 0.16
Nodes (17): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, getMepSimulationDetail(), excludedBranchNames, searchStoresAction(), AuditStartPage() (+9 more)

### Community 3 - "Input"
Cohesion: 0.12
Nodes (38): AuditFilterStatus, cache, EmptyState(), HistoryPage(), BranchCombobox(), ReviewCard(), AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps (+30 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.08
Nodes (50): GET(), getFilter(), parseArea(), AdminEquipmentPage(), averagePerStore(), formatNumber(), getFilter(), parseArea() (+42 more)

### Community 5 - "start-client.tsx"
Cohesion: 0.15
Nodes (17): getStoreByCodeAction(), AuditStartClient(), AuditStepNavigate, AuditStepNavigateOptions, AuditStepTarget, Props, StoreData, DemoPage() (+9 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.10
Nodes (45): addCommonWhere(), AdminReportCellValue, AdminReportDataset, AdminReportStatus, AdminReportType, allMasterEquipmentFilters, buildAuditHistoryDataset(), buildBranchSummaryDataset() (+37 more)

### Community 7 - "admin-custom-equipment-review.tsx"
Cohesion: 0.11
Nodes (22): AdminCustomEquipmentReviewProps, AREA_LABELS, dateFormat, AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams() (+14 more)

### Community 8 - "map.tsx"
Cohesion: 0.06
Nodes (44): LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon (+36 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.04
Nodes (44): eslintConfig, name, packageManager, prisma, seed, private, type, version (+36 more)

### Community 10 - "place-autocomplete.tsx"
Cohesion: 0.14
Nodes (23): Command(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+15 more)

### Community 11 - "admin/dashboard/page.tsx"
Cohesion: 0.13
Nodes (25): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+17 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "Button"
Cohesion: 0.09
Nodes (56): deleteAuditDraft(), getAuditDraft(), AdminCustomEquipmentReview(), AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoresTable(), SortableHeader(), updateSort() (+48 more)

### Community 14 - "admin-master-data-queries.ts"
Cohesion: 0.08
Nodes (30): CountRow, defaultMasterDataOrder, defaultMasterEquipmentSort, defaultMasterStoreSort, EquipmentArea, getEquipmentFromSql(), getEquipmentOrderBySql(), getEquipmentWhereSql() (+22 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "hvac-audit.ts"
Cohesion: 0.04
Nodes (81): AcCountFlagProps, toneByStatus, AC_UNIT_BTU, calculateAcUnits(), getClusterBtu(), AcCountStatus, average(), COP_TARGET (+73 more)

### Community 17 - "lighting-audit.ts"
Cohesion: 0.05
Nodes (55): restoreBackup(), calculateLpd(), createDefaultLuxRows(), createEmptyLightingAudit(), DEFAULT_LUX_ROWS, ESTIMATED_PLAN_RATIO, getLpdStatus(), getLuxArea() (+47 more)

### Community 18 - "store-mep-simulator-client.tsx"
Cohesion: 0.11
Nodes (33): getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle() (+25 more)

### Community 19 - "Card"
Cohesion: 0.11
Nodes (43): EnergyAuditError(), AuditValidationError(), AuditValidationDetailLoading(), GlobalError(), Forbidden(), NotFound(), AdminMetricCard(), AdminMetricTone (+35 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.09
Nodes (45): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+37 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.07
Nodes (38): AuditResultPage(), DemoResultPage(), consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK() (+30 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "lux-measurement-table.tsx"
Cohesion: 0.10
Nodes (27): AuditPhotoContext, LuxMeasurementTable(), LuxMeasurementTableProps, parseLux(), pointHint(), pointTone, rowAreas(), boxTone (+19 more)

### Community 24 - "Header"
Cohesion: 0.11
Nodes (27): AcEstimationLoading(), AuditResultLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationLoading(), DashboardLoading(), DemoResultLoading(), HistoryLoading() (+19 more)

### Community 25 - "ac-estimation-client.tsx"
Cohesion: 0.12
Nodes (27): AcEstimationClient(), AcEstimationClientProps, MapPicker, getRabData(), getTemperature(), EstimationResultCard(), EstimationResultCardData, Props (+19 more)

### Community 26 - "cn"
Cohesion: 0.10
Nodes (35): AlertAction(), ButtonGroupSeparator(), ButtonGroupText(), FieldContent(), FieldSeparator(), FieldTitle(), ItemSeparator(), PopoverDescription() (+27 more)

### Community 27 - "energy-audit-export-dialog.tsx"
Cohesion: 0.14
Nodes (23): EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear() (+15 more)

### Community 28 - "calculator-logs-client.tsx"
Cohesion: 0.14
Nodes (22): AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams(), CalculatorLogsClient() (+14 more)

### Community 29 - "LightEstimationClient"
Cohesion: 0.17
Nodes (18): checkLampObstacle(), formatDim(), getCashierZonePolygon(), getMaxInwardDepth(), getStoreScaleInfo(), MepFloorPlanCanvasPreview(), MepFloorPlanCanvasPreviewProps, PlacedAcUnit (+10 more)

### Community 30 - "ac-mapping-client.tsx"
Cohesion: 0.11
Nodes (33): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+25 more)

### Community 31 - "admin-audit-filters.tsx"
Cohesion: 0.06
Nodes (51): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+43 more)

### Community 32 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, eslint, eslint-config-next, @eslint/eslintrc, jest, jest-environment-jsdom, postcss (+21 more)

### Community 33 - "Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring"
Cohesion: 0.29
Nodes (6): 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka, Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.14
Nodes (28): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+20 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "submit-audit.ts"
Cohesion: 0.13
Nodes (18): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, getAuditHistory(), getAvailableYears(), HistoryItem, HistoryResponse (+10 more)

### Community 37 - "EnergyAuditExportDialog"
Cohesion: 0.09
Nodes (44): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+36 more)

### Community 38 - "Badge"
Cohesion: 0.13
Nodes (25): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.17
Nodes (27): DELETE(), PUT(), POST(), DELETE(), PUT(), POST(), requireUserManager(), ApiMutationResult (+19 more)

### Community 40 - "useLeaflet"
Cohesion: 0.15
Nodes (17): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+9 more)

### Community 41 - "audits/[id]/page.tsx"
Cohesion: 0.13
Nodes (25): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 42 - "audit-validation-queries.ts"
Cohesion: 0.12
Nodes (20): AuditValidationPage(), pageHref(), Props, firstValue(), parseValidationFilters(), SearchParamValue, ValidationGapFilter, ValidationListFilters (+12 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "energy-audit-queries.ts"
Cohesion: 0.07
Nodes (41): Context, GET(), LightingAuditPage(), Props, Context, GET(), HvacAuditPage(), Props (+33 more)

### Community 46 - "dxf-parser.ts"
Cohesion: 0.09
Nodes (36): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+28 more)

### Community 47 - "ref_path"
Cohesion: 0.12
Nodes (12): escapeCsv(), formatDate(), main(), pool, fmt(), main(), url, pool (+4 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.10
Nodes (39): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, getAdminGapFilterSql() (+31 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "step3.tsx"
Cohesion: 0.16
Nodes (16): submitAudit(), toAreaTarget(), AreaTarget, handleSubmit(), AuditStep3Props, buildDemoAuditResult(), currentYear, makeBlankRows() (+8 more)

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (43): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+35 more)

### Community 53 - "kategori/page.tsx"
Cohesion: 0.09
Nodes (41): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, dateFormat, EnergyAuditListPage(), first(), pageHref() (+33 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "audits/data/route.ts"
Cohesion: 0.09
Nodes (44): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+36 more)

### Community 56 - "energy-audit-export.ts"
Cohesion: 0.10
Nodes (36): GET(), GET(), CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap(), CATEGORY_EXPORT_LOADERS, loadCategory(), ExportableCategory (+28 more)

### Community 57 - "use-audit-store.ts"
Cohesion: 0.18
Nodes (16): AREA_TYPE_CATEGORY, isUploadThingUrl(), normalizeName(), selectCustomEquipment(), syncCustomEquipmentSubmissions(), equipment(), fakeTx(), master (+8 more)

### Community 58 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.29
Nodes (7): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator, saveAcEstimationLog, saveLightEstimationLog

### Community 59 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "hvac-audit-form.tsx"
Cohesion: 0.06
Nodes (64): AreaField, areaFields, TechnicalDraft, TechnicalForm(), TechnicalFormProps, UnitInput(), EnergyAuditExportDialog(), copTone (+56 more)

### Community 62 - "custom-equipment-review.ts"
Cohesion: 0.23
Nodes (13): ActionResult, approveCustomEquipmentAction(), rejectCustomEquipmentAction(), run(), approve(), handleResult(), reject(), approveCustomEquipment() (+5 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "lighting-audit-form.tsx"
Cohesion: 0.06
Nodes (50): BrandCombobox(), AuditStepIndicator(), AuditStepIndicatorProps, StepActionBar(), DraftRestoreAlert(), DraftRestoreAlertProps, timeFormat, dateFormat (+42 more)

### Community 65 - "dotenv"
Cohesion: 0.15
Nodes (11): dotenv, prisma, @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma (+3 more)

### Community 66 - "admin-gap-filter-toggle.tsx"
Cohesion: 0.27
Nodes (12): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, BranchCell(), getBranchParts(), SidebarMenuButton(), sidebarMenuButtonVariants (+4 more)

### Community 67 - "react"
Cohesion: 0.09
Nodes (25): LoginPage(), LoginToastNotice(), BranchComboboxProps, AdminMasterStoreDialogProps, AdminMasterStoreExportFilterProps, numberFormat, DeviceGroup, groupDevices() (+17 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "app/dashboard/page.tsx"
Cohesion: 0.21
Nodes (7): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, canValidateAudit(), getEnergyAuditPendingCount(), next

### Community 70 - "gypsum-tile-calculator.ts"
Cohesion: 0.13
Nodes (18): GypsumTileResultCard(), GypsumTileResultCardProps, AxisTileResult, calcTile1D(), calculateGypsumTileLayout(), CROSS_TEE_LENGTH_M, GYPSUM_LENGTH_M, GYPSUM_WIDTH_M (+10 more)

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

### Community 79 - "item-form-dialog.tsx"
Cohesion: 0.12
Nodes (23): AddEquipmentDialogProps, areaCategory, recordedQty(), EquipmentListProps, FormState, AreaKey, areaLabels, formatHours() (+15 more)

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

### Community 87 - "calculator-versions.ts"
Cohesion: 0.21
Nodes (8): GypsumTileExportCardData, Props, LightEstimationResultCard(), LightEstimationResultCardData, Props, Row(), GYPSUM_CALCULATOR_VERSION, LAMP_CALCULATOR_VERSION

### Community 88 - "admin-entry/page.tsx"
Cohesion: 0.15
Nodes (18): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), AdminEntryPage(), DestinationCard() (+10 more)

### Community 89 - "change-user-role.ts"
Cohesion: 0.17
Nodes (15): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, escapeCsv(), main(), pool (+7 more)

### Community 90 - "HvacAuditForm"
Cohesion: 0.12
Nodes (30): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), saveLightingAudit(), SaveResult, createUnitLike() (+22 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.17
Nodes (12): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getBrandName(), getEquipmentName(), isNonNegativeNumber(), isPositiveNumber() (+4 more)

### Community 92 - "MapDrawControl"
Cohesion: 0.16
Nodes (13): ButtonGroup(), buttonGroupVariants, MapControlContainer(), MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapFullscreenControl() (+5 more)

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "audit-photos.tsx"
Cohesion: 0.10
Nodes (25): OurFileRouter, GET, POST, runtime, PhotoUploadField(), setUploadingState(), upload(), PhotoUploadFieldProps (+17 more)

### Community 95 - "map-picker.tsx"
Cohesion: 0.27
Nodes (10): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+2 more)

### Community 96 - "light-estimation-client.tsx"
Cohesion: 0.12
Nodes (30): saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), LightEstimationClientProps, SHAPES, SnapGuide (+22 more)

### Community 97 - "admin-shell.tsx"
Cohesion: 0.07
Nodes (43): Page(), AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminSiteHeader() (+35 more)

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

### Community 115 - "lib/admin-gap-filter.ts"
Cohesion: 0.31
Nodes (10): getAdminGapFilterEnabled, getAdminGapHiddenCount(), gapFilteredAuditIdsSql(), getSangatBorosAuditIdsSql(), getSangatBorosStores(), isAdminSangatBoros(), SangatBorosStore, ADMIN_GAP_FILTER_COOKIE (+2 more)

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

### Community 120 - "audit-kalkulator.test.ts"
Cohesion: 0.10
Nodes (23): AuditItemRow, buildAuditItemRows(), CalcMethodInfo, isAirConditioner(), isUsageBased(), ac, acRows, chiller (+15 more)

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "energy-audit-categories.ts"
Cohesion: 0.25
Nodes (8): EnergyAuditCategoryStatusListProps, AVAILABLE_ENERGY_AUDIT_CATEGORIES, CategoryStatusMap, ENERGY_AUDIT_CATEGORIES, EnergyAuditCategoryInfo, EnergyAuditCategoryProgress, progress, toCategoryProgress()

### Community 124 - "reports/preview/route.ts"
Cohesion: 0.25
Nodes (16): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+8 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "filters.tsx"
Cohesion: 0.13
Nodes (32): AdminHeaderActions(), HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, FilterI18nConfig, FilterOperator, FilterOption (+24 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "AdminDashboardFilters"
Cohesion: 0.47
Nodes (6): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), getParam(), DashboardGlobalFilters()

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "route.spec.ts"
Cohesion: 0.27
Nodes (7): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet()

### Community 132 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 133 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 134 - "step-skeleton.tsx"
Cohesion: 0.36
Nodes (9): AuditStepSkeleton(), AuditStepSkeletonProps, AuditStepSkeletonVariant, skeletonLabels, Step1Skeleton(), Step2DetailSkeleton(), Step2Skeleton(), Step3Skeleton() (+1 more)

### Community 135 - "Konsep Akses Role: Admin, Auditor, GS General Service, dan Area"
Cohesion: 0.15
Nodes (15): 10. Keputusan (26 Oktober 2026), 11. Simulasi role untuk testing lokal, 1. Siapa masuk ke mana, 2. Kondisi sekarang, 3. Login: satu cookie untuk semua subdomain, 4. Data izin (di DB 1, dibuat oleh sparta-energy), 5. Pembagian kerja, 6. Alur (+7 more)

### Community 136 - "Badge"
Cohesion: 0.14
Nodes (19): AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams(), ReportCard (+11 more)

### Community 137 - "admin-audit-date-filter.ts"
Cohesion: 0.31
Nodes (8): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear(), addAuditWhereAnd(), getAdminAuditWhere()

### Community 138 - "utils.ts"
Cohesion: 0.22
Nodes (11): AdminMasterDataNav(), Tabs(), TabsList(), tabsListVariants, TabsTrigger(), ToggleGroupContext, Toggle(), toggleVariants (+3 more)

### Community 139 - "audit-kalkulator.replay.test.ts"
Cohesion: 0.28
Nodes (8): AREA_NAMES, endTimeFor(), ExportRow, replay(), store, TF67, toEquipments(), W441

### Community 140 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 141 - "admin-audit-detail.ts"
Cohesion: 0.15
Nodes (17): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), BrandPhoto, pickBrandPhoto(), brands (+9 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 143 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.18
Nodes (10): Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1), KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0) (+2 more)

### Community 144 - "admin-master-categories-list.tsx"
Cohesion: 0.40
Nodes (5): AdminMasterCategoriesList(), AdminMasterCategoriesListProps, CategoryItem, formatNumber(), numberFormat

### Community 145 - "AdminStoreFilters"
Cohesion: 0.53
Nodes (6): AdminStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 146 - "time-range-cards.tsx"
Cohesion: 0.60
Nodes (4): dateToTimeStr(), TimeRangeCards(), TimeRangeCardsProps, timeStrToDate()

### Community 147 - "prisma.ts"
Cohesion: 0.10
Nodes (18): ActionResult, deleteUser(), DeleteUserInput, fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult (+10 more)

### Community 148 - "generate-lamp-simulation.js"
Cohesion: 0.83
Nodes (3): calcSimetris(), evaluateStatus(), run()

### Community 149 - "xlsx"
Cohesion: 0.60
Nodes (4): xlsx, calcSimetris(), evaluateDetailed(), run()

### Community 150 - "generate-lamp-simulation.ts"
Cohesion: 0.60
Nodes (4): SimetrisResult, calcSimetris(), evaluateStatus(), run()

### Community 151 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 157 - "create-user.ts"
Cohesion: 0.13
Nodes (12): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, checkExistingEmails(), hashPassword(), ImportUserInput (+4 more)

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 163 - "role-access.ts"
Cohesion: 0.09
Nodes (39): ActionResult, deleteAudit(), deleteMepSimulationLog(), MepSimulationListFilter, SaveMepSimulationPayload, SaveMepSimulationResult, ActionResult, updateUser() (+31 more)

### Community 164 - "master-data/page.tsx"
Cohesion: 0.14
Nodes (29): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+21 more)

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.13
Nodes (20): BackfillAuditRow, BackfillChange, backfillCsv(), csvCell(), MIN_DIFF_KWH, planBaselineBackfill(), statusLabel(), csv (+12 more)

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1275 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `app/dashboard/page.tsx` to `admin-master-equipment-table.tsx`, `auth.ts`, `start-client.tsx`, `route.spec.ts`, `Input`, `start-client.tsx`, `Equipment Admin Queries`, `admin-custom-equipment-review.tsx`, `Package & ESLint Config`, `utils.ts`, `admin/dashboard/page.tsx`, `Button`, `prisma.ts`, `audit-validation.ts`, `admin-dashboard-charts.tsx`, `Branch Audit Summaries`, `Card`, `Header`, `ac-estimation-client.tsx`, `calculator-logs-client.tsx`, `create-user.ts`, `admin-audit-filters.tsx`, `admin-user-queries.ts`, `role-access.ts`, `submit-audit.ts`, `master-data/page.tsx`, `Badge`, `admin-master-data-mutations.ts`, `EnergyAuditExportDialog`, `audits/[id]/page.tsx`, `audit-validation-queries.ts`, `Root Layout & Theme`, `energy-audit-queries.ts`, `admin-store-queries.ts`, `step3.tsx`, `kategori/page.tsx`, `audits/data/route.ts`, `energy-audit-export.ts`, `hvac-audit-form.tsx`, `custom-equipment-review.ts`, `lighting-audit-form.tsx`, `react`, `item-form-dialog.tsx`, `admin-entry/page.tsx`, `HvacAuditForm`, `light-estimation-client.tsx`, `admin-shell.tsx`, `lib/admin-gap-filter.ts`, `reports/preview/route.ts`, `filters.tsx`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09856035437430787 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `admin-master-equipment-table.tsx`, `Input`, `Equipment Admin Queries`, `start-client.tsx`, `admin-custom-equipment-review.tsx`, `Badge`, `map.tsx`, `place-autocomplete.tsx`, `utils.ts`, `Button`, `hvac-audit.ts`, `time-range-cards.tsx`, `Card`, `admin-dashboard-charts.tsx`, `lux-measurement-table.tsx`, `Header`, `ac-estimation-client.tsx`, `energy-audit-export-dialog.tsx`, `calculator-logs-client.tsx`, `EnergyAuditExportDialog`, `Badge`, `useLeaflet`, `audits/[id]/page.tsx`, `Root Layout & Theme`, `step3.tsx`, `kategori/page.tsx`, `hvac-audit-form.tsx`, `lighting-audit-form.tsx`, `admin-gap-filter-toggle.tsx`, `react`, `item-form-dialog.tsx`, `admin-entry/page.tsx`, `HvacAuditForm`, `MapDrawControl`, `audit-photos.tsx`, `admin-shell.tsx`, `filters.tsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.12019566736547868 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._