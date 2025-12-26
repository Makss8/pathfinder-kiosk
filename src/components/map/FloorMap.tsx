import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { useMapStore } from '@/store/mapStore';
import { MapMarker, categoryConfig } from '@/types/map';

interface FloorMapProps {
  onMarkerClick?: (marker: MapMarker) => void;
}

const FloorMap: React.FC<FloorMapProps> = ({ onMarkerClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const { floorPlan, selectedMarker, searchQuery, activeCategories } = useMapStore();

  const filteredMarkers = floorPlan.markers.filter((marker) => {
    const matchesCategory = activeCategories.includes(marker.category);
    const matchesSearch = searchQuery === '' || 
      marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.standNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setDimensions({ width: offsetWidth, height: offsetHeight });
      
      // Calculate scale to fit the floor plan
      const scaleX = offsetWidth / floorPlan.width;
      const scaleY = offsetHeight / floorPlan.height;
      const newScale = Math.min(scaleX, scaleY, 1.5);
      setScale(newScale);
      
      // Center the map
      const centerX = (offsetWidth - floorPlan.width * newScale) / 2;
      const centerY = (offsetHeight - floorPlan.height * newScale) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [floorPlan.width, floorPlan.height]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.5, Math.min(3, newScale));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const getCategoryColor = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig]?.color || '#00d4ff';
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-background rounded-xl overflow-hidden">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={(e) => {
          setPosition({ x: e.target.x(), y: e.target.y() });
        }}
      >
        <Layer>
          {/* Floor background */}
          <Rect
            x={0}
            y={0}
            width={floorPlan.width}
            height={floorPlan.height}
            fill="#0f172a"
            stroke="#1e3a5f"
            strokeWidth={3}
            cornerRadius={12}
          />

          {/* Grid lines */}
          {Array.from({ length: Math.floor(floorPlan.width / 100) }).map((_, i) => (
            <React.Fragment key={`v-${i}`}>
              <Rect
                x={(i + 1) * 100}
                y={0}
                width={1}
                height={floorPlan.height}
                fill="#1e3a5f"
                opacity={0.3}
              />
            </React.Fragment>
          ))}
          {Array.from({ length: Math.floor(floorPlan.height / 100) }).map((_, i) => (
            <React.Fragment key={`h-${i}`}>
              <Rect
                x={0}
                y={(i + 1) * 100}
                width={floorPlan.width}
                height={1}
                fill="#1e3a5f"
                opacity={0.3}
              />
            </React.Fragment>
          ))}

          {/* Markers */}
          {filteredMarkers.map((marker) => {
            const isSelected = selectedMarker?.id === marker.id;
            const color = getCategoryColor(marker.category);

            return (
              <Group
                key={marker.id}
                x={marker.x}
                y={marker.y}
                onClick={() => onMarkerClick?.(marker)}
                onTap={() => onMarkerClick?.(marker)}
              >
                {/* Marker background */}
                <Rect
                  width={marker.width}
                  height={marker.height}
                  fill={isSelected ? color : `${color}33`}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  cornerRadius={8}
                  shadowColor={color}
                  shadowBlur={isSelected ? 20 : 10}
                  shadowOpacity={isSelected ? 0.8 : 0.4}
                />

                {/* Marker label */}
                <Text
                  x={5}
                  y={marker.height / 2 - 8}
                  width={marker.width - 10}
                  text={marker.standNumber || marker.name}
                  fontSize={12}
                  fontFamily="Space Grotesk"
                  fontStyle="bold"
                  fill={isSelected ? '#0f172a' : '#ffffff'}
                  align="center"
                />

                {/* Category indicator */}
                {marker.category !== 'stand' && (
                  <Text
                    x={5}
                    y={5}
                    text={categoryConfig[marker.category]?.label.charAt(0).toUpperCase()}
                    fontSize={14}
                    fontFamily="Space Grotesk"
                    fontStyle="bold"
                    fill={color}
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default FloorMap;
