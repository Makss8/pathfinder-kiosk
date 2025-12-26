import React, { Suspense } from 'react';
import MapHeader from '@/components/map/MapHeader';
import FloorMap from '@/components/map/FloorMap';
import SearchPanel from '@/components/map/SearchPanel';
import MarkerInfoPanel from '@/components/map/MarkerInfoPanel';
import { useMapStore } from '@/store/mapStore';
import { MapMarker } from '@/types/map';

const MapPage = () => {
  const { setSelectedMarker } = useMapStore();

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <MapHeader />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Search & Filters */}
        <aside className="w-96 p-6 bg-card border-r border-border flex flex-col">
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Find Your Way
          </h2>
          <SearchPanel />
        </aside>

        {/* Center - Map */}
        <main className="flex-1 relative p-4">
          <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded-xl" />}>
            <FloorMap onMarkerClick={handleMarkerClick} />
          </Suspense>
          
          {/* Legend */}
          <div className="absolute top-6 left-6 bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Legend</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#00d4ff]" />
                <span className="text-xs text-foreground">Stands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#a855f7]" />
                <span className="text-xs text-foreground">Toilets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#22c55e]" />
                <span className="text-xs text-foreground">Entrance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#f97316]" />
                <span className="text-xs text-foreground">Food</span>
              </div>
            </div>
          </div>

          {/* Touch Instructions */}
          <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">Tip:</span> Pinch to zoom • Drag to pan • Tap markers for details
            </p>
          </div>
        </main>

        {/* Right Panel - Info */}
        <aside className="w-[420px] bg-card border-l border-border">
          <MarkerInfoPanel />
        </aside>
      </div>
    </div>
  );
};

export default MapPage;