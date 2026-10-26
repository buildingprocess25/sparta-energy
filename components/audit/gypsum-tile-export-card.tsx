"use client"

import React from "react"
import { GYPSUM_CALCULATOR_VERSION } from "@/lib/calculator-versions"
import type { GypsumTileCalculationResult } from "@/lib/gypsum-tile-calculator"

export type GypsumTileExportCardData = {
  storeCode: string
  storeName: string
  storeBranch: string
  calculation: GypsumTileCalculationResult
  layoutSnapshot: string | null
}

type Props = {
  cardRef: React.RefObject<HTMLDivElement | null>
  data: GypsumTileExportCardData
}

function Row({ label, value, boldValue = true }: { label: string; value: string; boldValue?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "6px 0",
        borderBottom: "1px solid #f1f5f9",
        gap: "10px",
      }}
    >
      <span
        style={{
          fontSize: "10.5px",
          color: "#64748b",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "11.5px",
          color: "#0f172a",
          fontWeight: boldValue ? 700 : 500,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function GypsumTileExportCard({ cardRef, data }: Props) {
  const { storeCode, storeName, storeBranch, calculation, layoutSnapshot } = data

  const {
    orientation,
    roomWidthM,
    roomLengthM,
    roomAreaM2,
    roomPerimeterM,
    xAxis,
    yAxis,
    totalFullTiles,
    borderTilesTopBottom,
    borderTilesLeftRight,
    cornerTiles,
    totalBorderTiles,
    totalTilesNeeded,
    safetyWasteTiles,
    totalTilesToOrder,
    boq,
  } = calculation

  const isHorizontal = orientation === "horizontal"

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
            background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
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
                  background: "rgba(16, 185, 129, 0.2)",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  letterSpacing: "0.04em",
                  marginLeft: "4px",
                }}
              >
                MEP SIMULATOR
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "0.04em",
              }}
            >
              ESTIMASI PLAFON GYPSUM TILE 60x120 CM (T-BAR)
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                marginTop: "2px",
              }}
            >
              Standar Simetris 50% Rule · {GYPSUM_CALCULATOR_VERSION}
            </div>
          </div>
        </div>

        {/* ── Subheader Strip: Store Details ── */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            padding: "9px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#065f46",
              }}
            >
              {storeCode} — {storeName}
            </span>
            <span
              style={{
                fontSize: "10.5px",
                color: "#047857",
                backgroundColor: "#dcfce7",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: 600,
              }}
            >
              Cabang: {storeBranch || "—"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "11px", color: "#047857" }}>
              Dimensi Toko:{" "}
              <strong style={{ color: "#065f46" }}>
                {roomWidthM}m × {roomLengthM}m ({roomAreaM2} m²)
              </strong>
            </span>
            <span style={{ fontSize: "11px", color: "#047857" }}>
              Orientasi:{" "}
              <strong style={{ color: "#065f46" }}>
                {isHorizontal ? "Horizontal (1.2m Lebar X)" : "Vertikal (1.2m Panjang Y)"}
              </strong>
            </span>
          </div>
        </div>

        {/* ── Main Content: 2 Columns ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            padding: "16px 28px",
            gap: "24px",
          }}
        >
          {/* ── Left Column: Canvas Snapshot ── */}
          <div
            style={{
              flex: "0 0 580px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Visualisasi Tata Letak Grid Plafon (Ceiling Plan)</span>
              <span style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 600 }}>
                Modul 0.6m × 1.2m
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: "430px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {layoutSnapshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={layoutSnapshot}
                  alt="Denah Plafon Gypsum"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>
                  [ Snapshot Denah Tidak Tersedia ]
                </div>
              )}
            </div>

            {/* Legenda Warna */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "center",
                padding: "8px 12px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "10px",
                color: "#475569",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "10px", height: "10px", backgroundColor: "rgba(16, 185, 129, 0.4)", borderRadius: "2px" }} />
                <span>Panel Utuh (Tengah)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "10px", height: "10px", backgroundColor: "rgba(245, 158, 11, 0.4)", borderRadius: "2px" }} />
                <span>Panel Potongan Tepi</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "10px", height: "10px", backgroundColor: "rgba(217, 119, 6, 0.8)", borderRadius: "2px" }} />
                <span>Potongan 4 Sudut</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Data Tables & BoQ ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Highlight Box: Total Lembar Dipesan */}
            <div
              style={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                borderRadius: "10px",
                padding: "12px 16px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.9 }}>
                  Total Pengadaan Panel Gyptile
                </div>
                <div style={{ fontSize: "9.5px", opacity: 0.85, marginTop: "2px" }}>
                  Standar AHSP Jayaboard (1.75 lembar / m²)
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "24px", fontWeight: 900 }}>{totalTilesToOrder}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, marginLeft: "4px" }}>Lembar</span>
              </div>
            </div>

            {/* Pembedahan Kebutuhan Panel */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 14px",
                backgroundColor: "#ffffff",
              }}
            >
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  color: "#0f172a",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                }}
              >
                Pembedahan Kebutuhan Lembar (60x120 cm)
              </div>
              <Row label="Panel Utuh di Tengah" value={`${totalFullTiles} Lembar`} />
              <Row
                label={isHorizontal ? "Panel Tepi Depan & Belakang" : "Panel Tepi Kiri & Kanan"}
                value={`${borderTilesTopBottom} Lembar`}
              />
              <Row
                label={isHorizontal ? "Panel Tepi Kiri & Kanan" : "Panel Tepi Depan & Belakang"}
                value={`${borderTilesLeftRight} Lembar`}
              />
              {cornerTiles > 0 && <Row label="Panel Potongan 4 Sudut" value={`${cornerTiles} Lembar`} />}
              <Row label="Kebutuhan Bersih Terpasang" value={`${totalTilesNeeded} Lembar`} />
              <Row
                label="Cadangan Potong & Waste AHSP"
                value={`+${Math.max(0, totalTilesToOrder - totalTilesNeeded)} Lembar`}
              />
            </div>

            {/* Ukuran Potongan Tepi Dinding */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 14px",
                backgroundColor: "#ffffff",
              }}
            >
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  color: "#0f172a",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                }}
              >
                Ukuran Potongan Tepi Dinding (Aturan ≥ 50%)
              </div>
              <Row
                label={`Tepi Kiri & Kanan (Modul ${xAxis.panelDimM}m)`}
                value={`${xAxis.borderCutCm} cm (${Math.round(xAxis.borderCutRatio * 100)}%)`}
              />
              <Row
                label={`Tepi Depan & Belakang (Modul ${yAxis.panelDimM}m)`}
                value={`${yAxis.borderCutCm} cm (${Math.round(yAxis.borderCutRatio * 100)}%)`}
              />
            </div>

            {/* Estimasi Rangka T-Bar & Aksesoris */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 14px",
                backgroundColor: "#ffffff",
              }}
            >
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  color: "#0f172a",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Rangka T-Bar & Aksesoris (AHSP)</span>
                <span style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 600 }}>
                  Keliling {roomPerimeterM}m
                </span>
              </div>
              <Row label="Main Tee 3.6m" value={`${boq.mainTeePcs} Batang (~${boq.mainTeeTotalM} m)`} />
              <Row label="Cross Tee 1.2m" value={`${boq.crossTeePcs} Batang (~${boq.crossTeeTotalM} m)`} />
              <Row label="Wall Angle 3.0m" value={`${boq.wallAnglePcs} Batang (~${boq.wallAngleTotalM} m)`} />
              <Row label="Gantungan (Spring & Bracket)" value={`${boq.springAdjusterPcs || boq.rodHangerPcs} Set`} />
              <Row label="Kawat Penggantung Rod 3mm" value={`${boq.galvanisedSuspRodPcs || Math.ceil(boq.rodHangerPcs * 0.5)} Btg/Pcs`} />
            </div>
          </div>
        </div>

        {/* ── Footer Bar ── */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "10px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "9.5px", color: "#94a3b8" }}>
            Diekspor otomatis oleh <strong>SPARTA Energy MEP Simulator</strong> · {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
          </div>
          <div style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 600 }}>
            Catatan: Kuantitas mengacu pada standar volume AHSP Jayaboard. Harga satuan bervariasi mengikuti pasar daerah.
          </div>
        </div>
      </div>
    </div>
  )
}
