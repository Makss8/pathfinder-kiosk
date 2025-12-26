import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Line, Transformer } from 'react-konva';
import { useMapStore } from '@/store/mapStore';
import { MapMarker, categoryConfig, NavigationNode } from '@/types/map';
import Konva from 'konva';

interface AdminFloorMapProps {
  onMarkerClick?: (marker: MapMarker) => void;
}

const AdminFloorMap: React.FC<AdminFloorMapProps> = ({ onMarkerClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const shapeRefs = useRef<Map<string, Konva.Rect>>(new Map());

  const { 
    floorPlan, 
    selectedMarker, 
    updateMarker,
    editMode,
    addNavigationNode,
    updateNavigationNode,
    deleteNavigationNode,
    connectNodes,
    currentHallId,
  } = useMapStore();

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setDimensions({ width: offsetWidth, height: offsetHeight });
      
      const scaleX = offsetWidth / floorPlan.width;
      const scaleY = offsetHeight / floorPlan.height;
      const newScale = Math.min(scaleX, scaleY, 1.5);
      setScale(newScale);
      
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

  useEffect(() => {
    if (selectedMarker && transformerRef.current) {
      const node = shapeRefs.current.get(selectedMarker.id);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedMarker]);

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

  const handleMarkerDragEnd = (marker: MapMarker, e: any) => {
    const node = e.target;
    updateMarker(marker.id, {
      x: node.x(),
      y: node.y(),
    });
  };

  const handleMarkerTransformEnd = (marker: MapMarker, e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);
    
    updateMarker(marker.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(30, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
    });
  };

  const handleStageClick = (e: any) => {
    if (editMode === 'navigation') {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      const x = (pointer.x - position.x) / scale;
      const y = (pointer.y - position.y) / scale;
      
      if (e.target === stage || e.target.name() === 'background') {
        const newNode: NavigationNode = {
          id: `nav-${Date.now()}`,
          x,
          y,
          connections: [],
          hallId: currentHallId,
        };
        addNavigationNode(newNode);
      }
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (editMode === 'navigation') {
      if (connectingFrom) {
        if (connectingFrom !== nodeId) {
          connectNodes(connectingFrom, nodeId);
        }
        setConnectingFrom(null);
      } else {
        setConnectingFrom(nodeId);
        setSelectedNodeId(nodeId);
      }
    }
  };

  const handleNodeDragEnd = (node: NavigationNode, e: any) => {
    updateNavigationNode(node.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    if (editMode === 'navigation') {
      deleteNavigationNode(nodeId);
    }
  };

  const currentHallMarkers = floorPlan.markers.filter(m => m.hallId === currentHallId);
  const currentHallNodes = floorPlan.navigationNodes.filter(n => n.hallId === currentHallId);

  return (
    <div ref={containerRef} className="w-full h-full bg-background rounded-xl overflow-hidden">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={editMode === 'select'}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setPosition({ x: e.target.x(), y: e.target.y() });
          }
        }}
      >
        <Layer>
          {/* Floor background */}
          <Rect
            name="background"
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

          {/* Navigation connections */}
          {currentHallNodes.map((node) =>
            node.connections.map((connId) => {
              const connNode = currentHallNodes.find((n) => n.id === connId);
              if (!connNode || node.id > connId) return null;
              return (
                <Line
                  key={`${node.id}-${connId}`}
                  points={[node.x, node.y, connNode.x, connNode.y]}
                  stroke="#22c55e"
                  strokeWidth={3}
                  opacity={0.6}
                  dash={[10, 5]}
                />
              );
            })
          )}

          {/* Navigation nodes */}
          {editMode === 'navigation' &&
            currentHallNodes.map((node) => (
              <Circle
                key={node.id}
                x={node.x}
                y={node.y}
                radius={12}
                fill={connectingFrom === node.id ? '#f97316' : node.isEntryPoint ? '#22c55e' : '#3b82f6'}
                stroke={selectedNodeId === node.id ? '#ffffff' : 'transparent'}
                strokeWidth={3}
                draggable
                onClick={() => handleNodeClick(node.id)}
                onDblClick={() => handleNodeDoubleClick(node.id)}
                onDragEnd={(e) => handleNodeDragEnd(node, e)}
                shadowColor="#000"
                shadowBlur={10}
                shadowOpacity={0.5}
              />
            ))}

          {/* Markers */}
          {currentHallMarkers.map((marker) => {
            const isSelected = selectedMarker?.id === marker.id;
            const color = getCategoryColor(marker.category);

            return (
              <Group
                key={marker.id}
                x={marker.x}
                y={marker.y}
                draggable={editMode === 'move'}
                onDragEnd={(e) => handleMarkerDragEnd(marker, e)}
                onClick={() => onMarkerClick?.(marker)}
                onTap={() => onMarkerClick?.(marker)}
              >
                <Rect
                  ref={(node) => {
                    if (node) shapeRefs.current.set(marker.id, node);
                  }}
                  width={marker.width}
                  height={marker.height}
                  fill={isSelected ? color : `${color}33`}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  cornerRadius={8}
                  shadowColor={color}
                  shadowBlur={isSelected ? 20 : 10}
                  shadowOpacity={isSelected ? 0.8 : 0.4}
                  onTransformEnd={(e) => handleMarkerTransformEnd(marker, e)}
                />

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
                  listening={false}
                />

                {marker.category !== 'stand' && (
                  <Text
                    x={5}
                    y={5}
                    text={categoryConfig[marker.category]?.label.charAt(0).toUpperCase()}
                    fontSize={14}
                    fontFamily="Space Grotesk"
                    fontStyle="bold"
                    fill={color}
                    listening={false}
                  />
                )}
              </Group>
            );
          })}

          {/* Transformer for selected marker */}
          {editMode === 'move' && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 30 || newBox.height < 30) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AdminFloorMap;
