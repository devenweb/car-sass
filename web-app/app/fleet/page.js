'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  ArrowRight, Star, Users, Fuel, Zap, Wind, Music, Search, SlidersHorizontal, ChevronDown, Filter, X
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SmartImage } from '@/lib/image';
import { useLocalization } from '@/lib/currency';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function FleetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'All';
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [transmission, setTransmission] = useState('All');
  const [seats, setSeats] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const { formatPrice } = useLocalization();

  const categories = ['All', 'Economy', 'Saloon', 'SUV', 'MPV', 'Prestige'];
  const transmissionOptions = ['All', 'Auto', 'Manual'];
  const seatOptions = ['All', '4', '5', '7'];
  const priceRanges = [
    { label: 'All Prices', min: 0, max: 100000 },
    { label: 'Under Rs 1,500', min: 0, max: 1500 },
    { label: 'Rs 1,500 - 3,000', min: 1500, max: 3000 },
    { label: 'Rs 3,000 - 6,000', min: 3000, max: 6000 },
    { label: 'Above Rs 6,000', min: 6000, max: 100000 }
  ];

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const { data: templates, error: tError } = await supabase.from("vehicle_templates").select("*");
      if (tError) throw tError;

      const { data: pricing, error: pError } = await supabase.from("vehicle_pricing").select("vehicle_template_id, daily_price");
      const { data: units, error: uError } = await supabase.from("vehicle_units").select("vehicle_template_id, availability_status");

      const enriched = (templates || []).map(t => {
        const carPricing = pricing?.filter(p => p.vehicle_template_id === t.id) || [];
        const carUnits = units?.filter(u => u.vehicle_template_id === t.id) || [];
        const availableCount = carUnits.filter(u => u.availability_status === "available").length;
        
        // Dynamic Pricing Logic: Min from specific dates OR default template price
        const dailyPrices = carPricing.map(p => p.daily_price);
        const minPrice = dailyPrices.length > 0 ? Math.min(...dailyPrices) : (t.daily_price || 1500);
        
        return { ...t, available_count: availableCount, min_price: minPrice };
      });

      setTemplates(enriched);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  }

  const filteredTemplates = templates
    .filter(t => {
      const modelName = `${t.brand} ${t.model}`.toLowerCase();
      const matchesSearch = modelName.includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (activeCategory !== 'All') {
        const cat = (t.category || '').toLowerCase();
        const active = activeCategory.toLowerCase();
        if (active === 'economy') matchesCategory = ['economy', 'budget', 'hybrid', 'compact'].includes(cat);
        else if (active === 'saloon') matchesCategory = ['sedan', 'saloon'].includes(cat);
        else if (active === 'suv') matchesCategory = ['suv', '4x4', 'coupe', 'luxury edition'].includes(cat);
        else if (active === 'mpv') matchesCategory = cat === 'mpv';
        else if (active === 'prestige') matchesCategory = ['luxury', 'premium', 'elite', 'prestige'].includes(cat);
      }

      let matchesTransmission = true;
      if (transmission !== 'All') {
        const transLower = (t.transmission || "").toLowerCase();
        if (transmission === 'Auto') matchesTransmission = transLower.includes('auto');
        if (transmission === 'Manual') matchesTransmission = transLower.includes('man');
      }

      let matchesSeats = true;
      if (seats !== 'All') {
        matchesSeats = t.seats?.toString() === seats;
      }

      const matchesPrice = t.min_price >= priceRange[0] && t.min_price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesTransmission && matchesSeats && matchesPrice;
    })
    .sort((a, b) => a.min_price - b.min_price);  return (
    <div className="page-layout bg-[var(--bg-primary)] min-h-screen">
      <Navbar />

      <section className="pt-24 pb-8">
        <div className="content-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6 shrink-0">
               <h1 className="text-5xl md:text-7xl font-black text-[var(--bg-dark)] uppercase tracking-tighter">
                  Our <span className="text-[var(--brand-yellow)]">Fleet.</span>
               </h1>
            </div>

            <div className="flex-grow max-w-2xl relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--bg-dark)]/20" />
              <input 
                type="text" 
                placeholder="Search by brand, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/5 h-16 pl-16 pr-6 rounded-[1.5rem] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all shadow-sm"
              />
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${
                showFilters ? 'bg-[var(--bg-dark)] text-white' : 'bg-white text-[var(--bg-dark)] border border-black/5'
              }`}
            >
              {showFilters ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
              {showFilters ? 'Hide' : 'Filter'}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {showFilters && (
              <aside className="w-full lg:w-[320px] shrink-0 space-y-10">
                <div className="bg-white rounded-[3rem] p-10 border border-black/5 space-y-12 shadow-sm sticky top-32">
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

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Transmission</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {transmissionOptions.map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setTransmission(opt)}
                          className={`px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${
                            transmission === opt ? 'bg-[var(--bg-dark)] text-white shadow-md' : 'bg-slate-50 text-[var(--bg-dark)]/40'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Seats</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {seatOptions.map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setSeats(opt)}
                          className={`px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${
                            seats === opt ? 'bg-[var(--brand-yellow)] text-[var(--bg-dark)] shadow-md' : 'bg-slate-50 text-[var(--bg-dark)]/40'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            <div className="flex-grow">
              <div className={`grid gap-6 ${showFilters ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {loading ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="h-[480px] bg-white rounded-[3rem] animate-pulse" />)
                ) : filteredTemplates.length === 0 ? (
                  <div className="col-span-full py-40 text-center">
                    <h3 className="text-2xl font-black text-[var(--bg-dark)] mb-2 uppercase">No Cars Found</h3>
                    <p className="text-[var(--bg-dark)]/40 font-bold uppercase tracking-widest text-[10px]">Adjust your filters to see more results</p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <Link 
                      key={template.id} 
                      href={`/fleet/${template.id}`}
                      className="group relative bg-white rounded-[2.5rem] border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden"
                    >
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function FleetPage() {
  return (
    <Suspense fallback={null}>
      <FleetContent />
    </Suspense>
  );
}