# Graph Report - sparta-energy  (2026-11-04)

## Corpus Check
- 484 files · ~389,773 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3778 nodes · 11188 edges · 170 communities (152 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 95 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `652e86c1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hvac-audit-export.ts
- auth.ts
- Button
- Input
- Equipment Admin Queries
- AdminUserFilters
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
- hvac-audit-form.tsx
- audit-kalkulator.test.ts
- store-mep-simulator-client.tsx
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- step2-detail.tsx
- kategori/[id]/page.tsx
- admin-users-table.tsx
- cn
- custom-equipment-review.ts
- hvac-audit.test.ts
- admin-audits-table.tsx
- getAuditValidator
- lib/unregistered-brands.ts
- audit-photos.tsx
- MapDrawControl
- admin-user-queries.ts
- shadcn components.json
- 20260604000000_baseline_before_power_modes/migration.sql
- MapDrawShapeButton
- admin-stores-table.tsx
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
- stores/[id]/page.tsx
- photos/route.ts
- kategori/page.tsx
- antislop-layoutmobile
- audits/data/route.ts
- lighting-audit-export.ts
- app/dashboard/page.tsx
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- admin-calculator-queries.ts
- contrast-check.py
- calculator-versions.ts
- audit-technical.ts
- shadcn Forms & Composition
- hvac-audit-form.tsx
- request-guard.ts
- map-picker.tsx
- validation/page.tsx
- npm Scripts
- lib/custom-equipment.ts
- gypsum-tile-calculator.ts
- shadcn CLI & MCP
- Deploy Pipeline & Agent Guides
- Audit Domain Concepts
- Dokumentasi Spesifikasi Kalkulator Plafon Gypsum Tile
- PWA Service Worker
- PWA Manifest
- DOCX Generator Script
- 3-Pillar Ecosystem Architecture
- energy-audit-export-filters.ts
- Landing Hero Illustration
- antislop-human
- import-stores.ts
- create-user.ts
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- [id]/export/route.ts
- admin-entry/page.tsx
- change-user-role.ts
- lighting-audit.test.ts
- admin-store-detail.ts
- state-block.tsx
- PWA Icon Set
- lib/admin-gap-filter.ts
- mep-layout-canvas-preview.tsx
- prisma.ts
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
- admin-master-categories-list.tsx
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- step3.tsx
- Group 3: Quality Locks (consistency)
- antislop
- core.ts
- prisma
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- lighting-audit-form.tsx
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- dropdown-menu.tsx
- The Craftsmanship Standard
- with
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- export-audits.ts
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- get-history.ts
- admin-master-equipment-filters.tsx
- scripts/get-temperature.ts
- ai-recommendation.ts
- Skeleton
- admin-audit-detail.ts
- sync-stores.ts
- start-client.tsx
- settings/page.tsx
- react-leaflet-markercluster
- lighting-audit-export.ts
- AdminMasterStoreFilters
- MapLayers
- scripts/import-users.ts
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- change-user-role.ts
- sidebar.tsx
- allowBuilds
- reports/page.tsx
- admin-audit-filters.tsx
- Disaster Engine & Store Impact Verification Flow
- admin-equipment-filters.tsx
- interface
- backfill-audit-baseline.ts
- ref_node_assert
- Changelog - Lamp Estimation Calculator
- ImportUserCsvDialog

## God Nodes (most connected - your core abstractions)
1. `cn()` - 312 edges
2. `Button()` - 192 edges
3. `react` - 140 edges
4. `next` - 129 edges
5. `@tabler/icons-react` - 121 edges
6. `Badge()` - 91 edges
7. `Input()` - 81 edges
8. `Card()` - 71 edges
9. `DialogContent()` - 63 edges
10. `prisma` - 63 edges

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

## Communities (170 total, 18 thin omitted)

### Community 0 - "hvac-audit-export.ts"
Cohesion: 0.11
Nodes (29): AcCountFlag(), AcCountFlagProps, toneByStatus, AcCountStatus, average(), COP_TARGET, AC_HEADER, acChecklistRows() (+21 more)

### Community 1 - "auth.ts"
Cohesion: 0.08
Nodes (41): GET, POST, GET(), GetSessionResult, resolveSession(), Session, signInKey(), signInLockout (+33 more)

### Community 2 - "Button"
Cohesion: 0.07
Nodes (41): LoginPage(), LoginToastNotice(), Page(), BranchCombobox(), BranchComboboxProps, AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, numberFormat (+33 more)

### Community 3 - "Input"
Cohesion: 0.10
Nodes (45): AuditFilterStatus, cache, EmptyState(), HistoryPage(), AdminCustomEquipmentReviewProps, dateFormat, ReviewCard(), AdminUnregisteredBrandsReviewProps (+37 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (46): GET(), getFilter(), parseArea(), AdminEquipmentPage(), averagePerStore(), formatNumber(), getFilter(), parseArea() (+38 more)

### Community 5 - "AdminUserFilters"
Cohesion: 0.10
Nodes (34): SHAPES, SnapGuide, StandardCheckResult, AdminMasterDataNav(), AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange() (+26 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.10
Nodes (43): addCommonWhere(), AdminReportColumn, AdminReportDataset, AdminReportStatus, allMasterEquipmentFilters, buildAuditHistoryDataset(), buildBranchSummaryDataset(), buildEquipmentDataset() (+35 more)

### Community 7 - "ac-mapping-client.tsx"
Cohesion: 0.14
Nodes (27): AcMappingClient(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim(), getCashierZonePolygon() (+19 more)

### Community 8 - "map.tsx"
Cohesion: 0.06
Nodes (44): ButtonGroup(), buttonGroupVariants, LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker (+36 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.04
Nodes (63): eslintConfig, devDependencies, eslint@^9.39.4, eslint-config-next@16.1.7, @eslint/eslintrc@^3, jest@^30.3.0, jest-environment-jsdom@^30.3.0, postcss@^8 (+55 more)

### Community 10 - "audit-validation-queries.ts"
Cohesion: 0.11
Nodes (22): AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), AuditValidationDetailPage(), Props, AdminEntryLogoutButton() (+14 more)

### Community 11 - "admin/dashboard/page.tsx"
Cohesion: 0.09
Nodes (30): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+22 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @base-ui/react@^1.4.1, better-auth@^1.6.5, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, date-fns@^4.1.0, html-to-image@^1.11.13 (+34 more)

### Community 13 - "Button"
Cohesion: 0.08
Nodes (67): deleteAuditDraft(), getAuditDraft(), AdminCustomEquipmentReview(), AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoreExportFilterProps, numberFormat, AdminReportActions() (+59 more)

### Community 14 - "admin-master-data-queries.ts"
Cohesion: 0.07
Nodes (58): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+50 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "hvac-audit-form.tsx"
Cohesion: 0.05
Nodes (72): AboutPage(), InfoRow(), copTone, deltaTone, HvacAcUnitCard(), HvacAcUnitCardProps, roomTone, areaFormat (+64 more)

### Community 17 - "audit-kalkulator.test.ts"
Cohesion: 0.08
Nodes (27): AuditItemRow, CalcMethodInfo, isUsageBased(), ac, acRows, chiller, chillerCalc, coffee (+19 more)

### Community 18 - "store-mep-simulator-client.tsx"
Cohesion: 0.11
Nodes (33): getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle() (+25 more)

### Community 19 - "Card"
Cohesion: 0.11
Nodes (45): AuditStepNavigate, AuditValidationDetailLoading(), AdminMetricCard(), AdminMetricTone, metricToneStyles, AuditStep1(), Props, AreaItem (+37 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.10
Nodes (42): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+34 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.12
Nodes (22): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+14 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "step2-detail.tsx"
Cohesion: 0.07
Nodes (43): AcEstimationClient(), AcEstimationClientProps, MapPicker, getRabData(), EstimationResultCard(), EstimationResultCardData, Props, Row() (+35 more)

### Community 24 - "kategori/[id]/page.tsx"
Cohesion: 0.18
Nodes (13): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, areaOrder, formatGap(), numberFormat, percentFormat (+5 more)

### Community 25 - "admin-users-table.tsx"
Cohesion: 0.07
Nodes (39): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+31 more)

### Community 26 - "cn"
Cohesion: 0.07
Nodes (60): EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, AlertAction(), ComboboxChip(), ComboboxChips(), ComboboxChipsInput() (+52 more)

### Community 27 - "custom-equipment-review.ts"
Cohesion: 0.23
Nodes (13): ActionResult, approveCustomEquipmentAction(), rejectCustomEquipmentAction(), run(), approve(), handleResult(), reject(), approveCustomEquipment() (+5 more)

### Community 28 - "hvac-audit.test.ts"
Cohesion: 0.06
Nodes (32): createAcUnit(), createEmptyHvacAudit(), createExhaustZone(), acHeaderIndex, audit, exHeaderIndex, plnRow, readings (+24 more)

### Community 29 - "admin-audits-table.tsx"
Cohesion: 0.18
Nodes (15): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+7 more)

### Community 30 - "getAuditValidator"
Cohesion: 0.16
Nodes (17): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+9 more)

### Community 31 - "lib/unregistered-brands.ts"
Cohesion: 0.11
Nodes (31): ActionResult, addFieldBrandToMasterAction(), dismissFieldBrandAction(), run(), dismiss(), handleResult(), save(), parseKw() (+23 more)

### Community 32 - "audit-photos.tsx"
Cohesion: 0.17
Nodes (17): AuditPhotoContext, AuditPhotos(), remove(), upload(), AuditPhotosProps, compressPhoto(), photoUrl(), WebcamCapture() (+9 more)

### Community 33 - "MapDrawControl"
Cohesion: 0.83
Nodes (4): MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount()

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.16
Nodes (26): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserSortOrder (+18 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "20260604000000_baseline_before_power_modes/migration.sql"
Cohesion: 0.09
Nodes (31): "account", "session", "verification", "account", "audit_items", "audit_pln_std_history", "audit_recommendations", "audits" (+23 more)

### Community 37 - "MapDrawShapeButton"
Cohesion: 0.12
Nodes (20): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+12 more)

### Community 38 - "admin-stores-table.tsx"
Cohesion: 0.16
Nodes (15): AdminStoresTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getStatus() (+7 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.13
Nodes (31): ActionResult, deleteUser(), DeleteUserInput, checkExistingEmails(), DELETE(), PUT(), POST(), DELETE() (+23 more)

### Community 40 - "lighting-audit.ts"
Cohesion: 0.06
Nodes (57): CategorySummaryProps, restoreBackup(), boxTone, decimalFormat, labelRowsTop(), labelTone, LampLayout, LuxPlan() (+49 more)

### Community 41 - "audits/[id]/page.tsx"
Cohesion: 0.12
Nodes (26): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+18 more)

### Community 42 - "Header"
Cohesion: 0.13
Nodes (19): AcEstimationLoading(), AuditResultLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationLoading(), DashboardLoading(), DemoResultLoading(), HistoryLoading() (+11 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "energy-audit-queries.ts"
Cohesion: 0.08
Nodes (31): LightingAuditPage(), HvacAuditPage(), Props, AVAILABLE_ENERGY_AUDIT_CATEGORIES, CategoryStatusMap, EnergyAuditCategoryInfo, EnergyAuditCategoryProgress, progress (+23 more)

### Community 46 - "dxf-parser.ts"
Cohesion: 0.09
Nodes (37): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+29 more)

### Community 47 - "ref_path"
Cohesion: 0.13
Nodes (15): calcSimetris(), evaluateDetailed(), run(), calcSimetris(), evaluateStatus(), run(), SimetrisResult, calcSimetris() (+7 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.10
Nodes (39): GET(), getFilter(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, getAdminAuditRowsRaw(), getAuditRowsWhereSql() (+31 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "stores/[id]/page.tsx"
Cohesion: 0.12
Nodes (26): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+18 more)

### Community 52 - "photos/route.ts"
Cohesion: 0.14
Nodes (27): createFolder(), driveFetch(), DriveFile, ensureFolder(), escapeQuery(), findCityFolder(), findStoreFolder(), folderCache (+19 more)

### Community 53 - "kategori/page.tsx"
Cohesion: 0.17
Nodes (21): dateFormat, EnergyAuditListPage(), first(), pageHref(), Props, AuditCard(), AuditCardProps, AuditStatus (+13 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "audits/data/route.ts"
Cohesion: 0.08
Nodes (48): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+40 more)

### Community 56 - "lighting-audit-export.ts"
Cohesion: 0.12
Nodes (26): GET(), Context, GET(), CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap(), CATEGORY_EXPORT_LOADERS, loadCategory() (+18 more)

### Community 57 - "app/dashboard/page.tsx"
Cohesion: 0.14
Nodes (12): Props, DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditItem, RecentAuditSection(), RecentAuditSectionProps (+4 more)

### Community 58 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.39
Nodes (5): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator

### Community 59 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "calculator-versions.ts"
Cohesion: 0.13
Nodes (14): AcMappingResultCard(), AcMappingResultCardData, AcMappingUnitDetail, Props, Row(), GypsumTileExportCardData, Props, LightEstimationResultCard() (+6 more)

### Community 62 - "audit-technical.ts"
Cohesion: 0.18
Nodes (11): AuditTechnicalColumns, DecimalLike, readDraftTechnical(), TechnicalInput, TechnicalSource, allDay, areas, legacy (+3 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "hvac-audit-form.tsx"
Cohesion: 0.09
Nodes (36): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), saveLightingAudit(), SaveResult, createUnitLike() (+28 more)

### Community 65 - "request-guard.ts"
Cohesion: 0.17
Nodes (17): countInWindow(), createLockout(), createRateLimiter(), getClientIp(), prune(), retryAfterSeconds(), limiter, lockout (+9 more)

### Community 66 - "map-picker.tsx"
Cohesion: 0.21
Nodes (13): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+5 more)

### Community 67 - "validation/page.tsx"
Cohesion: 0.15
Nodes (15): AuditValidationPage(), pageHref(), Props, ResultStatusBadge(), ResultStatusBadgeProps, ValidationStoreList(), ValidationStoreListProps, firstValue() (+7 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "lib/custom-equipment.ts"
Cohesion: 0.26
Nodes (12): AREA_TYPE_CATEGORY, isUploadThingUrl(), normalizeName(), selectCustomEquipment(), syncCustomEquipmentSubmissions(), equipment(), fakeTx(), master (+4 more)

### Community 70 - "gypsum-tile-calculator.ts"
Cohesion: 0.11
Nodes (24): GypsumTileResultCardProps, AxisTileResult, calcTile1D(), calculateGypsumTileLayout(), ccw(), checkIsIrregular(), classifyCellAgainstPoly(), CROSS_TEE_LENGTH_M (+16 more)

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
Nodes (18): GypsumTileResultCard(), 0. Penanganan Denah Asimetris / Poligon (Trapesium, Huruf L, Sudut Serong), 1. Parameter Baku & Dimensi Panel, 2. Aturan Baku Pemasangan (Golden Rules), 3. Analisis File Excel Konsep & Koreksi Bug, 4. Desain Output & Pembedahan Panel, 5. Rencana Integrasi ke Store MEP Simulator, 6. Standar Acuan Baru: Koefisien Fix Jayaboard (Sheet "Koefisien 1.75") (+10 more)

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

### Community 79 - "energy-audit-export-filters.ts"
Cohesion: 0.22
Nodes (15): GET(), defaultExportFilters(), EnergyAuditExportFilters, EnergyAuditExportStatus, exportFileName(), parseExportFilters(), readAll(), readDate() (+7 more)

### Community 80 - "Landing Hero Illustration"
Cohesion: 0.32
Nodes (8): Audit Completion Checkmark, Lime Green / Dark Teal Brand Palette, Field Auditor with Clipboard, Handheld Measuring Device / Thermometer Gun, Landing Hero Illustration (Store Energy Audit), Electrical Panel with kWh Meter and Breakers, Retail Store Equipment (Fridge, Lights, CCTV, Cashier), Rooftop Solar Panels

### Community 81 - "antislop-human"
Cohesion: 0.10
Nodes (20): antislop-human, Broken Tab Order, Color & Contrast, Color-Only Feedback, Focus & States, How to use this skill, Human Skill Checklist, Keyboard (+12 more)

### Community 82 - "import-stores.ts"
Cohesion: 0.25
Nodes (6): Store Sync Cron Implementation Plan, Store Sync Cron Endpoint Design Spec, SPARTA Maintenance (reference sync implementation), adapter, pool, prisma

### Community 83 - "create-user.ts"
Cohesion: 0.17
Nodes (15): ActionResult, createUser(), CreateUserInput, ActionResult, ImportUserInput, importUsersBulk(), handleSubmit(), checkUserPassword() (+7 more)

### Community 84 - "Docs Builder Script"
Cohesion: 0.46
Nodes (7): Escape-Xml(), Make-Box(), Make-Bullet(), Make-Heading1(), Make-Heading2(), Make-P(), Make-Table()

### Community 85 - "Update Password Script"
Cohesion: 0.32
Nodes (7): branchRaw, email, main(), normalizeBranches(), password, pool, sha256()

### Community 86 - "Landing Line-Art Illustration"
Cohesion: 0.38
Nodes (6): Field Auditor Using Tablet, Green Energy Motif (Leaf, Lightning, Power Outlet), HEMAT (Energy Saving) Store Sign, Landing Page Illustration, In-Store Energy Audit, Retail Store Refrigerator and Shelves

### Community 87 - "[id]/export/route.ts"
Cohesion: 0.27
Nodes (10): GET(), isAdmin(), GAP_ROW_LABEL, gapPercentCell(), KW_FORMAT, summaryValueFormat(), kwSheet, rows (+2 more)

### Community 88 - "admin-entry/page.tsx"
Cohesion: 0.27
Nodes (10): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), handleSave(), getMonitoringDevices() (+2 more)

### Community 89 - "change-user-role.ts"
Cohesion: 0.21
Nodes (12): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg@^8.20.0, pg, escapeCsv(), main() (+4 more)

### Community 90 - "lighting-audit.test.ts"
Cohesion: 0.08
Nodes (20): LightingAuditData, csv, data, empty, estimate, explained, layout, legacy (+12 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.11
Nodes (20): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getAdminStoreDetail(), getBrandName(), getEquipmentName(), isNonNegativeNumber() (+12 more)

### Community 92 - "state-block.tsx"
Cohesion: 0.25
Nodes (8): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), StateBlock(), StateBlockAction, StateBlockProps

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "lib/admin-gap-filter.ts"
Cohesion: 0.35
Nodes (7): AdminLayout(), getAdminGapFilterEnabled, getAdminGapHiddenCount(), SangatBorosStore, ADMIN_GAP_FILTER_COOKIE, AUDIT_GAP_FILTER, getAuditGapFilterWhereSql()

### Community 95 - "mep-layout-canvas-preview.tsx"
Cohesion: 0.08
Nodes (42): saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), checkLampObstacle(), formatDim(), getCashierZonePolygon() (+34 more)

### Community 96 - "prisma.ts"
Cohesion: 0.09
Nodes (13): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult, SaveLightEstimationPayload, SaveLightEstimationResult, AuditResultPage() (+5 more)

### Community 97 - "admin-shell.tsx"
Cohesion: 0.07
Nodes (44): AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSidebar(), AdminSidebarItem(), AdminSiteHeader(), AdminUser (+36 more)

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

### Community 115 - "admin-master-categories-list.tsx"
Cohesion: 0.40
Nodes (5): AdminMasterCategoriesList(), AdminMasterCategoriesListProps, CategoryItem, formatNumber(), numberFormat

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
Cohesion: 0.14
Nodes (22): getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), AreaTarget, handleSubmit(), AuditStep3Props, buildDemoAuditResult() (+14 more)

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "core.ts"
Cohesion: 0.14
Nodes (18): discardCustomEquipmentPhoto(), f, imageOnly, ourFileRouter, OurFileRouter, requireMasterDataManager(), requireSignedIn(), GET (+10 more)

### Community 124 - "prisma"
Cohesion: 0.10
Nodes (41): ActionResult, deleteAudit(), getAuditHistory(), deleteMepSimulationLog(), MepSimulationListFilter, SaveMepSimulationPayload, SaveMepSimulationResult, ActionResult (+33 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "lighting-audit-form.tsx"
Cohesion: 0.06
Nodes (59): DemoResultPage(), AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore, AuditValidationInfo (+51 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "dropdown-menu.tsx"
Cohesion: 0.14
Nodes (31): AdminHeaderActions(), HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, FilterI18nConfig, FilterOperator, FilterOption (+23 more)

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

### Community 136 - "get-history.ts"
Cohesion: 0.21
Nodes (10): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, getAvailableYears(), HistoryItem, HistoryResponse, ActionError (+2 more)

### Community 137 - "admin-master-equipment-filters.tsx"
Cohesion: 0.23
Nodes (11): AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminMasterEquipmentFiltersProps, filterParamKeys, filterParamKeySet (+3 more)

### Community 138 - "scripts/get-temperature.ts"
Cohesion: 0.40
Nodes (3): fmt(), main(), url

### Community 139 - "ai-recommendation.ts"
Cohesion: 0.18
Nodes (14): getDemoAiRecommendation(), DraftNotSubmittableError, submitAudit(), SubmitAuditInput, toAreaTarget(), AiRecommendationResponse, generateRecommendationWithFallback(), getAiClient() (+6 more)

### Community 140 - "Skeleton"
Cohesion: 0.40
Nodes (10): AuditStepSkeleton(), AuditStepSkeletonProps, AuditStepSkeletonVariant, skeletonLabels, Step1Skeleton(), Step2DetailSkeleton(), Step2Skeleton(), Step3Skeleton() (+2 more)

### Community 141 - "admin-audit-detail.ts"
Cohesion: 0.26
Nodes (10): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), isAdminSangatBoros(), BrandPhoto, pickBrandPhoto() (+2 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.15
Nodes (19): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), fetchAccessToken(), fetchStoreSheet(), filterNewStores() (+11 more)

### Community 143 - "start-client.tsx"
Cohesion: 0.11
Nodes (28): AcEstimationPage(), excludedBranchNames, AcMappingClientProps, AcMappingPage(), excludedBranchNames, getMepSimulationDetail(), excludedBranchNames, getStoreByCodeAction() (+20 more)

### Community 144 - "settings/page.tsx"
Cohesion: 0.38
Nodes (5): MenuRow(), SectionLabel(), SettingsPage(), Theme, THEMES

### Community 145 - "react-leaflet-markercluster"
Cohesion: 0.50
Nodes (4): LeafletMarkerClusterGroup, MapMarkerClusterGroup(), react-leaflet-markercluster@5.0.0-rc.0, react-leaflet-markercluster

### Community 146 - "lighting-audit-export.ts"
Cohesion: 0.16
Nodes (15): Context, GET(), getLightingAuditsForExport(), buildLightingAuditWorkbook(), ExportAudit, lampTypes(), STATUS_LABEL, getLuxAreaLabel() (+7 more)

### Community 147 - "AdminMasterStoreFilters"
Cohesion: 0.53
Nodes (6): AdminMasterStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 149 - "scripts/import-users.ts"
Cohesion: 0.60
Nodes (4): main(), parseBranches(), pool, sha256()

### Community 151 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 154 - "change-user-role.ts"
Cohesion: 0.11
Nodes (17): @prisma/adapter-pg@^7.7.0, dotenv@^17.4.2, adapter, BrandEntry, equipmentData, pool, prisma, dotenv (+9 more)

### Community 155 - "sidebar.tsx"
Cohesion: 0.09
Nodes (33): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, BranchCell(), ButtonGroupSeparator(), ButtonGroupText(), FieldSeparator() (+25 more)

### Community 156 - "allowBuilds"
Cohesion: 0.18
Nodes (10): allowBuilds, esbuild, msgpackr-extract, msw, prisma, @prisma/engines, protobufjs, sharp (+2 more)

### Community 157 - "reports/page.tsx"
Cohesion: 0.14
Nodes (27): GET(), AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams() (+19 more)

### Community 158 - "admin-audit-filters.tsx"
Cohesion: 0.07
Nodes (45): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+37 more)

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.13
Nodes (12): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API, Store Coordinates Sync Plan (+4 more)

### Community 162 - "admin-equipment-filters.tsx"
Cohesion: 0.25
Nodes (10): AdminEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminEquipmentFiltersProps, areaOptions, filterParamKeys (+2 more)

### Community 166 - "interface"
Cohesion: 0.33
Nodes (5): interface, display_name, icon_large, icon_small, short_description

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.13
Nodes (20): BackfillAuditRow, BackfillChange, backfillCsv(), csvCell(), MIN_DIFF_KWH, planBaselineBackfill(), statusLabel(), csv (+12 more)

### Community 169 - "ref_node_assert"
Cohesion: 0.18
Nodes (10): detail, AREA_NAMES, endTimeFor(), expectedMonthly(), ExportRow, replay(), store, TF67 (+2 more)

### Community 170 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.15
Nodes (12): saveAcEstimationLog, Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, saveLightEstimationLog, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1) (+4 more)

### Community 179 - "ImportUserCsvDialog"
Cohesion: 0.53
Nodes (6): ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv(), parseCsvLine()

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1257 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `app/dashboard/page.tsx` to `auth.ts`, `Button`, `Input`, `dropdown-menu.tsx`, `AdminUserFilters`, `get-history.ts`, `admin-master-equipment-filters.tsx`, `audit-validation-queries.ts`, `ai-recommendation.ts`, `admin/dashboard/page.tsx`, `Button`, `admin-master-data-queries.ts`, `start-client.tsx`, `sync-stores.ts`, `hvac-audit-form.tsx`, `lighting-audit-export.ts`, `settings/page.tsx`, `audit-validation.ts`, `Card`, `Branch Audit Summaries`, `step2-detail.tsx`, `kategori/[id]/page.tsx`, `admin-users-table.tsx`, `custom-equipment-review.ts`, `reports/page.tsx`, `admin-audit-filters.tsx`, `lib/unregistered-brands.ts`, `admin-audits-table.tsx`, `admin-user-queries.ts`, `admin-equipment-filters.tsx`, `admin-stores-table.tsx`, `admin-master-data-mutations.ts`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `energy-audit-queries.ts`, `Package & ESLint Config`, `stores/[id]/page.tsx`, `kategori/page.tsx`, `audits/data/route.ts`, `lighting-audit-export.ts`, `Runtime Dependencies`, `hvac-audit-form.tsx`, `validation/page.tsx`, `energy-audit-export-filters.ts`, `create-user.ts`, `[id]/export/route.ts`, `admin-entry/page.tsx`, `state-block.tsx`, `lib/admin-gap-filter.ts`, `prisma.ts`, `admin-shell.tsx`, `step3.tsx`, `core.ts`, `prisma`, `lighting-audit-form.tsx`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **What connects `{ signIn, signOut, useSession }`, `Toast via sonner`, `Alfamart Emblem (small)` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hvac-audit-export.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10606060606060606 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `hvac-audit-export.ts`, `dropdown-menu.tsx`, `Button`, `Input`, `Equipment Admin Queries`, `AdminUserFilters`, `map.tsx`, `audit-validation-queries.ts`, `Skeleton`, `Button`, `settings/page.tsx`, `hvac-audit-form.tsx`, `Card`, `admin-dashboard-charts.tsx`, `step2-detail.tsx`, `admin-users-table.tsx`, `sidebar.tsx`, `admin-audits-table.tsx`, `audit-photos.tsx`, `MapDrawControl`, `MapDrawShapeButton`, `lighting-audit.ts`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `stores/[id]/page.tsx`, `kategori/page.tsx`, `hvac-audit-form.tsx`, `map-picker.tsx`, `validation/page.tsx`, `admin-shell.tsx`, `step3.tsx`, `lighting-audit-form.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08078431372549019 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._