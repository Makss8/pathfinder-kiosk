import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Hall, MapMarker, NavigationNode, Advertisement, MarkerCategory } from '@/types/map';
import { toast } from 'sonner';

// Hall mutations
export const useCreateHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hall: Omit<Hall, 'id'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('halls')
        .insert({
          id: hall.id,
          name: hall.name,
          width: hall.width,
          height: hall.height,
          background_image_url: hall.backgroundImage || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add translations if provided
      if (hall.translations) {
        const translations = Object.entries(hall.translations).map(([lang, trans]) => ({
          hall_id: data.id,
          language_code: lang,
          name: trans.name || null,
        }));

        if (translations.length > 0) {
          const { error: transError } = await supabase
            .from('hall_translations')
            .insert(translations);
          if (transError) throw transError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
    },
    onError: (error) => {
      toast.error('Failed to create hall: ' + error.message);
    },
  });
};

export const useUpdateHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Hall> }) => {
      const { error } = await supabase
        .from('halls')
        .update({
          name: updates.name,
          width: updates.width,
          height: updates.height,
          background_image_url: updates.backgroundImage || null,
        })
        .eq('id', id);

      if (error) throw error;

      // Update translations
      if (updates.translations) {
        for (const [lang, trans] of Object.entries(updates.translations)) {
          const { error: upsertError } = await supabase
            .from('hall_translations')
            .upsert({
              hall_id: id,
              language_code: lang,
              name: trans.name || null,
            }, { onConflict: 'hall_id,language_code' });

          if (upsertError) throw upsertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
    },
    onError: (error) => {
      toast.error('Failed to update hall: ' + error.message);
    },
  });
};

export const useDeleteHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('halls').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      queryClient.invalidateQueries({ queryKey: ['markers'] });
      queryClient.invalidateQueries({ queryKey: ['navigation_nodes'] });
    },
    onError: (error) => {
      toast.error('Failed to delete hall: ' + error.message);
    },
  });
};

// Marker mutations
export const useCreateMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (marker: Omit<MapMarker, 'id'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('markers')
        .insert({
          id: marker.id,
          hall_id: marker.hallId,
          name: marker.name,
          description: marker.description || '',
          category: marker.category,
          x: marker.x,
          y: marker.y,
          width: marker.width,
          height: marker.height,
          image_url: marker.imageUrl || null,
          stand_number: marker.standNumber || null,
          floor: marker.floor || 1,
        })
        .select()
        .single();

      if (error) throw error;

      // Add translations
      if (marker.translations) {
        const translations = Object.entries(marker.translations).map(([lang, trans]) => ({
          marker_id: data.id,
          language_code: lang,
          name: trans.name || null,
          description: trans.description || null,
        }));

        if (translations.length > 0) {
          const { error: transError } = await supabase
            .from('marker_translations')
            .insert(translations);
          if (transError) throw transError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markers'] });
    },
    onError: (error) => {
      toast.error('Failed to create marker: ' + error.message);
    },
  });
};

export const useUpdateMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MapMarker> }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.x !== undefined) updateData.x = updates.x;
      if (updates.y !== undefined) updateData.y = updates.y;
      if (updates.width !== undefined) updateData.width = updates.width;
      if (updates.height !== undefined) updateData.height = updates.height;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.standNumber !== undefined) updateData.stand_number = updates.standNumber;
      if (updates.floor !== undefined) updateData.floor = updates.floor;
      if (updates.hallId !== undefined) updateData.hall_id = updates.hallId;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('markers')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
      }

      // Update translations
      if (updates.translations) {
        for (const [lang, trans] of Object.entries(updates.translations)) {
          const { error: upsertError } = await supabase
            .from('marker_translations')
            .upsert({
              marker_id: id,
              language_code: lang,
              name: trans.name || null,
              description: trans.description || null,
            }, { onConflict: 'marker_id,language_code' });

          if (upsertError) throw upsertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markers'] });
    },
    onError: (error) => {
      toast.error('Failed to update marker: ' + error.message);
    },
  });
};

export const useDeleteMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('markers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markers'] });
    },
    onError: (error) => {
      toast.error('Failed to delete marker: ' + error.message);
    },
  });
};

// Navigation node mutations
export const useCreateNavigationNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (node: Omit<NavigationNode, 'id'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('navigation_nodes')
        .insert({
          id: node.id,
          hall_id: node.hallId,
          x: node.x,
          y: node.y,
          connections: node.connections || [],
          is_entry_point: node.isEntryPoint || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_nodes'] });
    },
    onError: (error) => {
      toast.error('Failed to create navigation node: ' + error.message);
    },
  });
};

export const useUpdateNavigationNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NavigationNode> }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.x !== undefined) updateData.x = updates.x;
      if (updates.y !== undefined) updateData.y = updates.y;
      if (updates.connections !== undefined) updateData.connections = updates.connections;
      if (updates.isEntryPoint !== undefined) updateData.is_entry_point = updates.isEntryPoint;
      if (updates.hallId !== undefined) updateData.hall_id = updates.hallId;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('navigation_nodes')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_nodes'] });
    },
    onError: (error) => {
      toast.error('Failed to update navigation node: ' + error.message);
    },
  });
};

export const useDeleteNavigationNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, remove this node from other nodes' connections
      const { data: nodes } = await supabase
        .from('navigation_nodes')
        .select('id, connections');

      if (nodes) {
        for (const node of nodes) {
          if (node.connections?.includes(id)) {
            await supabase
              .from('navigation_nodes')
              .update({ connections: node.connections.filter((c: string) => c !== id) })
              .eq('id', node.id);
          }
        }
      }

      const { error } = await supabase.from('navigation_nodes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_nodes'] });
    },
    onError: (error) => {
      toast.error('Failed to delete navigation node: ' + error.message);
    },
  });
};

// Advertisement mutations
export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ad: Omit<Advertisement, 'id'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert({
          id: ad.id,
          image_url: ad.imageUrl,
          duration_seconds: ad.duration,
          active: ad.active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
    onError: (error) => {
      toast.error('Failed to create advertisement: ' + error.message);
    },
  });
};

export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Advertisement> }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.duration !== undefined) updateData.duration_seconds = updates.duration;
      if (updates.active !== undefined) updateData.active = updates.active;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('advertisements')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
    onError: (error) => {
      toast.error('Failed to update advertisement: ' + error.message);
    },
  });
};

export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('advertisements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
    onError: (error) => {
      toast.error('Failed to delete advertisement: ' + error.message);
    },
  });
};

// App settings mutations
export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { inactivityTimeout?: number; supportedLanguages?: string[] }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.inactivityTimeout !== undefined) {
        updateData.inactivity_timeout_seconds = updates.inactivityTimeout;
      }
      if (updates.supportedLanguages !== undefined) {
        updateData.supported_languages = updates.supportedLanguages;
      }

      // Get the first settings row
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('app_settings')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_settings')
          .insert({
            inactivity_timeout_seconds: updates.inactivityTimeout || 30,
            supported_languages: updates.supportedLanguages || ['en', 'pl'],
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });
};

// Image upload helper
export const useUploadImage = () => {
  return useMutation({
    mutationFn: async ({ 
      bucket, 
      file, 
      path 
    }: { 
      bucket: 'marker-images' | 'hall-backgrounds' | 'advertisements'; 
      file: File; 
      path: string;
    }) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    },
    onError: (error) => {
      toast.error('Failed to upload image: ' + error.message);
    },
  });
};
