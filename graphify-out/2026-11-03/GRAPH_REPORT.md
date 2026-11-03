# Graph Report - sparta-energy  (2026-11-02)

## Corpus Check
- 466 files · ~382,623 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3678 nodes · 10876 edges · 178 communities (160 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `192e0174`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hvac-audit-export.ts
- auth.ts
- next
- calculator-logs-client.tsx
- Equipment Admin Queries
- pln-history-editor.tsx
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
- hvac-audit.ts
- lux-measurement-table.tsx
- store-mep-simulator-client.tsx
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- item-form-dialog.tsx
- step3.tsx
- ac-estimation-client.tsx
- admin-master-equipment-table.tsx
- lighting-audit-export.ts
- energy-audit-export-dialog.tsx
- LightEstimationClient
- light-estimation-client.tsx
- react
- eslint.config.mjs
- audit-validation-queries.ts
- admin-user-queries.ts
- shadcn components.json
- 20260604000000_baseline_before_power_modes/migration.sql
- Badge
- Badge
- admin-master-data-mutations.ts
- lighting-audit.test.ts
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
- admin-custom-equipment-review.tsx
- shadcn Forms & Composition
- hvac-audit-form.tsx
- request-guard.ts
- state-block.tsx
- step3.tsx
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
- admin-master-stores-table.tsx
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
- energy-audit.ts
- admin-store-detail.ts
- utils.ts
- PWA Icon Set
- audit-photos.tsx
- hvac-audit.test.ts
- LightingAuditForm
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
- ref_node_assert
- Group 3: Quality Locks (consistency)
- antislop
- core.ts
- reports/preview/route.ts
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- lighting-audit.ts
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- filters.tsx
- The Craftsmanship Standard
- with
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- ac-count-flag.tsx
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- reports/page.tsx
- Changelog - Lamp Estimation Calculator
- admin-audit-date-filter.ts
- Point
- hvac-audit-export.test.ts
- admin-audit-detail.ts
- sync-stores.ts
- actions/import-users.ts
- Button
- admin-master-equipment-dialog.tsx
- AdminMasterStoreFilters
- prisma.ts
- result-db.tsx
- scripts/import-users.ts
- validation-detail.tsx
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- lighting-audit-form.tsx
- change-user-role.ts
- Alert
- allowBuilds
- master-data/stores/data/route.ts
- settings/page.tsx
- audit-kalkulator.replay.test.ts
- Disaster Engine & Store Impact Verification Flow
- validation-summary.tsx
- ref_node_assert
- role-access.ts
- master-data/page.tsx
- sanitizeHvacAuditData
- interface
- backfill-audit-baseline.ts
- save-ac-estimation-log.ts
- scripts/get-temperature.ts
- dotenv
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

## Communities (178 total, 18 thin omitted)

### Community 0 - "hvac-audit-export.ts"
Cohesion: 0.15
Nodes (20): Context, GET(), getHvacAuditsForExport(), AC_HEADER, acChecklistRows(), acCountRows(), average(), ecoAndPhotoRows() (+12 more)

### Community 1 - "auth.ts"
Cohesion: 0.10
Nodes (36): GET, POST, GET(), GET(), GetSessionResult, resolveSession(), Session, signInKey() (+28 more)

### Community 2 - "next"
Cohesion: 0.09
Nodes (33): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, ActionResult, deleteAudit(), deleteMepSimulationLog(), getMepSimulationDetail() (+25 more)

### Community 3 - "calculator-logs-client.tsx"
Cohesion: 0.09
Nodes (43): getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), CreateUserDialog(), handleRoleChange(), EditUserDialog() (+35 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (48): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+40 more)

### Community 5 - "pln-history-editor.tsx"
Cohesion: 0.31
Nodes (8): PlnDraftRow, PlnHistoryEditor(), PlnHistoryEditorProps, yearOptions(), averagePlnKwh(), BILLING_MONTH_NAMES, formatBillingMonth(), parseBillingMonth()

