import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMapStore } from '@/store/mapStore';
import { MapMarker, MarkerCategory, categoryConfig } from '@/types/map';
import { toast } from 'sonner';

const AdminMarkerList: React.FC = () => {
  const { floorPlan, addMarker, updateMarker, deleteMarker } = useMapStore();
  const [editingMarker, setEditingMarker] = useState<MapMarker | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMarker, setNewMarker] = useState<Partial<MapMarker>>({
    name: '',
    description: '',
    category: 'stand',
    x: 100,
    y: 100,
    width: 100,
    height: 80,
    standNumber: '',
  });

  const handleAddMarker = () => {
    if (!newMarker.name || !newMarker.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const marker: MapMarker = {
      id: `marker-${Date.now()}`,
      name: newMarker.name,
      description: newMarker.description,
      category: newMarker.category as MarkerCategory,
      x: newMarker.x || 100,
      y: newMarker.y || 100,
      width: newMarker.width || 100,
      height: newMarker.height || 80,
      standNumber: newMarker.standNumber,
    };

    addMarker(marker);
    setIsAddDialogOpen(false);
    setNewMarker({
      name: '',
      description: '',
      category: 'stand',
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      standNumber: '',
    });
    toast.success('Marker added successfully');
  };

  const handleUpdateMarker = () => {
    if (!editingMarker) return;
    updateMarker(editingMarker.id, editingMarker);
    setEditingMarker(null);
    toast.success('Marker updated successfully');
  };

  const handleDeleteMarker = (id: string) => {
    deleteMarker(id);
    toast.success('Marker deleted successfully');
  };

  return (
    <div className="space-y-6">
      {/* Add New Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14 text-lg bg-gradient-primary text-primary-foreground rounded-xl">
            <Plus className="h-5 w-5 mr-2" />
            Add New Marker
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Add New Marker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name *</label>
                <Input
                  value={newMarker.name}
                  onChange={(e) => setNewMarker({ ...newMarker, name: e.target.value })}
                  placeholder="Enter name"
                  className="mt-1 h-12 bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stand Number</label>
                <Input
                  value={newMarker.standNumber}
                  onChange={(e) => setNewMarker({ ...newMarker, standNumber: e.target.value })}
                  placeholder="e.g., A1"
                  className="mt-1 h-12 bg-secondary border-border"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category *</label>
              <Select
                value={newMarker.category}
                onValueChange={(value) => setNewMarker({ ...newMarker, category: value as MarkerCategory })}
              >
                <SelectTrigger className="mt-1 h-12 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(Object.keys(categoryConfig) as MarkerCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryConfig[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description *</label>
              <Textarea
                value={newMarker.description}
                onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
                placeholder="Enter description"
                className="mt-1 bg-secondary border-border min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">X</label>
                <Input
                  type="number"
                  value={newMarker.x}
                  onChange={(e) => setNewMarker({ ...newMarker, x: parseInt(e.target.value) })}
                  className="mt-1 h-12 bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Y</label>
                <Input
                  type="number"
                  value={newMarker.y}
                  onChange={(e) => setNewMarker({ ...newMarker, y: parseInt(e.target.value) })}
                  className="mt-1 h-12 bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Width</label>
                <Input
                  type="number"
                  value={newMarker.width}
                  onChange={(e) => setNewMarker({ ...newMarker, width: parseInt(e.target.value) })}
                  className="mt-1 h-12 bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Height</label>
                <Input
                  type="number"
                  value={newMarker.height}
                  onChange={(e) => setNewMarker({ ...newMarker, height: parseInt(e.target.value) })}
                  className="mt-1 h-12 bg-secondary border-border"
                />
              </div>
            </div>
            <Button
              onClick={handleAddMarker}
              className="w-full h-12 bg-gradient-primary text-primary-foreground rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Marker
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Markers List */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {floorPlan.markers.map((marker) => {
          const config = categoryConfig[marker.category];
          const isEditing = editingMarker?.id === marker.id;

          return (
            <Card 
              key={marker.id} 
              className="bg-card border-border hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={editingMarker.name}
                        onChange={(e) => setEditingMarker({ ...editingMarker, name: e.target.value })}
                        placeholder="Name"
                        className="h-10 bg-secondary border-border"
                      />
                      <Input
                        value={editingMarker.standNumber || ''}
                        onChange={(e) => setEditingMarker({ ...editingMarker, standNumber: e.target.value })}
                        placeholder="Stand Number"
                        className="h-10 bg-secondary border-border"
                      />
                    </div>
                    <Textarea
                      value={editingMarker.description}
                      onChange={(e) => setEditingMarker({ ...editingMarker, description: e.target.value })}
                      placeholder="Description"
                      className="bg-secondary border-border min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateMarker}
                        className="bg-success text-foreground hover:bg-success/80"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingMarker(null)}
                        className="border-border"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ 
                          backgroundColor: `${config.color}25`,
                          color: config.color 
                        }}
                      >
                        {marker.standNumber || marker.category.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{marker.name}</h4>
                        <p className="text-sm text-muted-foreground">{config.label}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingMarker(marker)}
                        className="h-10 w-10 hover:bg-secondary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteMarker(marker.id)}
                        className="h-10 w-10 hover:bg-destructive/20 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMarkerList;
