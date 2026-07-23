"use client"

import React from "react"

export type LightEstimationResultCardData = {
  storeCode: string
  storeName: string
  storeBranch: string
  mode: "simetris" | "tidak-simetris"
  shapeLabel: string
  area: number
  watt: number
  lampLen: number
  totalLamps: number
  minLamps: number
  maxLamps: number
  rows: number
  lampsPerRow: number
  rowSpacing: string | number
  sideMargin: string | number
  rasio: number
  layoutSnapshot: string | null
}

type Props = {
  cardRef: React.RefObject<HTMLDivElement | null>
  data: LightEstimationResultCardData
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "6px 0",
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

export function LightEstimationResultCard({ cardRef, data }: Props) {
  const {
    storeCode,
    storeName,
    storeBranch,
    mode,
    shapeLabel,
    area,
    watt,
    lampLen,
    totalLamps,
    minLamps,
    maxLamps,
    rows,
    lampsPerRow,
    rowSpacing,
    sideMargin,
    rasio,
    layoutSnapshot,
  } = data

  const modeLabel = mode === "simetris" ? "Simetris" : `Tidak Simetris (${shapeLabel})`

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
          height: "750px",
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
              Hitung Kebutuhan
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
              Pencahayaan LED Toko
            </div>
          </div>
        </div>

        {/* ── Denah Snapshot ── */}
        <div
          style={{
            margin: "16px 16px 0",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1.5px solid #e5e7eb",
            height: "200px",
            backgroundColor: "#f8fafc",
            position: "relative",
          }}
        >
          {layoutSnapshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={layoutSnapshot}
              alt="Denah Penempatan"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
              Denah tidak tersedia
            </div>
          )}
        </div>

        {/* ── Info Card ── */}
        <div
          style={{
            margin: "8px 16px 0",
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
              {storeCode || "Toko Baru"} - {storeName || "Tanpa Nama"}
            </div>
            <div
              style={{ fontSize: "11px", color: "#6b7280", marginTop: "1px" }}
            >
              {storeBranch || "—"}
            </div>
          </div>

          {/* Data rows */}
          <div style={{ padding: "0 16px", marginBottom: "8px" }}>
            <Row label="Mode Kalkulator" value={modeLabel} />
            <Row label="Luas Ruangan" value={`${area.toFixed(1)} m²`} />
            <Row label="Spesifikasi LED" value={`${watt}W · ${lampLen}m`} />
            <Row label="Grid Penempatan" value={`${rows} Baris × ${lampsPerRow} Kolom`} />
            <Row label="Jarak Baris / Samping" value={`${Number(rowSpacing).toFixed(2)}m / ${Number(sideMargin).toFixed(2)}m`} />
            <Row label="Kerapatan Daya" value={`${Number(rasio).toFixed(2)} W/m²`} />
          </div>

          {/* Recommendation highlight */}
          {(() => {
            const checkRasioIdeal = rasio >= 4.0 && rasio <= 5.0
            const checkSampingIdeal = Number(sideMargin) >= 0.3 && Number(sideMargin) <= 0.6
            const checkBarisIdeal = Number(rowSpacing) <= 1.9
            const isIdeal = checkRasioIdeal && checkSampingIdeal && checkBarisIdeal

            const checkRasioTol = rasio >= 3.5 && rasio <= 5.5
            const checkSampingTol = Number(sideMargin) >= 0.2 && Number(sideMargin) <= 0.8
            const checkBarisTol = Number(rowSpacing) <= 2.2
            const isToleransi = !isIdeal && checkRasioTol && checkSampingTol && checkBarisTol

            let cardBg = "linear-gradient(135deg, #fffbeb, #fef3c7)"
            let cardBorder = "1.5px solid #fde68a"
            let cardTitleColor = "#b45309"
            let cardTitle = "Parameter Di Luar Standar"
            let cardCountColor = "#92400e"
            let cardUnitColor = "#d97706"
            let cardDescription = (
              <div style={{ color: "#92400e" }}>
                Peringatan: 
                {!checkRasioTol && ` Kerapatan daya di luar standar (${Number(rasio).toFixed(2)} W/m²).`}
                {!checkSampingTol && ` Jarak samping di luar standar (${Number(sideMargin).toFixed(2)}m).`}
                {!checkBarisTol && ` Jarak baris terlalu lebar (${Number(rowSpacing).toFixed(2)}m).`}
              </div>
            )

            if (isIdeal) {
              cardBg = "linear-gradient(135deg, #f0fdf4, #dcfce7)"
              cardBorder = "1.5px solid #bbf7d0"
              cardTitleColor = "#15803d"
              cardTitle = "Standar Ideal"
              cardCountColor = "#166534"
              cardUnitColor = "#16a34a"
              cardDescription = (
                <span>
                  Grid {rows}×{lampsPerRow} ({totalLamps} unit) memenuhi semua standar ideal layout dan energi (Rasio: {Number(rasio).toFixed(2)} W/m², Jarak samping: {Number(sideMargin).toFixed(2)}m, Jarak baris: {Number(rowSpacing).toFixed(2)}m).
                </span>
              )
            } else if (isToleransi) {
              cardBg = "linear-gradient(135deg, #eff6ff, #dbeafe)"
              cardBorder = "1.5px solid #bfdbfe"
              cardTitleColor = "#1d4ed8"
              cardTitle = "Standar Toleransi (Penyesuaian Denah)"
              cardCountColor = "#1e40af"
              cardUnitColor = "#2563eb"
              cardDescription = (
                <span style={{ color: "#1e3a8a" }}>
                  Grid {rows}×{lampsPerRow} ({totalLamps} unit) disesuaikan dengan denah toko dan merupakan tata letak paling optimal (Rasio: {Number(rasio).toFixed(2)} W/m², Jarak samping: {Number(sideMargin).toFixed(2)}m, Jarak baris: {Number(rowSpacing).toFixed(2)}m).
                </span>
              )
            }

            return (
              <div
                style={{
                  margin: "0px 16px 12px",
                  borderRadius: "10px",
                  background: cardBg,
                  border: cardBorder,
                  padding: "10px 14px",
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
                      color: cardTitleColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {cardTitle}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#374151",
                      marginTop: "2px",
                      lineHeight: "1.3"
                    }}
                  >
                    {cardDescription}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: 900,
                      color: cardCountColor,
                      lineHeight: 1,
                    }}
                  >
                    {totalLamps}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: cardUnitColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Unit LED
                  </div>
                </div>
              </div>
            )
          })()}
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