### Community 6 - "Report Export Queries"
Cohesion: 0.09
Nodes (48): defaultMasterDataOrder, defaultMasterStoreSort, MasterStoreCompletenessFilter, MasterStoreFilters, addCommonWhere(), AdminReportColumn, AdminReportDataset, AdminReportStatus (+40 more)

### Community 7 - "AdminMasterEquipmentFilters"
Cohesion: 0.53
Nodes (6): AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 8 - "map.tsx"
Cohesion: 0.04
Nodes (84): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+76 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.05
Nodes (56): devDependencies, @eslint/eslintrc@^3, jest@^30.3.0, jest-environment-jsdom@^30.3.0, postcss@^8, prettier@^3.8.1, prettier-plugin-tailwindcss@^0.7.2, tailwindcss@^4.2.1 (+48 more)

### Community 10 - "cn"
Cohesion: 0.09
Nodes (45): AvatarBadge(), AvatarGroup(), AvatarGroupCount(), ButtonGroupSeparator(), ButtonGroupText(), ComboboxClear(), ComboboxInput(), Command() (+37 more)

### Community 11 - "admin/dashboard/page.tsx"
Cohesion: 0.12
Nodes (26): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+18 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @base-ui/react@^1.4.1, clsx@^2.1.1, cmdk@^1.1.1, date-fns@^4.1.0, @google/genai@^1.50.1, html-to-image@^1.11.13, leaflet.markercluster@^1.5.3 (+34 more)

### Community 13 - "Button"
Cohesion: 0.13
Nodes (38): AdminCustomEquipmentReview(), AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoreExportFilterProps, numberFormat, AdminReportActions(), handleOpenChange(), loadPreview() (+30 more)

### Community 14 - "admin-master-data-queries.ts"
Cohesion: 0.10
Nodes (26): CountRow, defaultMasterEquipmentSort, EquipmentArea, getEquipmentFromSql(), getEquipmentOrderBySql(), getEquipmentWhereSql(), getMasterDataSummary(), getMasterEquipmentCount() (+18 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "hvac-audit.ts"
Cohesion: 0.06
Nodes (49): deltaTone, HvacAcUnitCardProps, roomTone, HvacExhaustZoneCard(), HvacExhaustZoneCardProps, ventilationTone, formatValue(), oneDecimal (+41 more)

### Community 17 - "lux-measurement-table.tsx"
Cohesion: 0.10
Nodes (28): AuditPhotoContext, LuxMeasurementTable(), LuxMeasurementTableProps, parseLux(), pointHint(), pointTone, rowAreas(), boxTone (+20 more)

### Community 18 - "store-mep-simulator-client.tsx"
Cohesion: 0.12
Nodes (32): getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle() (+24 more)

### Community 19 - "Card"
Cohesion: 0.22
Nodes (26): AuditValidationDetailLoading(), DashboardLoading(), AdminMetricCard(), AdminMetricTone, metricToneStyles, CorrectionEntry, CorrectionHistory(), dateTimeFormat (+18 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.13
Nodes (33): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+25 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.12
Nodes (22): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+14 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "item-form-dialog.tsx"
Cohesion: 0.09
Nodes (28): Brand, BrandCombobox(), BrandComboboxProps, AddEquipmentDialogProps, areaCategory, recordedQty(), EquipmentListProps, FormState (+20 more)

### Community 24 - "step3.tsx"
Cohesion: 0.11
Nodes (28): getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), getStoreByCodeAction(), AuditStartClient(), AuditStepNavigate, AuditStepNavigateOptions (+20 more)

### Community 25 - "ac-estimation-client.tsx"
Cohesion: 0.12
Nodes (27): AcEstimationClient(), AcEstimationClientProps, MapPicker, getTemperature(), EstimationResultCard(), EstimationResultCardData, Props, Row() (+19 more)

### Community 26 - "admin-master-equipment-table.tsx"
Cohesion: 0.12
Nodes (24): setAdminGapFilter(), AdminGapFilterToggle(), numberFormat, AdminMasterEquipmentTable(), SortableHeader(), updateSort(), formatDate(), formatNumber() (+16 more)

### Community 27 - "lighting-audit-export.ts"
Cohesion: 0.14
Nodes (18): calculateLpd(), buildLightingAuditWorkbook(), ExportAudit, lampTypes(), lightingRecapSheets(), STATUS_LABEL, formatLuxStandard(), getLpdStatus() (+10 more)

### Community 28 - "energy-audit-export-dialog.tsx"
Cohesion: 0.13
Nodes (26): AdminMasterDataNav(), EnergyAuditExportDialog(), EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips() (+18 more)

### Community 29 - "LightEstimationClient"
Cohesion: 0.10
Nodes (31): checkLampObstacle(), formatDim(), getCashierZonePolygon(), getMaxInwardDepth(), getStoreScaleInfo(), MepFloorPlanCanvasPreview(), MepFloorPlanCanvasPreviewProps, PlacedAcUnit (+23 more)

### Community 30 - "light-estimation-client.tsx"
Cohesion: 0.07
Nodes (51): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+43 more)

