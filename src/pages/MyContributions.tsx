import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { facilityService } from '../services/facilityService';
import { Facility } from '../types';
import { Card, Button, Badge, Input } from '../components/UI';
import { 
  Search, MapPin, Star, Edit3, 
  Trash2, Filter, MoreVertical,
  ChevronRight, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function MyContributions() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPlaces = async () => {
    if (!user) return;
    try {
      const data = await facilityService.getByUserId(user.id);
      setPlaces(data);
    } catch (error) {
      toast.error('Failed to load your contributions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    
    try {
      await facilityService.delete(id);
      toast.success('Facility deleted');
      setPlaces(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Failed to delete facility');
    }
  };

  const filteredPlaces = places.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">My Contributions</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Managing {places.length} Sports Places
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="Search your places..."
          className="pl-11 rounded-3xl bg-white border-zinc-100"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-4xl bg-zinc-100" />
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 border-zinc-100">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-4xl bg-zinc-50 text-zinc-300">
            <Search className="h-10 w-10" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">No results</h3>
          <p className="text-[10px] font-medium text-zinc-400">Try a different search term.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredPlaces.map((place, idx) => (
              <motion.div
                key={place.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group overflow-hidden p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-zinc-100">
                      <img
                        src={place.photos[0] || 'https://picsum.photos/seed/sports/400/300'}
                        alt={place.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between overflow-hidden">
                      <div>
                        <div className="flex items-center justify-between">
                          <Badge variant="info">{place.type}</Badge>
                          <div className="flex items-center gap-1 text-[10px] font-black text-zinc-900">
                            <Star className="h-3 w-3 fill-current" />
                            {place.rating}
                            {place.ratingSource && (
                              <span className="ml-1 text-zinc-400 font-medium lowercase">via {place.ratingSource}</span>
                            )}
                          </div>
                        </div>
                        <h3 className="mt-1 truncate font-bold text-zinc-900">
                          {place.name}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          {place.price}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                          {new Date(place.updated_at || place.created_at!).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500"
                            onClick={() => handleDelete(place.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Link to={`/edit-place/${place.id}`}>
                            <Button variant="secondary" size="sm" className="h-8 rounded-xl text-[10px]">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
