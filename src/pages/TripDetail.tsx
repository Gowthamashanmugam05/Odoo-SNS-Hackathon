import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plus,
  Loader2,
  Share2,
  Settings,
  List,
  CalendarDays,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTripDetails, Activity } from '@/hooks/useTrips';
import Layout from '@/components/layout/Layout';
import CityCard from '@/components/itinerary/CityCard';
import AddCityDialog from '@/components/itinerary/AddCityDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddCity, setShowAddCity] = useState(false);
  const [activeTab, setActiveTab] = useState('cities');

  const {
    trip,
    cities,
    activities,
    isLoading,
    addCity,
    deleteCity,
    addActivity,
    deleteActivity,
    updateActivity,
    reorderCities,
  } = useTripDetails(id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="section-container py-16 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Trip not found</h2>
          <Button onClick={() => navigate('/trips')}>Back to Trips</Button>
        </div>
      </Layout>
    );
  }

  const duration = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const totalCost = activities.reduce((sum, a) => sum + Number(a.cost || 0), 0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = cities.findIndex((c) => c.id === active.id);
      const newIndex = cities.findIndex((c) => c.id === over.id);
      
      const reordered = [...cities];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);
      
      const updates = reordered.map((city, index) => ({
        id: city.id,
        order_index: index,
      }));
      
      reorderCities.mutate(updates);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/shared/${trip.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share this link with friends to let them view your trip.',
    });
  };

  const getActivitiesForCity = (cityId: string) => {
    return activities.filter((a) => a.trip_city_id === cityId);
  };

  // Group activities by date for calendar view
  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = activity.activity_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <Layout>
      <div className="section-container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/trips')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                {trip.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
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
                    {totalCost.toLocaleString()} spent
                  </Badge>
                )}
              </div>
              
              {trip.description && (
                <p className="mt-4 text-muted-foreground max-w-2xl">
                  {trip.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => setShowAddCity(true)}
                className="btn-primary-travel"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add City
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Cities
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Cities View */}
          <TabsContent value="cities">
            {cities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-travel p-12 text-center"
              >
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  No cities added yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start building your itinerary by adding your first destination.
                </p>
                <Button onClick={() => setShowAddCity(true)} className="btn-primary-travel">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First City
                </Button>
              </motion.div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={cities.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cities.map((city) => (
                      <CityCard
                        key={city.id}
                        city={city}
                        activities={getActivitiesForCity(city.id)}
                        onDelete={() => deleteCity.mutate(city.id)}
                        onAddActivity={(activity) => addActivity.mutate(activity)}
                        onDeleteActivity={(id) => deleteActivity.mutate(id)}
                        onUpdateActivity={(id, updates) =>
                          updateActivity.mutate({ id, ...updates })
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <div className="card-travel p-6">
              <h3 className="font-display text-lg font-semibold mb-4">
                Activities Calendar
              </h3>
              
              {Object.keys(activitiesByDate).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No activities scheduled yet. Add activities to your cities to see them here.
                </p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(activitiesByDate)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, dayActivities]) => (
                      <div key={date}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0 w-16 text-center">
                            <div className="text-2xl font-bold text-primary">
                              {format(new Date(date), 'd')}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase">
                              {format(new Date(date), 'MMM')}
                            </div>
                          </div>
                          <div className="h-px flex-1 bg-border" />
                          <Badge variant="outline">
                            {dayActivities.length} activities
                          </Badge>
                        </div>
                        
                        <div className="ml-20 space-y-2">
                          {dayActivities
                            .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                            .map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                              >
                                {activity.start_time && (
                                  <span className="text-sm font-medium text-muted-foreground min-w-[50px]">
                                    {activity.start_time.slice(0, 5)}
                                  </span>
                                )}
                                <div className="flex-1">
                                  <div className="font-medium">{activity.name}</div>
                                  {activity.location && (
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {activity.location}
                                    </div>
                                  )}
                                </div>
                                {Number(activity.cost) > 0 && (
                                  <Badge className="bg-palm/10 text-palm border-palm/20">
                                    ${Number(activity.cost).toLocaleString()}
                                  </Badge>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add City Dialog */}
      <AddCityDialog
        open={showAddCity}
        onOpenChange={setShowAddCity}
        tripId={trip.id}
        tripStartDate={trip.start_date}
        tripEndDate={trip.end_date}
        orderIndex={cities.length}
        onSubmit={(city) => addCity.mutate(city)}
      />
    </Layout>
  );
};

export default TripDetail;
