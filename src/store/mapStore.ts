import { create } from 'zustand';
import { MapMarker, FloorPlan, NavigationNode, Hall, Advertisement } from '@/types/map';

// Sample data for demo
const sampleMarkers: MapMarker[] = [
  { id: '1', name: 'TechCorp', description: 'Leading technology solutions provider showcasing AI and ML innovations.', category: 'stand', x: 150, y: 200, width: 100, height: 80, standNumber: 'A1', hallId: 'hall-1', translations: { pl: { name: 'TechCorp', description: 'Wiodący dostawca rozwiązań technologicznych prezentujący innowacje AI i ML.' } } },
  { id: '2', name: 'InnovateLabs', description: 'Startup incubator presenting groundbreaking IoT devices.', category: 'stand', x: 300, y: 200, width: 100, height: 80, standNumber: 'A2', hallId: 'hall-1', translations: { pl: { name: 'InnovateLabs', description: 'Inkubator startupów prezentujący przełomowe urządzenia IoT.' } } },
  { id: '3', name: 'GreenEnergy Co', description: 'Sustainable energy solutions for modern enterprises.', category: 'stand', x: 450, y: 200, width: 100, height: 80, standNumber: 'A3', hallId: 'hall-1', translations: { pl: { name: 'GreenEnergy Co', description: 'Zrównoważone rozwiązania energetyczne dla nowoczesnych przedsiębiorstw.' } } },
  { id: '4', name: 'DigitalWave', description: 'Digital transformation consulting and cloud services.', category: 'stand', x: 600, y: 200, width: 100, height: 80, standNumber: 'A4', hallId: 'hall-1', translations: { pl: { name: 'DigitalWave', description: 'Konsulting transformacji cyfrowej i usługi chmurowe.' } } },
  { id: '5', name: 'SmartHome Inc', description: 'Home automation and smart living solutions.', category: 'stand', x: 150, y: 350, width: 100, height: 80, standNumber: 'B1', hallId: 'hall-1', translations: { pl: { name: 'SmartHome Inc', description: 'Automatyka domowa i inteligentne rozwiązania mieszkaniowe.' } } },
  { id: '6', name: 'CyberSecure', description: 'Enterprise cybersecurity and data protection services.', category: 'stand', x: 300, y: 350, width: 100, height: 80, standNumber: 'B2', hallId: 'hall-1', translations: { pl: { name: 'CyberSecure', description: 'Cyberbezpieczeństwo korporacyjne i usługi ochrony danych.' } } },
  { id: '7', name: 'MediTech', description: 'Medical technology and healthcare innovations.', category: 'stand', x: 450, y: 350, width: 100, height: 80, standNumber: 'B3', hallId: 'hall-1', translations: { pl: { name: 'MediTech', description: 'Technologia medyczna i innowacje w opiece zdrowotnej.' } } },
  { id: '8', name: 'EduPlatform', description: 'E-learning and educational technology solutions.', category: 'stand', x: 600, y: 350, width: 100, height: 80, standNumber: 'B4', hallId: 'hall-1', translations: { pl: { name: 'EduPlatform', description: 'E-learning i rozwiązania technologii edukacyjnej.' } } },
  { id: '9', name: 'Restrooms A', description: 'Public restrooms with wheelchair accessibility.', category: 'toilet', x: 750, y: 150, width: 60, height: 50, hallId: 'hall-1', translations: { pl: { name: 'Toalety A', description: 'Toalety publiczne z dostępem dla niepełnosprawnych.' } } },
  { id: '10', name: 'Restrooms B', description: 'Public restrooms near food court.', category: 'toilet', x: 750, y: 400, width: 60, height: 50, hallId: 'hall-1', translations: { pl: { name: 'Toalety B', description: 'Toalety publiczne przy strefie gastronomicznej.' } } },
  { id: '11', name: 'Main Entrance', description: 'Main entrance from parking area.', category: 'entrance', x: 50, y: 280, width: 40, height: 60, hallId: 'hall-1', translations: { pl: { name: 'Wejście Główne', description: 'Główne wejście od strony parkingu.' } } },
  { id: '12', name: 'South Exit', description: 'Emergency exit to south parking.', category: 'exit', x: 820, y: 280, width: 40, height: 60, hallId: 'hall-1', translations: { pl: { name: 'Wyjście Południowe', description: 'Wyjście ewakuacyjne na parking południowy.' } } },
  { id: '13', name: 'Information Desk', description: 'Get maps, schedules, and assistance.', category: 'info', x: 120, y: 280, width: 50, height: 50, hallId: 'hall-1', translations: { pl: { name: 'Punkt Informacyjny', description: 'Mapy, harmonogramy i pomoc.' } } },
  { id: '14', name: 'Food Court', description: 'Various food options and refreshments available.', category: 'food', x: 450, y: 480, width: 120, height: 60, hallId: 'hall-1', translations: { pl: { name: 'Strefa Gastronomiczna', description: 'Różnorodne opcje gastronomiczne i napoje.' } } },
  { id: '15', name: 'First Aid Station', description: 'Medical assistance and first aid services.', category: 'first-aid', x: 750, y: 280, width: 50, height: 50, hallId: 'hall-1', translations: { pl: { name: 'Punkt Pierwszej Pomocy', description: 'Pomoc medyczna i pierwsza pomoc.' } } },
];