### Community 31 - "react"
Cohesion: 0.17
Nodes (14): BranchCombobox(), BranchComboboxProps, AdminMasterStoreDialogProps, AdminMasterStoreFiltersProps, filterParamKeys, filterParamKeySet, CsvUserRow, Input() (+6 more)

### Community 32 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9.39.4, eslint-config-next@16.1.7, eslint, eslint-config-next

### Community 33 - "audit-validation-queries.ts"
Cohesion: 0.09
Nodes (22): AuditValidationDetailPage(), Props, 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 3. Pekerjaan di sparta-energy, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka (+14 more)

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.14
Nodes (28): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+20 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "20260604000000_baseline_before_power_modes/migration.sql"
Cohesion: 0.10
Nodes (28): "account", "session", "verification", "account", "audit_items", "audit_pln_std_history", "audit_recommendations", "audits" (+20 more)

### Community 37 - "Badge"
Cohesion: 0.12
Nodes (27): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+19 more)

### Community 38 - "Badge"
Cohesion: 0.12
Nodes (27): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+19 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.12
Nodes (33): ActionResult, deleteUser(), DeleteUserInput, AdminLayout(), DELETE(), PUT(), POST(), DELETE() (+25 more)

### Community 40 - "lighting-audit.test.ts"
Cohesion: 0.07
Nodes (24): getCompletionIssues(), getLuxArea(), getLuxStatus(), getZoneDefinition(), summarizeLux(), csv, data, empty (+16 more)

### Community 41 - "audits/[id]/page.tsx"
Cohesion: 0.13
Nodes (24): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 42 - "Header"
Cohesion: 0.10
Nodes (33): AcEstimationLoading(), AuditResultLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationLoading(), AuditValidationPage(), pageHref(), Props (+25 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.13
Nodes (18): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+10 more)

### Community 45 - "energy-audit-queries.ts"
Cohesion: 0.07
Nodes (35): Context, GET(), HvacAuditPage(), Props, activeStoreSql, latestAuditPerStore, sangatBorosIdsSql, AVAILABLE_ENERGY_AUDIT_CATEGORIES (+27 more)

### Community 46 - "dxf-parser.ts"
Cohesion: 0.14
Nodes (20): CadStoreMetrics, CadWallSegment, CadWallType, chainLinesIntoPolygon(), dist(), DxfCodeValue, DxfEntity, DxfHatchEntity (+12 more)

