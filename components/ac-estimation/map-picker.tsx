"use client"

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react"
import { useMapEvents, useMap, Marker } from "react-leaflet"
import { Map, MapFullscreenControl } from "@/components/ui/map"
import * as protomapsL from "protomaps-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { renderToStaticMarkup } from "react-dom/server"
import { Button } from "@/components/ui/button"
import { IconMapPinFilled, IconCurrentLocation } from "@tabler/icons-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// @ts-expect-error - Leaflet workaround for missing _getIconUrl in prototype
delete L.Icon.Default.prototype._getIconUrl

function createCustomIcon() {
  const html = renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        fill="#3b82f6"
        stroke="white"
        strokeWidth="3"
      />
    </svg>
  )
  return L.divIcon({
    html,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  })
}

type Props = {
  position: [number, number]
  onChange: (pos: [number, number]) => void
}

export type MapPickerRef = {
  captureSnapshot: (position: [number, number]) => string | null
}

// Inner component: exposes the Leaflet map instance to the outer ref
function MapCaptureHandler({
  mapRef,
}: {
  mapRef: React.MutableRefObject<L.Map | null>
}) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
  }, [map, mapRef])
  return null
}

function MapUpdater({ position, onChange }: Props) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true })
  }, [position, map])

  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng])
    },
  })

  return <Marker position={position} icon={createCustomIcon()} />
}

function ProtomapsLayer({ pixelRatio }: { pixelRatio?: number }) {
  const map = useMap()
  const currentPixelRatio = pixelRatio || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1

  useEffect(() => {
    const options = {
      url: "https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.mvt?key=f6cac8c113d13705",
      flavor: "light",
      lang: "id",
    }
    const layer = protomapsL.leafletLayer({
      ...options,
      devicePixelRatio: currentPixelRatio,
    }) as unknown as L.Layer
    layer.addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map])

  return null
}

const MapPicker = forwardRef<MapPickerRef, Props>(function MapPicker(
  { position, onChange },
  ref
) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const leafletMapRef = useRef<L.Map | null>(null)
  const snapshotMapRef = useRef<L.Map | null>(null)

  useImperativeHandle(ref, () => ({
    captureSnapshot: (position: [number, number]) => {
      const map = snapshotMapRef.current
      if (!map) return null
      const container = map.getContainer()
      const canvases = container.querySelectorAll<HTMLCanvasElement>(
        "canvas.leaflet-tile"
      )
      if (canvases.length === 0) return null
      try {
        const SCALE = 2
        const mapSize = map.getSize()
        const offscreen = document.createElement("canvas")
        offscreen.width = mapSize.x * SCALE
        offscreen.height = mapSize.y * SCALE
        const ctx = offscreen.getContext("2d")
        if (!ctx) return null

        ctx.scale(SCALE, SCALE)

        // Stitch all Protomaps canvas tiles
        canvases.forEach((canvas) => {
          const pos = canvas.getBoundingClientRect()
          const containerPos = container.getBoundingClientRect()
          const x = pos.left - containerPos.left
          const y = pos.top - containerPos.top
          ctx.drawImage(canvas, x, y, pos.width, pos.height)
        })

        // Draw the marker as a blue circle with white outline
        const markerPoint = map.latLngToContainerPoint([
          position[0],
          position[1],
        ])
        const r = 9
        ctx.beginPath()
        ctx.arc(markerPoint.x, markerPoint.y, r, 0, 2 * Math.PI)
        ctx.fillStyle = "#3b82f6"
        ctx.fill()
        ctx.lineWidth = 3
        ctx.strokeStyle = "#ffffff"
        ctx.stroke()

        return offscreen.toDataURL("image/png")
      } catch {
        return null
      }
    },
  }))

  const handleCurrentLocation = () => {
    setErrorMsg(null)
    setIsLocating(true)

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation tidak didukung oleh browser Anda.")
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ]
        onChange(coords)
        setIsLocating(false)
      },
      (err) => {
        setErrorMsg(`Gagal mengambil lokasi: ${err.message}`)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMsg && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="relative z-0 h-64 w-full overflow-hidden rounded-xl border">
        <Map center={position} zoom={14} className="z-0 h-full min-h-0 w-full">
          <ProtomapsLayer />
          <MapUpdater position={position} onChange={onChange} />
          <MapCaptureHandler mapRef={leafletMapRef} />
          <MapFullscreenControl />
        </Map>

        <div className="absolute right-2 bottom-2 z-1000">
          <Button
            size="sm"
            variant="secondary"
            className="text-xs shadow-md"
            onClick={handleCurrentLocation}
            disabled={isLocating}
          >
            <IconCurrentLocation className="size-4" />
            {isLocating ? "Mencari lokasi..." : "Lokasi saya"}
          </Button>
        </div>
      </div>

      {/* Hidden Map for Snapshot (Always centered at zoom 14) */}
      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "358px",
          height: "200px",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <Map
          center={position}
          zoom={14}
          className="h-full w-full"
          dragging={false}
          scrollWheelZoom={false}
        >
          <ProtomapsLayer pixelRatio={2} />
          <MapCaptureHandler mapRef={snapshotMapRef} />
        </Map>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <IconMapPinFilled className="size-3 text-primary" />
        Geser peta dan klik untuk menentukan titik lokasi toko.
      </p>
    </div>
  )
})

export default MapPicker
