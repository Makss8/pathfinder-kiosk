export type MarkerCategory = 'stand' | 'toilet' | 'entrance' | 'exit' | 'info' | 'food' | 'elevator' | 'stairs' | 'first-aid' | 'kiosk';

export interface MapMarker {
  id: string;
  name: string;
  description: string;
  category: MarkerCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  standNumber?: string;
  floor?: number;
  hallId?: string;
  // Translations
  translations?: {
    [lang: string]: {
      name?: string;
      description?: string;
    };
  };
}

export interface NavigationNode {
  id: string;
  x: number;
  y: number;
  connections: string[]; // IDs of connected nodes
  hallId: string;
  isEntryPoint?: boolean;
}

export interface Hall {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundImage?: string;
  translations?: {
    [lang: string]: {
      name?: string;
    };
  };
}

export interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
  markers: MapMarker[];
  backgroundImage?: string;
  navigationNodes: NavigationNode[];
  hallId?: string;
}

export interface Advertisement {
  id: string;
  imageUrl: string;
  duration: number; // in seconds
  active: boolean;
}

export const categoryConfig: Record<MarkerCategory, { label: string; color: string; icon: string }> = {
  stand: { label: 'Stands', color: '#00d4ff', icon: 'Store' },
  toilet: { label: 'Toilets', color: '#a855f7', icon: 'Bath' },
  entrance: { label: 'Entrance', color: '#22c55e', icon: 'DoorOpen' },
  exit: { label: 'Exit', color: '#ef4444', icon: 'DoorClosed' },
  info: { label: 'Information', color: '#3b82f6', icon: 'Info' },
  food: { label: 'Food & Drinks', color: '#f97316', icon: 'UtensilsCrossed' },
  elevator: { label: 'Elevator', color: '#eab308', icon: 'ArrowUpDown' },
  stairs: { label: 'Stairs', color: '#64748b', icon: 'Footprints' },
  'first-aid': { label: 'First Aid', color: '#dc2626', icon: 'Cross' },
  kiosk: { label: 'You Are Here', color: '#ec4899', icon: 'MapPinned' },
};
