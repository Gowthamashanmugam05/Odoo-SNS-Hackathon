import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plane } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrips } from '@/hooks/useTrips';
import Layout from '@/components/layout/Layout';
import CreateTripForm from '@/components/trips/CreateTripForm';
import { Button } from '@/components/ui/button';

const CreateTrip: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createTrip } = useTrips();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSubmit = async (data: any) => {
    const result = await createTrip.mutateAsync({
      name: data.name,
      description: data.description || null,
      start_date: data.start_date.toISOString().split('T')[0],
      end_date: data.end_date.toISOString().split('T')[0],
      cover_image: data.cover_image || null,
      total_budget: data.total_budget || 0,
      is_public: false,
    });
    navigate(`/trips/${result.id}`);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="section-container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Plane className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Create a New Trip
            </h1>
            <p className="text-muted-foreground">
              Start planning your next adventure
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-travel p-8"
          >
            <CreateTripForm
              onSubmit={handleSubmit}
              isLoading={createTrip.isPending}
            />
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTrip;
