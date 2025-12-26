import React from 'react';
import { MapPin, Settings, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useMapStore } from '@/store/mapStore';

const MapHeader: React.FC = () => {
  const navigate = useNavigate();
  const { floorPlan } = useMapStore();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-card border-b border-border">
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <MapPin className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Event Navigator
          </h1>
          <p className="text-sm text-muted-foreground">
            {floorPlan.name}
          </p>
        </div>
      </div>

      {/* Center - Stats */}
      <div className="hidden lg:flex items-center gap-8">
        <div className="text-center">
          <p className="text-3xl font-display font-bold text-primary">
            {floorPlan.markers.filter(m => m.category === 'stand').length}
          </p>
          <p className="text-sm text-muted-foreground">Exhibitors</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <p className="text-3xl font-display font-bold text-foreground">
            {floorPlan.markers.length}
          </p>
          <p className="text-sm text-muted-foreground">Total Locations</p>
        </div>
      </div>

      {/* Right - Time & Admin */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-5 py-3 bg-secondary rounded-xl">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-xl font-mono font-medium text-foreground">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </span>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/admin')}
          className="h-14 px-6 rounded-xl border-border hover:bg-secondary"
        >
          <Settings className="h-5 w-5 mr-2" />
          Admin
        </Button>
      </div>
    </header>
  );
};

export default MapHeader;
