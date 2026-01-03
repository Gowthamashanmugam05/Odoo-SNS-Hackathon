import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { where, orderBy } from 'firebase/firestore';
import {
  addDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
} from '@/integrations/firebase/operations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  total_budget: number;
  is_public: boolean;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface TripCity {
  id: string;
  trip_id: string;
  city_id: string | null;
  city_name: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  order_index: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  trip_city_id: string;
  name: string;
  description: string | null;
  activity_date: string;
  start_time: string | null;
  end_time: string | null;
  cost: number;
  category: string;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  description: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

export const useTrips = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tripsQuery = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      const docs = await getDocuments('trips', [where('user_id', '==', user!.id), orderBy('start_date', 'asc')]);
      return docs as Trip[];
    },
    enabled: !!user,
  });

  const createTrip = useMutation({
    mutationFn: async (trip: Omit<Trip, 'id' | 'user_id' | 'share_token' | 'created_at' | 'updated_at'>) => {
      const id = await addDocument('trips', { ...trip, user_id: user!.id });
      const doc = await getDocument('trips', id);
      return doc as Trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({ title: 'Trip created!', description: 'Your adventure awaits.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateTrip = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Trip> & { id: string }) => {
      await updateDocument('trips', id, updates as Record<string, any>);
      const doc = await getDocument('trips', id);
      return doc as Trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({ title: 'Trip updated!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTrip = useMutation({
    mutationFn: async (id: string) => {
      await deleteDocument('trips', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({ title: 'Trip deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    trips: tripsQuery.data ?? [],
    isLoading: tripsQuery.isLoading,
    createTrip,
    updateTrip,
    deleteTrip,
  };
};

export const useTripDetails = (tripId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tripQuery = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const doc = await getDocument('trips', tripId!);
      return (doc as Trip) ?? null;
    },
    enabled: !!tripId,
  });

  const citiesQuery = useQuery({
    queryKey: ['trip-cities', tripId],
    queryFn: async () => {
      const docs = await getDocuments('trip_cities', [where('trip_id', '==', tripId!), orderBy('order_index', 'asc')]);
      return docs as TripCity[];
    },
    enabled: !!tripId,
  });

  const activitiesQuery = useQuery({
    queryKey: ['activities', tripId],
    queryFn: async () => {
      if (!citiesQuery.data?.length) return [];
      
      const cityIds = citiesQuery.data.map(c => c.id);
      const docs = await getDocuments('activities', [where('trip_city_id', 'in', cityIds), orderBy('activity_date', 'asc')]);
      return docs as Activity[];
    },
    enabled: !!citiesQuery.data?.length,
  });

  const addCity = useMutation({
    mutationFn: async (city: Omit<TripCity, 'id' | 'created_at' | 'updated_at'>) => {
      const id = await addDocument('trip_cities', city);
      const doc = await getDocument('trip_cities', id);
      return doc as TripCity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-cities', tripId] });
      toast({ title: 'City added!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateCity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TripCity> & { id: string }) => {
      await updateDocument('trip_cities', id, updates as Record<string, any>);
      const doc = await getDocument('trip_cities', id);
      return doc as TripCity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-cities', tripId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCity = useMutation({
    mutationFn: async (id: string) => {
      await deleteDocument('trip_cities', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-cities', tripId] });
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
      toast({ title: 'City removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addActivity = useMutation({
    mutationFn: async (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
      const id = await addDocument('activities', activity);
      const doc = await getDocument('activities', id);
      return doc as Activity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
      toast({ title: 'Activity added!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Activity> & { id: string }) => {
      await updateDocument('activities', id, updates as Record<string, any>);
      const doc = await getDocument('activities', id);
      return doc as Activity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      await deleteDocument('activities', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
      toast({ title: 'Activity removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const reorderCities = useMutation({
    mutationFn: async (cities: { id: string; order_index: number }[]) => {
      const updates = cities.map(({ id, order_index }) =>
        updateDocument('trip_cities', id, { order_index })
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-cities', tripId] });
    },
  });

  return {
    trip: tripQuery.data,
    cities: citiesQuery.data ?? [],
    activities: activitiesQuery.data ?? [],
    isLoading: tripQuery.isLoading || citiesQuery.isLoading,
    addCity,
    updateCity,
    deleteCity,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderCities,
  };
};

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const docs = await getDocuments('cities', [orderBy('name', 'asc')]);
      return docs as City[];
    },
  });
};
