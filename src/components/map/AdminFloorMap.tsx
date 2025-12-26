import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useMapStore } from '@/store/mapStore';
import { MapMarker, categoryConfig, NavigationNode } from '@/types/map';

interface AdminFloorMapProps {
  onMarkerClick?: (marker: MapMarker) => void;
}

const AdminFloorMap: React.FC<AdminFloorMapProps> = ({ onMarkerClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 600 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; type: 'marker' | 'node'; startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const { 
    floorPlan, 
    selectedMarker, 
    updateMarker,
    setSelectedMarker,
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

  const getTransformScale = () => {
    return transformRef.current?.instance?.transformState?.scale || 1;
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editMode === 'navigation' && e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scale = getTransformScale();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      
      const newNode: NavigationNode = {
        id: `nav-${Date.now()}`,
        x,
        y,
        connections: [],
        hallId: currentHallId,
      };
      addNavigationNode(newNode);
    }
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
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

  const handleNodeDoubleClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (editMode === 'navigation') {
      deleteNavigationNode(nodeId);
    }
  };

  const handleMarkerMouseDown = (e: React.MouseEvent, marker: MapMarker) => {
    if (editMode !== 'move') return;
    e.stopPropagation();
    e.preventDefault();
    
    const scale = getTransformScale();
    setDragging({
      id: marker.id,
      type: 'marker',
      startX: marker.x,
      startY: marker.y,
      offsetX: e.clientX / scale,
      offsetY: e.clientY / scale,
    });
    setSelectedMarker(marker);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: NavigationNode) => {
    if (editMode !== 'navigation') return;
    e.stopPropagation();
    e.preventDefault();
    
    const scale = getTransformScale();
    setDragging({
      id: node.id,
      type: 'node',
      startX: node.x,
      startY: node.y,
      offsetX: e.clientX / scale,
      offsetY: e.clientY / scale,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, marker: MapMarker) => {
    if (editMode !== 'move') return;
    e.stopPropagation();
    e.preventDefault();
    
    setResizing({
      id: marker.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: marker.width,
      startHeight: marker.height,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const scale = getTransformScale();
    
    if (dragging) {
      const deltaX = e.clientX / scale - dragging.offsetX;
      const deltaY = e.clientY / scale - dragging.offsetY;
      
      if (dragging.type === 'marker') {
        updateMarker(dragging.id, {
          x: dragging.startX + deltaX,
          y: dragging.startY + deltaY,
        });
      } else {
        updateNavigationNode(dragging.id, {
          x: dragging.startX + deltaX,
          y: dragging.startY + deltaY,
        });
      }
    }
    
    if (resizing) {
      const scale = getTransformScale();
      const deltaX = (e.clientX - resizing.startX) / scale;
      const deltaY = (e.clientY - resizing.startY) / scale;
      
      updateMarker(resizing.id, {
        width: Math.max(30, resizing.startWidth + deltaX),
        height: Math.max(30, resizing.startHeight + deltaY),
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const currentHallMarkers = floorPlan.markers.filter(m => m.hallId === currentHallId);
  const currentHallNodes = floorPlan.navigationNodes.filter(n => n.hallId === currentHallId);

  const initialScale = Math.min(
    containerSize.width / floorPlan.width,
    containerSize.height / floorPlan.height,
    1
  );

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-background rounded-xl overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={initialScale}
        minScale={0.3}
        maxScale={3}
        centerOnInit
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: true }}
        panning={{ 
          disabled: editMode === 'move' || editMode === 'navigation',
          velocityDisabled: true 
        }}
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
            onClick={handleMapClick}
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

              {/* Navigation connections */}
              {currentHallNodes.map((node) =>
                node.connections.map((connId) => {
                  const connNode = currentHallNodes.find((n) => n.id === connId);
                  if (!connNode || node.id > connId) return null;
                  return (
                    <line
                      key={`${node.id}-${connId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={connNode.x}
                      y2={connNode.y}
                      stroke="#22c55e"
                      strokeWidth={3}
                      opacity={0.6}
                      strokeDasharray="10,5"
                    />
                  );
                })
              )}
            </svg>

            {/* Navigation nodes */}
            {editMode === 'navigation' &&
              currentHallNodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute cursor-pointer"
                  style={{
                    left: node.x - 12,
                    top: node.y - 12,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: connectingFrom === node.id 
                      ? '#f97316' 
                      : node.isEntryPoint 
                        ? '#22c55e' 
                        : '#3b82f6',
                    border: selectedNodeId === node.id ? '3px solid #ffffff' : 'none',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  }}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                />
              ))}

            {/* Markers */}
            {currentHallMarkers.map((marker) => {
              const isSelected = selectedMarker?.id === marker.id;
              const color = getCategoryColor(marker.category);

              return (
                <div
                  key={marker.id}
                  className="absolute cursor-pointer transition-shadow duration-200"
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
                  onMouseDown={(e) => handleMarkerMouseDown(e, marker)}
                >
                  {/* Category indicator */}
                  {marker.category !== 'stand' && (
                    <span
                      className="absolute top-1 left-2 text-sm font-bold pointer-events-none"
                      style={{ color }}
                    >
                      {categoryConfig[marker.category]?.label.charAt(0).toUpperCase()}
                    </span>
                  )}
                  
                  {/* Marker label */}
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold text-center px-1 pointer-events-none"
                    style={{ color: isSelected ? '#0f172a' : '#ffffff' }}
                  >
                    {marker.standNumber || marker.name}
                  </span>

                  {/* Resize handle */}
                  {editMode === 'move' && isSelected && (
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                      style={{
                        background: color,
                        borderRadius: '2px 0 6px 0',
                      }}
                      onMouseDown={(e) => handleResizeMouseDown(e, marker)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default AdminFloorMap;