const sampleHalls: Hall[] = [
  { id: 'hall-1', name: 'Hall A - Main Exhibition', width: 900, height: 600, translations: { pl: { name: 'Hala A - Główna Wystawa' } } },
  { id: 'hall-2', name: 'Hall B - Technology', width: 800, height: 500, translations: { pl: { name: 'Hala B - Technologia' } } },
];

const sampleNavigationNodes: NavigationNode[] = [
  { id: 'nav-1', x: 100, y: 280, connections: ['nav-2'], hallId: 'hall-1', isEntryPoint: true },
  { id: 'nav-2', x: 200, y: 280, connections: ['nav-1', 'nav-3', 'nav-5'], hallId: 'hall-1' },
  { id: 'nav-3', x: 350, y: 280, connections: ['nav-2', 'nav-4', 'nav-6'], hallId: 'hall-1' },
  { id: 'nav-4', x: 500, y: 280, connections: ['nav-3', 'nav-7'], hallId: 'hall-1' },
  { id: 'nav-5', x: 200, y: 200, connections: ['nav-2'], hallId: 'hall-1' },
  { id: 'nav-6', x: 350, y: 350, connections: ['nav-3'], hallId: 'hall-1' },
  { id: 'nav-7', x: 650, y: 280, connections: ['nav-4'], hallId: 'hall-1' },
];

