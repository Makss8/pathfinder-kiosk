import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomIn}
        className="h-14 w-14 rounded-xl bg-card border border-border shadow-card hover:bg-secondary"
      >
        <ZoomIn className="h-6 w-6" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomOut}
        className="h-14 w-14 rounded-xl bg-card border border-border shadow-card hover:bg-secondary"
      >
        <ZoomOut className="h-6 w-6" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onReset}
        className="h-14 w-14 rounded-xl bg-card border border-border shadow-card hover:bg-secondary"
      >
        <Maximize2 className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ZoomControls;
