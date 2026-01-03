-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'name', 'Traveler'), new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cover_image TEXT,
  total_budget DECIMAL(12, 2) DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- Public access via share token
CREATE POLICY "Anyone can view shared trips" ON public.trips
  FOR SELECT USING (is_public = true);

-- Create cities reference table
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cities" ON public.cities
  FOR SELECT USING (true);

-- Create trip_cities junction table
CREATE TABLE public.trip_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.cities(id),
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their trip cities" ON public.trip_cities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = trip_cities.trip_id 
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can manage their trip cities" ON public.trip_cities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = trip_cities.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their trip cities" ON public.trip_cities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = trip_cities.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their trip cities" ON public.trip_cities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = trip_cities.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_city_id UUID NOT NULL REFERENCES public.trip_cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  cost DECIMAL(10, 2) DEFAULT 0,
  category TEXT DEFAULT 'general',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_cities tc
      JOIN public.trips t ON t.id = tc.trip_id
      WHERE tc.id = activities.trip_city_id
      AND (t.user_id = auth.uid() OR t.is_public = true)
    )
  );

CREATE POLICY "Users can manage activities" ON public.activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_cities tc
      JOIN public.trips t ON t.id = tc.trip_id
      WHERE tc.id = activities.trip_city_id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activities" ON public.activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trip_cities tc
      JOIN public.trips t ON t.id = tc.trip_id
      WHERE tc.id = activities.trip_city_id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities" ON public.activities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trip_cities tc
      JOIN public.trips t ON t.id = tc.trip_id
      WHERE tc.id = activities.trip_city_id
      AND t.user_id = auth.uid()
    )
  );

-- Create costs table for tracking expenses
CREATE TABLE public.costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their costs" ON public.costs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = costs.trip_id 
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can manage their costs" ON public.costs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = costs.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their costs" ON public.costs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = costs.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their costs" ON public.costs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = costs.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_cities_updated_at BEFORE UPDATE ON public.trip_cities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some popular cities as reference data
INSERT INTO public.cities (name, country, description, latitude, longitude) VALUES
  ('Paris', 'France', 'The City of Light, known for the Eiffel Tower and world-class cuisine', 48.8566, 2.3522),
  ('Tokyo', 'Japan', 'A vibrant blend of traditional culture and cutting-edge technology', 35.6762, 139.6503),
  ('New York', 'United States', 'The city that never sleeps, home to iconic landmarks and diverse cultures', 40.7128, -74.0060),
  ('London', 'United Kingdom', 'Historic city with royal palaces, world-class museums, and theater', 51.5074, -0.1278),
  ('Rome', 'Italy', 'Eternal city filled with ancient ruins, art, and incredible food', 41.9028, 12.4964),
  ('Barcelona', 'Spain', 'Stunning architecture, beaches, and vibrant nightlife', 41.3851, 2.1734),
  ('Sydney', 'Australia', 'Beautiful harbor city with iconic Opera House and beaches', -33.8688, 151.2093),
  ('Dubai', 'UAE', 'Futuristic cityscape with luxury shopping and desert adventures', 25.2048, 55.2708),
  ('Singapore', 'Singapore', 'Garden city with stunning skyline and diverse food scene', 1.3521, 103.8198),
  ('Amsterdam', 'Netherlands', 'Canal-lined city famous for art, cycling, and tulips', 52.3676, 4.9041),
  ('Bali', 'Indonesia', 'Tropical paradise with temples, rice terraces, and beaches', -8.3405, 115.0920),
  ('Cape Town', 'South Africa', 'Stunning coastal city with Table Mountain backdrop', -33.9249, 18.4241),
  ('Reykjavik', 'Iceland', 'Gateway to Northern Lights and dramatic landscapes', 64.1466, -21.9426),
  ('Kyoto', 'Japan', 'Ancient capital with thousands of temples and traditional gardens', 35.0116, 135.7681),
  ('Marrakech', 'Morocco', 'Exotic city with bustling souks and stunning riads', 31.6295, -7.9811);