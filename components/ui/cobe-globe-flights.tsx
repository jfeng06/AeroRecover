"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

interface FlightArc {
  id: string
  from: [number, number]
  to: [number, number]
}

interface FlightMarker {
  id: string
  location: [number, number]
  size?: number
}

interface GlobeFlightsProps {
  arcs?: FlightArc[]
  markers?: FlightMarker[]
  className?: string
  speed?: number
}

const defaultArcs: FlightArc[] = [
  { id: "flight-1", from: [32.89, -97.04], to: [34.05, -118.24] }, // DFW to LAX
  { id: "flight-2", from: [32.89, -97.04], to: [47.45, -122.30] }, // DFW to SEA
  { id: "flight-3", from: [32.89, -97.04], to: [25.79, -80.28] }, // DFW to MIA
  { id: "flight-4", from: [32.89, -97.04], to: [39.85, -104.67] }, // DFW to DEN
  { id: "flight-5", from: [32.89, -97.04], to: [41.97, -87.90] }, // DFW to ORD
]

const defaultMarkers: FlightMarker[] = [
  { id: "apt-dfw", location: [32.89, -97.04] }, // DFW (Hub)
  { id: "apt-lax", location: [34.05, -118.24] }, // LAX
  { id: "apt-sea", location: [47.45, -122.30] }, // SEA
  { id: "apt-mia", location: [25.79, -80.28] }, // MIA
  { id: "apt-den", location: [39.85, -104.67] }, // DEN
  { id: "apt-ord", location: [41.97, -87.90] }, // ORD
]

export function GlobeFlights({
  arcs = defaultArcs,
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeFlightsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = -1.5 // Start with North America in view

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width, height: width,
        phi: 0, theta: 0.2, dark: 0.95, diffuse: 1.5,
        mapSamples: 16000, mapBrightness: 8,
        baseColor: [0.1, 0.1, 0.1], // Dark mode colors
        markerColor: [0.93, 0.26, 0.26], // Red for hub/disruptions
        glowColor: [0.1, 0.1, 0.1],
        markerElevation: 0.1,
        markers: markers.map((m) => ({ location: m.location, size: m.size ?? 0.04, id: m.id })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor: [0.22, 0.5, 0.96], // Blue for flights
        arcWidth: 1.5, arcHeight: 0.25, opacity: 0.8,
      })
    function animate() {
      if (!isPausedRef.current) phi += speed
      globe!.update({
        phi: phi + phiOffsetRef.current + dragOffset.current.phi,
        theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
      })
      animationId = requestAnimationFrame(animate)
    }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, arcs, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
    </div>
  )
}
