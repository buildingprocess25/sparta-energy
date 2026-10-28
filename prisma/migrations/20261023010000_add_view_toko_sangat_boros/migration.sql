-- Read-only contract for smart-energy-monitoring: the 12 boros stores with the
-- largest gap, from each store's latest completed kalkulasi. Validation status
-- does not affect the ranking. DEMO stores are kept for testing (is_demo) and
-- must be excluded before production use; Head Office is never counted.
-- Column names are shared with the monitoring repo: add columns freely, but
-- coordinate before renaming or removing one.
CREATE OR REPLACE VIEW "v_toko_sangat_boros" AS
WITH latest AS (
  SELECT DISTINCT ON (a.store_id) a.*
  FROM "audits" a
  WHERE a.status = 'COMPLETED'
  ORDER BY a.store_id, a.audit_date DESC
),
ranked AS (
  SELECT l.*, ROW_NUMBER() OVER (ORDER BY l.gap_percent DESC, l.id) AS peringkat
  FROM latest l
  JOIN "stores" s ON s.id = l.store_id
  WHERE l.is_boros = true
    AND l.gap_percent IS NOT NULL
    AND (s.branch IS NULL OR lower(s.branch) <> 'head office')
)
SELECT
  r.peringkat::int AS peringkat,
  s.code AS store_code,
  s.name AS store_name,
  s.branch,
  s.latitude,
  s.longitude,
  r.id AS audit_id,
  r.audit_date AS tanggal_kalkulasi,
  round(r.gap_percent, 2) AS gap_percent,
  round(r.avg_actual_pln_kwh_per_month, 2) AS aktual_pln_kwh_per_bulan,
  round(r.total_estimated_kwh_per_month, 2) AS standar_konsumsi_kwh_per_bulan,
  round(r.total_estimated_kwh_per_month / 30, 2) AS standar_konsumsi_kwh_per_hari,
  r.validation_status::text AS status_validasi,
  (lower(coalesce(s.branch, '')) = 'demo') AS is_demo
FROM ranked r
JOIN "stores" s ON s.id = r.store_id
WHERE r.peringkat <= 12;
