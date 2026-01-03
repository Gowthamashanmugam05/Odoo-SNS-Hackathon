import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Map, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrips } from '@/hooks/useTrips';
import Layout from '@/components/layout/Layout';
import TripCard from '@/components/trips/TripCard';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import PopularDestinations from '@/components/dashboard/PopularDestinations';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trips, isLoading, deleteTrip } = useTrips();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const upcomingTrips = trips.filter(
    (trip) => new Date(trip.start_date) >= new Date()
  ).slice(0, 3);

  const handleDelete = () => {
    if (deleteId) {
      deleteTrip.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleShare = (trip: any) => {
    const shareUrl = `${window.location.origin}/shared/${trip.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share this link with friends to let them view your trip.',
    });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="section-container py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to plan your next adventure?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Link
            to="/create-trip"
            className="card-travel p-6 flex items-center gap-4 group hover:border-primary/50"
          >
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Create New Trip</h3>
              <p className="text-sm text-muted-foreground">Start planning</p>
            </div>
          </Link>

          <Link
            to="/trips"
            className="card-travel p-6 flex items-center gap-4 group hover:border-primary/50"
          >
            <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <Map className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">My Trips</h3>
              <p className="text-sm text-muted-foreground">{trips.length} trips total</p>
            </div>
          </Link>

          <div className="card-travel p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">Upcoming</h3>
              <p className="text-sm text-muted-foreground">{upcomingTrips.length} trips planned</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">Upcoming Trips</h2>
              {trips.length > 0 && (
                <Button variant="ghost" asChild>
                  <Link to="/trips">View All</Link>
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : upcomingTrips.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-travel p-12 text-center"
              >
                <Map className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">No trips yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first trip and start planning your adventure!
                </p>
                <Button asChild className="btn-primary-travel">
                  <Link to="/create-trip">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Trip
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {upcomingTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onDelete={(id) => setDeleteId(id)}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BudgetOverview trips={trips} activities={[]} />
            <PopularDestinations />
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All cities, activities, and costs 
              associated with this trip will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Dashboard;
