import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Search, MapPin } from 'lucide-react';
import { TripCity, useCities, City } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const citySchema = z.object({
  city_name: z.string().min(1, 'City name is required'),
  country: z.string().min(1, 'Country is required'),
  arrival_date: z.date({ required_error: 'Arrival date is required' }),
  departure_date: z.date({ required_error: 'Departure date is required' }),
}).refine((data) => data.departure_date >= data.arrival_date, {
  message: 'Departure must be after arrival',
  path: ['departure_date'],
});

type CityFormData = z.infer<typeof citySchema>;

interface AddCityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  orderIndex: number;
  onSubmit: (city: Omit<TripCity, 'id' | 'created_at' | 'updated_at'>) => void;
}

const AddCityDialog: React.FC<AddCityDialogProps> = ({
  open,
  onOpenChange,
  tripId,
  tripStartDate,
  tripEndDate,
  orderIndex,
  onSubmit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: cities = [] } = useCities();

  const form = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      city_name: '',
      country: '',
    },
  });

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectCity = (city: City) => {
    form.setValue('city_name', city.name);
    form.setValue('country', city.country);
    setSearchQuery('');
  };

  const handleSubmit = (data: CityFormData) => {
    const selectedCity = cities.find(c => c.name === data.city_name);
    
    onSubmit({
      trip_id: tripId,
      city_id: selectedCity?.id || null,
      city_name: data.city_name,
      country: data.country,
      arrival_date: format(data.arrival_date, 'yyyy-MM-dd'),
      departure_date: format(data.departure_date, 'yyyy-MM-dd'),
      order_index: orderIndex,
      notes: null,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add City</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* City Search */}
            <div className="space-y-2">
              <FormLabel>Search Cities</FormLabel>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Paris, Tokyo, etc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchQuery && filteredCities.length > 0 && (
                <ScrollArea className="h-40 border rounded-lg">
                  <div className="p-2 space-y-1">
                    {filteredCities.slice(0, 8).map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => selectCity(city)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                      >
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium text-sm">{city.name}</div>
                          <div className="text-xs text-muted-foreground">{city.country}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="France" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="arrival_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Arrival</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'MMM d') : 'Pick date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(tripStartDate) || date > new Date(tripEndDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departure_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Departure</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'MMM d') : 'Pick date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(tripStartDate) ||
                            date > new Date(tripEndDate) ||
                            (form.getValues('arrival_date') && date < form.getValues('arrival_date'))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full btn-primary-travel">
              Add City
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCityDialog;
