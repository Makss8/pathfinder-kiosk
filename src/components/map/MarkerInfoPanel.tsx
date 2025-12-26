import React, { useMemo } from 'react';
import { X, MapPin, Navigation, Info, Store, Bath, DoorOpen, DoorClosed, UtensilsCrossed, ArrowUpDown, Footprints, Cross, MapPinned, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/store/mapStore';
import { categoryConfig, MarkerCategory } from '@/types/map';
import { calculateNavigationPath } from '@/lib/pathfinding';

const iconMap: Record<string, React.ElementType> = {
  Store,
  Bath,
  DoorOpen,
  DoorClosed,
  Info,
  UtensilsCrossed,
  ArrowUpDown,
  Footprints,
  Cross,
  MapPinned,
};

const MarkerInfoPanel: React.FC = () => {
  const { 
    selectedMarker, 
    setSelectedMarker, 
    floorPlan, 
    currentHallId,
    navigationTarget,
    setNavigationTarget,
    setNavigationPath,
  } = useMapStore();

  // Get kiosk marker (You Are Here point)
  const kioskMarker = useMemo(() => 
    floorPlan.markers.find(m => m.category === 'kiosk' && m.hallId === currentHallId),
    [floorPlan.markers, currentHallId]
  );

  const handleNavigate = () => {
    if (!selectedMarker || !kioskMarker) return;
    
    const path = calculateNavigationPath(
      kioskMarker,
      selectedMarker,
      floorPlan.navigationNodes
    );
    
    setNavigationPath(path);
    setNavigationTarget(selectedMarker);
  };

  const handleClearNavigation = () => {
    setNavigationPath([]);
    setNavigationTarget(null);
  };

  if (!selectedMarker) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-display font-semibold text-foreground mb-3">
          Select a Location
        </h3>
        <p className="text-lg text-muted-foreground max-w-sm">
          Tap on any stand or facility on the map to view details and get directions.
        </p>
        
        {!kioskMarker && (
          <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/30 max-w-sm">
            <p className="text-sm text-warning">
              <strong>Note:</strong> No "You Are Here" kiosk point is set. Navigation will not work until one is added in the admin panel.
            </p>
          </div>
        )}
      </div>
    );
  }

  const config = categoryConfig[selectedMarker.category as MarkerCategory];
  const IconComponent = iconMap[config.icon] || MapPin;
  const isNavigating = navigationTarget?.id === selectedMarker.id;

  return (
    <div className="h-full flex flex-col animate-slide-in-right">
      {/* Header */}
      <div 
        className="p-6 rounded-t-xl"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${config.color}25` }}
            >
              <IconComponent 
                className="h-8 w-8" 
                style={{ color: config.color }} 
              />
            </div>
            <div>
              {selectedMarker.standNumber && (
                <span 
                  className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-2"
                  style={{ 
                    backgroundColor: config.color,
                    color: '#0f172a'
                  }}
                >
                  {selectedMarker.standNumber}
                </span>
              )}
              <h2 className="text-2xl font-display font-bold text-foreground">
                {selectedMarker.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {config.label}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedMarker(null);
              handleClearNavigation();
            }}
            className="h-12 w-12 rounded-xl hover:bg-secondary"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Description
          </h4>
          <p className="text-lg text-foreground leading-relaxed">
            {selectedMarker.description}
          </p>
        </div>

        {/* Location Info */}
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: `${config.color}10` }}
        >
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5" style={{ color: config.color }} />
            <span className="text-foreground">
              Zone {selectedMarker.standNumber?.charAt(0) || 'A'} · Hall {selectedMarker.floor || 1}
            </span>
          </div>
        </div>

        {/* Navigation Status */}
        {isNavigating && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30">
            <div className="flex items-center gap-3">
              <Navigation className="h-5 w-5 text-success" />
              <span className="text-success font-medium">
                Navigation active - follow the green path
              </span>
            </div>
          </div>
        )}

        {/* Image placeholder */}
        {selectedMarker.imageUrl && (
          <div className="aspect-video rounded-xl bg-secondary overflow-hidden">
            <img 
              src={selectedMarker.imageUrl} 
              alt={selectedMarker.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 space-y-3">
        {!isNavigating ? (
          <Button 
            className="w-full h-16 text-xl font-semibold rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={handleNavigate}
            disabled={!kioskMarker}
          >
            <Navigation className="h-6 w-6 mr-3" />
            {kioskMarker ? 'Navigate Here' : 'Set Kiosk Point First'}
          </Button>
        ) : (
          <Button 
            className="w-full h-16 text-xl font-semibold rounded-xl"
            variant="outline"
            onClick={handleClearNavigation}
          >
            <XCircle className="h-6 w-6 mr-3" />
            Clear Navigation
          </Button>
        )}
      </div>
    </div>
  );
};

export default MarkerInfoPanel;
