import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMarkerList from '@/components/admin/AdminMarkerList';
import FloorPlanSettings from '@/components/admin/FloorPlanSettings';
import FloorMap from '@/components/map/FloorMap';
import { useMapStore } from '@/store/mapStore';
import { MapMarker } from '@/types/map';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('markers');
  const { setSelectedMarker } = useMapStore();

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Panel */}
        <div className="w-[450px] p-6 bg-card border-r border-border overflow-y-auto">
          <h1 className="text-3xl font-display font-bold text-foreground mb-6">
            {activeTab === 'markers' && 'Manage Markers'}
            {activeTab === 'floor-plan' && 'Floor Plan Settings'}
            {activeTab === 'settings' && 'App Settings'}
          </h1>
          
          {activeTab === 'markers' && <AdminMarkerList />}
          {activeTab === 'floor-plan' && <FloorPlanSettings />}
          {activeTab === 'settings' && (
            <div className="text-muted-foreground">
              <p>General settings coming soon...</p>
            </div>
          )}
        </div>

        {/* Map Preview */}
        <div className="flex-1 p-4 relative">
          <div className="absolute top-6 left-6 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-border z-10">
            <p className="text-sm font-medium text-foreground">
              Map Preview
            </p>
            <p className="text-xs text-muted-foreground">
              Click markers to select • Changes update in real-time
            </p>
          </div>
          <FloorMap onMarkerClick={handleMarkerClick} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
