import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MapPin, Calendar, GripVertical, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TripCity, Activity } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ActivityItem from './ActivityItem';
import AddActivityDialog from './AddActivityDialog';

interface CityCardProps {
  city: TripCity;
  activities: Activity[];
  onDelete: () => void;
  onAddActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  isDragging?: boolean;
}

const cityImages: Record<string, string> = {
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
};

const defaultCityImage = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400';

const CityCard: React.FC<CityCardProps> = ({
  city,
  activities,
  onDelete,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity,
  isDragging,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showAddActivity, setShowAddActivity] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: city.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const totalCost = activities.reduce((sum, a) => sum + Number(a.cost || 0), 0);
  const cityImage = cityImages[city.city_name] || defaultCityImage;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`card-travel ${isDragging ? 'opacity-50 scale-105' : ''}`}
      layout
    >
      {/* Header */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={cityImage}
          alt={city.city_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-3 left-3 p-2 bg-black/30 hover:bg-black/50 rounded-lg cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-white" />
        </button>
        
        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="absolute top-3 right-3 bg-black/30 hover:bg-destructive text-white"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        {/* City Info */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
            <MapPin className="h-3 w-3" />
            {city.country}
          </div>
          <h3 className="font-display text-xl font-semibold text-white">
            {city.city_name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Dates & Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(city.arrival_date), 'MMM d')} - {format(new Date(city.departure_date), 'MMM d')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activities.length} activities
            </Badge>
            {totalCost > 0 && (
              <Badge className="bg-palm/10 text-palm border-palm/20">
                ${totalCost.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>

        {/* Toggle Activities */}
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="font-medium">Activities</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Activities List */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activities yet. Add your first one!
              </p>
            ) : (
              activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onDelete={() => onDeleteActivity(activity.id)}
                  onUpdate={(updates) => onUpdateActivity(activity.id, updates)}
                />
              ))
            )}
            
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setShowAddActivity(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </motion.div>
        )}
      </div>

      <AddActivityDialog
        open={showAddActivity}
        onOpenChange={setShowAddActivity}
        tripCityId={city.id}
        startDate={city.arrival_date}
        endDate={city.departure_date}
        onSubmit={onAddActivity}
      />
    </motion.div>
  );
};

export default CityCard;
