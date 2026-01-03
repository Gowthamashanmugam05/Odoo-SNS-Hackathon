import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Map, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrips } from '@/hooks/useTrips';
import Layout from '@/components/layout/Layout';
import TripCard from '@/components/trips/TripCard';
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

const Trips: React.FC = () => {
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">My Trips</h1>
            <p className="text-muted-foreground">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
            </p>
          </div>
          <Button asChild className="btn-primary-travel">
            <Link to="/create-trip">
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Link>
          </Button>
        </motion.div>

        {/* Trips Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-travel p-16 text-center"
          >
            <Map className="h-20 w-20 mx-auto text-muted-foreground/50 mb-6" />
            <h3 className="font-display text-2xl font-semibold mb-2">
              No trips yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your first trip and start planning your next adventure. 
              Add cities, activities, and track your budget all in one place.
            </p>
            <Button asChild size="lg" className="btn-primary-travel">
              <Link to="/create-trip">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Trip
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TripCard
                  trip={trip}
                  onDelete={(id) => setDeleteId(id)}
                  onShare={handleShare}
                />
              </motion.div>
            ))}
          </div>
        )}
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

export default Trips;
