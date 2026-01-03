import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp } from 'lucide-react';

const destinations = [
  { name: 'Taj Mahal', country: 'India', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300' },
  { name: 'Jaipur', country: 'India', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300' },
  { name: 'Goa', country: 'India', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300' },
  { name: 'Kerala', country: 'India', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=300' },
  { name: 'Varanasi', country: 'India', image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=300' },
  { name: 'Mumbai', country: 'India', image: 'https://plus.unsplash.com/premium_photo-1693149687685-a674a6b1771f?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Delhi', country: 'India', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300' },
  { name: 'Rajasthan', country: 'India', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Himalayas', country: 'India', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300' },
  { name: 'Andaman', country: 'India', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300' },
  { name: 'Amritsar', country: 'India', image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=300' },
  { name: 'Mysore', country: 'India', image: 'https://images.unsplash.com/photo-1600112356915-089abb8fc71a?q=80&w=1294&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

const PopularDestinations: React.FC = () => {
  return (
    <div className="card-travel p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Popular Destinations</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
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
              className="w-full h-20 object-cover transition-transform duration-300 group-hover:scale-110"
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
