import React, { Suspense, useState, useEffect, useCallback } from 'react';
import MapHeader from '@/components/map/MapHeader';
import FloorMap from '@/components/map/FloorMap';
import SearchPanel from '@/components/map/SearchPanel';
import MarkerInfoPanel from '@/components/map/MarkerInfoPanel';
import AdvertisementScreen from '@/components/AdvertisementScreen';
import { useMapStore } from '@/store/mapStore';
import { MapMarker } from '@/types/map';
import { useAdvertisements, useAppSettings, useHalls, useMarkers, useNavigationNodes } from '@/hooks/useSupabaseData';

const MapPage = () => {
  const { setSelectedMarker, setFloorPlan, inactivityTimeout, setInactivityTimeout } = useMapStore();
  const [showAdvertisements, setShowAdvertisements] = useState(true);
  
  // Fetch data from database
  const { data: advertisements } = useAdvertisements();
  const { data: appSettings } = useAppSettings();
  const { data: halls } = useHalls();
  const { data: markers } = useMarkers();
  const { data: navigationNodes } = useNavigationNodes();

  // Update store when data loads
  useEffect(() => {
    if (appSettings?.inactivityTimeout) {
      setInactivityTimeout(appSettings.inactivityTimeout);
    }
  }, [appSettings, setInactivityTimeout]);

  useEffect(() => {
    if (halls && halls.length > 0 && markers && navigationNodes) {
      const currentHall = halls[0];
      const hallMarkers = markers.filter(m => m.hallId === currentHall.id);
      const hallNodes = navigationNodes.filter(n => n.hallId === currentHall.id);
      
      setFloorPlan({
        id: currentHall.id,
        name: currentHall.name,
        width: currentHall.width,
        height: currentHall.height,
        markers: hallMarkers,
        navigationNodes: hallNodes,
        backgroundImage: currentHall.backgroundImage,
        hallId: currentHall.id,
      });
    }
  }, [halls, markers, navigationNodes, setFloorPlan]);

  // Inactivity timer
  useEffect(() => {
    if (showAdvertisements) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowAdvertisements(true);
      }, inactivityTimeout * 1000);
    };

    // Events to track for activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start the timer
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [showAdvertisements, inactivityTimeout]);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  const handleDismissAds = useCallback(() => {
    setShowAdvertisements(false);
  }, []);

  // Show advertisements screen
  if (showAdvertisements) {
    return <AdvertisementScreen onTouch={handleDismissAds} />;
  }

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
