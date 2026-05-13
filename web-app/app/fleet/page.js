'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  ArrowRight, Star, Users, Fuel, Zap, Wind, Music, Search, SlidersHorizontal, ChevronDown, Filter, X, Settings, Shield,
  Briefcase, Smartphone, Calendar, Clock, LayoutGrid, List
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SmartImage } from '@/lib/image';
import { useLocalization } from '@/lib/currency';
import VehicleCard from '@/components/VehicleCard';

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
  const [activeExperience, setActiveExperience] = useState(searchParams?.get('experience') || 'All');
  const [sortBy, setSortBy] = useState('Price: Low to High');
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Date/Time Filters
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    setMounted(true);
  }, []);

  const { formatPrice } = useLocalization();

  const categories = ['All', 'Economy', 'Sedan', 'SUV', 'MPV', 'Luxury', 'Hatchback'];
  const transmissionOptions = ['All', 'Auto', 'Manual'];
  const experienceOptions = ['All', 'Family', 'Honeymoon', 'Sporty', 'Luxury', 'Economy'];
  const sortOptions = ['Price: Low - High', 'Price: High - Low', 'Newest First', 'Name: A - Z'];
  const seatOptions = ['All', '4', '5', '7'];
  const priceRanges = [
    { label: 'All Prices', min: 0, max: 100000 },
    { label: 'Under Rs 1,500', min: 0, max: 1500 },
    { label: 'Rs 1,500 - 3,000', min: 1500, max: 3000 },
    { label: 'Rs 3,000 - 6,000', min: 3000, max: 6000 },
    { label: 'Above Rs 6,000', min: 6000, max: 100000 }
  ];

  const resetFilters = () => {
    setActiveCategory('All');
    setTransmission('All');
    setSeats('All');
    setPriceRange([0, 10000]);
    setActiveExperience('All');
    setSortBy('Price: Low to High');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vehicle_templates")
        .select(`
          *,
          vehicle_pricing (daily_price),
          vehicle_units (availability_status, daily_price)
        `)
        .eq('published_status', 'published');

      if (error) throw error;

      const enriched = (data || []).map(t => {
        const pricing = t.vehicle_pricing || [];
        const units = t.vehicle_units || [];
        const availableCount = units.filter(u => u.availability_status === "available").length;
        
        // Dynamic Pricing Logic: Min from specific dates OR available units OR default template price
        const prices = [
          ...pricing.map(p => p.daily_price),
          ...units.map(u => u.daily_price).filter(p => p > 0)
        ];
        
        const minPrice = prices.length > 0 ? Math.min(...prices) : (t.daily_price || 1500);
        
        return { ...t, available_count: availableCount, min_price: minPrice };
      });

      setTemplates(enriched);
    } catch (err) { 
      console.error('Error fetching fleet:', err); 
    } finally { 
      setLoading(false); 
    }
  }

  const filteredTemplates = templates
    .filter(t => {
      const modelName = `${t.brand} ${t.model}`.toLowerCase();
      const matchesSearch = modelName.includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (activeCategory !== 'All') {
        const cat = (t.category || '').toLowerCase();
        const active = activeCategory.toLowerCase();
        if (active === 'economy') matchesCategory = ['economy', 'budget', 'hybrid', 'compact', 'hatchback'].includes(cat);
        else if (active === 'sedan') matchesCategory = ['sedan', 'saloon'].includes(cat);
        else if (active === 'suv') matchesCategory = ['suv', '4x4', 'coupe', 'luxury edition'].includes(cat);
        else if (active === 'mpv') matchesCategory = cat === 'mpv';
        else if (active === 'luxury') matchesCategory = ['luxury', 'premium', 'elite', 'prestige'].includes(cat);
        else if (active === 'hatchback') matchesCategory = cat === 'hatchback';
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

      let matchesExperience = true;
      if (activeExperience !== 'All') {
        matchesExperience = Array.isArray(t.tags) && t.tags.includes(activeExperience.toLowerCase());
      }

      return matchesSearch && matchesCategory && matchesTransmission && matchesSeats && matchesPrice && matchesExperience;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low - High') return a.min_price - b.min_price;
      if (sortBy === 'Price: High - Low') return b.min_price - a.min_price;
      if (sortBy === 'Newest First') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'Name: A - Z') return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      return 0;
    });
    
  return (
    <div className="page-layout bg-[var(--bg-primary)] min-h-screen">
      <Navbar />

      <section className="pt-24 pb-8">
        <div className="content-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6 shrink-0">
               <h1 className="text-5xl md:text-7xl font-black text-[var(--bg-dark)] tracking-tighter">
                  Our <span className="text-[var(--brand-yellow)]">Drive.</span>
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

            <div className="flex items-center gap-2 bg-white border border-black/5 p-1.5 rounded-[1.5rem] shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-4 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[var(--brand-yellow)] text-[var(--bg-dark)] shadow-md' : 'text-[var(--bg-dark)]/40 hover:bg-slate-50'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-4 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[var(--brand-yellow)] text-[var(--bg-dark)] shadow-md' : 'text-[var(--bg-dark)]/40 hover:bg-slate-50'}`}
              >
                <List size={18} />
              </button>
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
              <aside className="w-full lg:w-[320px] shrink-0">
                <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 space-y-10 shadow-sm sticky top-32 max-h-[85vh] overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-center pb-4 border-b border-black/5">
                    <span className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]">Filters</span>
                    <button 
                      onClick={resetFilters}
                      className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-[var(--bg-dark)] transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Sort By - Now First and Simplified */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Sort By</h3>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setSortBy(opt)}
                          className={`px-3 py-2 rounded-lg font-black uppercase tracking-tighter text-[9px] transition-all border ${
                            sortBy === opt ? 'bg-[var(--bg-dark)] text-white border-[var(--bg-dark)]' : 'bg-white text-[var(--bg-dark)]/40 border-black/5 hover:border-black/20'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Travel Dates */}
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-1">Pickup Date & Time</label>
                        <div className="flex gap-2">
                          <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex-grow bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-[12px] font-bold outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]/20"
                          />
                          <input 
                            type="time" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-24 bg-slate-50 border border-black/5 rounded-xl px-2 py-3 text-[12px] font-bold outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-1">Return</label>
                        <div className="flex gap-2">
                          <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="flex-grow bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-[12px] font-bold outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]/20"
                          />
                          <input 
                            type="time" 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-24 bg-slate-50 border border-black/5 rounded-xl px-2 py-3 text-[12px] font-bold outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Type */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Body Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-4 py-2.5 rounded-xl font-black uppercase tracking-tighter text-[10px] transition-all border ${
                            activeCategory === cat ? 'bg-[var(--brand-yellow)] border-[var(--brand-yellow)] text-[var(--bg-dark)] shadow-md shadow-[var(--brand-yellow)]/20' : 'bg-slate-50 border-transparent text-[var(--bg-dark)]/40 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Experience</h3>
                    <div className="flex flex-wrap gap-2">
                      {experienceOptions.map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setActiveExperience(opt)}
                          className={`px-4 py-2.5 rounded-xl font-black uppercase tracking-tighter text-[10px] transition-all border ${
                            activeExperience.toLowerCase() === opt.toLowerCase() ? 'bg-[var(--bg-dark)] border-[var(--bg-dark)] text-white shadow-lg shadow-black/10' : 'bg-slate-50 border-transparent text-[var(--bg-dark)]/40 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Price Range</h3>
                      <span className="text-[11px] font-black text-emerald-600">
                        {mounted ? `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}` : '...'}
                      </span>
                    </div>
                    
                    <div className="relative px-2">
                      <div className="range-slider-container">
                        <div className="range-slider-track !h-1.5"></div>
                        <div 
                          className="range-slider-progress !h-1.5"
                          style={{
                            left: `${(priceRange[0] / 10000) * 100}%`,
                            right: `${100 - (priceRange[1] / 10000) * 100}%`
                          }}
                        ></div>
                        <input
                          type="range" min="0" max="10000" step="500" value={priceRange[0]}
                          onChange={(e) => {
                            const val = Math.min(Number(e.target.value), priceRange[1] - 500);
                            setPriceRange([val, priceRange[1]]);
                          }}
                          className="range-slider-input"
                        />
                        <input
                          type="range" min="0" max="10000" step="500" value={priceRange[1]}
                          onChange={(e) => {
                            const val = Math.max(Number(e.target.value), priceRange[0] + 500);
                            setPriceRange([priceRange[0], val]);
                          }}
                          className="range-slider-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trans & Seats */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-black/5">
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Transmission</h3>
                      <div className="flex flex-col gap-2">
                        {transmissionOptions.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => setTransmission(opt)}
                            className={`px-3 py-2 rounded-lg font-black uppercase tracking-tighter text-[10px] transition-all border ${
                              transmission === opt ? 'bg-[var(--bg-dark)] border-[var(--bg-dark)] text-white' : 'bg-slate-50 border-transparent text-[var(--bg-dark)]/40'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Seats</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {seatOptions.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => setSeats(opt)}
                            className={`w-10 h-10 rounded-xl font-black text-[11px] transition-all border ${
                              seats === opt ? 'bg-[var(--brand-yellow)] border-[var(--brand-yellow)] text-[var(--bg-dark)]' : 'bg-slate-50 border-transparent text-[var(--bg-dark)]/40'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            <div className="flex-grow">
              <div className={
                viewMode === 'grid' 
                ? `grid gap-6 ${showFilters ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`
                : "flex flex-col gap-6"
              }>
                {loading ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="h-[480px] bg-white rounded-[3rem] animate-pulse" />)
                ) : filteredTemplates.length === 0 ? (
                  <div className="col-span-full py-40 text-center">
                    <h3 className="text-2xl font-black text-[var(--bg-dark)] mb-2 uppercase">No Cars Found</h3>
                    <p className="text-[var(--bg-dark)]/40 font-bold uppercase tracking-widest text-[10px]">Adjust your filters to see more results</p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <VehicleCard 
                      key={template.id}
                      template={template}
                      viewMode={viewMode}
                      formatPrice={formatPrice}
                      mounted={mounted}
                    />
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