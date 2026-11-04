# Graph Report - sparta-energy  (2026-11-04)

## Corpus Check
- 469 files · ~386,264 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3706 nodes · 10943 edges · 170 communities (153 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 94 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `242e4c44`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hvac-audit-export.ts
- auth.ts
- step2.tsx
- Input
- Equipment Admin Queries
- calculator-logs-client.tsx
- Report Export Queries
- ac-mapping-client.tsx
- map.tsx
- Package & ESLint Config
- audit-validation-queries.ts
- admin/dashboard/page.tsx
- Runtime Dependencies
- Button
- admin-master-data-queries.ts
- AC Mapping Calculator Proposal
- hvac-audit.ts
- hvac-audit-export.test.ts
- store-mep-simulator-client.tsx
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- step2-detail.tsx
- submit-audit.ts
- validation-detail.tsx
- admin-master-equipment-dialog.tsx
- breadcrumb.tsx
- energy-audit-export-dialog.tsx
- LightEstimationClient
- lux-measurement-table.tsx
- Badge
- audit-photos.tsx
- MapDrawControl
- admin-user-queries.ts
- shadcn components.json
- 20260604000000_baseline_before_power_modes/migration.sql
- MapDrawShapeButton
- stores/[id]/page.tsx
- admin-master-data-mutations.ts
- lighting-audit-form.tsx
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
- stores/[id]/page.tsx
- photos/route.ts
- kategori/page.tsx
- antislop-layoutmobile
- audits/data/route.ts
- lighting-audit-export.ts
- admin-audit-filters.tsx
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- admin-calculator-queries.ts
- contrast-check.py
- calculator-versions.ts
- custom-equipment-review.ts
- shadcn Forms & Composition
- HvacAuditForm
- request-guard.ts
- map-picker.tsx
- master-data/page.tsx
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
- AdminMasterEquipmentTable
- Landing Hero Illustration
- antislop-human
- import-stores.ts
- Prisma Seed
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- technical-form.tsx
- admin-entry/page.tsx
- change-user-role.ts
- admin-equipment-filters.tsx
- admin-store-detail.ts
- route.spec.ts
- PWA Icon Set
- react
- mep-layout-canvas-preview.tsx
- admin-user-import-dialog.tsx
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
- state-block.tsx
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- step3.tsx
- Group 3: Quality Locks (consistency)
- antislop
- core.ts
- reports/preview/route.ts
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- utils.ts
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- filters.tsx
- The Craftsmanship Standard
- with
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- export-audits.ts
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- reports/page.tsx
- Changelog - Lamp Estimation Calculator
- create-user.ts
- audit-technical.ts
- admin-dashboard-filters.tsx
- admin-audit-detail.ts
- sync-stores.ts
- role-access.ts
- equipment-thumbnail.tsx
- admin-audit-date-filter.ts
- Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring
- AdminMasterStoreFilters
- getMasterEquipmentRows
- scripts/import-users.ts
- generate-lamp-simulation.ts
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- hvac-audit-form.tsx
- change-user-role.ts
- result-db.tsx
- allowBuilds
- Store Coordinates Sync Plan
- Disaster Engine & Store Impact Verification Flow
- lib/admin-gap-filter.ts
- interface
- backfill-audit-baseline.ts
- prisma.ts
- scripts/get-temperature.ts

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

## Communities (170 total, 17 thin omitted)

### Community 0 - "hvac-audit-export.ts"
Cohesion: 0.11
Nodes (26): Context, GET(), AcCountFlag(), AcCountFlagProps, toneByStatus, getHvacAuditsForExport(), AcCountStatus, COP_TARGET (+18 more)

### Community 1 - "auth.ts"
Cohesion: 0.16
Nodes (24): GET(), resolveSession(), cache, forgetProxySession(), getProxySession(), keyFor(), ProxySession, BETTER_AUTH_SESSION_COOKIES (+16 more)

### Community 2 - "step2.tsx"
Cohesion: 0.11
Nodes (24): getStoreByCodeAction(), AuditStartClient(), AuditStepNavigate, AuditStepNavigateOptions, AuditStepTarget, Props, StoreData, DemoPage() (+16 more)

### Community 3 - "Input"
Cohesion: 0.14
Nodes (32): AuditFilterStatus, cache, EmptyState(), HistoryPage(), AdminCustomEquipmentReviewProps, AREA_LABELS, dateFormat, ReviewCard() (+24 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (46): GET(), getFilter(), parseArea(), AdminEquipmentPage(), averagePerStore(), formatNumber(), getFilter(), parseArea() (+38 more)

### Community 5 - "calculator-logs-client.tsx"
Cohesion: 0.12
Nodes (26): AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams(), CalculatorLogsClient() (+18 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.09
Nodes (47): addCommonWhere(), AdminReportCellValue, AdminReportColumn, AdminReportDataset, AdminReportStatus, AdminReportType, allMasterEquipmentFilters, buildAuditHistoryDataset() (+39 more)

### Community 7 - "ac-mapping-client.tsx"
Cohesion: 0.09
Nodes (37): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+29 more)

### Community 8 - "map.tsx"
Cohesion: 0.05
Nodes (48): LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker, LeafletPolygon, LeafletPolyline (+40 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.04
Nodes (63): eslintConfig, devDependencies, eslint@^9.39.4, eslint-config-next@16.1.7, @eslint/eslintrc@^3, jest@^30.3.0, jest-environment-jsdom@^30.3.0, postcss@^8 (+55 more)

### Community 10 - "audit-validation-queries.ts"
Cohesion: 0.08
Nodes (30): AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), AuditValidationDetailPage(), Props, AdminEntryLogoutButton() (+22 more)

### Community 11 - "admin/dashboard/page.tsx"
Cohesion: 0.13
Nodes (24): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+16 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, @base-ui/react@^1.4.1, better-auth@^1.6.5, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, date-fns@^4.1.0, @google/genai@^1.50.1 (+33 more)

### Community 13 - "Button"
Cohesion: 0.11
Nodes (49): deleteAuditDraft(), getAuditDraft(), AdminCustomEquipmentReview(), AdminMasterStoreDialog(), AdminMasterStoreDialogProps, AdminMasterStoreExportFilter(), AdminMasterStoreExportFilterProps, numberFormat (+41 more)

### Community 14 - "admin-master-data-queries.ts"
Cohesion: 0.08
Nodes (31): GET(), getFilter(), CountRow, defaultMasterDataOrder, defaultMasterEquipmentSort, defaultMasterStoreSort, EquipmentArea, getMasterStoreRows() (+23 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "hvac-audit.ts"
Cohesion: 0.06
Nodes (59): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), saveLightingAudit(), SaveResult, getTemperature() (+51 more)

### Community 17 - "hvac-audit-export.test.ts"
Cohesion: 0.09
Nodes (18): AC_UNIT_BTU, calculateAcUnits(), getClusterBtu(), detail, createAcUnit(), HvacExportAudit, acHeaderIndex, audit (+10 more)

### Community 18 - "store-mep-simulator-client.tsx"
Cohesion: 0.11
Nodes (33): getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle() (+25 more)

### Community 19 - "Card"
Cohesion: 0.16
Nodes (30): AuditResultLoading(), AuditValidationDetailLoading(), DashboardLoading(), DemoResultLoading(), AdminMetricCard(), AdminMetricTone, metricToneStyles, AuditResultSkeleton() (+22 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.05
Nodes (64): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+56 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.12
Nodes (22): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+14 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "step2-detail.tsx"
Cohesion: 0.09
Nodes (32): AcEstimationClient(), AcEstimationClientProps, MapPicker, EstimationResultCard(), EstimationResultCardData, Props, Row(), BrandCombobox() (+24 more)

### Community 24 - "submit-audit.ts"
Cohesion: 0.15
Nodes (13): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, getAvailableYears(), HistoryItem, HistoryResponse, SubmitAuditInput (+5 more)

### Community 25 - "validation-detail.tsx"
Cohesion: 0.10
Nodes (25): saveValidationDraft(), validateAudit(), AddEquipmentDialogProps, areaCategory, recordedQty(), EquipmentListProps, FormState, AreaKey (+17 more)

### Community 26 - "admin-master-equipment-dialog.tsx"
Cohesion: 0.12
Nodes (25): AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminMasterEquipmentFiltersProps (+17 more)

### Community 27 - "breadcrumb.tsx"
Cohesion: 0.36
Nodes (8): AdminSiteHeader(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 28 - "energy-audit-export-dialog.tsx"
Cohesion: 0.08
Nodes (55): EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear() (+47 more)

### Community 29 - "LightEstimationClient"
Cohesion: 0.09
Nodes (37): getRabData(), saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), LightEstimationClientProps, SHAPES (+29 more)

### Community 30 - "lux-measurement-table.tsx"
Cohesion: 0.33
Nodes (8): LuxMeasurementTable(), LuxMeasurementTableProps, parseLux(), pointHint(), pointTone, rowAreas(), getDimLuxLimit(), getLuxLevel()

### Community 31 - "Badge"
Cohesion: 0.15
Nodes (21): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, formatGap(), formatKwh(), ResultStatusBadge(), ResultStatusBadgeProps (+13 more)

### Community 32 - "audit-photos.tsx"
Cohesion: 0.15
Nodes (20): AuditPhotoContext, AuditPhotos(), remove(), upload(), AuditPhotosProps, compressPhoto(), photoUrl(), WebcamCapture() (+12 more)

### Community 33 - "MapDrawControl"
Cohesion: 0.31
Nodes (9): ButtonGroup(), buttonGroupVariants, MapControlContainer(), MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapSearchControl() (+1 more)

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.14
Nodes (28): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+20 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "20260604000000_baseline_before_power_modes/migration.sql"
Cohesion: 0.10
Nodes (29): "account", "session", "verification", "account", "audit_items", "audit_pln_std_history", "audit_recommendations", "audits" (+21 more)

### Community 37 - "MapDrawShapeButton"
Cohesion: 0.13
Nodes (17): LeafletMarkerClusterGroup, MapDrawActionButton(), MapDrawDelete(), MapDrawEdit(), MapDrawUndo(), MapMarkerClusterGroup(), useLeaflet(), loadLeaflet() (+9 more)

### Community 38 - "stores/[id]/page.tsx"
Cohesion: 0.08
Nodes (46): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+38 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.10
Nodes (37): ActionResult, deleteUser(), DeleteUserInput, ActionResult, updateUser(), UpdateUserInput, DELETE(), PUT() (+29 more)

### Community 40 - "lighting-audit-form.tsx"
Cohesion: 0.03
Nodes (98): CategorySummaryProps, dateFormat, LightingAuditForm(), goToStep(), restoreBackup(), save(), selectLuxPoint(), update() (+90 more)

### Community 41 - "audits/[id]/page.tsx"
Cohesion: 0.12
Nodes (25): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 42 - "Header"
Cohesion: 0.10
Nodes (33): AcEstimationLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationLoading(), AuditValidationPage(), pageHref(), Props, HistoryLoading() (+25 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "energy-audit-queries.ts"
Cohesion: 0.08
Nodes (30): LightingAuditPage(), Props, HvacAuditPage(), Props, AVAILABLE_ENERGY_AUDIT_CATEGORIES, CategoryStatusMap, ENERGY_AUDIT_CATEGORIES, EnergyAuditCategoryInfo (+22 more)

### Community 46 - "dxf-parser.ts"
Cohesion: 0.10
Nodes (33): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+25 more)

### Community 47 - "ref_path"
Cohesion: 0.14
Nodes (13): calcSimetris(), evaluateDetailed(), run(), calcSimetris(), evaluateStatus(), run(), pool, test() (+5 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.10
Nodes (40): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, getAdminGapFilterSql() (+32 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "stores/[id]/page.tsx"
Cohesion: 0.12
Nodes (26): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+18 more)

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (42): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+34 more)

### Community 53 - "kategori/page.tsx"
Cohesion: 0.16
Nodes (24): dateFormat, EnergyAuditListPage(), first(), pageHref(), Props, ValidationStoreList(), ValidationStoreListProps, AuditCard() (+16 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "audits/data/route.ts"
Cohesion: 0.09
Nodes (44): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+36 more)

### Community 56 - "lighting-audit-export.ts"
Cohesion: 0.07
Nodes (49): GET(), GET(), Context, GET(), CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap(), CATEGORY_EXPORT_LOADERS (+41 more)

### Community 57 - "admin-audit-filters.tsx"
Cohesion: 0.12
Nodes (23): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+15 more)

### Community 58 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.29
Nodes (7): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator, saveAcEstimationLog, saveLightEstimationLog

### Community 59 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "calculator-versions.ts"
Cohesion: 0.21
Nodes (8): GypsumTileExportCardData, Props, LightEstimationResultCard(), LightEstimationResultCardData, Props, Row(), GYPSUM_CALCULATOR_VERSION, LAMP_CALCULATOR_VERSION

### Community 62 - "custom-equipment-review.ts"
Cohesion: 0.13
Nodes (24): ActionResult, approveCustomEquipmentAction(), rejectCustomEquipmentAction(), run(), approve(), handleResult(), reject(), AREA_TYPE_CATEGORY (+16 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "HvacAuditForm"
Cohesion: 0.17
Nodes (20): createUnitLike(), formatCoord(), HvacAuditForm(), addUnit(), calculateStandard(), goToStep(), removeUnit(), restoreBackup() (+12 more)

### Community 65 - "request-guard.ts"
Cohesion: 0.17
Nodes (17): countInWindow(), createLockout(), createRateLimiter(), getClientIp(), prune(), retryAfterSeconds(), limiter, lockout (+9 more)

### Community 66 - "map-picker.tsx"
Cohesion: 0.21
Nodes (13): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+5 more)

### Community 67 - "master-data/page.tsx"
Cohesion: 0.13
Nodes (28): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, AdminMasterCategoriesList() (+20 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "app/dashboard/page.tsx"
Cohesion: 0.22
Nodes (10): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditItem, RecentAuditSection(), RecentAuditSectionProps, RecentAuditStatus (+2 more)

### Community 70 - "gypsum-tile-calculator.ts"
Cohesion: 0.11
Nodes (25): GypsumTileResultCard(), GypsumTileResultCardProps, AxisTileResult, calcTile1D(), calculateGypsumTileLayout(), ccw(), checkIsIrregular(), classifyCellAgainstPoly() (+17 more)

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

### Community 79 - "AdminMasterEquipmentTable"
Cohesion: 0.15
Nodes (15): setAdminGapFilter(), AdminGapFilterToggle(), numberFormat, AdminMasterEquipmentTable(), SortableHeader(), updateSort(), formatDate(), formatNumber() (+7 more)

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

### Community 87 - "technical-form.tsx"
Cohesion: 0.13
Nodes (20): dateToTimeStr(), TimeRangeCards(), TimeRangeCardsProps, timeStrToDate(), PlnDraftRow, PlnHistoryEditor(), PlnHistoryEditorProps, toNumberOrZero() (+12 more)

### Community 88 - "admin-entry/page.tsx"
Cohesion: 0.26
Nodes (11): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), handleSave(), getEnergyMonitoringUrl() (+3 more)

### Community 89 - "change-user-role.ts"
Cohesion: 0.21
Nodes (12): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg@^8.20.0, pg, escapeCsv(), main() (+4 more)

### Community 90 - "admin-equipment-filters.tsx"
Cohesion: 0.13
Nodes (21): AdminEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminEquipmentFiltersProps, areaOptions, filterParamKeys (+13 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.22
Nodes (11): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getBrandName(), getEquipmentName(), isNonNegativeNumber(), isPositiveNumber() (+3 more)

### Community 92 - "route.spec.ts"
Cohesion: 0.27
Nodes (7): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet()

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "react"
Cohesion: 0.11
Nodes (21): LoginPage(), LoginToastNotice(), AdminMasterStoreFiltersProps, filterParamKeys, filterParamKeySet, DeviceGroup, groupDevices(), LoadState (+13 more)

### Community 95 - "mep-layout-canvas-preview.tsx"
Cohesion: 0.16
Nodes (17): checkLampObstacle(), formatDim(), getCashierZonePolygon(), getMaxInwardDepth(), getStoreScaleInfo(), MepFloorPlanCanvasPreview(), MepFloorPlanCanvasPreviewProps, PlacedAcUnit (+9 more)

### Community 96 - "admin-user-import-dialog.tsx"
Cohesion: 0.53
Nodes (6): ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv(), parseCsvLine()

### Community 97 - "admin-shell.tsx"
Cohesion: 0.06
Nodes (47): Page(), AdminGapFilterState, AdminNavGroup, AdminNavItem, AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminUser (+39 more)

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

### Community 115 - "state-block.tsx"
Cohesion: 0.25
Nodes (8): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), StateBlock(), StateBlockAction, StateBlockProps

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

### Community 120 - "step3.tsx"
Cohesion: 0.08
Nodes (39): getDemoAiRecommendation(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), submitAudit(), AreaTarget, AuditStep3() (+31 more)

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "core.ts"
Cohesion: 0.14
Nodes (17): discardCustomEquipmentPhoto(), f, imageOnly, ourFileRouter, OurFileRouter, requireMasterDataManager(), requireSignedIn(), GET (+9 more)

### Community 124 - "reports/preview/route.ts"
Cohesion: 0.30
Nodes (14): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+6 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "utils.ts"
Cohesion: 0.10
Nodes (21): BranchCombobox(), BranchComboboxProps, Brand, BrandComboboxProps, ButtonGroupSeparator(), ButtonGroupText(), FieldSeparator(), ItemSeparator() (+13 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "filters.tsx"
Cohesion: 0.13
Nodes (32): AdminHeaderActions(), HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, FilterI18nConfig, FilterOperator, FilterOption (+24 more)

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

### Community 134 - "export-audits.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDate(), main(), pool

### Community 135 - "Konsep Akses Role: Admin, Auditor, GS General Service, dan Area"
Cohesion: 0.15
Nodes (15): 10. Keputusan (26 Oktober 2026), 11. Simulasi role untuk testing lokal, 1. Siapa masuk ke mana, 2. Kondisi sekarang, 3. Login: satu cookie untuk semua subdomain, 4. Data izin (di DB 1, dibuat oleh sparta-energy), 5. Pembagian kerja, 6. Alur (+7 more)

### Community 136 - "reports/page.tsx"
Cohesion: 0.27
Nodes (12): AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams(), ReportCard (+4 more)

### Community 137 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.29
Nodes (5): Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, KALKULATOR LAMPU SIMETRIS sheet, calculatePenalties (weighted 100x/10x/1x), JB Distribution Analysis (40,401 room combinations, 84% ideal)

### Community 138 - "create-user.ts"
Cohesion: 0.12
Nodes (15): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, checkExistingEmails(), hashPassword(), ImportUserInput (+7 more)

### Community 139 - "audit-technical.ts"
Cohesion: 0.18
Nodes (11): AuditTechnicalColumns, DecimalLike, readDraftTechnical(), TechnicalInput, TechnicalSource, allDay, areas, legacy (+3 more)

### Community 140 - "admin-dashboard-filters.tsx"
Cohesion: 0.24
Nodes (10): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminDashboardFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+2 more)

### Community 141 - "admin-audit-detail.ts"
Cohesion: 0.19
Nodes (14): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), buildIotLookup(), getIotStatusLookup(), getStoreIot() (+6 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 143 - "role-access.ts"
Cohesion: 0.11
Nodes (32): ActionResult, deleteAudit(), getAuditHistory(), deleteMepSimulationLog(), MepSimulationListFilter, SaveMepSimulationPayload, SaveMepSimulationResult, GET() (+24 more)

### Community 144 - "equipment-thumbnail.tsx"
Cohesion: 0.27
Nodes (8): CATEGORY_ICONS, EquipmentThumbnailProps, SIZES, DEVICE_CATEGORIES, DeviceCategory, isDeviceCategory(), mapLegacyDeviceCategory(), rows

### Community 145 - "admin-audit-date-filter.ts"
Cohesion: 0.31
Nodes (8): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear(), addAuditWhereAnd(), getAdminAuditWhere()

### Community 146 - "Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring"
Cohesion: 0.29
Nodes (7): 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka, Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring, getSangatBorosStores()

### Community 147 - "AdminMasterStoreFilters"
Cohesion: 0.53
Nodes (6): AdminMasterStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 148 - "getMasterEquipmentRows"
Cohesion: 0.50
Nodes (5): getEquipmentFromSql(), getEquipmentOrderBySql(), getEquipmentWhereSql(), getMasterEquipmentCount(), getMasterEquipmentRows()

### Community 149 - "scripts/import-users.ts"
Cohesion: 0.60
Nodes (4): main(), parseBranches(), pool, sha256()

### Community 150 - "generate-lamp-simulation.ts"
Cohesion: 0.60
Nodes (4): SimetrisResult, calcSimetris(), evaluateStatus(), run()

### Community 151 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 153 - "hvac-audit-form.tsx"
Cohesion: 0.06
Nodes (56): AboutPage(), InfoRow(), copTone, deltaTone, HvacAcUnitCard(), HvacAcUnitCardProps, roomTone, areaFormat (+48 more)

### Community 154 - "change-user-role.ts"
Cohesion: 0.15
Nodes (12): @prisma/adapter-pg@^7.7.0, dotenv@^17.4.2, dotenv, @prisma/adapter-pg, adapter, main(), pool, printUsage() (+4 more)

### Community 155 - "result-db.tsx"
Cohesion: 0.12
Nodes (26): AuditResultPage(), DemoResultPage(), AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore (+18 more)

### Community 156 - "allowBuilds"
Cohesion: 0.18
Nodes (10): allowBuilds, esbuild, msgpackr-extract, msw, prisma, @prisma/engines, protobufjs, sharp (+2 more)

### Community 159 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 163 - "lib/admin-gap-filter.ts"
Cohesion: 0.26
Nodes (12): AdminLayout(), AdminShell(), SidebarInset(), getAdminGapFilterEnabled, getAdminGapHiddenCount(), gapFilteredAuditIdsSql(), getSangatBorosAuditIdsSql(), isAdminSangatBoros() (+4 more)

### Community 166 - "interface"
Cohesion: 0.33
Nodes (5): interface, display_name, icon_large, icon_small, short_description

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.13
Nodes (20): BackfillAuditRow, BackfillChange, backfillCsv(), csvCell(), MIN_DIFF_KWH, planBaselineBackfill(), statusLabel(), csv (+12 more)

### Community 168 - "prisma.ts"
Cohesion: 0.06
Nodes (46): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, getMepSimulationDetail(), fetchAccessToken(), getEnvOptional(), saveAcEstimationLog() (+38 more)

### Community 169 - "scripts/get-temperature.ts"
Cohesion: 0.40
Nodes (3): fmt(), main(), url

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1241 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `admin-master-data-mutations.ts` to `hvac-audit-export.ts`, `auth.ts`, `step2.tsx`, `Input`, `filters.tsx`, `calculator-logs-client.tsx`, `Package & ESLint Config`, `create-user.ts`, `admin/dashboard/page.tsx`, `audit-validation-queries.ts`, `admin-dashboard-filters.tsx`, `admin-master-data-queries.ts`, `role-access.ts`, `hvac-audit.ts`, `Button`, `Runtime Dependencies`, `Card`, `audit-validation.ts`, `Branch Audit Summaries`, `step2-detail.tsx`, `submit-audit.ts`, `hvac-audit-form.tsx`, `admin-master-equipment-dialog.tsx`, `result-db.tsx`, `validation-detail.tsx`, `LightEstimationClient`, `Badge`, `admin-user-queries.ts`, `lib/admin-gap-filter.ts`, `stores/[id]/page.tsx`, `prisma.ts`, `audits/[id]/page.tsx`, `Header`, `lighting-audit-form.tsx`, `Root Layout & Theme`, `energy-audit-queries.ts`, `admin-store-queries.ts`, `stores/[id]/page.tsx`, `kategori/page.tsx`, `audits/data/route.ts`, `lighting-audit-export.ts`, `admin-audit-filters.tsx`, `custom-equipment-review.ts`, `master-data/page.tsx`, `app/dashboard/page.tsx`, `admin-entry/page.tsx`, `admin-equipment-filters.tsx`, `route.spec.ts`, `react`, `admin-shell.tsx`, `state-block.tsx`, `step3.tsx`, `core.ts`, `reports/preview/route.ts`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `{ signIn, signOut, useSession }`, `Toast via sonner`, `Alfamart Emblem (small)` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hvac-audit-export.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10967741935483871 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `energy-audit-export-dialog.tsx` to `hvac-audit-export.ts`, `filters.tsx`, `step2.tsx`, `Input`, `Equipment Admin Queries`, `calculator-logs-client.tsx`, `map.tsx`, `audit-validation-queries.ts`, `Button`, `equipment-thumbnail.tsx`, `Card`, `admin-dashboard-charts.tsx`, `step2-detail.tsx`, `validation-detail.tsx`, `admin-master-equipment-dialog.tsx`, `result-db.tsx`, `hvac-audit-form.tsx`, `breadcrumb.tsx`, `lux-measurement-table.tsx`, `Badge`, `audit-photos.tsx`, `MapDrawControl`, `lib/admin-gap-filter.ts`, `MapDrawShapeButton`, `stores/[id]/page.tsx`, `lighting-audit-form.tsx`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `stores/[id]/page.tsx`, `kategori/page.tsx`, `HvacAuditForm`, `map-picker.tsx`, `AdminMasterEquipmentTable`, `technical-form.tsx`, `react`, `admin-shell.tsx`, `step3.tsx`, `utils.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `step2.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1140819964349376 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._