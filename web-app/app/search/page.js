'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { 
  Car, Star, Filter, Users, Fuel, Settings2, 
  Briefcase, Wind, Baby, CheckCircle2, ArrowRight,
  ChevronDown, Search, X, MapPin, Calendar
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const category = searchParams?.get('category') || '';
  const location = searchParams?.get('location') || '';
  const date = searchParams?.get('date') || '';

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCars() {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('cars')
          .select('*');

        if (supabaseError) throw supabaseError;
        setCars(data || []);
      } catch (err) {
        console.error('Search error details:', err);
        setError(err.message || 'Failed to fetch vehicles from database');
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  const filteredCars = useMemo(() => {
    if (!cars.length) return [];
    let result = [...cars];
    if (category && category !== 'All Vehicles') {
      const targetCategory = category.trim().toLowerCase();
      result = result.filter(car => 
        car.category?.trim().toLowerCase() === targetCategory
      );
    }
    return result;
  }, [cars, category]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-secondary mb-4">Connection Error</h2>
        <p className="text-text-muted mb-8">{error}</p>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F6]">
      <Navbar />

      <main className="flex-grow">
        {/* Search Header */}
        <section className="bg-secondary py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-[13px]">Search Results</span>
                <h1 className="text-4xl md:text-5xl text-white font-serif tracking-tight uppercase">
                  Vehicles for <span className="text-primary italic">Your Journey</span>
                </h1>
                <div className="flex flex-wrap gap-6 text-white/50 text-sm font-bold uppercase tracking-widest">
                  {location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{location}</span>
                    </div>
                  )}
                  {date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{date}</span>
                    </div>
                  )}
                  {category && (
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" />
                      <span>{category}</span>
                    </div>
                  )}
                </div>
              </div>
              <Link href="/" className="text-white/60 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-[11px] transition-colors border-b border-white/10 pb-1">
                Modify Search
              </Link>
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-text-muted font-bold uppercase tracking-widest text-xs">Finding matches...</p>
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCars.map((car) => (
                  <div key={car.id} className="card-deal group h-full flex flex-col bg-white">
                    <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                      <img 
                        src={car.image_url} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={car.name} 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="badge-deal">{car.category}</span>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-[10px] font-black text-secondary">{car.rating || '4.9'}</span>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-secondary text-2xl font-bold group-hover:text-primary transition-colors mb-2">{car.name}</h3>
                      <p className="text-text-muted text-sm line-clamp-2 mb-6 font-medium leading-relaxed">{car.description}</p>
                      
                      <div className="grid grid-cols-3 gap-6 py-6 border-y border-black/5 mb-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="text-[9px] font-black text-text-muted uppercase">{car.seats} Seats</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Fuel className="w-5 h-5 text-primary" />
                          <span className="text-[9px] font-black text-text-muted uppercase">{car.features?.fuel || 'Petrol'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Settings2 className="w-5 h-5 text-primary" />
                          <span className="text-[9px] font-black text-text-muted uppercase">{car.features?.transmission || 'Auto'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">As from</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-secondary">Rs</span>
                            <span className="text-2xl font-black text-secondary">{car.price_per_day?.toLocaleString()}</span>
                            <span className="text-[10px] text-text-muted font-bold">/Day</span>
                          </div>
                        </div>
                        <Link href={`/fleet/${car.id}`} className="btn-primary !px-6 !py-3.5 !text-[9px] !rounded-xl">Book Now</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-black/5 shadow-sm">
                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8">
                  <Search className="w-12 h-12" />
                </div>
                <h3 className="text-3xl text-secondary font-serif uppercase tracking-tight mb-4">No Vehicles Match Your Search</h3>
                <p className="text-text-muted font-medium max-w-md mx-auto mb-10 leading-relaxed">
                  We couldn't find any vehicles matching your search criteria. Try a different category or view our entire collection.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/" className="btn-primary !px-12">New Search</Link>
                  <Link href="/fleet" className="text-secondary font-black uppercase tracking-widest text-[11px] hover:text-primary transition-colors">View Entire Fleet</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
