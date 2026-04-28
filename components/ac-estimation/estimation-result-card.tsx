"use client"

import React from "react"

export type EstimationResultCardData = {
  storeCode: string
  storeName: string
  storeBranch: string
  position: [number, number]
  salesArea: number
  maxTemp: number
  bmkgTemp: number | null // suhu manual (BMKG)
  openMeteoTemp: number | null // suhu dari Open-Meteo
  clusterBtu: number
  totalBtu: number
  acUnits: number
  mapSnapshot: string | null
}

type Props = {
  cardRef: React.RefObject<HTMLDivElement | null>
  data: EstimationResultCardData
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "8px 0",
        borderBottom: "1px solid #e5e7eb",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "#6b7280",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "12px",
          color: "#111827",
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  )
}

function SubTempRow({
  label,
  value,
  isUsed,
}: {
  label: string
  value: number
  isUsed: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 0 4px 12px",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span
          style={{
            fontSize: "10px",
            color: "#6b7280",
            fontWeight: 400,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {isUsed && (
          <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: 700 }}>
            ✓
          </span>
        )}
        <span
          style={{
            fontSize: "11px",
            color: isUsed ? "#166534" : "#9ca3af",
            fontWeight: isUsed ? 600 : 400,
          }}
        >
          {value}°C
        </span>
      </div>
    </div>
  )
}

export function EstimationResultCard({ cardRef, data }: Props) {
  const {
    storeCode,
    storeName,
    storeBranch,
    position,
    salesArea,
    maxTemp,
    bmkgTemp,
    openMeteoTemp,
    totalBtu,
    acUnits,
    mapSnapshot,
  } = data

  const lat = position[0].toFixed(6)
  const lng = position[1].toFixed(6)

  return (
    // Hidden off-screen — only used for html-to-image capture
    <div
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div
        ref={cardRef}
        style={{
          width: "390px",
          height: "693px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f4a35 0%, #082e20 100%)",
            padding: "20px 24px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/Alfamart-Emblem.png"
              alt="Alfamart"
              width={80}
              height={80}
              style={{ height: "22px", width: "auto", objectFit: "contain" }}
            />
            <div
              style={{
                width: "1px",
                height: "18px",
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/Building-Logo.png"
                alt="SPARTA"
                width={40}
                height={40}
                style={{ height: "18px", width: "auto", objectFit: "contain" }}
              />
              <div style={{ lineHeight: 1 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "0.1em",
                  }}
                >
                  SPARTA
                </div>
                <div
                  style={{
                    fontSize: "7px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Energy
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "9px",
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Estimasi Kebutuhan
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#6ee7b7",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Unit Pendingin Ruangan
            </div>
          </div>
        </div>

        {/* ── Map Snapshot ── */}
        <div
          style={{
            margin: "16px 16px 0",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1.5px solid #e5e7eb",
            height: "200px",
            backgroundColor: "#f3f4f6",
            position: "relative",
          }}
        >
          {mapSnapshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mapSnapshot}
              alt="Peta Lokasi"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              Peta tidak tersedia
            </div>
          )}
        </div>

        {/* ── Info Card ── */}
        <div
          style={{
            margin: "12px 16px 0",
            borderRadius: "12px",
            border: "1.5px solid #e5e7eb",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {/* Store header */}
          <div
            style={{
              background: "#f8fafc",
              padding: "10px 16px",
              borderBottom: "1.5px solid #e5e7eb",
            }}
          >
            <div
              style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}
            >
              {storeCode} - {storeName}
            </div>
            <div
              style={{ fontSize: "11px", color: "#6b7280", marginTop: "1px" }}
            >
              {storeBranch}
            </div>
          </div>

          {/* Data rows */}
          <div style={{ padding: "0 16px", marginBottom: "10px" }}>
            <Row label="Lat, Lng" value={`${lat}, ${lng}`} />
            <Row label="Luas Sales Area" value={`${salesArea} m²`} />

            {/* Suhu Luar — main row + sub-rows */}
            <Row label="Suhu Luar Tertinggi" value={`${maxTemp}°C`} />
            {(openMeteoTemp !== null || bmkgTemp !== null) && (
              <div
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "4px",
                }}
              >
                {openMeteoTemp !== null && (
                  <SubTempRow
                    label="Open-Meteo (otomatis berdasarkan titik map)"
                    value={openMeteoTemp}
                    isUsed={bmkgTemp === null || openMeteoTemp >= bmkgTemp}
                  />
                )}
                {bmkgTemp !== null && (
                  <SubTempRow
                    label="BMKG ( input manual )"
                    value={bmkgTemp}
                    isUsed={openMeteoTemp === null || bmkgTemp > openMeteoTemp}
                  />
                )}
              </div>
            )}

            <Row
              label="Total Beban BTU"
              value={`${new Intl.NumberFormat("id-ID").format(totalBtu)} BTU`}
            />
          </div>

          {/* Recommendation highlight */}
          <div
            style={{
              margin: "0px 16px 16px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              border: "1.5px solid #bbf7d0",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#15803d",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Rekomendasi Pemasangan
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  marginTop: "2px",
                }}
              >
                {new Intl.NumberFormat("id-ID").format(totalBtu)} BTU dibagi
                kapasitas 1 unit AC 2 PK (18.000 BTU).
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: 900,
                  color: "#166534",
                  lineHeight: 1,
                }}
              >
                {acUnits}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#16a34a",
                  whiteSpace: "nowrap",
                }}
              >
                Unit AC 2 PK
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "10px 16px",
            textAlign: "center",
            fontSize: "9px",
            color: "#9ca3af",
          }}
        >
          Generated by SPARTA Energy •{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  )
}
