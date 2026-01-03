import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp } from 'lucide-react';

const destinations = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300' },
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300' },
  { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300' },
  { name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300' },
];

const PopularDestinations: React.FC = () => {
  return (
    <div className="card-travel p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Popular Destinations</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {destinations.map((dest, index) => (
          <motion.div
            key={dest.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-pointer overflow-hidden rounded-xl"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center gap-1 text-white">
                <MapPin className="h-3 w-3" />
                <span className="text-sm font-medium">{dest.name}</span>
              </div>
              <span className="text-xs text-white/70">{dest.country}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PopularDestinations;
