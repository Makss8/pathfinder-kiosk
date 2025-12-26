import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMapStore } from '@/store/mapStore';
import { Hall } from '@/types/map';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import { useHalls } from '@/hooks/useSupabaseData';
import { useCreateHall, useUpdateHall, useDeleteHall } from '@/hooks/useSupabaseMutations';

const HallsManager: React.FC = () => {
  const { currentHallId, setCurrentHall } = useMapStore();
  const { t, language } = useLanguage();
  const { data: halls = [] } = useHalls();
  const createHall = useCreateHall();
  const updateHall = useUpdateHall();
  const deleteHall = useDeleteHall();

  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHall, setNewHall] = useState<Partial<Hall>>({
    name: '',
    width: 900,
    height: 600,
  });

  const handleAddHall = async () => {
    if (!newHall.name) {
      toast.error(t('msg.fillRequired'));
      return;
    }

    try {
      await createHall.mutateAsync({
        name: newHall.name,
        width: newHall.width || 900,
        height: newHall.height || 600,
      });

      setIsAddDialogOpen(false);
      setNewHall({ name: '', width: 900, height: 600 });
      toast.success(t('msg.saved'));
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdateHall = async () => {
    if (!editingHall) return;
    
    try {
      await updateHall.mutateAsync({
        id: editingHall.id,
        updates: editingHall,
      });
      setEditingHall(null);
      toast.success(t('msg.saved'));
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteHall = async (id: string) => {
    if (halls.length <= 1) {
      toast.error('Cannot delete the last hall');
      return;
    }

    try {
      await deleteHall.mutateAsync(id);
      toast.success(t('msg.deleted'));
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getHallName = (hall: Hall) => {
    if (language !== 'en' && hall.translations?.[language]?.name) {
      return hall.translations[language].name;
    }
    return hall.name;
  };

  return (
    <div className="space-y-6">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14 text-lg bg-gradient-primary text-primary-foreground rounded-xl">
            <Plus className="h-5 w-5 mr-2" />
            Add New Hall
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Add New Hall</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Hall Name *</label>
              <Input
                value={newHall.name}
                onChange={(e) => setNewHall({ ...newHall, name: e.target.value })}
                placeholder="Enter hall name"
                className="mt-1 h-12 bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Width (px)</label>
                <Input
                  type="number"
                  value={newHall.width}
                  onChange={(e) => setNewHall({ ...newHall, width: parseInt(e.target.value) })}
                  className="mt-1 h-12 bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Height (px)</label>
                <Input
                  type="number"
                  value={newHall.height}
                  onChange={(e) => setNewHall({ ...newHall, height: parseInt(e.target.value) })}
                  className="mt-1 h-12 bg-secondary border-border"
                />
              </div>
            </div>
            <Button
              onClick={handleAddHall}
              disabled={createHall.isPending}
              className="w-full h-12 bg-gradient-primary text-primary-foreground rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              {createHall.isPending ? 'Adding...' : 'Add Hall'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {halls.map((hall) => {
          const isEditing = editingHall?.id === hall.id;
          const isActive = currentHallId === hall.id;

          return (
            <Card
              key={hall.id}
              className={`bg-card border-border hover:border-primary/50 transition-colors cursor-pointer ${
                isActive ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => !isEditing && setCurrentHall(hall.id)}
            >
              <CardContent className="p-4">
                {isEditing ? (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editingHall.name}
                      onChange={(e) => setEditingHall({ ...editingHall, name: e.target.value })}
                      placeholder="Hall name"
                      className="h-10 bg-secondary border-border"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        value={editingHall.width}
                        onChange={(e) => setEditingHall({ ...editingHall, width: parseInt(e.target.value) })}
                        placeholder="Width"
                        className="h-10 bg-secondary border-border"
                      />
                      <Input
                        type="number"
                        value={editingHall.height}
                        onChange={(e) => setEditingHall({ ...editingHall, height: parseInt(e.target.value) })}
                        placeholder="Height"
                        className="h-10 bg-secondary border-border"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateHall}
                        disabled={updateHall.isPending}
                        className="bg-success text-foreground hover:bg-success/80"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {updateHall.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingHall(null)}
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
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{getHallName(hall)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {hall.width} x {hall.height} px
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingHall(hall)}
                        className="h-10 w-10 hover:bg-secondary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteHall(hall.id)}
                        disabled={deleteHall.isPending || halls.length <= 1}
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

export default HallsManager;
