import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMarkerList from '@/components/admin/AdminMarkerList';
import FloorPlanSettings from '@/components/admin/FloorPlanSettings';
import AdminFloorMap from '@/components/map/AdminFloorMap';
import HallsManager from '@/components/admin/HallsManager';
import AdvertisementsManager from '@/components/admin/AdvertisementsManager';
import { useMapStore } from '@/store/mapStore';
import { MapMarker } from '@/types/map';
import { Button } from '@/components/ui/button';
import { MousePointer2, Move, Route } from 'lucide-react';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('markers');
  const { setSelectedMarker, editMode, setEditMode } = useMapStore();

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex">
        <div className="w-[450px] p-6 bg-card border-r border-border overflow-y-auto">
          <h1 className="text-3xl font-display font-bold text-foreground mb-6">
            {activeTab === 'markers' && 'Manage Markers'}
            {activeTab === 'floor-plan' && 'Floor Plan Settings'}
            {activeTab === 'settings' && 'App Settings'}
            {activeTab === 'halls' && 'Manage Halls'}
            {activeTab === 'advertisements' && 'Advertisements'}
          </h1>
          
          {activeTab === 'markers' && <AdminMarkerList />}
          {activeTab === 'floor-plan' && <FloorPlanSettings />}
          {activeTab === 'halls' && <HallsManager />}
          {activeTab === 'advertisements' && <AdvertisementsManager />}
          {activeTab === 'settings' && (
            <div className="text-muted-foreground">
              <p>General settings coming soon...</p>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 relative">
          <div className="absolute top-6 left-6 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-border z-10">
            <p className="text-sm font-medium text-foreground">Map Preview</p>
            <p className="text-xs text-muted-foreground">
              {editMode === 'move' && 'Drag markers to move, handles to resize'}
              {editMode === 'select' && 'Pan & zoom the map'}
              {editMode === 'navigation' && 'Click to add nodes, click two to connect'}
            </p>
          </div>
          
          <div className="absolute top-6 right-6 flex gap-2 z-10">
            <Button
              size="sm"
              variant={editMode === 'select' ? 'default' : 'outline'}
              onClick={() => setEditMode('select')}
              className="gap-2"
            >
              <MousePointer2 className="h-4 w-4" />
              Select
            </Button>
            <Button
              size="sm"
              variant={editMode === 'move' ? 'default' : 'outline'}
              onClick={() => setEditMode('move')}
              className="gap-2"
            >
              <Move className="h-4 w-4" />
              Move/Resize
            </Button>
            <Button
              size="sm"
              variant={editMode === 'navigation' ? 'default' : 'outline'}
              onClick={() => setEditMode('navigation')}
              className="gap-2"
            >
              <Route className="h-4 w-4" />
              Navigation
            </Button>
          </div>
          
          <AdminFloorMap onMarkerClick={handleMarkerClick} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
