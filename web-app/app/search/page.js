'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { 
  Car, Star, Filter, Users, Fuel, Settings2, 
  Briefcase, Wind, Baby, CheckCircle2, ArrowRight,
  ChevronDown, Search, X, MapPin, Calendar, AlertTriangle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLocalization } from '@/lib/currency';
import { SmartImage } from '@/lib/image';

function SearchResultsContent() {
  const { formatPrice } = useLocalization();
  const searchParams = useSearchParams();
  const category = searchParams?.get('category') || '';
  const location = searchParams?.get('location') || '';
  const date = searchParams?.get('date') || '';

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 100000]);

  const priceRanges = [
    { label: 'All Prices', min: 0, max: 100000 },
    { label: 'Under Rs 1,500', min: 0, max: 1500 },
    { label: 'Rs 1,500 - 3,000', min: 1500, max: 3000 },
    { label: 'Rs 3,000 - 6,000', min: 3000, max: 6000 },
    { label: 'Above Rs 6,000', min: 6000, max: 100000 }
  ];

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('vehicle_templates')
          .select(`
            *,
            units:vehicle_units(availability_status),
            pricing:vehicle_pricing(daily_price)
          `);

        if (supabaseError) throw supabaseError;
        
        // Transform and Aggregate
        const transformed = (data || []).map(t => {
          const availableUnits = t.units?.filter(u => u.availability_status === 'available') || [];
          
          // Determine starting price (dynamic > default)
          const dailyPrices = t.pricing?.map(p => p.daily_price) || [];
          const minPrice = dailyPrices.length > 0 
            ? Math.min(...dailyPrices) 
            : (t.daily_price || 1500);
          
          return {
            ...t,
            min_price: minPrice,
            available_count: availableUnits.length
          };
        });

        setTemplates(transformed);
      } catch (err) {
        console.error('Search error details:', err);
        setError(err.message || 'Failed to fetch vehicles from database');
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!templates.length) return [];
    let result = [...templates];
    
    // Category Filter
    if (category && category !== 'All Vehicles' && category !== 'All') {
      const targetCategory = category.trim().toLowerCase();
      result = result.filter(t => 
        t.category?.trim().toLowerCase() === targetCategory ||
        (targetCategory === 'saloon' && t.category?.toLowerCase() === 'sedan') ||
        (targetCategory === 'sedan' && t.category?.toLowerCase() === 'saloon')
      );
    }

    // Price Range Filter
    result = result.filter(t => t.min_price >= priceRange[0] && t.min_price <= priceRange[1]);

    return result;
  }, [templates, category, priceRange]);

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

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Filter Sidebar */}
              <aside className="w-full lg:w-72 shrink-0">
                <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm sticky top-32 space-y-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/30">Price Range</h3>
                      <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/5 rounded-full">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    
                    <div className="relative pt-6 pb-2">
                      <div className="range-slider-container">
                        <div className="range-slider-track"></div>
                        <div 
                          className="range-slider-progress"
                          style={{
                            left: `${(priceRange[0] / 10000) * 100}%`,
                            right: `${100 - (priceRange[1] / 10000) * 100}%`
                          }}
                        ></div>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="500"
                          value={priceRange[0]}
                          onChange={(e) => {
                            const val = Math.min(Number(e.target.value), priceRange[1] - 500);
                            setPriceRange([val, priceRange[1]]);
                          }}
                          className="range-slider-input"
                        />
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="500"
                          value={priceRange[1]}
                          onChange={(e) => {
                            const val = Math.max(Number(e.target.value), priceRange[0] + 500);
                            setPriceRange([priceRange[0], val]);
                          }}
                          className="range-slider-input"
                        />
                      </div>
                      <div className="flex justify-between mt-4">
                         <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Min</span>
                         <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Max</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-grow">
                {loading ? (
                  <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="mt-4 text-text-muted font-bold uppercase tracking-widest text-xs">Finding matches...</p>
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTemplates.map((template) => (
                      <Link key={template.id} href={`/fleet/${template.id}`} className="card-deal group h-full flex flex-col bg-white overflow-hidden rounded-3xl border border-black/5 shadow-sm hover:shadow-xl transition-all">
                        <div className="relative aspect-[16/10] overflow-hidden shrink-0 bg-white group-hover:bg-slate-50/50 transition-colors duration-700 p-6">
                          <SmartImage 
                            src={template.default_thumbnail || template.image_url} 
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                            alt={`${template.brand} ${template.model}`} 
                          />
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <span className="badge-deal !bg-white/95 !text-[var(--bg-dark)] !shadow-xl !border-black/5 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">{template.category}</span>
                            {template.available_count > 0 ? (
                              <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">
                                {template.available_count} Available
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">
                                Sold Out
                              </span>
                            )}
                          </div>
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-[var(--brand-yellow)] fill-[var(--brand-yellow)]" />
                            <span className="text-[10px] font-black text-[var(--bg-dark)]">4.9</span>
                          </div>
                        </div>
                        
                        <div className="p-8 flex flex-col flex-1">
                          <h3 className="text-[var(--bg-dark)] text-2xl font-black uppercase group-hover:text-[var(--brand-yellow)] transition-colors mb-2 tracking-tighter">{template.brand} {template.model}</h3>
                          <div className="flex items-center gap-2 mb-6">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Verified Inventory</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 py-6 border-y border-black/5 mb-8">
                            <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-black/5">
                              <Users className="w-5 h-5 text-[var(--brand-yellow)]/50" />
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-[var(--bg-dark)]/40 uppercase tracking-widest mb-0.5">Capacity</span>
                                 <span className="text-[10px] font-black text-[var(--bg-dark)] uppercase tracking-tight">{template.seats} Adults</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-black/5">
                              <Settings2 className="w-5 h-5 text-[var(--brand-yellow)]/50" />
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-[var(--bg-dark)]/40 uppercase tracking-widest mb-0.5">Transmission</span>
                                 <span className="text-[10px] font-black text-[var(--bg-dark)] uppercase tracking-tight">{template.transmission}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-auto flex items-center justify-between pt-4">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-[var(--bg-dark)]/30 font-black uppercase tracking-[0.3em] mb-1 leading-none">Starting At</span>
                              <span className="text-2xl font-black text-[var(--bg-dark)] tracking-tighter leading-none">{formatPrice(template.min_price)}</span>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--bg-dark)] shadow-lg group-hover:scale-110 transition-transform">
                              <ArrowRight className="w-7 h-7" />
                            </div>
                          </div>
                        </div>
                      </Link>
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
            </div>
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