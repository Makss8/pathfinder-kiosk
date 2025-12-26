import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useMapStore } from '@/store/mapStore';
import { MapMarker, categoryConfig } from '@/types/map';

interface FloorMapProps {
  onMarkerClick?: (marker: MapMarker) => void;
}

const FloorMap: React.FC<FloorMapProps> = ({ onMarkerClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 600 });

  const { floorPlan, selectedMarker, searchQuery, activeCategories, currentHallId } = useMapStore();

  const filteredMarkers = floorPlan.markers.filter((marker) => {
    const matchesCategory = activeCategories.includes(marker.category);
    const matchesSearch = searchQuery === '' || 
      marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.standNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHall = marker.hallId === currentHallId;
    return matchesCategory && matchesSearch && matchesHall;
  });

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
    <div ref={containerRef} className="w-full h-full bg-background rounded-xl overflow-hidden">
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
          wrapperStyle={{ width: '100%', height: '100%' }}
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
            {/* Grid lines */}
            <svg 
              className="absolute inset-0 pointer-events-none" 
              width={floorPlan.width} 
              height={floorPlan.height}
            >
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
            </svg>

            {/* Markers */}
            {filteredMarkers.map((marker) => {
              const isSelected = selectedMarker?.id === marker.id;
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
                    backgroundColor: isSelected ? color : `${color}33`,
                    border: `${isSelected ? 3 : 2}px solid ${color}`,
                    borderRadius: 8,
                    boxShadow: isSelected 
                      ? `0 0 20px ${color}cc` 
                      : `0 0 10px ${color}66`,
                  }}
                  onClick={() => onMarkerClick?.(marker)}
                >
                  {/* Category indicator */}
                  {marker.category !== 'stand' && (
                    <span
                      className="absolute top-1 left-2 text-sm font-bold"
                      style={{ color }}
                    >
                      {categoryConfig[marker.category]?.label.charAt(0).toUpperCase()}
                    </span>
                  )}
                  
                  {/* Marker label */}
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold text-center px-1"
                    style={{ color: isSelected ? '#0f172a' : '#ffffff' }}
                  >
                    {marker.standNumber || marker.name}
                  </span>
                </div>
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default FloorMap;
