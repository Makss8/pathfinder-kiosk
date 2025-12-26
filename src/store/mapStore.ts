import { create } from 'zustand';
import { MapMarker, FloorPlan } from '@/types/map';

// Sample data for demo
const sampleMarkers: MapMarker[] = [
  { id: '1', name: 'TechCorp', description: 'Leading technology solutions provider showcasing AI and ML innovations.', category: 'stand', x: 150, y: 200, width: 100, height: 80, standNumber: 'A1' },
  { id: '2', name: 'InnovateLabs', description: 'Startup incubator presenting groundbreaking IoT devices.', category: 'stand', x: 300, y: 200, width: 100, height: 80, standNumber: 'A2' },
  { id: '3', name: 'GreenEnergy Co', description: 'Sustainable energy solutions for modern enterprises.', category: 'stand', x: 450, y: 200, width: 100, height: 80, standNumber: 'A3' },
  { id: '4', name: 'DigitalWave', description: 'Digital transformation consulting and cloud services.', category: 'stand', x: 600, y: 200, width: 100, height: 80, standNumber: 'A4' },
  { id: '5', name: 'SmartHome Inc', description: 'Home automation and smart living solutions.', category: 'stand', x: 150, y: 350, width: 100, height: 80, standNumber: 'B1' },
  { id: '6', name: 'CyberSecure', description: 'Enterprise cybersecurity and data protection services.', category: 'stand', x: 300, y: 350, width: 100, height: 80, standNumber: 'B2' },
  { id: '7', name: 'MediTech', description: 'Medical technology and healthcare innovations.', category: 'stand', x: 450, y: 350, width: 100, height: 80, standNumber: 'B3' },
  { id: '8', name: 'EduPlatform', description: 'E-learning and educational technology solutions.', category: 'stand', x: 600, y: 350, width: 100, height: 80, standNumber: 'B4' },
  { id: '9', name: 'Restrooms A', description: 'Public restrooms with wheelchair accessibility.', category: 'toilet', x: 750, y: 150, width: 60, height: 50 },
  { id: '10', name: 'Restrooms B', description: 'Public restrooms near food court.', category: 'toilet', x: 750, y: 400, width: 60, height: 50 },
  { id: '11', name: 'Main Entrance', description: 'Main entrance from parking area.', category: 'entrance', x: 50, y: 280, width: 40, height: 60 },
  { id: '12', name: 'South Exit', description: 'Emergency exit to south parking.', category: 'exit', x: 820, y: 280, width: 40, height: 60 },
  { id: '13', name: 'Information Desk', description: 'Get maps, schedules, and assistance.', category: 'info', x: 120, y: 280, width: 50, height: 50 },
  { id: '14', name: 'Food Court', description: 'Various food options and refreshments available.', category: 'food', x: 450, y: 480, width: 120, height: 60 },
  { id: '15', name: 'First Aid Station', description: 'Medical assistance and first aid services.', category: 'first-aid', x: 750, y: 280, width: 50, height: 50 },
];

const sampleFloorPlan: FloorPlan = {
  id: 'main-hall',
  name: 'Exhibition Hall - Main Floor',
  width: 900,
  height: 600,
  markers: sampleMarkers,
};

interface MapState {
  floorPlan: FloorPlan;
  selectedMarker: MapMarker | null;
  searchQuery: string;
  activeCategories: string[];
  isAdminMode: boolean;
  setFloorPlan: (floorPlan: FloorPlan) => void;
  setSelectedMarker: (marker: MapMarker | null) => void;
  setSearchQuery: (query: string) => void;
  toggleCategory: (category: string) => void;
  setActiveCategories: (categories: string[]) => void;
  setAdminMode: (isAdmin: boolean) => void;
  addMarker: (marker: MapMarker) => void;
  updateMarker: (id: string, updates: Partial<MapMarker>) => void;
  deleteMarker: (id: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  floorPlan: sampleFloorPlan,
  selectedMarker: null,
  searchQuery: '',
  activeCategories: ['stand', 'toilet', 'entrance', 'exit', 'info', 'food', 'elevator', 'stairs', 'first-aid'],
  isAdminMode: false,
  setFloorPlan: (floorPlan) => set({ floorPlan }),
  setSelectedMarker: (marker) => set({ selectedMarker: marker }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleCategory: (category) =>
    set((state) => ({
      activeCategories: state.activeCategories.includes(category)
        ? state.activeCategories.filter((c) => c !== category)
        : [...state.activeCategories, category],
    })),
  setActiveCategories: (categories) => set({ activeCategories: categories }),
  setAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),
  addMarker: (marker) =>
    set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        markers: [...state.floorPlan.markers, marker],
      },
    })),
  updateMarker: (id, updates) =>
    set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        markers: state.floorPlan.markers.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      },
    })),
  deleteMarker: (id) =>
    set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        markers: state.floorPlan.markers.filter((m) => m.id !== id),
      },
      selectedMarker: state.selectedMarker?.id === id ? null : state.selectedMarker,
    })),
}));
