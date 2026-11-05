# Graph Report - sparta-energy  (2026-11-04)

## Corpus Check
- 496 files · ~400,076 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3925 nodes · 11652 edges · 173 communities (155 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 96 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a8db2102`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hvac-audit-export.ts
- auth.ts
- admin-audit-queries.ts
- result-db.tsx
- Equipment Admin Queries
- light-estimation-client.tsx
- Report Export Queries
- ac-mapping-client.tsx
- map.tsx
- Package & ESLint Config
- audit-validation-queries.ts
- admin/dashboard/page.tsx
- Runtime Dependencies
- Button
- admin-auth.ts
- AC Mapping Calculator Proposal
- hvac-audit-form.tsx
- admin-master-data-queries.ts
- store-mep-simulator-client.tsx
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- utils.ts
- Input
- step3.tsx
- place-autocomplete.tsx
- custom-equipment-review.ts
- role-access.ts
- admin-stores-table.tsx
- step2-detail.tsx
- lib/unregistered-brands.ts
- audit-photos.tsx
- admin-master-equipment-dialog.tsx
- admin-user-queries.ts
- shadcn components.json
- 20260604000000_baseline_before_power_modes/migration.sql
- admin-master-data-queries.ts
- save-ac-estimation-log.ts
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
- energy-audit-export.ts
- HvacAuditForm
- CardContent
- admin-calculator-queries.ts
- contrast-check.py
- calculator-versions.ts
- item-form-dialog.tsx
- shadcn Forms & Composition
- hvac-audit-export.test.ts
- request-guard.ts
- map-picker.tsx
- audit-kalkulator.ts
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
- formula-comparison/route.ts
- Landing Hero Illustration
- antislop-human
- import-stores.ts
- AdminStoreFilters
- Docs Builder Script
- Update Password Script
- Landing Line-Art Illustration
- [id]/export/route.ts
- admin-entry/page.tsx
- export-store-data.ts
- create-user.ts
- admin-store-detail.ts
- resolveOperationType
- PWA Icon Set
- formula-comparison.test.ts
- mep-layout-canvas-preview.tsx
- admin-dashboard-filters.tsx
- admin-shell.tsx
- lighting-audit-form.tsx
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
- admin-equipment-filters.tsx
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- admin-report-filters.tsx
- Group 3: Quality Locks (consistency)
- antislop
- core.ts
- can
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- radix-ui
- Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator
- dropdown-menu.tsx
- The Craftsmanship Standard
- with
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- export-audits.ts
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- step3.tsx
- react
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- save-draft.ts
- Rumus Kalkulator Konsumsi Energi v2: Pembanding Rumus Lama dan Baru
- admin-audit-detail.ts
- sync-stores.ts
- start-client.tsx
- db-pool.ts
- AdminAuditFilters
- v2.0.0, 4 November 2026
- admin-audit-date-filter.ts
- admin-master-categories-list.tsx
- scripts/import-users.ts
- AdminMasterEquipmentFilters
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- AdminMasterStoreFilters
- change-user-role.ts
- eslint.config.mjs
- allowBuilds
- reports/page.tsx
- admin-audit-filters.tsx
- Disaster Engine & Store Impact Verification Flow
- ac-calculator.ts
- generate-lamp-simulation.ts
- interface
- backfill-audit-baseline.ts
- ref_node_assert
- Changelog - Lamp Estimation Calculator

## God Nodes (most connected - your core abstractions)
1. `cn()` - 312 edges
2. `Button()` - 195 edges
3. `react` - 140 edges
4. `next` - 130 edges
5. `@tabler/icons-react` - 121 edges
6. `Badge()` - 91 edges
7. `Input()` - 84 edges
8. `Card()` - 71 edges
9. `prisma` - 65 edges
10. `DialogContent()` - 63 edges

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

## Communities (173 total, 18 thin omitted)

### Community 0 - "hvac-audit-export.ts"
Cohesion: 0.09
Nodes (38): AcStandardResult, calculateHvacAcStandard(), getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), SaveResult, Context, GET() (+30 more)

### Community 1 - "auth.ts"
Cohesion: 0.08
Nodes (40): GET, POST, GET(), GET(), GetSessionResult, resolveSession(), Session, signInKey() (+32 more)

### Community 2 - "admin-audit-queries.ts"
Cohesion: 0.10
Nodes (23): activeStoreFilter, addAuditWhereAnd(), AdminAuditPriority, AdminAuditRow, AdminAuditSortKey, AdminAuditSortOrder, adminAuditsPageSize, AdminAuditStatus (+15 more)

### Community 3 - "result-db.tsx"
Cohesion: 0.13
Nodes (18): AuditResultPage(), DemoResultPage(), AREA_LABELS, areaChartConfig, AuditDB, AuditItemDB, AuditResultDB(), AuditStore (+10 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (46): GET(), getFilter(), parseArea(), AdminEquipmentPage(), averagePerStore(), formatNumber(), getFilter(), parseArea() (+38 more)

### Community 5 - "light-estimation-client.tsx"
Cohesion: 0.12
Nodes (28): SHAPES, SnapGuide, StandardCheckResult, AdminMasterDataNav(), CalculatorLogsClient(), CalculatorLogsClientProps, formatDateIndo(), MONTH_OPTIONS (+20 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.09
Nodes (46): addCommonWhere(), AdminReportCellValue, AdminReportColumn, AdminReportDataset, AdminReportStatus, AdminReportType, allMasterEquipmentFilters, buildAuditHistoryDataset() (+38 more)

### Community 7 - "ac-mapping-client.tsx"
Cohesion: 0.12
Nodes (28): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+20 more)

### Community 8 - "map.tsx"
Cohesion: 0.04
Nodes (75): ButtonGroup(), buttonGroupVariants, LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker (+67 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.05
Nodes (59): devDependencies, dotenv@^17.4.2, @eslint/eslintrc@^3, jest@^30.3.0, jest-environment-jsdom@^30.3.0, postcss@^8, prettier@^3.8.1, prettier-plugin-tailwindcss@^0.7.2 (+51 more)

### Community 10 - "audit-validation-queries.ts"
Cohesion: 0.12
Nodes (18): AuditValidationDetailPage(), Props, DemoPage(), 3. Pekerjaan di sparta-energy, activeStoreSql, getValidationAudit(), isSangatBorosAudit(), latestAuditPerStore (+10 more)

### Community 11 - "admin/dashboard/page.tsx"
Cohesion: 0.09
Nodes (30): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+22 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.04
Nodes (46): dependencies, @base-ui/react@^1.4.1, better-auth@^1.6.5, clsx@^2.1.1, cmdk@^1.1.1, date-fns@^4.1.0, html-to-image@^1.11.13, leaflet.markercluster@^1.5.3 (+38 more)

### Community 13 - "Button"
Cohesion: 0.10
Nodes (57): AdminCustomEquipmentReview(), AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoreExportFilterProps, numberFormat, AdminMasterStoresTable(), SortableHeader(), updateSort() (+49 more)

### Community 14 - "admin-auth.ts"
Cohesion: 0.29
Nodes (9): AdminLayout(), requireAdmin(), getAdminGapFilterEnabled, getAdminGapHiddenCount(), withAdminGapFilter(), SangatBorosStore, ADMIN_GAP_FILTER_COOKIE, AUDIT_GAP_FILTER (+1 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "hvac-audit-form.tsx"
Cohesion: 0.04
Nodes (72): AcCountFlagProps, toneByStatus, copTone, deltaTone, HvacAcUnitCardProps, roomTone, HvacExhaustZoneCardProps, ventilationTone (+64 more)

### Community 17 - "admin-master-data-queries.ts"
Cohesion: 0.08
Nodes (30): CountRow, DecimalValue, defaultMasterDataOrder, defaultMasterEquipmentSort, defaultMasterStoreSort, EquipmentArea, getEquipmentFromSql(), getEquipmentOrderBySql() (+22 more)

### Community 18 - "store-mep-simulator-client.tsx"
Cohesion: 0.09
Nodes (39): getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle() (+31 more)

### Community 19 - "Card"
Cohesion: 0.12
Nodes (37): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), AdminMetricCard(), AdminMetricTone, metricToneStyles (+29 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.10
Nodes (43): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, auditStoreHours(), AuditTechnicalInput, checkItemFields() (+35 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.12
Nodes (23): consumptionChartConfig, ConsumptionTrendChart(), ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue() (+15 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "utils.ts"
Cohesion: 0.06
Nodes (50): AcEstimationClient(), AcEstimationClientProps, MapPicker, getRabData(), getTemperature(), MapPickerRef, Brand, BrandCombobox() (+42 more)

### Community 24 - "Input"
Cohesion: 0.09
Nodes (47): getAvailableYears(), AuditFilterStatus, cache, EmptyState(), HistoryPage(), ReviewCard(), approve(), handleResult() (+39 more)

### Community 25 - "step3.tsx"
Cohesion: 0.08
Nodes (38): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+30 more)

### Community 26 - "place-autocomplete.tsx"
Cohesion: 0.08
Nodes (54): EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear() (+46 more)

### Community 27 - "custom-equipment-review.ts"
Cohesion: 0.23
Nodes (13): ActionResult, approveCustomEquipmentAction(), rejectCustomEquipmentAction(), run(), approveCustomEquipment(), ApproveCustomEquipmentInput, CustomEquipmentReviewError, rejectCustomEquipment() (+5 more)

### Community 28 - "role-access.ts"
Cohesion: 0.17
Nodes (16): ActionResult, updateUser(), UpdateUserInput, POST(), readSimulatedRole(), handleSubmit(), 12. Status sisi sparta-energy (26 Oktober 2026), ADMIN_ACCESS (+8 more)

### Community 29 - "admin-stores-table.tsx"
Cohesion: 0.19
Nodes (14): AdminStoresTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getStatus() (+6 more)

### Community 30 - "step2-detail.tsx"
Cohesion: 0.09
Nodes (31): CALC_METHODS, computeBaseKw(), computeDailyKwh(), computeTimeShare(), DEFAULT_RUNNING_PCT_OF_NAMEPLATE, DEFAULT_STANDBY_PCT_OF_NAMEPLATE, EnergyProfile, EnergyResult (+23 more)

### Community 31 - "lib/unregistered-brands.ts"
Cohesion: 0.11
Nodes (30): ActionResult, addFieldBrandToMasterAction(), dismissFieldBrandAction(), run(), MasterBrandRef, matchMasterBrand(), normalizeBrandName(), brands (+22 more)

### Community 32 - "audit-photos.tsx"
Cohesion: 0.15
Nodes (19): AuditPhotoContext, AuditPhotos(), remove(), upload(), AuditPhotosProps, compressPhoto(), photoUrl(), WebcamCapture() (+11 more)

### Community 33 - "admin-master-equipment-dialog.tsx"
Cohesion: 0.07
Nodes (61): AboutPage(), InfoRow(), AdminCustomEquipmentReviewProps, dateFormat, AdminMasterEquipmentDialog(), handleSubmit(), AdminMasterEquipmentDialogProps, AREA_CATEGORY_LABELS (+53 more)

### Community 34 - "admin-user-queries.ts"
Cohesion: 0.14
Nodes (28): AdminUsersPage(), formatNumber(), getFilter(), SearchParams, GET(), getFilter(), AdminUserFilters, AdminUserRow (+20 more)

### Community 35 - "shadcn components.json"
Cohesion: 0.07
Nodes (26): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+18 more)

### Community 36 - "20260604000000_baseline_before_power_modes/migration.sql"
Cohesion: 0.09
Nodes (31): "account", "session", "verification", "account", "audit_items", "audit_pln_std_history", "audit_recommendations", "audits" (+23 more)

### Community 37 - "admin-master-data-queries.ts"
Cohesion: 0.13
Nodes (30): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+22 more)

### Community 38 - "save-ac-estimation-log.ts"
Cohesion: 0.47
Nodes (5): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.12
Nodes (33): ActionResult, deleteUser(), DeleteUserInput, DELETE(), PUT(), POST(), DELETE(), PUT() (+25 more)

### Community 40 - "lighting-audit-form.tsx"
Cohesion: 0.04
Nodes (73): CategorySummaryProps, boxTone, decimalFormat, labelRowsTop(), labelTone, LampLayout, LuxPlan(), pointAverage() (+65 more)

### Community 41 - "audits/[id]/page.tsx"
Cohesion: 0.13
Nodes (24): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 42 - "Header"
Cohesion: 0.10
Nodes (35): AcEstimationLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditStartClient(), AuditValidationDetailLoading(), AuditValidationLoading(), AuditValidationPage(), pageHref() (+27 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.13
Nodes (18): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+10 more)

### Community 45 - "energy-audit-queries.ts"
Cohesion: 0.07
Nodes (31): LightingAuditPage(), Props, HvacAuditPage(), Props, CategoryStatusMap, EnergyAuditCategoryInfo, EnergyAuditCategoryProgress, progress (+23 more)

### Community 46 - "dxf-parser.ts"
Cohesion: 0.08
Nodes (38): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+30 more)

### Community 47 - "ref_path"
Cohesion: 0.13
Nodes (13): calcSimetris(), evaluateDetailed(), run(), calcSimetris(), evaluateStatus(), run(), fmt(), main() (+5 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.10
Nodes (42): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, getAdminGapFilterSql() (+34 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "stores/[id]/page.tsx"
Cohesion: 0.13
Nodes (24): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (43): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+35 more)

### Community 53 - "kategori/page.tsx"
Cohesion: 0.09
Nodes (45): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, dateFormat, EnergyAuditListPage(), first(), pageHref() (+37 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "audits/data/route.ts"
Cohesion: 0.18
Nodes (22): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+14 more)

### Community 56 - "energy-audit-export.ts"
Cohesion: 0.07
Nodes (54): GET(), GET(), Context, GET(), AVAILABLE_ENERGY_AUDIT_CATEGORIES, CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap() (+46 more)

### Community 57 - "HvacAuditForm"
Cohesion: 0.14
Nodes (24): StepActionBar(), areaFormat, createUnitLike(), dateFormat, formatCoord(), HvacAuditForm(), addUnit(), calculateStandard() (+16 more)

### Community 58 - "CardContent"
Cohesion: 0.19
Nodes (12): AuditResultLoading(), AuditStepNavigate, DemoResultLoading(), AuditResultSkeleton(), AreaItem, areaItems, AuditStep2(), AuditStep2Props (+4 more)

### Community 59 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "calculator-versions.ts"
Cohesion: 0.10
Nodes (19): EstimationResultCard(), EstimationResultCardData, Props, Row(), AcMappingResultCard(), AcMappingResultCardData, AcMappingUnitDetail, Props (+11 more)

### Community 62 - "item-form-dialog.tsx"
Cohesion: 0.13
Nodes (21): AddEquipmentDialogProps, areaCategory, recordedQty(), EquipmentListProps, FormState, AreaKey, areaLabels, areaOrder (+13 more)

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "hvac-audit-export.test.ts"
Cohesion: 0.12
Nodes (13): createAcUnit(), HvacExportAudit, acHeaderIndex, audit, exHeaderIndex, plnRow, readings, recap (+5 more)

### Community 65 - "request-guard.ts"
Cohesion: 0.17
Nodes (17): countInWindow(), createLockout(), createRateLimiter(), getClientIp(), prune(), retryAfterSeconds(), limiter, lockout (+9 more)

### Community 66 - "map-picker.tsx"
Cohesion: 0.15
Nodes (24): createCustomIcon(), MapCaptureHandler(), MapPicker, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater(), formatKwh() (+16 more)

### Community 67 - "audit-kalkulator.ts"
Cohesion: 0.16
Nodes (20): AuditItemRow, CalcMethodInfo, BOROS_TOLERANCE, calculateGapPercent(), calculateItemDailyKwh(), calculateLegacyItemDailyKwh(), DAYS_PER_MONTH, isBorosFor() (+12 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "app/dashboard/page.tsx"
Cohesion: 0.21
Nodes (11): DashboardPage(), AcEstimationUnavailableNotice(), CalculatorGrid(), CalculatorGridProps, RecentAuditItem, RecentAuditSection(), RecentAuditSectionProps, RecentAuditStatus (+3 more)

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
Cohesion: 0.12
Nodes (16): 0. Penanganan Denah Asimetris / Poligon (Trapesium, Huruf L, Sudut Serong), 1. Parameter Baku & Dimensi Panel, 2. Aturan Baku Pemasangan (Golden Rules), 3. Analisis File Excel Konsep & Koreksi Bug, 4. Desain Output & Pembedahan Panel, 6. Standar Acuan Baru: Koefisien Fix Jayaboard (Sheet "Koefisien 1.75"), 7. Catatan Mengenai Harga Satuan Material (Regional Pricing), A. Contoh Kasus Sisi 60 cm (Lebar Toko 5.0 m, Modul 0.6 m) (+8 more)

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

### Community 79 - "formula-comparison/route.ts"
Cohesion: 0.24
Nodes (10): formatColumns(), GET(), isAdmin(), percent(), status(), VALIDATION_LABELS, EXCLUDED_BRANCHES, getFormulaComparisons() (+2 more)

### Community 80 - "Landing Hero Illustration"
Cohesion: 0.32
Nodes (8): Audit Completion Checkmark, Lime Green / Dark Teal Brand Palette, Field Auditor with Clipboard, Handheld Measuring Device / Thermometer Gun, Landing Hero Illustration (Store Energy Audit), Electrical Panel with kWh Meter and Breakers, Retail Store Equipment (Fridge, Lights, CCTV, Cashier), Rooftop Solar Panels

### Community 81 - "antislop-human"
Cohesion: 0.10
Nodes (20): antislop-human, Broken Tab Order, Color & Contrast, Color-Only Feedback, Focus & States, How to use this skill, Human Skill Checklist, Keyboard (+12 more)

### Community 82 - "import-stores.ts"
Cohesion: 0.25
Nodes (6): Store Sync Cron Implementation Plan, Store Sync Cron Endpoint Design Spec, SPARTA Maintenance (reference sync implementation), adapter, pool, prisma

### Community 83 - "AdminStoreFilters"
Cohesion: 0.53
Nodes (6): AdminStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

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
Cohesion: 0.10
Nodes (26): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), AdminEntryPage(), DestinationCard() (+18 more)

### Community 89 - "export-store-data.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDecimal(), main(), pool

### Community 90 - "create-user.ts"
Cohesion: 0.22
Nodes (15): ActionResult, createUser(), CreateUserInput, ActionResult, checkExistingEmails(), ImportUserInput, importUsersBulk(), handleSubmit() (+7 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.19
Nodes (12): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getBrandName(), getEquipmentName(), isNonNegativeNumber(), isPositiveNumber() (+4 more)

### Community 92 - "resolveOperationType"
Cohesion: 0.23
Nodes (14): AREA_TYPE_CATEGORY, normalizeName(), selectCustomEquipment(), syncCustomEquipmentSubmissions(), equipment(), fakeTx(), master, picked (+6 more)

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "formula-comparison.test.ts"
Cohesion: 0.17
Nodes (11): ComparisonItem, audit, changed, coffee, incomplete, item(), noBrand, TF67 (+3 more)

### Community 95 - "mep-layout-canvas-preview.tsx"
Cohesion: 0.09
Nodes (38): saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), checkLampObstacle(), formatDim(), getCashierZonePolygon() (+30 more)

### Community 96 - "admin-dashboard-filters.tsx"
Cohesion: 0.23
Nodes (11): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminDashboardFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+3 more)

### Community 97 - "admin-shell.tsx"
Cohesion: 0.06
Nodes (65): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps (+57 more)

### Community 99 - "lighting-audit-form.tsx"
Cohesion: 0.08
Nodes (41): saveLightingAudit(), PlnDraftRow, AreaField, areaFields, TechnicalDraft, TechnicalForm(), TechnicalFormProps, UnitInput() (+33 more)

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

### Community 115 - "admin-equipment-filters.tsx"
Cohesion: 0.23
Nodes (11): AdminEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminEquipmentFiltersProps, areaOptions, filterParamKeys (+3 more)

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

### Community 120 - "admin-report-filters.tsx"
Cohesion: 0.27
Nodes (9): AdminReportFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminReportFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+1 more)

### Community 121 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 122 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 123 - "core.ts"
Cohesion: 0.13
Nodes (19): discardCustomEquipmentPhoto(), f, imageOnly, ourFileRouter, OurFileRouter, requireMasterDataManager(), requireSignedIn(), GET (+11 more)

### Community 124 - "can"
Cohesion: 0.11
Nodes (27): ActionResult, deleteAudit(), AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, getAuditHistory(), HistoryItem (+19 more)

### Community 125 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 126 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 127 - "radix-ui"
Cohesion: 0.16
Nodes (13): ButtonGroupSeparator(), ButtonGroupText(), FieldSeparator(), ItemSeparator(), Progress(), Separator(), SidebarSeparator(), ToggleGroupContext (+5 more)

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

### Community 136 - "step3.tsx"
Cohesion: 0.07
Nodes (36): getDemoAiRecommendation(), DraftNotSubmittableError, submitAudit(), SubmitAuditInput, toAreaTarget(), AreaTarget, handleSubmit(), AuditStep3Props (+28 more)

### Community 137 - "react"
Cohesion: 0.07
Nodes (33): Props, LoginPage(), LoginToastNotice(), BranchCombobox(), BranchComboboxProps, AdminMasterStoreDialogProps, AdminMasterStoreFiltersProps, filterParamKeys (+25 more)

### Community 138 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.39
Nodes (5): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator

### Community 139 - "save-draft.ts"
Cohesion: 0.06
Nodes (44): deleteAuditDraft(), getAuditDraft(), getSingleDuration(), saveAuditDraft(), SaveDraftInput, toAreaTarget(), handleDelete(), handleResume() (+36 more)

### Community 140 - "Rumus Kalkulator Konsumsi Energi v2: Pembanding Rumus Lama dan Baru"
Cohesion: 0.20
Nodes (9): 1. Rumus berdampingan, 2. Kolom data, 3. Contoh hitungan, 4. Aturan yang dikunci, 5. Audit lama: laporan pembanding, 6. Kategori, 7. Yang belum diputuskan, Ringkasan hasil (+1 more)

### Community 141 - "admin-audit-detail.ts"
Cohesion: 0.16
Nodes (16): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), isAdminSangatBoros(), getAdminStoreDetail(), buildIotLookup() (+8 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.15
Nodes (19): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), fetchAccessToken(), fetchStoreSheet(), filterNewStores() (+11 more)

### Community 143 - "start-client.tsx"
Cohesion: 0.08
Nodes (34): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, getMepSimulationDetail(), MepSimulationListFilter, SaveMepSimulationPayload, SaveMepSimulationResult (+26 more)

### Community 144 - "db-pool.ts"
Cohesion: 0.36
Nodes (6): createDbPool(), dbPool, getPositiveIntegerEnv(), globalForDbPool, main(), mapCategoryToArea()

### Community 145 - "AdminAuditFilters"
Cohesion: 0.53
Nodes (6): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 146 - "v2.0.0, 4 November 2026"
Cohesion: 0.25
Nodes (7): Changelog: Kalkulator Konsumsi Energi Toko, Diperbaiki, Ditambahkan, Diubah, Tidak berubah, v1, sampai 3 November 2026, v2.0.0, 4 November 2026

### Community 147 - "admin-audit-date-filter.ts"
Cohesion: 0.43
Nodes (6): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear()

### Community 148 - "admin-master-categories-list.tsx"
Cohesion: 0.40
Nodes (5): AdminMasterCategoriesList(), AdminMasterCategoriesListProps, CategoryItem, formatNumber(), numberFormat

### Community 149 - "scripts/import-users.ts"
Cohesion: 0.60
Nodes (4): main(), parseBranches(), pool, sha256()

### Community 150 - "AdminMasterEquipmentFilters"
Cohesion: 0.53
Nodes (6): AdminMasterEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 151 - "create-admin-user.ts"
Cohesion: 0.24
Nodes (6): main(), pool, printUsage(), sha256(), hash, password

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 153 - "AdminMasterStoreFilters"
Cohesion: 0.53
Nodes (6): AdminMasterStoreFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), getParam()

### Community 154 - "change-user-role.ts"
Cohesion: 0.10
Nodes (24): getPoolConfig(), adapter, BrandEntry, equipmentData, pool, prisma, dotenv, pg (+16 more)

### Community 155 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9.39.4, eslint-config-next@16.1.7, eslint, eslint-config-next

### Community 156 - "allowBuilds"
Cohesion: 0.18
Nodes (10): allowBuilds, esbuild, msgpackr-extract, msw, prisma, @prisma/engines, protobufjs, sharp (+2 more)

### Community 157 - "reports/page.tsx"
Cohesion: 0.18
Nodes (19): AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getComparisonHref(), getExportHref(), getPreviewHref(), getReportParams() (+11 more)

### Community 158 - "admin-audit-filters.tsx"
Cohesion: 0.20
Nodes (12): AdminAuditFiltersProps, filterParamKeys, filterParamKeySet, monthOptions, iotFilterField, priorityFilterField, validationFilterField, AdminStoreFiltersProps (+4 more)

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.13
Nodes (12): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API, Store Coordinates Sync Plan (+4 more)

### Community 161 - "ac-calculator.ts"
Cohesion: 0.70
Nodes (3): AC_UNIT_BTU, calculateAcUnits(), getClusterBtu()

### Community 162 - "generate-lamp-simulation.ts"
Cohesion: 0.60
Nodes (4): SimetrisResult, calcSimetris(), evaluateStatus(), run()

### Community 166 - "interface"
Cohesion: 0.33
Nodes (5): interface, display_name, icon_large, icon_small, short_description

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.13
Nodes (20): BackfillAuditRow, BackfillChange, backfillCsv(), csvCell(), MIN_DIFF_KWH, planBaselineBackfill(), statusLabel(), csv (+12 more)

### Community 169 - "ref_node_assert"
Cohesion: 0.27
Nodes (9): AREA_NAMES, endTimeFor(), expectedMonthly(), ExportRow, replay(), store, TF67, toEquipments() (+1 more)

### Community 170 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.15
Nodes (12): saveAcEstimationLog, Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, saveLightEstimationLog, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1) (+4 more)

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1319 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `start-client.tsx` to `hvac-audit-export.ts`, `auth.ts`, `dropdown-menu.tsx`, `result-db.tsx`, `light-estimation-client.tsx`, `step3.tsx`, `react`, `audit-validation-queries.ts`, `save-draft.ts`, `admin/dashboard/page.tsx`, `Button`, `admin-auth.ts`, `sync-stores.ts`, `Package & ESLint Config`, `Runtime Dependencies`, `Card`, `audit-validation.ts`, `Branch Audit Summaries`, `utils.ts`, `Input`, `step3.tsx`, `custom-equipment-review.ts`, `role-access.ts`, `admin-stores-table.tsx`, `admin-audit-filters.tsx`, `lib/unregistered-brands.ts`, `admin-master-equipment-dialog.tsx`, `admin-user-queries.ts`, `admin-master-data-queries.ts`, `save-ac-estimation-log.ts`, `admin-master-data-mutations.ts`, `audits/[id]/page.tsx`, `Header`, `Root Layout & Theme`, `energy-audit-queries.ts`, `admin-store-queries.ts`, `stores/[id]/page.tsx`, `kategori/page.tsx`, `audits/data/route.ts`, `energy-audit-export.ts`, `HvacAuditForm`, `CardContent`, `item-form-dialog.tsx`, `app/dashboard/page.tsx`, `formula-comparison/route.ts`, `[id]/export/route.ts`, `admin-entry/page.tsx`, `create-user.ts`, `admin-dashboard-filters.tsx`, `admin-shell.tsx`, `lighting-audit-form.tsx`, `admin-equipment-filters.tsx`, `admin-report-filters.tsx`, `core.ts`, `can`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `{ signIn, signOut, useSession }`, `Toast via sonner`, `Alfamart Emblem (small)` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hvac-audit-export.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09191583610188261 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `dropdown-menu.tsx`, `result-db.tsx`, `light-estimation-client.tsx`, `ac-mapping-client.tsx`, `step3.tsx`, `react`, `map.tsx`, `hvac-audit-form.tsx`, `AdminAuditFilters`, `store-mep-simulator-client.tsx`, `Card`, `admin-master-categories-list.tsx`, `admin-dashboard-charts.tsx`, `AdminMasterEquipmentFilters`, `utils.ts`, `Input`, `step3.tsx`, `AdminMasterStoreFilters`, `place-autocomplete.tsx`, `reports/page.tsx`, `admin-audit-filters.tsx`, `admin-stores-table.tsx`, `audit-photos.tsx`, `admin-master-equipment-dialog.tsx`, `audits/[id]/page.tsx`, `Header`, `stores/[id]/page.tsx`, `kategori/page.tsx`, `HvacAuditForm`, `CardContent`, `item-form-dialog.tsx`, `map-picker.tsx`, `app/dashboard/page.tsx`, `gypsum-tile-calculator.ts`, `AdminStoreFilters`, `admin-entry/page.tsx`, `mep-layout-canvas-preview.tsx`, `admin-dashboard-filters.tsx`, `admin-shell.tsx`, `lighting-audit-form.tsx`, `admin-equipment-filters.tsx`, `admin-report-filters.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08313725490196078 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._