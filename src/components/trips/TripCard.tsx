import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { MapPin, Calendar, DollarSign, MoreVertical, Trash2, Edit, Share2 } from 'lucide-react';
import { Trip } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface TripCardProps {
  trip: Trip;
  citiesCount?: number;
  onDelete: (id: string) => void;
  onShare: (trip: Trip) => void;
}

const tripImages = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
];

const TripCard: React.FC<TripCardProps> = ({ trip, citiesCount = 0, onDelete, onShare }) => {
  const duration = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const randomImage = tripImages[Math.floor(Math.random() * tripImages.length)];
  const coverImage = trip.cover_image || randomImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-travel group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={trip.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        {trip.is_public && (
          <Badge className="absolute top-3 left-3 bg-primary/90">
            <Share2 className="h-3 w-3 mr-1" />
            Shared
          </Badge>
        )}
        
        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/trips/${trip.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Trip
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(trip)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Trip
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(trip.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Title Overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-xl font-semibold text-white truncate">
            {trip.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <Link to={`/trips/${trip.id}`} className="block p-4">
        <div className="space-y-3">
          {/* Date Range */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{citiesCount} cities</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">{duration} days</span>
              </div>
            </div>
            
            {trip.total_budget > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-palm">
                <DollarSign className="h-4 w-4" />
                {trip.total_budget.toLocaleString()}
              </div>
            )}
          </div>

          {/* Description */}
          {trip.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {trip.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default TripCard;
