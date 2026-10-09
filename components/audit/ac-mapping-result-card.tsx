"use client"

import React from "react"
import { AC_MAPPING_VERSION } from "@/lib/calculator-versions"

export type AcMappingUnitDetail = {
  name: string
  wallLabel: string
  wallLengthM: number
  startNode: string
  endNode: string
  fromStart: string
  toEnd: string
}

export type AcMappingResultCardData = {
  storeCode: string
  storeName: string
  storeBranch: string
  area: number
  lengthM?: number
  widthM?: number
  grossArea?: number
  temp: number | null
  btuPerM2: number
  totalBtu: number
  acUnits: number
  layoutSnapshot: string | null
  placedUnits?: AcMappingUnitDetail[]
  outdoorNotes?: string
}

type Props = {
  cardRef: React.RefObject<HTMLDivElement | null>
  data: AcMappingResultCardData
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

export function AcMappingResultCard({ cardRef, data }: Props) {
  const {
    storeCode,
    storeName,
    storeBranch,
    area,
    lengthM,
    widthM,
    grossArea,
    temp,
    btuPerM2,
    totalBtu,
    acUnits,
    layoutSnapshot,
    outdoorNotes,
  } = data

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
                {AC_MAPPING_VERSION}
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
              Layout & Beban Termal
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
              Mapping & Tata Letak AC 2 PK
            </div>
          </div>
        </div>

        {/* ── Main Content Area: 60% Canvas Denah | 40% Keterangan & Spesifikasi ── */}
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
          {/* ── Kiri: Denah Layout Snapshot (~60%) ── */}
          <div
            style={{
              flex: "1.4 1 0%",
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
                📐 Visual Denah Tata Letak AC Ruang Sales
              </span>
              <span
                style={{
                  fontSize: "10.5px",
                  color: "#0369a1",
                  fontWeight: 700,
                  backgroundColor: "#e0f2fe",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {acUnits} Unit Terpasang
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
                  alt="Denah Layout AC"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "560px",
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

          {/* ── Kanan: Keterangan, Parameter & Rekomendasi (~40%) ── */}
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
                {lengthM !== undefined && widthM !== undefined && (
                  <Row
                    label="Dimensi Denah (PT × LT)"
                    value={`${lengthM.toFixed(2)}m × ${widthM.toFixed(2)}m`}
                  />
                )}
                <Row
                  label="Luas Denah Efektif"
                  value={
                    grossArea && grossArea !== area
                      ? `${area.toFixed(1)} m² (Gross: ${grossArea.toFixed(1)} m²)`
                      : `${area.toFixed(1)} m²`
                  }
                />
                {temp !== null && (
                  <Row
                    label="Suhu Lingkungan Desain"
                    value={`${temp}°C (${btuPerM2} BTU/m²)`}
                  />
                )}
                <Row
                  label="Target Beban Pendinginan"
                  value={`${totalBtu.toLocaleString("id-ID")} BTU`}
                />
                <Row
                  label="Spesifikasi Unit AC"
                  value="2 PK (18.000 BTU/h)"
                />
              </div>

              {/* ── Keterangan Penempatan Outdoor AC ── */}
              {outdoorNotes && outdoorNotes.trim() && (
                <div
                  style={{
                    margin: "0 18px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: "#0369a1",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: "4px",
                    }}
                  >
                    📍 Penempatan Outdoor AC
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#0f172a",
                      fontWeight: 600,
                      lineHeight: "1.4",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {outdoorNotes.trim()}
                  </div>
                </div>
              )}
            </div>

            {/* Rekomendasi Jumlah Unit AC Highlight */}
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
                  Rekomendasi Jumlah Unit AC
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginTop: "3px",
                    lineHeight: 1.2,
                  }}
                >
                  Kapasitas 1 unit: 18.000 BTU/h (2 PK)
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 900,
                    color: "#166534",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {acUnits}
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
                  Unit AC 2 PK
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
          <span>SPARTA Energy • Dokumen Perencanaan Tata Letak & Beban Termal AC</span>
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
