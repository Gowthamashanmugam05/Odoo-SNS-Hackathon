import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { Calendar, MapPin, Globe, Loader2, DollarSign, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const SharedTrip: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['shared-trip', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('share_token', token!)
        .eq('is_public', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['shared-trip-cities', trip?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_cities')
        .select('*')
        .eq('trip_id', trip!.id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!trip?.id,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['shared-trip-activities', cities],
    queryFn: async () => {
      if (!cities.length) return [];
      const cityIds = cities.map((c) => c.id);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .in('trip_city_id', cityIds)
        .order('activity_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: cities.length > 0,
  });

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied!',
      description: 'Share this link with others.',
    });
  };

  if (tripLoading) {
    return (
      <Layout showNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout showNav={false}>
        <div className="section-container py-16 text-center">
          <Globe className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Trip not found</h2>
          <p className="text-muted-foreground mb-6">
            This trip doesn't exist or is not publicly shared.
          </p>
          <Button asChild>
            <Link to="/">Go to GlobeTrotter</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const duration = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const totalCost = activities.reduce((sum, a) => sum + Number(a.cost || 0), 0);

  const getActivitiesForCity = (cityId: string) => {
    return activities.filter((a) => a.trip_city_id === cityId);
  };

  return (
    <Layout showNav={false}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold">
                Globe<span className="text-primary">Trotter</span>
              </span>
            </Link>
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </header>

      <div className="section-container py-24">
        {/* Trip Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary">
            <ExternalLink className="h-3 w-3 mr-1" />
            Shared Itinerary
          </Badge>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {trip.name}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
              </span>
            </div>
            <Badge variant="secondary">{duration} days</Badge>
            <Badge variant="secondary">
              <MapPin className="h-3 w-3 mr-1" />
              {cities.length} cities
            </Badge>
            {totalCost > 0 && (
              <Badge className="bg-palm/10 text-palm border-palm/20">
                <DollarSign className="h-3 w-3 mr-1" />
                ${totalCost.toLocaleString()} total
              </Badge>
            )}
          </div>
          
          {trip.description && (
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {trip.description}
            </p>
          )}
        </motion.div>

        {/* Cities & Activities */}
        <div className="space-y-8">
          {cities.map((city, index) => {
            const cityActivities = getActivitiesForCity(city.id);
            const cityCost = cityActivities.reduce((sum, a) => sum + Number(a.cost || 0), 0);
            
            return (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-travel overflow-hidden"
              >
                {/* City Header */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <MapPin className="h-4 w-4" />
                        {city.country}
                      </div>
                      <h2 className="font-display text-2xl font-semibold">
                        {city.city_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(city.arrival_date), 'MMM d')} - {format(new Date(city.departure_date), 'MMM d')}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {cityActivities.length} activities
                      </Badge>
                      {cityCost > 0 && (
                        <div className="mt-2 text-sm font-medium text-palm">
                          ${cityCost.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activities */}
                {cityActivities.length > 0 && (
                  <div className="p-6">
                    <div className="space-y-3">
                      {cityActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                        >
                          {activity.start_time && (
                            <div className="flex-shrink-0 text-sm font-medium text-muted-foreground min-w-[50px]">
                              {activity.start_time.slice(0, 5)}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{activity.name}</div>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {activity.category}
                              </Badge>
                              {activity.location && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {activity.location}
                                </span>
                              )}
                            </div>
                          </div>
                          {Number(activity.cost) > 0 && (
                            <div className="text-sm font-medium text-palm">
                              ${Number(activity.cost).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Want to create your own travel itinerary?
          </p>
          <Button asChild size="lg" className="btn-primary-travel">
            <Link to="/auth?mode=signup">
              Create Free Account
            </Link>
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SharedTrip;
