"use client"

import React from "react"
import { LAMP_CALCULATOR_VERSION } from "@/lib/calculator-versions"

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
        padding: "7px 0",
        borderBottom: "1px solid #f1f5f9",
        gap: "10px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "#64748b",
          fontWeight: 600,
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
          color: "#0f172a",
          fontWeight: 700,
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
  const displayRange =
    minLamps && maxLamps && minLamps !== maxLamps ? `${minLamps}–${maxLamps}` : `${totalLamps}`

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
          width: "1120px",
          minHeight: "792px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* ── Top Header Bar ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f4a35 0%, #082e20 100%)",
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/Alfamart-Emblem.png"
              alt="Alfamart"
              width={90}
              height={90}
              style={{ height: "26px", width: "auto", objectFit: "contain" }}
            />
            <div
              style={{
                width: "1.5px",
                height: "22px",
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/Building-Logo.png"
                alt="SPARTA"
                width={40}
                height={40}
                style={{ height: "22px", width: "auto", objectFit: "contain" }}
              />
              <div style={{ lineHeight: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "0.1em",
                  }}
                >
                  SPARTA
                </div>
                <div
                  style={{
                    fontSize: "8.5px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Energy
                </div>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#6ee7b7",
                  backgroundColor: "rgba(110, 231, 183, 0.15)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(110, 231, 183, 0.3)",
                  letterSpacing: "0.04em",
                  marginLeft: "4px",
                }}
              >
                {LAMP_CALCULATOR_VERSION}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              Perencanaan Pencahayaan
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#6ee7b7",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Simulasi Sistem Lampu LED Ruang Sales
            </div>
          </div>
        </div>

        {/* ── Main Content Area: ~70% Canvas Denah | ~30% Keterangan & Spesifikasi ── */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "20px 28px",
            gap: "20px",
            alignItems: "stretch",
            boxSizing: "border-box",
          }}
        >
          {/* ── Kiri: Denah Layout Snapshot (~70%) ── */}
          <div
            style={{
              flex: "2.4 1 0%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "14px",
              border: "1.5px solid #e2e8f0",
              backgroundColor: "#ffffff",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 16px",
                backgroundColor: "#f8fafc",
                borderBottom: "1.5px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: 700,
                  color: "#0f172a",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Visual Denah Grid Lampu Ruang Sales
              </span>
              <span
                style={{
                  fontSize: "10.5px",
                  color: "#b45309",
                  fontWeight: 700,
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fde68a",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {totalLamps} Titik Lampu Terpasang
              </span>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px",
                backgroundColor: "#ffffff",
              }}
            >
              {layoutSnapshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={layoutSnapshot}
                  alt="Denah Grid Lampu"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "580px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  Denah tidak tersedia
                </div>
              )}
            </div>
          </div>

          {/* ── Kanan: Keterangan, Parameter & Rekomendasi (~30%) ── */}
          <div
            style={{
              flex: "1 1 0%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "14px",
              border: "1.5px solid #e2e8f0",
              backgroundColor: "#ffffff",
              overflow: "hidden",
            }}
          >
            {/* Toko Header & Parameter */}
            <div>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "12px 18px",
                  borderBottom: "1.5px solid #e2e8f0",
                }}
              >
                <div
                  style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a" }}
                >
                  {storeCode || "TOKO-BARU"} - {storeName || "Toko Retail"}
                </div>
                <div
                  style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", fontWeight: 500 }}
                >
                  Cabang: {storeBranch || "—"}
                </div>
              </div>

              {/* Data rows parameter & spesifikasi */}
              <div style={{ padding: "8px 18px 12px" }}>
                <Row
                  label="Mode Denah"
                  value={shapeLabel || modeLabel}
                />
                <Row
                  label="Luas Plafond Efektif"
                  value={`${area.toFixed(1)} m²`}
                />
                <Row
                  label="Spesifikasi Lampu"
                  value={`LED Tube T8 (${watt}W · ${lampLen}m)`}
                />
                <Row
                  label="Konfigurasi Grid"
                  value={
                    rows > 0 && lampsPerRow > 0
                      ? `${rows} Baris × ${lampsPerRow} Kolom`
                      : `${totalLamps} Titik Aktif`
                  }
                />
                <Row
                  label="Jarak Antar Baris"
                  value={`${Number(rowSpacing).toFixed(2)} m`}
                />
                <Row
                  label="Jarak Samping (JS)"
                  value={`${Number(sideMargin).toFixed(2)} m`}
                />
                <Row
                  label="Kepadatan Daya (LPD)"
                  value={`${Number(rasio).toFixed(2)} W/m²`}
                />
                <Row
                  label="Target Standar Retail"
                  value="4–5 W/m² (Standar Retail)"
                />
              </div>
            </div>

            {/* Rekomendasi Jumlah Titik Lampu Highlight Card */}
            <div
              style={{
                margin: "12px 18px 18px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                border: "1.5px solid #bbf7d0",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#15803d",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    lineHeight: "1.3",
                  }}
                >
                  Rekomendasi Titik Lampu
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginTop: "3px",
                    lineHeight: 1.2,
                  }}
                >
                  LED Tube T8 {watt}W (Target 4–5 W/m²)
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: displayRange.length > 5 ? "24px" : "34px",
                    fontWeight: 900,
                    color: "#166534",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayRange}
                </div>
                <div
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "#16a34a",
                    whiteSpace: "nowrap",
                    marginTop: "3px",
                  }}
                >
                  Titik Lampu LED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Footer ── */}
        <div
          style={{
            padding: "10px 28px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "9.5px",
            color: "#94a3b8",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <span>SPARTA Energy • Dokumen Perencanaan Tata Letak & Sistem Pencahayaan LED</span>
          <span>
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
