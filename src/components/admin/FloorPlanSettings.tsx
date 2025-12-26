import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMapStore } from '@/store/mapStore';
import { toast } from 'sonner';

const FloorPlanSettings: React.FC = () => {
  const { floorPlan, setFloorPlan } = useMapStore();
  const [settings, setSettings] = React.useState({
    name: floorPlan.name,
    width: floorPlan.width,
    height: floorPlan.height,
  });

  const handleSave = () => {
    setFloorPlan({
      ...floorPlan,
      name: settings.name,
      width: settings.width,
      height: settings.height,
    });
    toast.success('Floor plan settings saved');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-display">Floor Plan Configuration</CardTitle>
          <CardDescription>Configure the floor plan dimensions and properties</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Floor Plan Name</label>
            <Input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="mt-1 h-12 bg-secondary border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Width (px)</label>
              <Input
                type="number"
                value={settings.width}
                onChange={(e) => setSettings({ ...settings, width: parseInt(e.target.value) })}
                className="mt-1 h-12 bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Height (px)</label>
              <Input
                type="number"
                value={settings.height}
                onChange={(e) => setSettings({ ...settings, height: parseInt(e.target.value) })}
                className="mt-1 h-12 bg-secondary border-border"
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="w-full h-12 bg-gradient-primary text-primary-foreground rounded-xl"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-display">Import/Export</CardTitle>
          <CardDescription>Backup or restore your floor plan data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-12 border-border"
            onClick={() => {
              const data = JSON.stringify(floorPlan, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'floor-plan.json';
              a.click();
              toast.success('Floor plan exported');
            }}
          >
            Export Floor Plan
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 border-border"
            onClick={() => toast.info('Import feature coming soon')}
          >
            Import Floor Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloorPlanSettings;
