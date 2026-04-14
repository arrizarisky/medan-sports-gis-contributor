import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { facilityService } from '../services/facilityService';
import { Facility } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { Plus, MapPin, Star, Clock, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  const [myPlaces, setMyPlaces] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      facilityService.getByUserId(user.id)
        .then(setMyPlaces)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tighter text-zinc-900">
          Hello, {user?.user_metadata?.full_name?.split(' ')[0] || 'Contributor'}
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Your Medan Sports Dashboard
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 flex items-center justify-between bg-zinc-900 p-8 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Contributions</p>
            <p className="text-4xl font-black tracking-tighter">{myPlaces.length}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10">
            <LayoutGrid className="h-6 w-6" />
          </div>
        </Card>
        <Card className="flex flex-col gap-2 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Avg Rating</p>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-zinc-900 text-zinc-900" />
            <p className="text-2xl font-black tracking-tighter">
              {myPlaces.length > 0 
                ? (myPlaces.reduce((acc, p) => acc + p.rating, 0) / myPlaces.length).toFixed(1) 
                : '0.0'}
            </p>
          </div>
        </Card>
        <Card className="flex flex-col gap-2 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Newest</p>
          <p className="text-sm font-black tracking-tight">
            {myPlaces.length > 0 
              ? new Date(myPlaces[0].created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
              : 'None'}
          </p>
        </Card>
      </div>

      {/* Recent Contributions */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">Recent Activity</h2>
          <Link to="/my-contributions">
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px]">
              View All
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-4xl bg-zinc-100" />
            ))}
          </div>
        ) : myPlaces.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 border-zinc-100 bg-zinc-50/50">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-zinc-300 shadow-sm">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">No places yet</h3>
            <p className="mb-6 text-[10px] font-medium text-zinc-400">Start contributing to Medan's sports map.</p>
            <Link to="/add-place">
              <Button size="sm">Add First Place</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {myPlaces.slice(0, 3).map((place, idx) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={`/edit-place/${place.id}`}>
                  <Card className="group relative flex items-center gap-4 p-4 transition-all hover:bg-zinc-50 active:scale-98">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-zinc-100">
                      <img
                        src={place.photos[0] || 'https://picsum.photos/seed/sports/400/300'}
                        alt={place.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Badge variant="info" className="px-2 py-0.5">{place.type}</Badge>
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-zinc-900">
                          <Star className="h-3 w-3 fill-current" />
                          {place.rating}
                          {place.ratingSource && (
                            <span className="ml-1 text-zinc-400 font-medium">via {place.ratingSource}</span>
                          )}
                        </div>
                      </div>
                      <h3 className="mt-1 truncate font-bold text-zinc-900">{place.name}</h3>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{place.price}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-300 transition-transform group-hover:translate-x-1" />
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <div className="pb-10">
        <Link to="/add-place">
          <Button className="w-full py-6 rounded-full text-base">
            <Plus className="mr-2 h-6 w-6" />
            Add New Facility
          </Button>
        </Link>
      </div>
    </div>
  );
}
