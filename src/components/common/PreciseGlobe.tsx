'use client';
import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

interface PreciseGlobeProps {
  size?: number;
}

export const PreciseGlobe: React.FC<PreciseGlobeProps> = ({ size = 440 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  useEffect(() => {
    let phi = 0;
    let animId: number;
    let isDestroyed = false;
    let currentWidth = size;

    if (!canvasRef.current || !containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        currentWidth = Math.min(containerRef.current.offsetWidth || size, size);
      }
    };
    updateDimensions();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 2, 2) : 2,
      width: currentWidth * 2,
      height: currentWidth * 2,
      phi: 0,
      theta: 0.22,
      dark: 0, // Light theme mode
      diffuse: 1.25,
      mapSamples: 24000, // High-precision cartographic point distribution
      mapBrightness: 5.0,
      baseColor: [0.93, 0.94, 0.98], // Soft violet-tinted background globe
      markerColor: [0.49, 0.23, 0.93], // Royal Electric Violet (#7c3aed)
      glowColor: [0.82, 0.75, 0.98], // Soft violet atmospheric halo
      markers: [
        // Precise Real Coordinates: Global economic hubs
        { location: [35.6762, 139.6503], size: 0.06 }, // Tokyo
        { location: [1.3521, 103.8198], size: 0.05 },  // Singapore
        { location: [-6.2088, 106.8456], size: 0.05 }, // Jakarta
        { location: [51.5074, -0.1278], size: 0.06 },  // London
        { location: [40.7128, -74.006], size: 0.06 },   // New York
        { location: [37.7749, -122.4194], size: 0.06 },// San Francisco
        { location: [-33.8688, 151.2093], size: 0.05 },// Sydney
        { location: [25.2048, 55.2708], size: 0.05 },  // Dubai
        { location: [47.3769, 8.5417], size: 0.05 },   // Zurich
      ],
      arcs: [
        // Real-world Cross-border payment corridor arcs
        { from: [37.7749, -122.4194], to: [35.6762, 139.6503], color: [0.49, 0.23, 0.93] }, // SF -> Tokyo (Violet)
        { from: [51.5074, -0.1278], to: [1.3521, 103.8198], color: [0.06, 0.72, 0.51] },    // London -> Singapore (Emerald)
        { from: [1.3521, 103.8198], to: [-6.2088, 106.8456], color: [0.65, 0.25, 0.95] },   // Singapore -> Jakarta (Magenta Violet)
        { from: [40.7128, -74.006], to: [51.5074, -0.1278], color: [0.96, 0.62, 0.04] },     // NY -> London (Gold)
        { from: [25.2048, 55.2708], to: [-33.8688, 151.2093], color: [0.06, 0.72, 0.51] },  // Dubai -> Sydney (Emerald)
      ],
      arcColor: [0.49, 0.23, 0.93],
      arcWidth: 1.2,
      arcHeight: 0.35,
    });

    const handleResize = () => {
      updateDimensions();
      globe.update({
        width: currentWidth * 2,
        height: currentWidth * 2,
      });
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (isDestroyed) return;
      if (!pointerInteracting.current) {
        phi += 0.0035;
      }
      globe.update({
        phi: phi + pointerInteractionMovement.current,
      });
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isDestroyed = true;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      globe.destroy();
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: `${size}px`,
        aspectRatio: '1',
        margin: '0 auto',
        position: 'relative',
        cursor: 'grab',
        touchAction: 'none',
      }}
      onPointerDown={(e) => {
        pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
      }}
      onPointerUp={() => {
        pointerInteracting.current = null;
      }}
      onPointerOut={() => {
        pointerInteracting.current = null;
      }}
      onMouseMove={(e) => {
        if (pointerInteracting.current !== null) {
          const delta = e.clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta * 0.005;
        }
      }}
      onTouchMove={(e) => {
        if (pointerInteracting.current !== null && e.touches[0]) {
          const delta = e.touches[0].clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta * 0.005;
        }
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          contain: 'layout paint size',
          opacity: 0.96,
        }}
      />
    </div>
  );
};
