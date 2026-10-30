# Graph Report - sparta-energy  (2026-10-30)

## Corpus Check
- 440 files · ~555,134 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .ico 2, .css 1)

## Summary
- 3435 nodes · 10190 edges · 171 communities (159 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7fd77c7c`
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
- technical-form.tsx
- lighting-audit-form.tsx
- start-client.tsx
- Card
- audit-validation.ts
- admin-dashboard-charts.tsx
- Branch Audit Summaries
- utils.ts
- step3.tsx
- prisma.ts
- kategori/page.tsx
- ac-count-flag.tsx
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
- energy-audit-export.ts
- db-utils.ts
- ref_path
- Styling & Theming Rules
- admin-store-queries.ts
- Tone & Voice
- can
- photos/route.ts
- admin-audit-queries.ts
- antislop-layoutmobile
- admin-calculator-queries.ts
- gypsum-tile-calculator.ts
- energy-audit-export-filters.ts
- validation-summary.tsx
- admin/stores/data/route.ts
- contrast-check.py
- admin-master-equipment-table.tsx
- Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring
- shadcn Forms & Composition
- energy-audit-queries.ts
- UploadThing File Upload
- field.tsx
- submit-audit.ts
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
- change-user-role.ts
- admin-audit-filters.tsx
- admin-store-detail.ts
- save-draft.ts
- PWA Icon Set
- state-block.tsx
- hvac-audit-export.ts
- draft-list-section.tsx
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
- CardContent
- Decorative Elements
- antislop-ui
- Layout & Components
- Visual & Color
- sanitizeLightingAuditData
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
- admin-master-store-filters.tsx
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- export-store-data.ts
- Konsep Akses Role: Admin, Auditor, GS General Service, dan Area
- calculator-versions.ts
- breadcrumb.tsx
- Button
- admin-audit-date-filter.ts
- device-access.ts
- lib/admin-gap-filter.ts
- sync-stores.ts
- Temperature BTU Clusters (450 / 600 / 751 BTU/m2)
- hvac-audit-form.tsx
- hvac-exhaust-zone-card.tsx
- export-audits.ts
- audit-recalculate.ts
- app/dashboard/page.tsx
- audit-kalkulator.test.ts
- MapDrawControl
- create-admin-user.ts
- AC Restricted Zones (Glass/Door, Open Chiller, Cashier)
- role-access.ts
- actions/import-users.ts
- energy-audit-export-dialog.tsx
- ac-estimation-client.tsx
- route.spec.ts
- result-skeleton.tsx
- time-range-cards.tsx
- Disaster Engine & Store Impact Verification Flow
- admin-user-device-dialog.tsx
- Store Coordinates Sync Plan
- dotenv
- master-data/page.tsx
- ImportUserCsvDialog
- generate-lamp-analysis.js
- backfill-audit-baseline.ts
- admin-master-categories-list.tsx
- generate-lamp-simulation.ts
- store-types.ts

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

## Communities (171 total, 12 thin omitted)

### Community 0 - "admin-audits-table.tsx"
Cohesion: 0.18
Nodes (14): AdminAuditsTable(), SortableHeader(), updateSort(), calculateGapPercent(), formatDate(), formatKwh(), getNextSortOrder(), getRecommendationLabel() (+6 more)

### Community 1 - "auth.ts"
Cohesion: 0.10
Nodes (34): GET, POST, GET(), GET(), GetSessionResult, resolveSession(), Session, User (+26 more)

### Community 2 - "admin-users-table.tsx"
Cohesion: 0.11
Nodes (35): AdminEquipmentTable(), SortableHeader(), updateSort(), areaLabels, formatDate(), formatNumber(), getNextSortOrder(), numberFormat (+27 more)

### Community 3 - "Input"
Cohesion: 0.13
Nodes (31): AuditFilterStatus, cache, EmptyState(), HistoryPage(), CreateUserDialog(), handleRoleChange(), EditUserDialog(), handleRoleChange() (+23 more)

### Community 4 - "Equipment Admin Queries"
Cohesion: 0.09
Nodes (46): GET(), getFilter(), parseArea(), AdminEquipmentPage(), averagePerStore(), formatNumber(), getFilter(), parseArea() (+38 more)

### Community 5 - "Header"
Cohesion: 0.10
Nodes (36): AcEstimationLoading(), EnergyAuditListLoading(), AuditStartLoading(), AuditValidationDetailLoading(), AuditValidationLoading(), AuditValidationPage(), pageHref(), Props (+28 more)

### Community 6 - "Report Export Queries"
Cohesion: 0.09
Nodes (48): addCommonWhere(), AdminReportCellValue, AdminReportColumn, AdminReportDataset, AdminReportStatus, AdminReportType, allMasterEquipmentFilters, buildAdminReportDataset() (+40 more)

### Community 7 - "@tabler/icons-react"
Cohesion: 0.15
Nodes (15): AuditPhotoContext, AuditPhotos(), remove(), upload(), AuditPhotosProps, compressPhoto(), photoUrl(), WebcamCapture() (+7 more)

### Community 8 - "map.tsx"
Cohesion: 0.06
Nodes (44): LeafletCircle, LeafletCircleMarker, LeafletFeatureGroup, LeafletLayerGroup, LeafletMapContainer, LeafletMarker, LeafletMarkerClusterGroup, LeafletPolygon (+36 more)

### Community 9 - "Package & ESLint Config"
Cohesion: 0.04
Nodes (45): eslintConfig, name, packageManager, prisma, seed, private, type, version (+37 more)

### Community 10 - "Changelog - Lamp Estimation Calculator"
Cohesion: 0.18
Nodes (10): Changelog - Lamp Estimation Calculator, placeLamps (targetLpb fitting fix v1.1.1), Polygon Ray-Intersection Lamp Placement, Light Calculator Excel Analysis, KALKULATOR LAMPU ASIMETRIS sheet, Lamps-per-Row Trial Sampling (Max/Min/Min-1), KALKULATOR LAMPU SIMETRIS sheet, Proposal: Hierarchical Optimization Lamp Calculator (v1.2.0) (+2 more)

### Community 11 - "admin-audit-queries.ts"
Cohesion: 0.18
Nodes (23): GET(), getFilter(), isAdmin(), parseRecommendation(), parseStatus(), AdminAuditsPage(), formatNumber(), getFilter() (+15 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, better-auth, class-variance-authority, clsx, cmdk, date-fns, @google/genai (+35 more)

### Community 13 - "DialogContent"
Cohesion: 0.12
Nodes (41): AdminMasterStoreDialog(), AdminMasterStoreExportFilter(), AdminMasterStoreExportFilterProps, numberFormat, DeleteUserConfirmDialog(), ExitAuditDialog(), ExitAuditDialogProps, AddEquipmentDialog() (+33 more)

### Community 14 - "hvac-audit-export.ts"
Cohesion: 0.16
Nodes (22): Context, GET(), AC_HEADER, acChecklistRows(), acCountRows(), average(), ecoAndPhotoRows(), EXHAUST_HEADER (+14 more)

### Community 15 - "AC Mapping Calculator Proposal"
Cohesion: 0.12
Nodes (17): components/ac-estimation/ac-placement-canvas.tsx (planned), AC Layout & Mapping Design Specification, AC Layout Tool (/ac-layout), CalculatorGrid, Daikin 2 PK Split Wall Reference Unit (18,000 BTU/h, 1050mm), Daikin Installation Manual / Engineering Data Book (FTKC/FTV), AC Mapping Calculator Proposal, AC Estimation Calculator (/ac-estimation) (+9 more)

### Community 16 - "technical-form.tsx"
Cohesion: 0.14
Nodes (19): PlnDraftRow, PlnHistoryEditor(), PlnHistoryEditorProps, toNumberOrZero(), yearOptions(), AreaField, areaFields, TechnicalDraft (+11 more)

### Community 17 - "lighting-audit-form.tsx"
Cohesion: 0.05
Nodes (70): CategorySummaryProps, dateFormat, LightingAuditFormProps, lpdTone, luxTone, newId(), numberFormat, parseNumber() (+62 more)

### Community 18 - "start-client.tsx"
Cohesion: 0.11
Nodes (28): AcEstimationPage(), excludedBranchNames, AcMappingPage(), excludedBranchNames, getMepSimulationDetail(), excludedBranchNames, getStoreByCodeAction(), searchStoresAction() (+20 more)

### Community 19 - "Card"
Cohesion: 0.24
Nodes (22): AdminMetricCard(), AdminMetricTone, metricToneStyles, CorrectionEntry, CorrectionHistory(), dateTimeFormat, AcEstimationCard(), EnergyAuditCard() (+14 more)

### Community 20 - "audit-validation.ts"
Cohesion: 0.12
Nodes (37): ActionResult, addAuditItem(), AddAuditItemInput, applyDraft(), areaTargets, AuditTechnicalInput, checkItemFields(), checkPlnHistory() (+29 more)

### Community 21 - "admin-dashboard-charts.tsx"
Cohesion: 0.08
Nodes (37): AuditResultPage(), consumptionChartConfig, ConsumptionTrendPoint, EfficiencyBreakdownChart(), EfficiencyBreakdownDatum, efficiencyChartConfig, formatK(), formatTooltipValue() (+29 more)

### Community 22 - "Branch Audit Summaries"
Cohesion: 0.11
Nodes (34): AdminBranchesPage(), areaLabels, BranchAuditSummaryRow, BranchDominantRow, BranchSortKey, buildBranchesQueryParts(), calculateGapPercent(), formatKwh() (+26 more)

### Community 23 - "utils.ts"
Cohesion: 0.14
Nodes (18): ButtonGroupSeparator(), ButtonGroupText(), FieldSeparator(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia(), itemMediaVariants (+10 more)

### Community 24 - "step3.tsx"
Cohesion: 0.14
Nodes (22): getDemoAiRecommendation(), submitAudit(), toAreaTarget(), AreaTarget, AuditStep3(), handleSubmit(), AuditStep3Props, buildDemoAuditResult() (+14 more)

### Community 25 - "prisma.ts"
Cohesion: 0.13
Nodes (13): fetchAccessToken(), getEnvOptional(), saveAcEstimationLog(), SaveAcEstimationPayload, SaveAcEstimationResult, SaveLightEstimationPayload, SaveLightEstimationResult, Props (+5 more)

### Community 26 - "kategori/page.tsx"
Cohesion: 0.13
Nodes (32): categoryIcons, dateFormat, EnergyAuditStorePage(), Props, dateFormat, EnergyAuditListPage(), first(), pageHref() (+24 more)

### Community 27 - "ac-count-flag.tsx"
Cohesion: 0.32
Nodes (6): AcCountFlag(), AcCountFlagProps, toneByStatus, statusTone, AcCountStatus, parseAcSummaryStatus()

### Community 28 - "Button"
Cohesion: 0.15
Nodes (15): BranchCombobox(), BranchComboboxProps, AdminMasterStoreDialogProps, CsvUserRow, SuggestionButtonProps, DialogOverlay(), DialogPortal(), Label() (+7 more)

### Community 29 - "store-mep-simulator-client.tsx"
Cohesion: 0.11
Nodes (33): getLatestStoreMepSimulation(), getMepSimulationList(), saveMepSimulationLog(), ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), checkLampObstacle() (+25 more)

### Community 30 - "Point"
Cohesion: 0.09
Nodes (34): HistorySnapshot, PerimeterPathResult, PlacedAcUnit, ValidWallSpan, WallSegment, ZoneSpanResult, HistorySnapshot, PerimeterPathResult (+26 more)

### Community 31 - "Button"
Cohesion: 0.16
Nodes (19): AdminUserFilters(), handleBranchToggle(), handleClearAllBranches(), handleRoleChange(), handleSearchSubmit(), handleSelectAllBranches(), updateParams(), AdminUserFiltersProps (+11 more)

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
Cohesion: 0.12
Nodes (26): AdminAuditDetail, AdminAuditDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+18 more)

### Community 37 - "admin/dashboard/page.tsx"
Cohesion: 0.13
Nodes (25): AdminDashboardPage(), calculateGapPercent(), compactNumberFormat, CompletedAuditRow, excludedBranchNames, formatCompact(), formatNumber(), formatOperatingHours() (+17 more)

### Community 38 - "Badge"
Cohesion: 0.13
Nodes (24): AdminStoreDetail, AdminStoreDetailPage(), compareEquipmentRows(), EquipmentRow, EquipmentSortKey, equipmentSortKeys, equipmentSortLabels, formatDate() (+16 more)

### Community 39 - "admin-master-data-mutations.ts"
Cohesion: 0.13
Nodes (32): ActionResult, deleteUser(), DeleteUserInput, DELETE(), PUT(), POST(), DELETE(), PUT() (+24 more)

### Community 40 - "light-estimation-client.tsx"
Cohesion: 0.08
Nodes (47): saveLightEstimationLog(), checkStandards(), formatDim(), getClosestPointOnSegment(), LightEstimationClient(), LightEstimationClientProps, SHAPES, SnapGuide (+39 more)

### Community 41 - "ac-mapping-client.tsx"
Cohesion: 0.11
Nodes (33): AcMappingClient(), AcMappingClientProps, ActiveTool, applyCashierBoxToPolygon(), applyZoneToPolygon(), checkAcPlacementValidation(), ForbiddenInterval, formatDim() (+25 more)

### Community 42 - "cn"
Cohesion: 0.12
Nodes (34): ComboboxClear(), ComboboxInput(), Command(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList() (+26 more)

### Community 43 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 44 - "Root Layout & Theme"
Cohesion: 0.14
Nodes (16): dynamic, fontMono, geist, metadata, RootLayout(), viewport, isPlainLeftClick(), RouteProgress() (+8 more)

### Community 45 - "energy-audit-export.ts"
Cohesion: 0.15
Nodes (22): CATEGORY_RECAP_SHEETS, CategoryExportAudits, buildEnergyAuditRecap(), CATEGORY_EXPORT_LOADERS, loadCategory(), ExportableCategory, isExportableCategory(), STATUS_LABEL (+14 more)

### Community 46 - "db-utils.ts"
Cohesion: 0.17
Nodes (12): createDbPool(), getPositiveIntegerEnv(), globalForDbPool, getPoolConfig(), pg, adapter, pool, prisma (+4 more)

### Community 47 - "ref_path"
Cohesion: 0.14
Nodes (12): calcSimetris(), evaluateStatus(), run(), fmt(), main(), url, test(), testFile() (+4 more)

### Community 48 - "Styling & Theming Rules"
Cohesion: 0.15
Nodes (11): CSS Variable Semantic Tokens (OKLCH), shadcn Customization & Theming, Class-based Dark Mode via next-themes, cn() Conditional Class Utility, Styling & Tailwind Rules, Bottom Navigation Pattern, SPARTA Energy Design System, Emerald Primary Palette & Status Colors (+3 more)

### Community 49 - "admin-store-queries.ts"
Cohesion: 0.12
Nodes (23): getAdminGapFilterSql(), AdminStoreFilters, AdminStoreRow, AdminStoreSortKey, BranchRow, CountRow, defaultAdminStoreOrder, defaultAdminStoreSort (+15 more)

### Community 50 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 51 - "can"
Cohesion: 0.13
Nodes (23): ActionResult, deleteAudit(), deleteMepSimulationLog(), MepSimulationListFilter, SaveMepSimulationPayload, SaveMepSimulationResult, GET(), isAdmin() (+15 more)

### Community 52 - "photos/route.ts"
Cohesion: 0.09
Nodes (43): DELETE(), fail(), GET(), jakartaDate, jakartaTime, PHOTO_CATEGORIES, POST(), readPhotoParams() (+35 more)

### Community 53 - "admin-audit-queries.ts"
Cohesion: 0.10
Nodes (23): activeStoreFilter, addAuditWhereAnd(), AdminAuditAuditorOption, AdminAuditFilters, AdminAuditPriority, AdminAuditRow, AdminAuditSortKey, AdminAuditSortOrder (+15 more)

### Community 54 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 55 - "admin-calculator-queries.ts"
Cohesion: 0.21
Nodes (17): CalculatorLogsPage(), metadata, SearchParams, AcLogFilters, AcLogItem, applyBranchFilter(), applyDateFilter(), applySearchFilter() (+9 more)

### Community 56 - "gypsum-tile-calculator.ts"
Cohesion: 0.13
Nodes (18): GypsumTileResultCard(), GypsumTileResultCardProps, AxisTileResult, calcTile1D(), calculateGypsumTileLayout(), CROSS_TEE_LENGTH_M, GYPSUM_LENGTH_M, GYPSUM_WIDTH_M (+10 more)

### Community 57 - "energy-audit-export-filters.ts"
Cohesion: 0.21
Nodes (16): GET(), AVAILABLE_ENERGY_AUDIT_CATEGORIES, defaultExportFilters(), EnergyAuditExportStatus, exportDateRange(), exportFileName(), parseExportFilters(), readAll() (+8 more)

### Community 58 - "validation-summary.tsx"
Cohesion: 0.19
Nodes (19): formatKwh(), Comparison(), dateFormat, statusLabel(), ValidationPreview, ValidationSummary(), ValidationSummaryProps, DraftRestoreAlert() (+11 more)

### Community 59 - "admin/stores/data/route.ts"
Cohesion: 0.25
Nodes (16): GET(), getFilter(), isAdmin(), AdminStoresPage(), formatNumber(), getFilter(), SearchParams, adminStoresPageSize (+8 more)

### Community 60 - "contrast-check.py"
Cohesion: 0.12
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 61 - "admin-master-equipment-table.tsx"
Cohesion: 0.11
Nodes (17): AdminMasterEquipmentDialog(), AdminMasterEquipmentDialogProps, AdminMasterEquipmentFiltersProps, filterParamKeys, filterParamKeySet, AdminMasterEquipmentTable(), SortableHeader(), updateSort() (+9 more)

### Community 62 - "Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring"
Cohesion: 0.29
Nodes (6): 1. Tujuan, 2. Kontrak data: view `v_toko_sangat_boros`, 4. Pekerjaan di smart-energy-monitoring, 5. Tahap berikutnya: Rekomendasi Audit, 6. Keputusan terbuka, Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring

### Community 63 - "shadcn Forms & Composition"
Cohesion: 0.22
Nodes (9): shadcn/ui OpenAI Agent Interface Config, asChild (radix) vs render (base) Composition, Base vs Radix API Differences, Field Validation (data-invalid + aria-invalid), FieldGroup + Field Form Layout, Forms & Inputs Rules, InputGroup + InputGroupInput/Addon, ToggleGroup for Option Sets (+1 more)

### Community 64 - "energy-audit-queries.ts"
Cohesion: 0.09
Nodes (25): LightingAuditPage(), Props, CategoryStatusMap, ENERGY_AUDIT_CATEGORIES, EnergyAuditCategoryInfo, EnergyAuditCategoryProgress, progress, toCategoryProgress() (+17 more)

### Community 65 - "UploadThing File Upload"
Cohesion: 0.24
Nodes (8): f, OurFileRouter, GET, POST, runtime, useUploadThing, uploadthing, @uploadthing/react

### Community 66 - "field.tsx"
Cohesion: 0.15
Nodes (17): AboutPage(), InfoRow(), NumberField(), NumberFieldProps, parseNumber(), DEV_LOGIN_ROLES, LoginForm(), Field() (+9 more)

### Community 67 - "submit-audit.ts"
Cohesion: 0.16
Nodes (13): AuditHistoryRow, AuditStatus, AuditYearRow, AvailableYearsResponse, getAuditHistory(), getAvailableYears(), HistoryItem, HistoryResponse (+5 more)

### Community 68 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, format, lint, prisma:generate, start, test (+3 more)

### Community 69 - "map-picker.tsx"
Cohesion: 0.23
Nodes (12): createCustomIcon(), MapCaptureHandler(), MapPicker, MapPickerRef, MapUpdater(), Props, ProtomapsLayer(), SnapshotViewUpdater() (+4 more)

### Community 70 - "getAuditValidator"
Cohesion: 0.09
Nodes (27): AdminEntryPage(), DestinationCard(), DestinationCardProps, numberFormat, StatLink(), AdminEntryLogoutButton(), 3. Pekerjaan di sparta-energy, firstValue() (+19 more)

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
Cohesion: 0.19
Nodes (19): GET(), AdminReportsPage(), describeList(), describeMasterStoreScope(), formatNumber(), getExportHref(), getPreviewHref(), getReportParams() (+11 more)

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
Cohesion: 0.10
Nodes (39): AdminHeaderActions(), getInitials(), HeaderProfileMenu(), ThemeModeToggle(), AdminUserActions(), AdminUserActionsProps, FilterI18nConfig, FilterOperator (+31 more)

### Community 88 - "iot-status.ts"
Cohesion: 0.18
Nodes (14): areaLabels, calculateGapPercent(), getAdminAuditDetail(), getAreaLabel(), toNumber(), buildIotLookup(), getIotStatusLookup(), getStoreIot() (+6 more)

### Community 89 - "change-user-role.ts"
Cohesion: 0.33
Nodes (6): @prisma/adapter-pg, adapter, main(), pool, printUsage(), prisma

### Community 90 - "admin-audit-filters.tsx"
Cohesion: 0.12
Nodes (23): AdminAuditFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminAuditFiltersProps, filterParamKeys, filterParamKeySet (+15 more)

### Community 91 - "admin-store-detail.ts"
Cohesion: 0.17
Nodes (13): AdminStoreDetailInput, AREA_LABELS, AreaTarget, buildStoreDetailViewModel(), getAdminStoreDetail(), getBrandName(), getEquipmentName(), isNonNegativeNumber() (+5 more)

### Community 92 - "save-draft.ts"
Cohesion: 0.17
Nodes (14): getSingleDuration(), SaveDraftInput, toAreaTarget(), AuditItemRow, buildAuditItemRows(), CalcMethodInfo, isAirConditioner(), isUsageBased() (+6 more)

### Community 93 - "PWA Icon Set"
Cohesion: 0.33
Nodes (6): Android Chrome PWA Icon 192x192, Android Chrome PWA Icon 512x512, Apple Touch Icon, Sparta Energy Building Shield Logo, Favicon 16x16, Favicon 32x32

### Community 94 - "state-block.tsx"
Cohesion: 0.25
Nodes (8): EnergyAuditError(), AuditValidationError(), GlobalError(), Forbidden(), NotFound(), StateBlock(), StateBlockAction, StateBlockProps

### Community 95 - "hvac-audit-export.ts"
Cohesion: 0.06
Nodes (34): createAcUnit(), createEmptyHvacAudit(), createExhaustZone(), HvacExportAudit, acHeaderIndex, audit, exHeaderIndex, readings (+26 more)

### Community 96 - "draft-list-section.tsx"
Cohesion: 0.18
Nodes (15): deleteAuditDraft(), getAuditDraft(), AdminReportActions(), handleOpenChange(), loadPreview(), AdminReportActionsProps, formatCell(), PreviewResponse (+7 more)

### Community 97 - "admin-shell.tsx"
Cohesion: 0.08
Nodes (49): setAdminGapFilter(), AdminGapFilterState, AdminGapFilterToggle(), numberFormat, AdminNavGroup, AdminNavItem, AdminShell(), AdminShellProps (+41 more)

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
Cohesion: 0.16
Nodes (18): saveAuditDraft(), AuditStepNavigate, DemoResultPage(), AuditStep1(), Props, AreaItem, areaItems, AuditStep2() (+10 more)

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

### Community 120 - "sanitizeLightingAuditData"
Cohesion: 0.18
Nodes (15): getAuditableSource(), revalidateEnergyAudit(), saveHvacAudit(), saveLightingAudit(), restoreBackup(), getHvacCompletionIssues(), toAcSummaryStatus(), createDefaultLuxRows() (+7 more)

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
Nodes (50): copTone, deltaTone, HvacAcUnitCardProps, roomTone, oneDecimal, twoDecimals, wholeNumber, photoCode() (+42 more)

### Community 128 - "Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator"
Cohesion: 0.22
Nodes (8): 1. Arsitektur & Model Database (Prisma), 2. Struktur `layoutData` (JSON Snapshot), 3. Server Actions yang Akan Dibuat, 4. Rencana Perubahan Tampilan (UI / UX), 5. Checklist Eksekusi (Nanti Sore Jam 16:00), A. Di Halaman Simulator (`app/store-mep-simulator/`), B. Di Halaman Admin (`app/admin/calculator-logs/`), Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

### Community 129 - "admin-dashboard-filters.tsx"
Cohesion: 0.24
Nodes (10): AdminDashboardFilters(), applyFilterChanges(), clearFilters(), pushParams(), AdminDashboardFiltersProps, filterParamKeys, filterParamKeySet, getParam() (+2 more)

### Community 130 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 131 - "admin-master-store-filters.tsx"
Cohesion: 0.09
Nodes (30): AdminEquipmentFilters(), applyFilterChanges(), applySearch(), clearFilters(), pushParams(), AdminEquipmentFiltersProps, areaOptions, filterParamKeys (+22 more)

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

### Community 138 - "Button"
Cohesion: 0.26
Nodes (8): LoginPage(), LoginToastNotice(), Page(), DemoLoginButton(), Logo(), LogoProps, Button(), buttonVariants

### Community 139 - "admin-audit-date-filter.ts"
Cohesion: 0.43
Nodes (6): AuditDateRange, getAdminAuditDateWhere(), getMonthDateRange(), getYearDateRange(), parseMonth(), parseYear()

### Community 140 - "device-access.ts"
Cohesion: 0.27
Nodes (10): findGsUser(), getUserDeviceAccess(), isMissingTable(), LoadResult, SaveResult, saveUserDeviceAccess(), handleSave(), getMonitoringDevices() (+2 more)

### Community 141 - "lib/admin-gap-filter.ts"
Cohesion: 0.29
Nodes (11): AdminLayout(), getAdminGapFilterEnabled, getAdminGapHiddenCount(), gapFilteredAuditIdsSql(), getSangatBorosAuditIdsSql(), getSangatBorosStores(), isAdminSangatBoros(), SangatBorosStore (+3 more)

### Community 142 - "sync-stores.ts"
Cohesion: 0.26
Nodes (12): fetchAccessToken(), fetchStoreSheet(), findHeaderIndex(), HEADER_ALIASES, isRecord(), normalizeHeader(), parseCoordinates(), parseStoreSheetRows() (+4 more)

### Community 143 - "Temperature BTU Clusters (450 / 600 / 751 BTU/m2)"
Cohesion: 0.29
Nodes (7): AC Calculator Logic Analysis (v1.1.0/v1.2.0/v1.2-adj/Interpolasi), Perbandingan_Kalkulator_AC Simulation Dataset (4,681 rows), Temperature BTU Clusters (450 / 600 / 751 BTU/m2), AC Unit Count Formula (ceil(Area x Cluster BTU / Unit BTU)), Changelog - AC Estimation Calculator, saveAcEstimationLog, saveLightEstimationLog

### Community 144 - "hvac-audit-form.tsx"
Cohesion: 0.11
Nodes (30): calculateHvacAcStandard(), areaFormat, createUnitLike(), dateFormat, formatCoord(), HvacAuditForm(), addUnit(), calculateStandard() (+22 more)

### Community 145 - "hvac-exhaust-zone-card.tsx"
Cohesion: 0.28
Nodes (11): HvacAcUnitCard(), HvacExhaustZoneCard(), HvacExhaustZoneCardProps, ventilationTone, formatValue(), PhotoRow(), ResultRow(), ResultRowProps (+3 more)

### Community 146 - "export-audits.ts"
Cohesion: 0.60
Nodes (4): escapeCsv(), formatDate(), main(), pool

### Community 147 - "audit-recalculate.ts"
Cohesion: 0.23
Nodes (11): monthlyFromRows(), averagePlnKwh(), BOROS_TOLERANCE, calculateGapPercent(), DAYS_PER_MONTH, isBorosFor(), ItemKwhInput, summarizeAuditItems() (+3 more)

### Community 148 - "app/dashboard/page.tsx"
Cohesion: 0.10
Nodes (23): AcStandardResult, SaveResult, GET(), Context, GET(), HvacAuditPage(), Props, AuditValidationDetailPage() (+15 more)

### Community 149 - "audit-kalkulator.test.ts"
Cohesion: 0.17
Nodes (10): ac, acRows, chiller, chillerCalc, coffee, freezer, lateAc, masterStandard (+2 more)

### Community 150 - "MapDrawControl"
Cohesion: 0.18
Nodes (12): ButtonGroup(), buttonGroupVariants, MapControlContainer(), MapDrawControl(), handleDrawCreated(), handleDrawEditedOrDeleted(), updateLayersCount(), MapLocateControl() (+4 more)

### Community 151 - "create-admin-user.ts"
Cohesion: 0.60
Nodes (4): main(), pool, printUsage(), sha256()

### Community 152 - "AC Restricted Zones (Glass/Door, Open Chiller, Cashier)"
Cohesion: 0.22
Nodes (5): ASHRAE Handbook / Standard 55 / Standard 72, Dead Zone Detection (<20% intensity), Foster et al. - Effect of ambient air movement on refrigerated display cabinets, Throw Distance Zones (0-2.5 / 2.5-5.5 / 5.5-7.5 m), Cooling Circles Visualization

### Community 153 - "role-access.ts"
Cohesion: 0.13
Nodes (22): ActionResult, createUser(), CreateUserInput, hashPassword(), ActionResult, updateUser(), UpdateUserInput, POST() (+14 more)

### Community 154 - "actions/import-users.ts"
Cohesion: 0.20
Nodes (7): ActionResult, checkExistingEmails(), hashPassword(), ImportUserInput, importUsersBulk(), hash, password

### Community 155 - "energy-audit-export-dialog.tsx"
Cohesion: 0.13
Nodes (24): AdminMasterDataNav(), EnergyAuditExportDialogProps, MultiSelect(), MultiSelectProps, PreviewState, ComboboxChip(), ComboboxChips(), ComboboxChipsInput() (+16 more)

### Community 156 - "ac-estimation-client.tsx"
Cohesion: 0.08
Nodes (35): AcEstimationClient(), AcEstimationClientProps, MapPicker, getRabData(), getTemperature(), EstimationResultCard(), EstimationResultCardData, Props (+27 more)

### Community 157 - "route.spec.ts"
Cohesion: 0.27
Nodes (7): POST(), duplicateStores, incompleteStores, stores, Dokploy Schedule Job (daily loopback invocation), filterNewStores(), syncStoresFromSheet()

### Community 158 - "result-skeleton.tsx"
Cohesion: 0.60
Nodes (3): AuditResultLoading(), DemoResultLoading(), AuditResultSkeleton()

### Community 159 - "time-range-cards.tsx"
Cohesion: 0.36
Nodes (7): dateToTimeStr(), TimeRangeCards(), TimeRangeCardsProps, timeStrToDate(), buildTime(), SimpleTimePicker(), TimeItem()

### Community 160 - "Disaster Engine & Store Impact Verification Flow"
Cohesion: 0.25
Nodes (7): Disaster Early Warning Proposal, BMKG Open Data (TEWS earthquake feeds), Disaster Engine & Store Impact Verification Flow, DisasterAlert / StoreDisasterImpact tables (planned), GDACS (UN Global Disaster Alert System), Haversine Radius Matching, USGS Earthquake API

### Community 161 - "admin-user-device-dialog.tsx"
Cohesion: 0.38
Nodes (5): DeviceGroup, groupDevices(), LoadState, matches(), UserDeviceDialog()

### Community 162 - "Store Coordinates Sync Plan"
Cohesion: 0.29
Nodes (5): Store Coordinates Sync Plan, parseCoordinates, searchStoresAction / getStoreByCodeAction, Store latitude/longitude (Float?) fields, Store Google Sheet Contract (header aliases, normalization)

### Community 163 - "dotenv"
Cohesion: 0.33
Nodes (5): dotenv, prisma, escapeCsv(), main(), pool

### Community 164 - "master-data/page.tsx"
Cohesion: 0.08
Nodes (55): GET(), getFilter(), AdminMasterDataPage(), formatNumber(), getFilter(), numberFormat, SearchParams, GET() (+47 more)

### Community 165 - "ImportUserCsvDialog"
Cohesion: 0.53
Nodes (6): ImportUserCsvDialog(), handleClose(), handleFileChange(), handleImport(), parseCsv(), parseCsvLine()

### Community 166 - "generate-lamp-analysis.js"
Cohesion: 0.83
Nodes (3): calcSimetris(), evaluateDetailed(), run()

### Community 167 - "backfill-audit-baseline.ts"
Cohesion: 0.38
Nodes (6): APPLY, AuditRow, formatKwh(), main(), pool, statusLabel()

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1221 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `app/dashboard/page.tsx` to `admin-audits-table.tsx`, `auth.ts`, `admin-dashboard-filters.tsx`, `Input`, `admin-master-store-filters.tsx`, `Header`, `admin-users-table.tsx`, `Package & ESLint Config`, `Button`, `admin-audit-queries.ts`, `device-access.ts`, `DialogContent`, `hvac-audit-export.ts`, `lib/admin-gap-filter.ts`, `hvac-audit-form.tsx`, `lighting-audit-form.tsx`, `start-client.tsx`, `Card`, `audit-validation.ts`, `admin-dashboard-charts.tsx`, `Branch Audit Summaries`, `step3.tsx`, `role-access.ts`, `actions/import-users.ts`, `prisma.ts`, `ac-estimation-client.tsx`, `route.spec.ts`, `kategori/page.tsx`, `energy-audit-export-dialog.tsx`, `Button`, `admin-master-stores-table.tsx`, `admin-user-queries.ts`, `Button`, `audits/[id]/page.tsx`, `admin/dashboard/page.tsx`, `master-data/page.tsx`, `admin-master-data-mutations.ts`, `Badge`, `light-estimation-client.tsx`, `Root Layout & Theme`, `can`, `energy-audit-export-filters.ts`, `admin/stores/data/route.ts`, `admin-master-equipment-table.tsx`, `energy-audit-queries.ts`, `field.tsx`, `submit-audit.ts`, `getAuditValidator`, `admin-shell.tsx`, `admin-audit-filters.tsx`, `save-draft.ts`, `state-block.tsx`, `draft-list-section.tsx`, `admin-shell.tsx`, `CardContent`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `@radix-ui/react-select`, `@types/pg`, `shadcn` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09513742071881606 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `admin-audits-table.tsx`, `admin-users-table.tsx`, `Input`, `Equipment Admin Queries`, `Header`, `@tabler/icons-react`, `map.tsx`, `breadcrumb.tsx`, `Button`, `DialogContent`, `technical-form.tsx`, `hvac-audit-form.tsx`, `lighting-audit-form.tsx`, `Card`, `admin-dashboard-charts.tsx`, `MapDrawControl`, `utils.ts`, `step3.tsx`, `kategori/page.tsx`, `ac-count-flag.tsx`, `Button`, `ac-estimation-client.tsx`, `energy-audit-export-dialog.tsx`, `time-range-cards.tsx`, `Button`, `admin-master-stores-table.tsx`, `audits/[id]/page.tsx`, `Badge`, `Root Layout & Theme`, `validation-summary.tsx`, `admin-master-equipment-table.tsx`, `field.tsx`, `map-picker.tsx`, `getAuditValidator`, `admin-shell.tsx`, `admin-shell.tsx`, `CardContent`, `useLeaflet`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `admin-users-table.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10520487264673312 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `parseStoreSheetRows()` and `parseCoordinates`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Alfamart Emblem` and `Alfamart Emblem (small)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._