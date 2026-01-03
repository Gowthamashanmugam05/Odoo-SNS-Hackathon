import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, MapPin, Calendar, Users, ArrowRight, Plane, Compass, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import heroImage from '@/assets/hero-travel.jpg';

const features = [
  {
    icon: MapPin,
    title: 'Multi-City Planning',
    description: 'Add unlimited cities to your itinerary with drag & drop reordering.',
  },
  {
    icon: Calendar,
    title: 'Day-by-Day Activities',
    description: 'Plan every moment with detailed activity scheduling and notes.',
  },
  {
    icon: Compass,
    title: 'Budget Tracking',
    description: 'Keep your spending in check with automatic cost calculations.',
  },
];

const destinations = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
];

const Index: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative section-container py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 text-white/80 mb-4">
                <Globe className="h-5 w-5" />
                <span className="font-medium">Your Journey Starts Here</span>
              </div>
              
              <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Plan Your
                <span className="block text-gradient">Dream Adventure</span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Create stunning multi-city itineraries, manage your budget, and share 
                your travel plans with friends and family. All in one beautiful app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="btn-primary-travel text-lg">
                  <Link to="/auth?mode=signup">
                    Start Planning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex gap-8 mt-12"
            >
              {[
                { value: '50+', label: 'Cities' },
                { value: '1000+', label: 'Travelers' },
                { value: '4.9', label: 'Rating', icon: Star },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                    {stat.value}
                    {stat.icon && <stat.icon className="h-5 w-5 text-secondary fill-secondary" />}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="text-gradient"> Plan Perfectly</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From multi-city itineraries to budget tracking, GlobeTrotter has all the tools 
              to make your trip planning effortless.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-travel p-8 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 bg-muted/30">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Popular <span className="text-gradient">Destinations</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Get inspired by these trending travel spots
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {destinations.map((dest, index) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-[3/4]"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span className="font-display text-lg font-semibold">{dest.name}</span>
                  </div>
                  <span className="text-sm text-white/70">{dest.country}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-20">
              <Plane className="absolute top-10 left-10 h-24 w-24 text-white transform -rotate-12" />
              <Globe className="absolute bottom-10 right-10 h-32 w-32 text-white" />
            </div>
            
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who plan their adventures with GlobeTrotter.
              </p>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg">
                <Link to="/auth?mode=signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold">
                Globe<span className="text-primary">Trotter</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 GlobeTrotter. Plan your adventures with confidence.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
