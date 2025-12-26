import React from 'react';
import { X, MapPin, Navigation, Info, Store, Bath, DoorOpen, DoorClosed, UtensilsCrossed, ArrowUpDown, Footprints, Cross } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/store/mapStore';
import { categoryConfig, MarkerCategory } from '@/types/map';

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
};

const MarkerInfoPanel: React.FC = () => {
  const { selectedMarker, setSelectedMarker } = useMapStore();

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
      </div>
    );
  }

  const config = categoryConfig[selectedMarker.category as MarkerCategory];
  const IconComponent = iconMap[config.icon] || MapPin;

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
            onClick={() => setSelectedMarker(null)}
            className="h-12 w-12 rounded-xl hover:bg-secondary"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
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

      {/* Action Button */}
      <div className="p-6 pt-0">
        <Button 
          className="w-full h-16 text-xl font-semibold rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Navigation className="h-6 w-6 mr-3" />
          Navigate Here
        </Button>
      </div>
    </div>
  );
};

export default MarkerInfoPanel;