### Community 47 - "ref_path"
Cohesion: 0.13
Nodes (15): calcSimetris(), evaluateDetailed(), run(), calcSimetris(), evaluateStatus(), run(), SimetrisResult, calcSimetris() (+7 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.11
Nodes (37): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, AdminStoreFilters (+29 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "ai-recommendation.ts"
Cohesion: 0.43
Nodes (5): getDemoAiRecommendation(), AiRecommendationResponse, generateRecommendationWithFallback(), getAiClient(), MODEL_WATERFALL

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (43): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+35 more)

### Community 53 - "kategori/page.tsx"
Cohesion: 0.12
Nodes (33): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, dateFormat, EnergyAuditListPage(), first(), pageHref() (+25 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "audits/data/route.ts"
Cohesion: 0.10
Nodes (39): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+31 more)

### Community 56 - "energy-audit-export.ts"
Cohesion: 0.10
Nodes (36): GET(), GET(), CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap(), CATEGORY_EXPORT_LOADERS, loadCategory(), ExportableCategory (+28 more)

### Community 57 - "lib/custom-equipment.ts"
Cohesion: 0.28
Nodes (11): AREA_TYPE_CATEGORY, isUploadThingUrl(), normalizeName(), selectCustomEquipment(), syncCustomEquipmentSubmissions(), equipment(), fakeTx(), master (+3 more)

### Community 58 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.39
Nodes (5): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator

### Community 59 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "technical-form.tsx"
Cohesion: 0.08
Nodes (35): AboutPage(), InfoRow(), dateToTimeStr(), TimeRangeCards(), TimeRangeCardsProps, timeStrToDate(), AreaField, areaFields (+27 more)

### Community 62 - "admin-custom-equipment-review.tsx"
Cohesion: 0.10
Nodes (31): ActionResult, approveCustomEquipmentAction(), rejectCustomEquipmentAction(), run(), AdminCustomEquipmentReviewProps, AREA_LABELS, dateFormat, ReviewCard() (+23 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "hvac-audit-form.tsx"
Cohesion: 0.11
Nodes (30): copTone, areaFormat, createUnitLike(), dateFormat, formatCoord(), HvacAuditForm(), addUnit(), calculateStandard() (+22 more)

### Community 65 - "request-guard.ts"
Cohesion: 0.17
Nodes (17): countInWindow(), createLockout(), createRateLimiter(), getClientIp(), prune(), retryAfterSeconds(), limiter, lockout (+9 more)

### Community 66 - "state-block.tsx"
Cohesion: 0.27
Nodes (9): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), StateBlock(), StateBlockAction, StateBlockProps (+1 more)

### Community 67 - "step3.tsx"
Cohesion: 0.13
Nodes (21): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+13 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "app/dashboard/page.tsx"
Cohesion: 0.14
Nodes (18): deleteAuditDraft(), getAuditDraft(), DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, DraftItem, DraftListSection() (+10 more)

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

### Community 79 - "admin-master-stores-table.tsx"
Cohesion: 0.19
Nodes (10): AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate(), formatHours(), formatNumber(), getNextSortOrder(), numberFormat (+2 more)

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
Cohesion: 0.13
Nodes (14): AcMappingResultCard(), AcMappingResultCardData, AcMappingUnitDetail, Props, Row(), GypsumTileExportCardData, Props, LightEstimationResultCard() (+6 more)

### Community 88 - "admin-entry/page.tsx"
Cohesion: 0.27
Nodes (10): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), handleSave(), getMonitoringDevices() (+2 more)

### Community 89 - "change-user-role.ts"
Cohesion: 0.22
Nodes (12): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, escapeCsv(), formatDate(), main() (+4 more)

