import React, { useState, useRef } from 'react';
import { Plus, Trash2, Clock, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Advertisement } from '@/types/map';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import { Label } from '@/components/ui/label';
import { useAdvertisements, useAppSettings } from '@/hooks/useSupabaseData';
import { 
  useCreateAdvertisement, 
  useUpdateAdvertisement, 
  useDeleteAdvertisement, 
  useUpdateAppSettings,
  useUploadImage 
} from '@/hooks/useSupabaseMutations';

const AdvertisementsManager: React.FC = () => {
  const { t } = useLanguage();
  const { data: advertisements = [] } = useAdvertisements();
  const { data: appSettings } = useAppSettings();
  const createAd = useCreateAdvertisement();
  const updateAd = useUpdateAdvertisement();
  const deleteAd = useDeleteAdvertisement();
  const updateSettings = useUpdateAppSettings();
  const uploadImage = useUploadImage();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newAd, setNewAd] = useState<Partial<Advertisement>>({
    imageUrl: '',
    duration: 5,
    active: true,
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const path = `ads/${Date.now()}-${file.name}`;
      const url = await uploadImage.mutateAsync({
        bucket: 'advertisements',
        file,
        path,
      });
      setNewAd(prev => ({ ...prev, imageUrl: url }));
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
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      handleImageUpload(file);
    }
  };

  const handleAddAd = async () => {
    if (!newAd.imageUrl) {
      toast.error(t('msg.fillRequired'));
      return;
    }

    try {
      await createAd.mutateAsync({
        imageUrl: newAd.imageUrl,
        duration: newAd.duration || 5,
        active: newAd.active ?? true,
      });

      setIsAddDialogOpen(false);
      setNewAd({ imageUrl: '', duration: 5, active: true });
      toast.success(t('msg.saved'));
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await deleteAd.mutateAsync(id);
      toast.success(t('msg.deleted'));
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await updateAd.mutateAsync({ id, updates: { active } });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdateTimeout = async (seconds: number) => {
    try {
      await updateSettings.mutateAsync({ inactivityTimeout: seconds });
    } catch (error) {
      // Error handled by mutation
    }
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
              value={appSettings?.inactivityTimeout || 30}
              onChange={(e) => handleUpdateTimeout(parseInt(e.target.value) || 30)}
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
            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Image *</label>
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
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Input
                  value={newAd.imageUrl}
                  onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                  placeholder="Or enter image URL"
                  className="h-12 bg-secondary border-border"
                />
              </div>
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
              disabled={createAd.isPending}
              className="w-full h-12 bg-gradient-primary text-primary-foreground rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              {createAd.isPending ? 'Adding...' : t('ads.add')}
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
                    disabled={deleteAd.isPending}
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