const sampleAdvertisements: Advertisement[] = [
  { id: 'ad-1', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop', duration: 5, active: true },
  { id: 'ad-2', imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920&h=1080&fit=crop', duration: 5, active: true },
];

const sampleFloorPlan: FloorPlan = {
  id: 'main-hall',
  name: 'Exhibition Hall - Main Floor',
  width: 900,
  height: 600,
  markers: sampleMarkers,
  navigationNodes: sampleNavigationNodes,
  hallId: 'hall-1',
};

interface MapState {
  floorPlan: FloorPlan;
  halls: Hall[];
  currentHallId: string;
  selectedMarker: MapMarker | null;
  searchQuery: string;
  activeCategories: string[];
  isAdminMode: boolean;
  advertisements: Advertisement[];
  inactivityTimeout: number;
  showAds: boolean;
  navigationPath: string[];
  navigationTarget: MapMarker | null;
  editMode: 'select' | 'move' | 'navigation';
  
  // Actions
  setFloorPlan: (floorPlan: FloorPlan) => void;
  setSelectedMarker: (marker: MapMarker | null) => void;
  setSearchQuery: (query: string) => void;
  toggleCategory: (category: string) => void;
  setActiveCategories: (categories: string[]) => void;
  setAdminMode: (isAdmin: boolean) => void;
  addMarker: (marker: MapMarker) => void;
  updateMarker: (id: string, updates: Partial<MapMarker>) => void;
  deleteMarker: (id: string) => void;
  
  // Halls
  addHall: (hall: Hall) => void;
  updateHall: (id: string, updates: Partial<Hall>) => void;
  deleteHall: (id: string) => void;
  setCurrentHall: (hallId: string) => void;
  
  // Navigation nodes
  addNavigationNode: (node: NavigationNode) => void;
  updateNavigationNode: (id: string, updates: Partial<NavigationNode>) => void;
  deleteNavigationNode: (id: string) => void;
  connectNodes: (nodeId1: string, nodeId2: string) => void;
  
  // Advertisements
  addAdvertisement: (ad: Advertisement) => void;
  updateAdvertisement: (id: string, updates: Partial<Advertisement>) => void;
  deleteAdvertisement: (id: string) => void;
  setInactivityTimeout: (seconds: number) => void;
  setShowAds: (show: boolean) => void;
  
  // Navigation
  setNavigationTarget: (marker: MapMarker | null) => void;
  setNavigationPath: (path: string[]) => void;
  
  // Edit mode
  setEditMode: (mode: 'select' | 'move' | 'navigation') => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  floorPlan: sampleFloorPlan,
  halls: sampleHalls,
  currentHallId: 'hall-1',
  selectedMarker: null,
  searchQuery: '',
  activeCategories: ['stand', 'toilet', 'entrance', 'exit', 'info', 'food', 'elevator', 'stairs', 'first-aid', 'kiosk'],
  isAdminMode: false,
  advertisements: sampleAdvertisements,
  inactivityTimeout: 30,
  showAds: true,
  navigationPath: [],
  navigationTarget: null,
  editMode: 'select',
  
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
        markers: [...state.floorPlan.markers, { ...marker, hallId: state.currentHallId }],
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
    
  // Halls
  addHall: (hall) => set((state) => ({ halls: [...state.halls, hall] })),
  updateHall: (id, updates) =>
    set((state) => ({
      halls: state.halls.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    })),
  deleteHall: (id) =>
    set((state) => ({
      halls: state.halls.filter((h) => h.id !== id),
      currentHallId: state.currentHallId === id ? state.halls[0]?.id || '' : state.currentHallId,
    })),
  setCurrentHall: (hallId) => {
    const hall = get().halls.find((h) => h.id === hallId);
    if (hall) {
      set({
        currentHallId: hallId,
        floorPlan: {
          ...get().floorPlan,
          width: hall.width,
          height: hall.height,
          hallId: hallId,
          markers: get().floorPlan.markers.filter((m) => m.hallId === hallId),
        },
      });
    }
  },
  
  // Navigation nodes
  addNavigationNode: (node) =>
    set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        navigationNodes: [...state.floorPlan.navigationNodes, { ...node, hallId: state.currentHallId }],
      },
    })),
  updateNavigationNode: (id, updates) =>
    set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        navigationNodes: state.floorPlan.navigationNodes.map((n) =>
          n.id === id ? { ...n, ...updates } : n
        ),
      },
    })),
  deleteNavigationNode: (id) =>
    set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        navigationNodes: state.floorPlan.navigationNodes
          .filter((n) => n.id !== id)
          .map((n) => ({
            ...n,
            connections: n.connections.filter((c) => c !== id),
          })),
      },
    })),
  connectNodes: (nodeId1, nodeId2) =>
    set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        navigationNodes: state.floorPlan.navigationNodes.map((n) => {
          if (n.id === nodeId1 && !n.connections.includes(nodeId2)) {
            return { ...n, connections: [...n.connections, nodeId2] };
          }
          if (n.id === nodeId2 && !n.connections.includes(nodeId1)) {
            return { ...n, connections: [...n.connections, nodeId1] };
          }
          return n;
        }),
      },
    })),
    
  // Advertisements
  addAdvertisement: (ad) => set((state) => ({ advertisements: [...state.advertisements, ad] })),
  updateAdvertisement: (id, updates) =>
    set((state) => ({
      advertisements: state.advertisements.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  deleteAdvertisement: (id) =>
    set((state) => ({
      advertisements: state.advertisements.filter((a) => a.id !== id),
    })),
  setInactivityTimeout: (seconds) => set({ inactivityTimeout: seconds }),
  setShowAds: (show) => set({ showAds: show }),
  
  // Navigation
  setNavigationTarget: (marker) => set({ navigationTarget: marker }),
  setNavigationPath: (path) => set({ navigationPath: path }),
  
  // Edit mode
  setEditMode: (mode) => set({ editMode: mode }),
}));