### Community 90 - "energy-audit.ts"
Cohesion: 0.29
Nodes (12): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), saveLightingAudit(), SaveResult, getAuditValidator() (+4 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.22
Nodes (11): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getBrandName(), getEquipmentName(), isNonNegativeNumber(), isPositiveNumber() (+3 more)

### Community 92 - "utils.ts"
Cohesion: 0.73
Nodes (3): AdminTableScroll(), ScrollArea(), ScrollBar()

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "audit-photos.tsx"
Cohesion: 0.09
Nodes (32): AuditPhotos(), remove(), upload(), AuditPhotosProps, compressPhoto(), photoUrl(), WebcamCapture(), WebcamCaptureProps (+24 more)

### Community 95 - "hvac-audit.test.ts"
Cohesion: 0.10
Nodes (22): average(), getAcCountResult(), getCopStatus(), HVAC_ECO_SUGGESTIONS, HVAC_MEASURING_TOOLS, isAcStandardStale(), suggestEco(), summarizeAcUnit() (+14 more)

### Community 96 - "LightingAuditForm"
Cohesion: 0.18
Nodes (15): LightingAuditPage(), Props, LightingAuditForm(), goToStep(), save(), selectLuxPoint(), update(), updateZone() (+7 more)

### Community 97 - "admin-shell.tsx"
Cohesion: 0.07
Nodes (57): AdminGapFilterState, AdminHeaderActions(), AdminNavGroup, AdminNavItem, AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminSiteHeader() (+49 more)

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
Cohesion: 0.21
Nodes (15): getAdminAuditRowsRaw(), getAuditRowsOrderBySql(), getAuditRowsWhereSql(), getDateRange(), getAdminGapFilterEnabled, getAdminGapFilterSql(), getAdminGapHiddenCount(), gapFilteredAuditIdsSql() (+7 more)

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

### Community 120 - "ref_node_assert"
Cohesion: 0.09
Nodes (33): submitAudit(), toAreaTarget(), handleSubmit(), buildDemoAuditResult(), toAreaTarget(), AuditItemRow, buildAuditItemRows(), CalcMethodInfo (+25 more)

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
Cohesion: 0.20
Nodes (18): GET(), isAdmin(), applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET() (+10 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "lighting-audit.ts"
Cohesion: 0.13
Nodes (22): CategorySummaryProps, restoreBackup(), createDefaultLuxRows(), createEmptyLightingAudit(), DEFAULT_LUX_ROWS, ESTIMATED_PLAN_RATIO, isLuxSubZone(), LightingLamp (+14 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "filters.tsx"
Cohesion: 0.05
Nodes (65): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+57 more)

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

### Community 134 - "ac-count-flag.tsx"
Cohesion: 0.31
Nodes (7): AcCountFlag(), AcCountFlagProps, toneByStatus, EnergyAuditCategoryStatusList(), EnergyAuditCategoryStatusListProps, AcCountStatus, parseAcSummaryStatus()

### Community 135 - "Konsep Akses Role: Admin, Auditor, GS General Service, dan Area"
Cohesion: 0.15
Nodes (15): 10. Keputusan (26 Oktober 2026), 11. Simulasi role untuk testing lokal, 1. Siapa masuk ke mana, 2. Kondisi sekarang, 3. Login: satu cookie untuk semua subdomain, 4. Data izin (di DB 1, dibuat oleh sparta-energy), 5. Pembagian kerja, 6. Alur (+7 more)

### Community 136 - "reports/page.tsx"
Cohesion: 0.21
Nodes (14): AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams(), ReportCard (+6 more)

### Community 137 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.15
Nodes (12): saveAcEstimationLog, Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, saveLightEstimationLog, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1) (+4 more)

### Community 138 - "admin-audit-date-filter.ts"
Cohesion: 0.31
Nodes (8): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear(), addAuditWhereAnd(), getAdminAuditWhere()

### Community 139 - "Point"
Cohesion: 0.16
Nodes (18): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+10 more)

### Community 140 - "hvac-audit-export.test.ts"
Cohesion: 0.12
Nodes (15): createAcUnit(), createEmptyHvacAudit(), createExhaustZone(), HvacExportAudit, acHeaderIndex, audit, exHeaderIndex, plnRow (+7 more)

### Community 141 - "admin-audit-detail.ts"
Cohesion: 0.15
Nodes (17): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), BrandPhoto, pickBrandPhoto(), brands (+9 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.15
Nodes (19): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), fetchAccessToken(), fetchStoreSheet(), filterNewStores() (+11 more)

