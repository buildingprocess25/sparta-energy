# Graph Report - sparta-energy  (2026-11-04)

## Corpus Check
- 467 files · ~385,591 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3692 nodes · 10918 edges · 165 communities (147 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 94 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `558b79eb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hvac-audit-export.ts
- auth.ts
- next
- Input
- Equipment Admin Queries
- calculator-logs-client.tsx
- Report Export Queries
- ac-mapping-client.tsx
- map.tsx
- Package & ESLint Config
- cn
- admin/dashboard/page.tsx
- Runtime Dependencies
- Button
- admin-master-data-queries.ts
- AC Mapping Calculator Proposal
- hvac-audit.ts
- lighting-audit.test.ts
- store-mep-simulator-client.tsx
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- step2-detail.tsx
- submit-audit.ts
- ac-estimation-client.tsx
- admin-master-equipment-dialog.tsx
- cn
- energy-audit-export-dialog.tsx
- LightEstimationClient
- lux-measurement-table.tsx
- audit-kalkulator.test.ts
- audit-photos.tsx
- MapDrawControl
- admin-user-queries.ts
- shadcn components.json
- 20260604000000_baseline_before_power_modes/migration.sql
- MapDrawShapeButton
- stores/[id]/page.tsx
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
- energy-audit-export.ts
- lib/custom-equipment.ts
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
- admin-users-table.tsx
- Landing Hero Illustration
- antislop-human
- import-stores.ts
- Prisma Seed
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- lighting-audit-export.ts
- admin-entry/page.tsx
- change-user-role.ts
- energy-audit-export-filters.ts
- admin-store-detail.ts
- route.spec.ts
- PWA Icon Set
- react
- admin-master-stores-table.tsx
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
- settings/page.tsx
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
- toggle-group.tsx
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- filters.tsx
- The Craftsmanship Standard
- with
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- export-audits.ts
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- master-data/stores/data/route.ts
- Changelog - Lamp Estimation Calculator
- actions/import-users.ts
- react-leaflet-markercluster
- MapLayers
- admin-audit-detail.ts
- sync-stores.ts
- create-user.ts
- scripts/import-users.ts
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- hvac-audit-form.tsx
- change-user-role.ts
- Alert
- allowBuilds
- Store Coordinates Sync Plan
- Disaster Engine & Store Impact Verification Flow
- admin-master-categories-list.tsx
- can
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

## Communities (165 total, 18 thin omitted)

### Community 0 - "hvac-audit-export.ts"
Cohesion: 0.08
Nodes (31): Context, GET(), getHvacAuditsForExport(), AC_HEADER, acChecklistRows(), acCountRows(), average(), ecoAndPhotoRows() (+23 more)

### Community 1 - "auth.ts"
Cohesion: 0.14
Nodes (25): GET(), GET(), resolveSession(), cache, forgetProxySession(), getProxySession(), keyFor(), ProxySession (+17 more)

### Community 2 - "next"
Cohesion: 0.08
Nodes (33): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, getMepSimulationDetail(), excludedBranchNames, getStoreByCodeAction(), searchStoresAction() (+25 more)

### Community 3 - "Input"
Cohesion: 0.10
Nodes (44): AuditFilterStatus, cache, EmptyState(), HistoryPage(), handleConfirmDelete(), BranchCombobox(), BranchComboboxProps, ReviewCard() (+36 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (48): GET(), getFilter(), isAdmin(), parseArea(), validAreas, AdminEquipmentPage(), averagePerStore(), formatNumber() (+40 more)

### Community 5 - "calculator-logs-client.tsx"
Cohesion: 0.15
Nodes (23): AdminMasterDataNav(), CalculatorLogsClient(), CalculatorLogsClientProps, formatDateIndo(), MONTH_OPTIONS, EnergyAuditExportDialog(), buildTime(), BuildTimeOptions (+15 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.09
Nodes (48): addCommonWhere(), AdminReportCellValue, AdminReportColumn, AdminReportDataset, AdminReportStatus, AdminReportType, allMasterEquipmentFilters, buildAdminReportDataset() (+40 more)

### Community 7 - "ac-mapping-client.tsx"
Cohesion: 0.07
Nodes (42): AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim(), getCashierZonePolygon() (+34 more)

### Community 8 - "map.tsx"
Cohesion: 0.06
Nodes (45): ButtonGroup(), buttonGroupVariants, LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker (+37 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.04
Nodes (63): eslintConfig, devDependencies, eslint@^9.39.4, eslint-config-next@16.1.7, @eslint/eslintrc@^3, jest@^30.3.0, jest-environment-jsdom@^30.3.0, postcss@^8 (+55 more)

### Community 10 - "cn"
Cohesion: 0.15
Nodes (19): Command(), CommandEmpty(), CommandGroup(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut(), buildSearchUrl() (+11 more)

### Community 11 - "admin/dashboard/page.tsx"
Cohesion: 0.08
Nodes (41): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+33 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @base-ui/react@^1.4.1, better-auth@^1.6.5, clsx@^2.1.1, cmdk@^1.1.1, date-fns@^4.1.0, @google/genai@^1.50.1, html-to-image@^1.11.13 (+34 more)

### Community 13 - "Button"
Cohesion: 0.08
Nodes (69): AcMappingClient(), deleteAuditDraft(), getAuditDraft(), AdminCustomEquipmentReview(), AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoreExportFilterProps, numberFormat (+61 more)

### Community 14 - "admin-master-data-queries.ts"
Cohesion: 0.09
Nodes (27): CountRow, defaultMasterDataOrder, defaultMasterEquipmentSort, defaultMasterStoreSort, EquipmentArea, getEquipmentFromSql(), getEquipmentOrderBySql(), getEquipmentWhereSql() (+19 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "hvac-audit.ts"
Cohesion: 0.04
Nodes (77): AcCountFlag(), AcCountFlagProps, toneByStatus, copTone, deltaTone, HvacAcUnitCard(), HvacAcUnitCardProps, roomTone (+69 more)

### Community 17 - "lighting-audit.test.ts"
Cohesion: 0.06
Nodes (26): detail, getCompletionIssues(), getLuxArea(), getLuxStatus(), getZoneDefinition(), LightingZoneKey, summarizeLux(), csv (+18 more)

### Community 18 - "store-mep-simulator-client.tsx"
Cohesion: 0.10
Nodes (37): getLatestStoreMepSimulation(), getMepSimulationList(), MepSimulationListFilter, saveMepSimulationLog(), SaveMepSimulationPayload, SaveMepSimulationResult, ActiveTool, applyCashierBoxToPolygon() (+29 more)

### Community 19 - "Card"
Cohesion: 0.10
Nodes (45): AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams(), ReportCard (+37 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.06
Nodes (64): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+56 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.12
Nodes (22): consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue(), numberFormat (+14 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.10
Nodes (35): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+27 more)

### Community 23 - "step2-detail.tsx"
Cohesion: 0.12
Nodes (17): BrandCombobox(), AuditStep2Detail(), EquipmentItem, EquipmentRow(), EquipmentRowProps, formatKw(), getAverageDailyRuntime(), getSingleDuration() (+9 more)

### Community 24 - "submit-audit.ts"
Cohesion: 0.16
Nodes (10): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, HistoryItem, HistoryResponse, SubmitAuditInput, DEMO_EMAIL (+2 more)

### Community 25 - "ac-estimation-client.tsx"
Cohesion: 0.19
Nodes (17): AcEstimationClient(), AcEstimationClientProps, MapPicker, EstimationResultCard(), EstimationResultCardData, Props, Row(), Drawer() (+9 more)

### Community 26 - "admin-master-equipment-dialog.tsx"
Cohesion: 0.07
Nodes (37): AdminCustomEquipmentReviewProps, AREA_LABELS, dateFormat, AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch() (+29 more)

### Community 27 - "cn"
Cohesion: 0.13
Nodes (26): AdminSiteHeader(), AlertAction(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+18 more)

### Community 28 - "energy-audit-export-dialog.tsx"
Cohesion: 0.11
Nodes (31): EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear() (+23 more)

### Community 29 - "LightEstimationClient"
Cohesion: 0.08
Nodes (48): getRabData(), saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), LightEstimationClientProps, SHAPES (+40 more)

### Community 30 - "lux-measurement-table.tsx"
Cohesion: 0.10
Nodes (28): AuditPhotoContext, LuxMeasurementTable(), LuxMeasurementTableProps, parseLux(), pointHint(), pointTone, rowAreas(), boxTone (+20 more)

### Community 31 - "audit-kalkulator.test.ts"
Cohesion: 0.12
Nodes (16): ac, acRows, chiller, chillerCalc, coffee, freezer, lateAc, masterStandard (+8 more)

### Community 32 - "audit-photos.tsx"
Cohesion: 0.21
Nodes (15): AuditPhotos(), remove(), upload(), AuditPhotosProps, compressPhoto(), photoUrl(), Sheet(), SheetContent() (+7 more)

### Community 33 - "MapDrawControl"
Cohesion: 0.83
Nodes (4): MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount()

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
Cohesion: 0.12
Nodes (20): MapDrawActionButton(), MapDrawCircle(), MapDrawDelete(), MapDrawEdit(), MapDrawMarker(), MapDrawPolygon(), MapDrawPolyline(), MapDrawRectangle() (+12 more)

### Community 38 - "stores/[id]/page.tsx"
Cohesion: 0.09
Nodes (40): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+32 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.14
Nodes (30): ActionResult, deleteUser(), DeleteUserInput, DELETE(), PUT(), POST(), DELETE(), PUT() (+22 more)

### Community 40 - "lighting-audit.ts"
Cohesion: 0.09
Nodes (33): CategorySummaryProps, restoreBackup(), calculateLpd(), createDefaultLuxRows(), createEmptyLightingAudit(), DEFAULT_LUX_ROWS, ESTIMATED_PLAN_RATIO, lightingRecapSheets() (+25 more)

### Community 41 - "audits/[id]/page.tsx"
Cohesion: 0.13
Nodes (24): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 42 - "Header"
Cohesion: 0.09
Nodes (42): AcEstimationLoading(), AuditResultLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditStepNavigate, AuditValidationDetailLoading(), AuditValidationLoading(), DashboardLoading() (+34 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "energy-audit-queries.ts"
Cohesion: 0.08
Nodes (31): LightingAuditPage(), Props, AVAILABLE_ENERGY_AUDIT_CATEGORIES, CategoryStatusMap, ENERGY_AUDIT_CATEGORIES, EnergyAuditCategoryInfo, EnergyAuditCategoryProgress, progress (+23 more)

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
Cohesion: 0.08
Nodes (44): GET(), getFilter(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, AdminStoreFilters(), applyFilterChanges() (+36 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "stores/[id]/page.tsx"
Cohesion: 0.13
Nodes (25): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+17 more)

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (43): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+35 more)

### Community 53 - "kategori/page.tsx"
Cohesion: 0.05
Nodes (64): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, dateFormat, EnergyAuditListPage(), first(), pageHref() (+56 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "audits/data/route.ts"
Cohesion: 0.07
Nodes (52): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+44 more)

### Community 56 - "energy-audit-export.ts"
Cohesion: 0.19
Nodes (16): GET(), CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap(), CATEGORY_EXPORT_LOADERS, loadCategory(), ExportableCategory, isExportableCategory() (+8 more)

### Community 57 - "lib/custom-equipment.ts"
Cohesion: 0.14
Nodes (22): getAvailableYears(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), AREA_TYPE_CATEGORY, isUploadThingUrl(), normalizeName() (+14 more)

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
Cohesion: 0.13
Nodes (14): AcMappingResultCard(), AcMappingResultCardData, AcMappingUnitDetail, Props, Row(), GypsumTileExportCardData, Props, LightEstimationResultCard() (+6 more)

### Community 62 - "custom-equipment-review.ts"
Cohesion: 0.23
Nodes (13): ActionResult, approveCustomEquipmentAction(), rejectCustomEquipmentAction(), run(), approve(), handleResult(), reject(), approveCustomEquipment() (+5 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "HvacAuditForm"
Cohesion: 0.12
Nodes (29): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), saveLightingAudit(), SaveResult, getTemperature() (+21 more)

### Community 65 - "request-guard.ts"
Cohesion: 0.17
Nodes (17): countInWindow(), createLockout(), createRateLimiter(), getClientIp(), prune(), retryAfterSeconds(), limiter, lockout (+9 more)

### Community 66 - "map-picker.tsx"
Cohesion: 0.21
Nodes (13): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+5 more)

### Community 67 - "master-data/page.tsx"
Cohesion: 0.17
Nodes (22): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, getMasterDataSummary() (+14 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "app/dashboard/page.tsx"
Cohesion: 0.33
Nodes (6): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditSection(), getEnergyAuditPendingCount()

### Community 70 - "gypsum-tile-calculator.ts"
Cohesion: 0.12
Nodes (23): GypsumTileResultCardProps, AxisTileResult, calcTile1D(), calculateGypsumTileLayout(), ccw(), checkIsIrregular(), classifyCellAgainstPoly(), CROSS_TEE_LENGTH_M (+15 more)

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
Cohesion: 0.16
Nodes (20): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, AdminTableScroll(), AdminUsersTable(), AdminUsersTableProps, BranchCell() (+12 more)

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

### Community 87 - "lighting-audit-export.ts"
Cohesion: 0.13
Nodes (20): Context, GET(), getLightingAuditsForExport(), buildLightingAuditWorkbook(), ExportAudit, lampTypes(), STATUS_LABEL, formatLuxStandard() (+12 more)

### Community 88 - "admin-entry/page.tsx"
Cohesion: 0.20
Nodes (15): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), DeviceGroup, groupDevices() (+7 more)

### Community 89 - "change-user-role.ts"
Cohesion: 0.15
Nodes (15): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg@^8.20.0, pg, adapter, pool (+7 more)

### Community 90 - "energy-audit-export-filters.ts"
Cohesion: 0.19
Nodes (17): GET(), defaultExportFilters(), EnergyAuditExportFilters, EnergyAuditExportStatus, exportDateRange(), exportFileName(), parseExportFilters(), readAll() (+9 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.21
Nodes (12): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getAdminStoreDetail(), getBrandName(), getEquipmentName(), isNonNegativeNumber() (+4 more)

### Community 92 - "route.spec.ts"
Cohesion: 0.27
Nodes (7): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet()

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "react"
Cohesion: 0.10
Nodes (21): LoginPage(), LoginToastNotice(), AdminMasterStoreDialogProps, Brand, BrandComboboxProps, PhotoUploadFieldProps, DemoLoginButton(), SuggestionButtonProps (+13 more)

### Community 95 - "admin-master-stores-table.tsx"
Cohesion: 0.18
Nodes (11): AdminMasterStoresTable(), SortableHeader(), updateSort(), formatDate(), formatHours(), formatNumber(), getNextSortOrder(), numberFormat (+3 more)

### Community 96 - "admin-user-import-dialog.tsx"
Cohesion: 0.31
Nodes (10): checkExistingEmails(), hashPassword(), importUsersBulk(), CsvUserRow, ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport() (+2 more)

### Community 97 - "admin-shell.tsx"
Cohesion: 0.07
Nodes (45): Page(), AdminHeaderActions(), AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps, AdminSidebar(), AdminSidebarItem() (+37 more)

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

### Community 115 - "settings/page.tsx"
Cohesion: 0.28
Nodes (7): MenuRow(), SectionLabel(), SettingsPage(), Theme, THEMES, next-themes@^0.4.6, next-themes

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
Cohesion: 0.15
Nodes (21): submitAudit(), toAreaTarget(), handleSubmit(), buildDemoAuditResult(), toAreaTarget(), AuditItemRow, buildAuditItemRows(), CalcMethodInfo (+13 more)

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
Nodes (13): applyColumnFormats(), buildWorkbookBuffer(), GET(), getColumnWidths(), isAdmin(), GET(), isAdmin(), serializeCell() (+5 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroupContext, Toggle(), toggleVariants, class-variance-authority@^0.7.1, class-variance-authority

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "filters.tsx"
Cohesion: 0.04
Nodes (86): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+78 more)

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

### Community 136 - "master-data/stores/data/route.ts"
Cohesion: 0.29
Nodes (9): GET(), getFilter(), getMasterStoreBranchCounts(), getMasterStoreRows(), getStoreOrderBySql(), getStoreWhereSql(), masterStoresPageSize, parseMasterStoreHours() (+1 more)

### Community 137 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.18
Nodes (10): Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1), KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0) (+2 more)

### Community 138 - "actions/import-users.ts"
Cohesion: 0.25
Nodes (4): ActionResult, ImportUserInput, hash, password

### Community 139 - "react-leaflet-markercluster"
Cohesion: 0.50
Nodes (4): LeafletMarkerClusterGroup, MapMarkerClusterGroup(), react-leaflet-markercluster@5.0.0-rc.0, react-leaflet-markercluster

### Community 141 - "admin-audit-detail.ts"
Cohesion: 0.20
Nodes (13): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), buildIotLookup(), getIotStatusLookup(), getStoreIot() (+5 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 143 - "create-user.ts"
Cohesion: 0.10
Nodes (30): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, updateUser(), UpdateUserInput, AdminEntryPage() (+22 more)

### Community 149 - "scripts/import-users.ts"
Cohesion: 0.60
Nodes (4): main(), parseBranches(), pool, sha256()

### Community 151 - "create-admin-user.ts"
Cohesion: 0.38
Nodes (6): dotenv@^17.4.2, dotenv, main(), pool, printUsage(), sha256()

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 153 - "hvac-audit-form.tsx"
Cohesion: 0.08
Nodes (42): AboutPage(), InfoRow(), AreaField, areaFields, TechnicalForm(), TechnicalFormProps, UnitInput(), areaFormat (+34 more)

### Community 154 - "change-user-role.ts"
Cohesion: 0.29
Nodes (7): @prisma/adapter-pg@^7.7.0, @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma

### Community 155 - "Alert"
Cohesion: 0.06
Nodes (56): DemoResultPage(), AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore, AuditValidationInfo (+48 more)

### Community 156 - "allowBuilds"
Cohesion: 0.18
Nodes (10): allowBuilds, esbuild, msgpackr-extract, msw, prisma, @prisma/engines, protobufjs, sharp (+2 more)

### Community 159 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 162 - "admin-master-categories-list.tsx"
Cohesion: 0.40
Nodes (5): AdminMasterCategoriesList(), AdminMasterCategoriesListProps, CategoryItem, formatNumber(), numberFormat

### Community 163 - "can"
Cohesion: 0.19
Nodes (16): ActionResult, deleteAudit(), getAuditHistory(), deleteMepSimulationLog(), GET(), isAdmin(), excludedBranchNames, GET() (+8 more)

### Community 166 - "interface"
Cohesion: 0.33
Nodes (5): interface, display_name, icon_large, icon_small, short_description

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.13
Nodes (20): BackfillAuditRow, BackfillChange, backfillCsv(), csvCell(), MIN_DIFF_KWH, planBaselineBackfill(), statusLabel(), csv (+12 more)

### Community 168 - "prisma.ts"
Cohesion: 0.07
Nodes (27): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult, SaveLightEstimationPayload, SaveLightEstimationResult, GET (+19 more)

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1232 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `hvac-audit-export.ts`, `auth.ts`, `filters.tsx`, `Input`, `Equipment Admin Queries`, `calculator-logs-client.tsx`, `master-data/stores/data/route.ts`, `Package & ESLint Config`, `actions/import-users.ts`, `admin/dashboard/page.tsx`, `Runtime Dependencies`, `Button`, `create-user.ts`, `store-mep-simulator-client.tsx`, `Card`, `audit-validation.ts`, `Branch Audit Summaries`, `submit-audit.ts`, `ac-estimation-client.tsx`, `hvac-audit-form.tsx`, `Alert`, `admin-master-equipment-dialog.tsx`, `LightEstimationClient`, `admin-user-queries.ts`, `can`, `stores/[id]/page.tsx`, `admin-master-data-mutations.ts`, `prisma.ts`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `energy-audit-queries.ts`, `stores/[id]/page.tsx`, `kategori/page.tsx`, `audits/data/route.ts`, `energy-audit-export.ts`, `lib/custom-equipment.ts`, `custom-equipment-review.ts`, `HvacAuditForm`, `master-data/page.tsx`, `app/dashboard/page.tsx`, `admin-users-table.tsx`, `lighting-audit-export.ts`, `admin-entry/page.tsx`, `energy-audit-export-filters.ts`, `route.spec.ts`, `react`, `admin-master-stores-table.tsx`, `admin-shell.tsx`, `settings/page.tsx`, `core.ts`, `reports/preview/route.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `{ signIn, signOut, useSession }`, `Toast via sonner`, `Alfamart Emblem (small)` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hvac-audit-export.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08232118758434548 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `filters.tsx`, `next`, `Input`, `Equipment Admin Queries`, `calculator-logs-client.tsx`, `map.tsx`, `cn`, `Button`, `create-user.ts`, `hvac-audit.ts`, `Card`, `audit-validation.ts`, `admin-dashboard-charts.tsx`, `step2-detail.tsx`, `ac-estimation-client.tsx`, `admin-master-equipment-dialog.tsx`, `Alert`, `hvac-audit-form.tsx`, `energy-audit-export-dialog.tsx`, `lux-measurement-table.tsx`, `audit-photos.tsx`, `MapDrawControl`, `MapDrawShapeButton`, `stores/[id]/page.tsx`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `stores/[id]/page.tsx`, `kategori/page.tsx`, `HvacAuditForm`, `map-picker.tsx`, `admin-users-table.tsx`, `react`, `admin-master-stores-table.tsx`, `admin-shell.tsx`, `settings/page.tsx`, `toggle-group.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14408602150537633 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._