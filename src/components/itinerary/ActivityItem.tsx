import React from 'react';
import { format } from 'date-fns';
import { Clock, DollarSign, Trash2, MapPin } from 'lucide-react';
import { Activity } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ActivityItemProps {
  activity: Activity;
  onDelete: () => void;
  onUpdate: (updates: Partial<Activity>) => void;
}

const categoryColors: Record<string, string> = {
  sightseeing: 'bg-sky/10 text-primary border-primary/20',
  food: 'bg-sunset/10 text-secondary border-secondary/20',
  transport: 'bg-muted text-muted-foreground border-border',
  accommodation: 'bg-palm/10 text-palm border-palm/20',
  shopping: 'bg-coral/10 text-coral border-coral/20',
  general: 'bg-muted text-muted-foreground border-border',
};

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onDelete }) => {
  const colorClass = categoryColors[activity.category] || categoryColors.general;

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      {/* Time */}
      {activity.start_time && (
        <div className="flex-shrink-0 text-xs text-muted-foreground font-medium min-w-[50px]">
          {activity.start_time.slice(0, 5)}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-sm">{activity.name}</h4>
            {activity.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {activity.description}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className={colorClass}>
            {activity.category}
          </Badge>
          
          {activity.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {activity.location}
            </span>
          )}
          
          {Number(activity.cost) > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-palm">
              <DollarSign className="h-3 w-3" />
              {Number(activity.cost).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
