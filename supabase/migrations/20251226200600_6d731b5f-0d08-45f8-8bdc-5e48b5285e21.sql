-- Create ENUM for marker categories
CREATE TYPE marker_category AS ENUM ('stand', 'toilet', 'entrance', 'exit', 'info', 'food', 'elevator', 'stairs', 'first-aid', 'kiosk');

-- Create halls table
CREATE TABLE public.halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1200,
  height INTEGER NOT NULL DEFAULT 800,
  background_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hall translations table
CREATE TABLE public.hall_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  UNIQUE(hall_id, language_code)
);

-- Create markers table
CREATE TABLE public.markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category marker_category NOT NULL DEFAULT 'stand',
  x NUMERIC NOT NULL DEFAULT 0,
  y NUMERIC NOT NULL DEFAULT 0,
  width NUMERIC NOT NULL DEFAULT 100,
  height NUMERIC NOT NULL DEFAULT 60,
  image_url TEXT,
  stand_number TEXT,
  floor INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marker translations table
CREATE TABLE public.marker_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id UUID NOT NULL REFERENCES public.markers(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  description TEXT,
  UNIQUE(marker_id, language_code)
);

-- Create navigation nodes table
CREATE TABLE public.navigation_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  x NUMERIC NOT NULL DEFAULT 0,
  y NUMERIC NOT NULL DEFAULT 0,
  connections TEXT[] DEFAULT '{}',
  is_entry_point BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 5,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app settings table
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inactivity_timeout_seconds INTEGER DEFAULT 30,
  supported_languages TEXT[] DEFAULT ARRAY['en', 'pl'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marker_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create public read policies (for the map display)
CREATE POLICY "Public read access" ON public.halls FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.hall_translations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.markers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.marker_translations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.navigation_nodes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.advertisements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.app_settings FOR SELECT USING (true);

-- Create public write policies (for admin functionality - can be secured later with auth)
CREATE POLICY "Public write access" ON public.halls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write access" ON public.hall_translations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write access" ON public.markers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write access" ON public.marker_translations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write access" ON public.navigation_nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write access" ON public.advertisements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write access" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_halls_updated_at
  BEFORE UPDATE ON public.halls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_markers_updated_at
  BEFORE UPDATE ON public.markers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('marker-images', 'marker-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('hall-backgrounds', 'hall-backgrounds', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('advertisements', 'advertisements', true);

-- Create storage policies for public read
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('marker-images', 'hall-backgrounds', 'advertisements'));

-- Create storage policies for public upload/update/delete (can be secured with auth later)
CREATE POLICY "Public upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('marker-images', 'hall-backgrounds', 'advertisements'));
CREATE POLICY "Public update access" ON storage.objects FOR UPDATE USING (bucket_id IN ('marker-images', 'hall-backgrounds', 'advertisements'));
CREATE POLICY "Public delete access" ON storage.objects FOR DELETE USING (bucket_id IN ('marker-images', 'hall-backgrounds', 'advertisements'));

-- Insert default app settings
INSERT INTO public.app_settings (inactivity_timeout_seconds, supported_languages) VALUES (30, ARRAY['en', 'pl']);

-- Insert sample hall
INSERT INTO public.halls (id, name, width, height) VALUES ('00000000-0000-0000-0000-000000000001', 'Main Hall', 1200, 800);

-- Insert sample hall translations
INSERT INTO public.hall_translations (hall_id, language_code, name) VALUES 
('00000000-0000-0000-0000-000000000001', 'en', 'Main Hall'),
('00000000-0000-0000-0000-000000000001', 'pl', 'Hala Główna');

-- Insert sample markers
INSERT INTO public.markers (id, hall_id, name, description, category, x, y, width, height, stand_number) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Information Desk', 'Main information point', 'info', 100, 100, 120, 80, NULL),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Tech Company A', 'Technology solutions', 'stand', 250, 150, 100, 60, 'A1'),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Main Entrance', 'Main entrance to the hall', 'entrance', 50, 400, 80, 100, NULL),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Restrooms', 'Public restrooms', 'toilet', 900, 50, 100, 80, NULL),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'You Are Here', 'Current location', 'kiosk', 500, 400, 60, 60, NULL);

-- Insert sample marker translations
INSERT INTO public.marker_translations (marker_id, language_code, name, description) VALUES
('00000000-0000-0000-0001-000000000001', 'en', 'Information Desk', 'Main information point'),
('00000000-0000-0000-0001-000000000001', 'pl', 'Punkt Informacyjny', 'Główny punkt informacyjny'),
('00000000-0000-0000-0001-000000000002', 'en', 'Tech Company A', 'Technology solutions'),
('00000000-0000-0000-0001-000000000002', 'pl', 'Firma Tech A', 'Rozwiązania technologiczne'),
('00000000-0000-0000-0001-000000000003', 'en', 'Main Entrance', 'Main entrance to the hall'),
('00000000-0000-0000-0001-000000000003', 'pl', 'Wejście Główne', 'Główne wejście do hali'),
('00000000-0000-0000-0001-000000000004', 'en', 'Restrooms', 'Public restrooms'),
('00000000-0000-0000-0001-000000000004', 'pl', 'Toalety', 'Toalety publiczne'),
('00000000-0000-0000-0001-000000000005', 'en', 'You Are Here', 'Current location'),
('00000000-0000-0000-0001-000000000005', 'pl', 'Tu Jesteś', 'Obecna lokalizacja');

-- Insert sample navigation nodes
INSERT INTO public.navigation_nodes (id, hall_id, x, y, connections, is_entry_point) VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 100, 400, ARRAY['00000000-0000-0000-0002-000000000002'], true),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 300, 400, ARRAY['00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000003'], false),
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 500, 400, ARRAY['00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000004'], false),
('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 500, 200, ARRAY['00000000-0000-0000-0002-000000000003'], false);