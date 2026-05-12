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
  const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Newest First'];
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
      const { data: templates, error: tError } = await supabase.from("vehicle_templates").select("*").eq('published_status', 'published');
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
      if (sortBy === 'Price: Low to High') return a.min_price - b.min_price;
      if (sortBy === 'Price: High to Low') return b.min_price - a.min_price;
      if (sortBy === 'Newest First') return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });
    
  return (
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
              <aside className="w-full lg:w-[320px] shrink-0 space-y-10">
                <div className="bg-white rounded-[3rem] p-10 border border-black/5 space-y-12 shadow-sm sticky top-32 max-h-[85vh] overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-center pb-2 border-b border-black/5">
                    <button 
                      onClick={resetFilters}
                      className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-[var(--bg-dark)] transition-colors"
                    >
                      Reset All
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Travel Dates</h3>
                      <div className="space-y-3">
                         <div className="space-y-2">
                           <label className="text-[7px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-2">Pickup</label>
                           <div className="flex gap-2">
                             <input 
                               type="date" 
                               value={startDate}
                               onChange={(e) => setStartDate(e.target.value)}
                               className="flex-grow bg-slate-50 border border-black/5 rounded-xl px-3 py-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[var(--brand-yellow)]"
                             />
                             <input 
                               type="time" 
                               value={startTime}
                               onChange={(e) => setStartTime(e.target.value)}
                               className="w-20 bg-slate-50 border border-black/5 rounded-xl px-2 py-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[var(--brand-yellow)]"
                             />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[7px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-2">Return</label>
                           <div className="flex gap-2">
                             <input 
                               type="date" 
                               value={endDate}
                               onChange={(e) => setEndDate(e.target.value)}
                               className="flex-grow bg-slate-50 border border-black/5 rounded-xl px-3 py-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[var(--brand-yellow)]"
                             />
                             <input 
                               type="time" 
                               value={endTime}
                               onChange={(e) => setEndTime(e.target.value)}
                               className="w-20 bg-slate-50 border border-black/5 rounded-xl px-2 py-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[var(--brand-yellow)]"
                             />
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Sort By</h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {sortOptions.map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setSortBy(opt)}
                          className={`px-5 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all text-left ${
                            sortBy === opt ? 'bg-[var(--bg-dark)] text-white shadow-md' : 'bg-slate-50 text-[var(--bg-dark)]/40 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Body Type</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${
                            activeCategory === cat ? 'bg-[var(--brand-yellow)] text-[var(--bg-dark)] shadow-md' : 'bg-slate-50 text-[var(--bg-dark)]/40 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Experiences</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {experienceOptions.map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setActiveExperience(opt)}
                          className={`px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${
                            activeExperience.toLowerCase() === opt.toLowerCase() ? 'bg-[var(--bg-dark)] text-white shadow-md' : 'bg-slate-50 text-[var(--bg-dark)]/40 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Price Range</h3>
                      <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/5 rounded-full">
                        {mounted ? `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}` : '...'}
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
                    viewMode === 'grid' ? (
                      <Link 
                        key={template.id} 
                        href={`/fleet/${template.slug || template.id}`}
                        className="group relative bg-white rounded-[2.5rem] border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden cursor-pointer"
                      >
                          <div className="relative aspect-[16/8.5] overflow-hidden shrink-0 bg-white group-hover:bg-slate-50/50 transition-colors duration-700 p-4">
                            <SmartImage 
                              src={template.default_thumbnail || template.image_url} 
                              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                              alt={`${template.brand} ${template.model}`} 
                            />
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                              <span className="badge-deal !bg-white/95 !text-[var(--bg-dark)] !shadow-lg !border-black/5 px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em]">{template.category}</span>
                              {mounted && (template.available_count > 0 ? (
                                 <span className="px-2.5 py-0.5 bg-emerald-500 text-white rounded-lg text-[7px] font-black uppercase tracking-widest shadow-sm">
                                   {template.available_count} Available
                                 </span>
                               ) : (
                                 <span className="px-2.5 py-0.5 bg-red-500 text-white rounded-lg text-[7px] font-black uppercase tracking-widest shadow-sm">
                                   Sold Out
                                 </span>
                               ))}
                            </div>
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 text-[var(--brand-yellow)] fill-[var(--brand-yellow)]" />
                              <span className="text-[9px] font-black text-[var(--bg-dark)]">{Number(template.rating || 5.0).toFixed(1)}</span>
                            </div>
                          </div>
                          
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-[var(--bg-dark)] text-lg font-black uppercase group-hover:text-[var(--brand-yellow)] transition-colors mb-0.5 tracking-tighter leading-tight">{template.brand} {template.model}</h3>
                            <div className="flex items-center gap-2 mb-3">
                               <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                               <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Verified Fleet</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-3 border-y border-black/5 mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-black/5 flex items-center justify-center shrink-0">
                                  <Users className="w-3.5 h-3.5 text-[var(--brand-yellow)]" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                   <span className="text-[6px] font-black text-[var(--bg-dark)]/30 uppercase tracking-widest leading-none">Seats</span>
                                   <span className="text-[9px] font-black text-[var(--bg-dark)] uppercase tracking-tight truncate">
                                     {mounted ? `${template.seats}` : '...'}
                                   </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-black/5 flex items-center justify-center shrink-0">
                                  <Briefcase className="w-3.5 h-3.5 text-[var(--brand-yellow)]" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                   <span className="text-[6px] font-black text-[var(--bg-dark)]/30 uppercase tracking-widest leading-none">Luggage</span>
                                   <span className="text-[9px] font-black text-[var(--bg-dark)] uppercase tracking-tight truncate">
                                     {mounted ? `${template.luggage_large || 2} Large` : '...'}
                                   </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-black/5 flex items-center justify-center shrink-0">
                                  <Fuel className="w-3.5 h-3.5 text-[var(--brand-yellow)]" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                   <span className="text-[6px] font-black text-[var(--bg-dark)]/30 uppercase tracking-widest leading-none">Fuel</span>
                                   <span className="text-[9px] font-black text-[var(--bg-dark)] uppercase tracking-tight truncate">
                                     {mounted ? (template.fuel_type || 'Gasoline') : '...'}
                                   </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-black/5 flex items-center justify-center shrink-0">
                                  <Smartphone className="w-3.5 h-3.5 text-[var(--brand-yellow)]" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                   <span className="text-[6px] font-black text-[var(--bg-dark)]/30 uppercase tracking-widest leading-none">Tech</span>
                                   <span className="text-[9px] font-black text-[var(--bg-dark)] uppercase tracking-tight truncate">
                                     {mounted ? (template.has_apple_carplay ? 'CarPlay' : 'BT Audio') : '...'}
                                   </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[7px] text-[var(--bg-dark)]/30 font-black uppercase tracking-[0.2em] mb-0.5 leading-none">Starting At</span>
                                <span className="text-xl font-black text-[var(--bg-dark)] tracking-tighter leading-none">
                                  {mounted ? formatPrice(template.min_price) : '...'}
                                </span>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--bg-dark)] shadow-md group-hover:scale-110 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                      </Link>
                    ) : (
                      <Link 
                        key={template.id} 
                        href={`/fleet/${template.slug || template.id}`}
                        className="group relative bg-white rounded-[3rem] border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row overflow-hidden cursor-pointer"
                      >
                         <div className="w-full md:w-80 relative overflow-hidden bg-white group-hover:bg-slate-50/50 transition-colors duration-700 p-6 flex items-center justify-center">
                            <SmartImage 
                              src={template.default_thumbnail || template.image_url} 
                              className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-110" 
                              alt={`${template.brand} ${template.model}`} 
                            />
                            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                              <span className="badge-deal !bg-white/95 !text-[var(--bg-dark)] !shadow-lg !border-black/5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">{template.category}</span>
                            </div>
                         </div>

                         <div className="flex-grow p-8 flex flex-col border-t md:border-t-0 md:border-l border-black/5">
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                  <h3 className="text-[var(--bg-dark)] text-2xl font-black uppercase group-hover:text-[var(--brand-yellow)] transition-colors mb-1 tracking-tighter">{template.brand} {template.model}</h3>
                                  <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                     <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Immediate Confirmation • Premium Quality</span>
                                  </div>
                               </div>
                               <div className="bg-white/90 border border-black/5 px-3 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5 text-[var(--brand-yellow)] fill-[var(--brand-yellow)]" />
                                  <span className="text-xs font-black text-[var(--bg-dark)]">{Number(template.rating || 5.0).toFixed(1)}</span>
                               </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-black/5 mb-6">
                               {[
                                 { icon: Users, label: 'Seats', value: template.seats },
                                 { icon: Briefcase, label: 'Luggage', value: `${template.luggage_large || 2} Large` },
                                 { icon: Fuel, label: 'Fuel', value: template.fuel_type || 'Gasoline' },
                                 { icon: Smartphone, label: 'Tech', value: template.has_apple_carplay ? 'CarPlay' : 'BT' }
                               ].map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center shrink-0">
                                      <item.icon className="w-4 h-4 text-[var(--brand-yellow)]" />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[7px] font-black text-[var(--bg-dark)]/30 uppercase tracking-widest">{item.label}</span>
                                       <span className="text-[10px] font-black text-[var(--bg-dark)] uppercase tracking-tight">{mounted ? item.value : '...'}</span>
                                    </div>
                                 </div>
                               ))}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                               {template.tags?.slice(0, 3).map((tag, idx) => (
                                 <span key={idx} className="px-3 py-1 bg-slate-50 border border-black/5 rounded-lg text-[7px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40">
                                   {tag}
                                 </span>
                               ))}
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5">
                               <div className="flex items-baseline gap-2">
                                  <span className="text-[10px] text-[var(--bg-dark)]/30 font-black uppercase tracking-[0.2em]">Starting At</span>
                                  <span className="text-3xl font-black text-[var(--bg-dark)] tracking-tighter leading-none">
                                    {mounted ? formatPrice(template.min_price) : '...'}
                                  </span>
                                  <span className="text-[8px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-widest">/ Per Day</span>
                               </div>
                               <div className="flex items-center gap-4">
                                  {mounted && template.available_count > 0 && (
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{template.available_count} Cars Left</span>
                                  )}
                                  <div className="h-14 px-8 rounded-2xl bg-[var(--brand-yellow)] flex items-center justify-center gap-3 text-[var(--bg-dark)] font-black uppercase tracking-widest text-[10px] shadow-lg group-hover:scale-[1.02] transition-all">
                                    View Details
                                    <ArrowRight size={18} />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </Link>
                    )
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