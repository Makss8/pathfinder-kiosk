import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useMapStore } from '@/store/mapStore';
import { MapMarker, categoryConfig } from '@/types/map';
import { MapPinned } from 'lucide-react';

interface FloorMapProps {
  onMarkerClick?: (marker: MapMarker) => void;
}

const FloorMap: React.FC<FloorMapProps> = ({ onMarkerClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 600 });

  const { 
    floorPlan, 
    selectedMarker, 
    searchQuery, 
    activeCategories, 
    currentHallId,
    navigationPath,
    navigationTarget,
  } = useMapStore();

  const filteredMarkers = floorPlan.markers.filter((marker) => {
    const matchesCategory = activeCategories.includes(marker.category);
    const matchesSearch = searchQuery === '' || 
      marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.standNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHall = marker.hallId === currentHallId;
    return matchesCategory && matchesSearch && matchesHall;
  });

  // Get kiosk marker (You Are Here point)
  const kioskMarker = useMemo(() => 
    floorPlan.markers.find(m => m.category === 'kiosk' && m.hallId === currentHallId),
    [floorPlan.markers, currentHallId]
  );

  // Get current hall nodes for navigation path rendering
  const currentHallNodes = useMemo(() => 
    floorPlan.navigationNodes.filter(n => n.hallId === currentHallId),
    [floorPlan.navigationNodes, currentHallId]
  );

  // Build navigation path line coordinates
  const navigationPathCoords = useMemo(() => {
    if (navigationPath.length < 2) return [];
    
    const coords: { x: number; y: number }[] = [];
    
    // If we have a kiosk marker, start from its center
    if (kioskMarker) {
      coords.push({
        x: kioskMarker.x + kioskMarker.width / 2,
        y: kioskMarker.y + kioskMarker.height / 2,
      });
    }
    
    // Add all navigation nodes in the path
    for (const nodeId of navigationPath) {
      const node = currentHallNodes.find(n => n.id === nodeId);
      if (node) {
        coords.push({ x: node.x, y: node.y });
      }
    }
    
    // If we have a target, end at its center
    if (navigationTarget) {
      coords.push({
        x: navigationTarget.x + navigationTarget.width / 2,
        y: navigationTarget.y + navigationTarget.height / 2,
      });
    }
    
    return coords;
  }, [navigationPath, currentHallNodes, kioskMarker, navigationTarget]);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setContainerSize({ width: offsetWidth, height: offsetHeight });
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const getCategoryColor = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig]?.color || '#00d4ff';
  };

  const initialScale = Math.min(
    containerSize.width / floorPlan.width,
    containerSize.height / floorPlan.height,
    1
  );

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-background rounded-xl overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      <TransformWrapper
        initialScale={initialScale}
        minScale={0.3}
        maxScale={3}
        centerOnInit
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: true }}
        panning={{ velocityDisabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%', touchAction: 'none' }}
          contentStyle={{ width: floorPlan.width, height: floorPlan.height }}
        >
          <div 
            className="relative"
            style={{ 
              width: floorPlan.width, 
              height: floorPlan.height,
              backgroundColor: '#0f172a',
              border: '3px solid #1e3a5f',
              borderRadius: 12,
            }}
          >
            {/* Grid lines and navigation path */}
            <svg 
              className="absolute inset-0 pointer-events-none" 
              width={floorPlan.width} 
              height={floorPlan.height}
            >
              {/* Grid lines */}
              {Array.from({ length: Math.floor(floorPlan.width / 100) }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={(i + 1) * 100}
                  y1={0}
                  x2={(i + 1) * 100}
                  y2={floorPlan.height}
                  stroke="#1e3a5f"
                  strokeWidth={1}
                  opacity={0.3}
                />
              ))}
              {Array.from({ length: Math.floor(floorPlan.height / 100) }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={(i + 1) * 100}
                  x2={floorPlan.width}
                  y2={(i + 1) * 100}
                  stroke="#1e3a5f"
                  strokeWidth={1}
                  opacity={0.3}
                />
              ))}

              {/* Navigation path */}
              {navigationPathCoords.length >= 2 && (
                <>
                  {/* Shadow/glow effect */}
                  <polyline
                    points={navigationPathCoords.map(c => `${c.x},${c.y}`).join(' ')}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.3}
                  />
                  {/* Main path */}
                  <polyline
                    points={navigationPathCoords.map(c => `${c.x},${c.y}`).join(' ')}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="12,8"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;-20"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </polyline>
                </>
              )}
            </svg>

            {/* Markers */}
            {filteredMarkers.map((marker) => {
              const isSelected = selectedMarker?.id === marker.id;
              const isKiosk = marker.category === 'kiosk';
              const isTarget = navigationTarget?.id === marker.id;
              const color = getCategoryColor(marker.category);

              return (
                <div
                  key={marker.id}
                  className="absolute cursor-pointer transition-all duration-200"
                  style={{
                    left: marker.x,
                    top: marker.y,
                    width: marker.width,
                    height: marker.height,
                    backgroundColor: isSelected || isKiosk ? color : `${color}33`,
                    border: `${isSelected || isTarget ? 4 : 2}px solid ${color}`,
                    borderRadius: isKiosk ? '50%' : 8,
                    boxShadow: isSelected || isKiosk
                      ? `0 0 25px ${color}cc, 0 0 50px ${color}66` 
                      : `0 0 10px ${color}66`,
                    zIndex: isKiosk ? 100 : isSelected ? 50 : 10,
                  }}
                  onClick={() => !isKiosk && onMarkerClick?.(marker)}
                >
                  {/* Kiosk "You Are Here" icon */}
                  {isKiosk && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPinned className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  )}

                  {/* Category indicator */}
                  {marker.category !== 'stand' && marker.category !== 'kiosk' && (
                    <span
                      className="absolute top-1 left-2 text-sm font-bold"
                      style={{ color }}
                    >
                      {categoryConfig[marker.category]?.label.charAt(0).toUpperCase()}
                    </span>
                  )}
                  
                  {/* Marker label */}
                  {!isKiosk && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-xs font-bold text-center px-1"
                      style={{ color: isSelected ? '#0f172a' : '#ffffff' }}
                    >
                      {marker.standNumber || marker.name}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Kiosk pulse effect */}
            {kioskMarker && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: kioskMarker.x - 10,
                  top: kioskMarker.y - 10,
                  width: kioskMarker.width + 20,
                  height: kioskMarker.height + 20,
                }}
              >
                <div 
                  className="w-full h-full rounded-full animate-ping"
                  style={{ 
                    backgroundColor: `${getCategoryColor('kiosk')}33`,
                    animationDuration: '2s',
                  }}
                />
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default FloorMap;
