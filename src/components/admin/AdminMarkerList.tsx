import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit, Save, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMapStore } from '@/store/mapStore';
import { MapMarker, MarkerCategory, categoryConfig } from '@/types/map';
import { toast } from 'sonner';
import { useMarkers } from '@/hooks/useSupabaseData';
import { useCreateMarker, useUpdateMarker, useDeleteMarker, useUploadImage } from '@/hooks/useSupabaseMutations';

const AdminMarkerList: React.FC = () => {
  const { currentHallId } = useMapStore();
  const { data: markers = [] } = useMarkers();
  const createMarker = useCreateMarker();
  const updateMarker = useUpdateMarker();
  const deleteMarker = useDeleteMarker();
  const uploadImage = useUploadImage();

  const [editingMarker, setEditingMarker] = useState<MapMarker | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMarker, setNewMarker] = useState<Partial<MapMarker>>({
    name: '',
    description: '',
    category: 'stand',
    x: 100,
    y: 100,
    width: 100,
    height: 80,
    standNumber: '',
    imageUrl: '',
  });

  const hallMarkers = markers.filter(m => m.hallId === currentHallId);
  const kioskExists = hallMarkers.some(m => m.category === 'kiosk');

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const path = `markers/${Date.now()}-${file.name}`;
      const url = await uploadImage.mutateAsync({
        bucket: 'marker-images',
        file,
        path,
      });
      setNewMarker(prev => ({ ...prev, imageUrl: url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      handleImageUpload(file);
    }
  };

  const handleAddMarker = async () => {
    if (!newMarker.name || !newMarker.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newMarker.category === 'kiosk' && kioskExists) {
      toast.error('Only one "You Are Here" kiosk point is allowed per hall. Delete the existing one first.');
      return;
    }

    try {
      await createMarker.mutateAsync({
        name: newMarker.name,
        description: newMarker.description || '',
        category: newMarker.category as MarkerCategory,
        x: newMarker.x || 100,
        y: newMarker.y || 100,
        width: newMarker.category === 'kiosk' ? 60 : (newMarker.width || 100),
        height: newMarker.category === 'kiosk' ? 60 : (newMarker.height || 80),
        standNumber: newMarker.standNumber,
        imageUrl: newMarker.imageUrl,
        hallId: currentHallId,
      });

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
        imageUrl: '',
      });
      toast.success('Marker added successfully');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdateMarker = async () => {
    if (!editingMarker) return;
    
    try {
      await updateMarker.mutateAsync({
        id: editingMarker.id,
        updates: editingMarker,
      });
      setEditingMarker(null);
      toast.success('Marker updated successfully');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteMarker = async (id: string) => {
    try {
      await deleteMarker.mutateAsync(id);
      toast.success('Marker deleted successfully');
    } catch (error) {
      // Error handled by mutation
    }
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
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
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
            
            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Photo</label>
              <div className="mt-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-12 border-dashed border-2"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <Input
                  value={newMarker.imageUrl}
                  onChange={(e) => setNewMarker({ ...newMarker, imageUrl: e.target.value })}
                  placeholder="Or enter image URL"
                  className="h-12 bg-secondary border-border"
                />
                {newMarker.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                    <img 
                      src={newMarker.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x225?text=Invalid+URL')}
                    />
                  </div>
                )}
              </div>
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
              disabled={createMarker.isPending}
              className="w-full h-12 bg-gradient-primary text-primary-foreground rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              {createMarker.isPending ? 'Adding...' : 'Add Marker'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Markers List */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {hallMarkers.map((marker) => {
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
                    <Input
                      value={editingMarker.imageUrl || ''}
                      onChange={(e) => setEditingMarker({ ...editingMarker, imageUrl: e.target.value })}
                      placeholder="Image URL"
                      className="h-10 bg-secondary border-border"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateMarker}
                        disabled={updateMarker.isPending}
                        className="bg-success text-foreground hover:bg-success/80"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {updateMarker.isPending ? 'Saving...' : 'Save'}
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
                        disabled={deleteMarker.isPending}
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