### Community 143 - "actions/import-users.ts"
Cohesion: 0.20
Nodes (7): ActionResult, checkExistingEmails(), hashPassword(), ImportUserInput, importUsersBulk(), hash, password

### Community 144 - "Button"
Cohesion: 0.18
Nodes (11): LoginPage(), LoginToastNotice(), Page(), AuditItem, AuditListSection(), AuditListSectionProps, DemoLoginButton(), Logo() (+3 more)

### Community 145 - "admin-master-equipment-dialog.tsx"
Cohesion: 0.25
Nodes (11): AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, PhotoUploadField(), setUploadingState(), upload(), PhotoUploadFieldProps, TooltipProvider(), compressImage() (+3 more)

### Community 146 - "AdminMasterStoreFilters"
Cohesion: 0.53
Nodes (6): AdminMasterStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 147 - "prisma.ts"
Cohesion: 0.07
Nodes (25): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, getAuditHistory(), HistoryItem, HistoryResponse, SubmitAuditInput (+17 more)

### Community 148 - "result-db.tsx"
Cohesion: 0.15
Nodes (15): AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore, AuditValidationInfo, describeKwhChange() (+7 more)

### Community 149 - "scripts/import-users.ts"
Cohesion: 0.60
Nodes (4): main(), parseBranches(), pool, sha256()

### Community 150 - "validation-detail.tsx"
Cohesion: 0.23
Nodes (13): saveValidationDraft(), validateAudit(), ValidationDraftInput, toNumberOrZero(), StepActionBar(), TechnicalDraft, draftFromAudit(), toDraftInput() (+5 more)

### Community 151 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 153 - "lighting-audit-form.tsx"
Cohesion: 0.14
Nodes (13): dateFormat, LightingAuditFormProps, lpdTone, luxTone, numberFormat, Step, stepLabels, tone (+5 more)

### Community 154 - "change-user-role.ts"
Cohesion: 0.17
Nodes (10): @prisma/adapter-pg@^7.7.0, @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma, adapter (+2 more)

### Community 155 - "Alert"
Cohesion: 0.36
Nodes (9): DraftRestoreAlert(), DraftRestoreAlertProps, timeFormat, OfflineIndicator(), Alert(), AlertAction(), AlertDescription(), AlertTitle() (+1 more)

### Community 156 - "allowBuilds"
Cohesion: 0.18
Nodes (10): allowBuilds, esbuild, msgpackr-extract, msw, prisma, @prisma/engines, protobufjs, sharp (+2 more)

### Community 157 - "master-data/stores/data/route.ts"
Cohesion: 0.29
Nodes (9): GET(), getFilter(), getMasterStoreBranchCounts(), getMasterStoreRows(), getStoreOrderBySql(), getStoreWhereSql(), masterStoresPageSize, parseMasterStoreHours() (+1 more)

### Community 158 - "settings/page.tsx"
Cohesion: 0.27
Nodes (6): MenuRow(), SectionLabel(), SettingsPage(), Theme, THEMES, authClient

### Community 159 - "audit-kalkulator.replay.test.ts"
Cohesion: 0.24
Nodes (9): AREA_NAMES, endTimeFor(), ExportRow, replay(), store, TF67, toEquipments(), W441 (+1 more)

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.13
Nodes (12): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API, Store Coordinates Sync Plan (+4 more)

### Community 161 - "validation-summary.tsx"
Cohesion: 0.33
Nodes (8): formatKwh(), Comparison(), dateFormat, statusLabel(), ValidationPreview, ValidationSummary(), ValidationSummaryProps, ValidationAudit

### Community 162 - "ref_node_assert"
Cohesion: 0.36
Nodes (4): AC_UNIT_BTU, calculateAcUnits(), getClusterBtu(), detail

