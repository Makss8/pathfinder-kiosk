import React, { useState } from 'react';
import { Plus, Trash2, Image, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useMapStore } from '@/store/mapStore';
import { Advertisement } from '@/types/map';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import { Label } from '@/components/ui/label';

const AdvertisementsManager: React.FC = () => {
  const { 
    advertisements, 
    addAdvertisement, 
    updateAdvertisement, 
    deleteAdvertisement,
    inactivityTimeout,
    setInactivityTimeout,
  } = useMapStore();
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAd, setNewAd] = useState<Partial<Advertisement>>({
    imageUrl: '',
    duration: 5,
    active: true,
  });

  const handleAddAd = () => {
    if (!newAd.imageUrl) {
      toast.error(t('msg.fillRequired'));
      return;
    }

    const ad: Advertisement = {
      id: `ad-${Date.now()}`,
      imageUrl: newAd.imageUrl,
      duration: newAd.duration || 5,
      active: newAd.active ?? true,
    };

    addAdvertisement(ad);
    setIsAddDialogOpen(false);
    setNewAd({ imageUrl: '', duration: 5, active: true });
    toast.success(t('msg.saved'));
  };

  const handleDeleteAd = (id: string) => {
    deleteAdvertisement(id);
    toast.success(t('msg.deleted'));
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateAdvertisement(id, { active });
  };

  return (
    <div className="space-y-6">
      {/* Inactivity Timeout Setting */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{t('ads.inactivityTimeout')}</h4>
                <p className="text-sm text-muted-foreground">
                  Return to ads after this many seconds of inactivity
                </p>
              </div>
            </div>
            <Input
              type="number"
              value={inactivityTimeout}
              onChange={(e) => setInactivityTimeout(parseInt(e.target.value) || 30)}
              className="w-24 h-10 bg-secondary border-border text-center"
              min={5}
              max={300}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Advertisement */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14 text-lg bg-gradient-primary text-primary-foreground rounded-xl">
            <Plus className="h-5 w-5 mr-2" />
            {t('ads.add')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">{t('ads.add')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Image URL *</label>
              <Input
                value={newAd.imageUrl}
                onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="mt-1 h-12 bg-secondary border-border"
              />
            </div>
            {newAd.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                <img 
                  src={newAd.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x225?text=Invalid+URL')}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('ads.duration')}</label>
              <Input
                type="number"
                value={newAd.duration}
                onChange={(e) => setNewAd({ ...newAd, duration: parseInt(e.target.value) })}
                className="mt-1 h-12 bg-secondary border-border"
                min={1}
                max={60}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={newAd.active}
                onCheckedChange={(checked) => setNewAd({ ...newAd, active: checked })}
              />
              <Label htmlFor="active">{t('ads.active')}</Label>
            </div>
            <Button
              onClick={handleAddAd}
              className="w-full h-12 bg-gradient-primary text-primary-foreground rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('ads.add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advertisements List */}
      <div className="space-y-3">
        {advertisements.map((ad) => (
          <Card key={ad.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img 
                    src={ad.imageUrl} 
                    alt="Advertisement" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/128x80?text=Error')}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{ad.duration}s</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ad.active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {ad.active ? t('ads.active') : t('ads.inactive')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{ad.imageUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={ad.active}
                    onCheckedChange={(checked) => handleToggleActive(ad.id, checked)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteAd(ad.id)}
                    className="h-10 w-10 hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdvertisementsManager;
