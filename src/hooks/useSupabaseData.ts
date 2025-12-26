import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Hall, MapMarker, NavigationNode, Advertisement, MarkerCategory } from '@/types/map';

// Database types
interface DbHall {
  id: string;
  name: string;
  width: number;
  height: number;
  background_image_url: string | null;
}

interface DbHallTranslation {
  hall_id: string;
  language_code: string;
  name: string | null;
}

interface DbMarker {
  id: string;
  hall_id: string;
  name: string;
  description: string | null;
  category: MarkerCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  image_url: string | null;
  stand_number: string | null;
  floor: number | null;
}

interface DbMarkerTranslation {
  marker_id: string;
  language_code: string;
  name: string | null;
  description: string | null;
}

interface DbNavigationNode {
  id: string;
  hall_id: string;
  x: number;
  y: number;
  connections: string[] | null;
  is_entry_point: boolean | null;
}

interface DbAdvertisement {
  id: string;
  image_url: string;
  duration_seconds: number;
  active: boolean | null;
}

interface DbAppSettings {
  id: string;
  inactivity_timeout_seconds: number | null;
  supported_languages: string[] | null;
}

// Fetch all halls with translations
export const useHalls = () => {
  return useQuery({
    queryKey: ['halls'],
    queryFn: async (): Promise<Hall[]> => {
      const { data: halls, error: hallsError } = await supabase
        .from('halls')
        .select('*');

      if (hallsError) throw hallsError;

      const { data: translations, error: transError } = await supabase
        .from('hall_translations')
        .select('*');

      if (transError) throw transError;

      return (halls as DbHall[]).map((hall) => {
        const hallTranslations = (translations as DbHallTranslation[]).filter(
          (t) => t.hall_id === hall.id
        );
        
        const translationsObj: Record<string, { name?: string }> = {};
        hallTranslations.forEach((t) => {
          if (t.name) {
            translationsObj[t.language_code] = { name: t.name };
          }
        });

        return {
          id: hall.id,
          name: hall.name,
          width: hall.width,
          height: hall.height,
          backgroundImage: hall.background_image_url || undefined,
          translations: Object.keys(translationsObj).length > 0 ? translationsObj : undefined,
        };
      });
    },
  });
};

// Fetch markers for a specific hall or all markers
export const useMarkers = (hallId?: string) => {
  return useQuery({
    queryKey: ['markers', hallId],
    queryFn: async (): Promise<MapMarker[]> => {
      let query = supabase.from('markers').select('*');
      if (hallId) {
        query = query.eq('hall_id', hallId);
      }

      const { data: markers, error: markersError } = await query;
      if (markersError) throw markersError;

      const { data: translations, error: transError } = await supabase
        .from('marker_translations')
        .select('*');

      if (transError) throw transError;

      return (markers as DbMarker[]).map((marker) => {
        const markerTranslations = (translations as DbMarkerTranslation[]).filter(
          (t) => t.marker_id === marker.id
        );

        const translationsObj: Record<string, { name?: string; description?: string }> = {};
        markerTranslations.forEach((t) => {
          translationsObj[t.language_code] = {
            name: t.name || undefined,
            description: t.description || undefined,
          };
        });

        return {
          id: marker.id,
          name: marker.name,
          description: marker.description || '',
          category: marker.category,
          x: Number(marker.x),
          y: Number(marker.y),
          width: Number(marker.width),
          height: Number(marker.height),
          imageUrl: marker.image_url || undefined,
          standNumber: marker.stand_number || undefined,
          floor: marker.floor || undefined,
          hallId: marker.hall_id,
          translations: Object.keys(translationsObj).length > 0 ? translationsObj : undefined,
        };
      });
    },
  });
};

// Fetch navigation nodes
export const useNavigationNodes = (hallId?: string) => {
  return useQuery({
    queryKey: ['navigation_nodes', hallId],
    queryFn: async (): Promise<NavigationNode[]> => {
      let query = supabase.from('navigation_nodes').select('*');
      if (hallId) {
        query = query.eq('hall_id', hallId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as DbNavigationNode[]).map((node) => ({
        id: node.id,
        x: Number(node.x),
        y: Number(node.y),
        connections: node.connections || [],
        hallId: node.hall_id,
        isEntryPoint: node.is_entry_point || false,
      }));
    },
  });
};

// Fetch advertisements
export const useAdvertisements = () => {
  return useQuery({
    queryKey: ['advertisements'],
    queryFn: async (): Promise<Advertisement[]> => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data as DbAdvertisement[]).map((ad) => ({
        id: ad.id,
        imageUrl: ad.image_url,
        duration: ad.duration_seconds,
        active: ad.active ?? true,
      }));
    },
  });
};

// Fetch app settings
export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const settings = data as DbAppSettings | null;
      return {
        inactivityTimeout: settings?.inactivity_timeout_seconds || 30,
        supportedLanguages: settings?.supported_languages || ['en', 'pl'],
      };
    },
  });
};