### Community 163 - "role-access.ts"
Cohesion: 0.10
Nodes (28): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, updateUser(), UpdateUserInput, AdminEntryPage() (+20 more)

### Community 164 - "master-data/page.tsx"
Cohesion: 0.14
Nodes (26): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, AdminMasterCategoriesList() (+18 more)

### Community 165 - "sanitizeHvacAuditData"
Cohesion: 0.57
Nodes (8): currentOption(), sanitizeExhaustZone(), sanitizeHvacAuditData(), sanitizeStandard(), sanitizeUnit(), toCount(), toNumber(), toText()

### Community 166 - "interface"
Cohesion: 0.33
Nodes (5): interface, display_name, icon_large, icon_small, short_description

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.13
Nodes (20): BackfillAuditRow, BackfillChange, backfillCsv(), csvCell(), MIN_DIFF_KWH, planBaselineBackfill(), statusLabel(), csv (+12 more)

### Community 168 - "save-ac-estimation-log.ts"
Cohesion: 0.47
Nodes (5): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1227 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `hvac-audit-export.ts`, `auth.ts`, `filters.tsx`, `calculator-logs-client.tsx`, `Equipment Admin Queries`, `lighting-audit-form.tsx`, `Package & ESLint Config`, `admin/dashboard/page.tsx`, `Runtime Dependencies`, `Button`, `sync-stores.ts`, `actions/import-users.ts`, `Button`, `prisma.ts`, `audit-validation.ts`, `result-db.tsx`, `Branch Audit Summaries`, `item-form-dialog.tsx`, `step3.tsx`, `ac-estimation-client.tsx`, `admin-master-equipment-table.tsx`, `validation-detail.tsx`, `energy-audit-export-dialog.tsx`, `master-data/stores/data/route.ts`, `light-estimation-client.tsx`, `settings/page.tsx`, `react`, `audit-validation-queries.ts`, `admin-user-queries.ts`, `role-access.ts`, `master-data/page.tsx`, `Badge`, `Badge`, `admin-master-data-mutations.ts`, `save-ac-estimation-log.ts`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `energy-audit-queries.ts`, `admin-store-queries.ts`, `kategori/page.tsx`, `audits/data/route.ts`, `energy-audit-export.ts`, `technical-form.tsx`, `admin-custom-equipment-review.tsx`, `hvac-audit-form.tsx`, `state-block.tsx`, `step3.tsx`, `app/dashboard/page.tsx`, `admin-master-stores-table.tsx`, `admin-entry/page.tsx`, `energy-audit.ts`, `LightingAuditForm`, `admin-shell.tsx`, `Card`, `lib/admin-gap-filter.ts`, `core.ts`, `reports/preview/route.ts`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `{ signIn, signOut, useSession }`, `Toast via sonner`, `Alfamart Emblem (small)` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09619450317124736 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `filters.tsx`, `calculator-logs-client.tsx`, `Equipment Admin Queries`, `pln-history-editor.tsx`, `ac-count-flag.tsx`, `map.tsx`, `Button`, `Button`, `admin-master-equipment-dialog.tsx`, `lux-measurement-table.tsx`, `Card`, `result-db.tsx`, `admin-dashboard-charts.tsx`, `item-form-dialog.tsx`, `step3.tsx`, `ac-estimation-client.tsx`, `admin-master-equipment-table.tsx`, `lighting-audit-form.tsx`, `Alert`, `energy-audit-export-dialog.tsx`, `settings/page.tsx`, `react`, `light-estimation-client.tsx`, `validation-summary.tsx`, `role-access.ts`, `Badge`, `Badge`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `kategori/page.tsx`, `technical-form.tsx`, `admin-custom-equipment-review.tsx`, `hvac-audit-form.tsx`, `step3.tsx`, `admin-master-stores-table.tsx`, `utils.ts`, `audit-photos.tsx`, `LightingAuditForm`, `admin-shell.tsx`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.09154437456324249 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._