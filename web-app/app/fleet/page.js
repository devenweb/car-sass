'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  ArrowRight, Star, Users, Fuel, Zap, Wind, Music, Search, SlidersHorizontal, ChevronDown, Filter, X
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
  const [priceSort, setPriceSort] = useState('Default');

  const { formatPrice } = useLocalization();

  const categories = ['All', 'Economy', 'Saloon', 'SUV', 'MPV', 'Prestige'];
  const transmissionOptions = ['All', 'Auto', 'Man'];
  const seatOptions = ['All', '4', '5', '7'];
  const sortOptions = ['Default', 'Low', 'High'];

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_templates')
        .select(`
          *,
          units:vehicle_units(id, daily_price, availability_status)
        `);
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  }

  const filteredTemplates = templates
    .map(t => {
      const availableUnits = t.units?.filter(u => u.availability_status === 'available') || [];
      const minPrice = availableUnits.length > 0 
        ? Math.min(...availableUnits.map(u => u.daily_price)) 
        : (t.units?.[0]?.daily_price || 0);
      
      return { 
        ...t, 
        available_count: availableUnits.length, 
        min_price: minPrice 
      };
    })
    .filter(t => {
      const modelName = `${t.brand} ${t.model}`.toLowerCase();
      const matchesSearch = modelName.includes(searchQuery.toLowerCase());
      let matchesCategory = true;
      if (activeCategory !== 'All') {
        if (activeCategory === 'Economy') matchesCategory = ['Economy', 'Budget', 'Hybrid', 'Compact'].includes(t.category);
        else if (activeCategory === 'Saloon') matchesCategory = t.category === 'Sedan';
        else if (activeCategory === 'SUV') matchesCategory = ['SUV', '4x4', 'Coupe', 'Luxury Edition'].includes(t.category);
        else if (activeCategory === 'MPV') matchesCategory = t.category === 'MPV';
        else if (activeCategory === 'Prestige') matchesCategory = ['Luxury', 'Premium', 'Elite'].includes(t.category);
      }
      let matchesTransmission = true;
      if (transmission !== 'All') {
        matchesTransmission = t.transmission === transmission;
      }
      let matchesSeats = true;
      if (seats !== 'All') {
        matchesSeats = t.seats?.toString() === seats;
      }
      return matchesSearch && matchesCategory && matchesTransmission && matchesSeats;
    })
    .sort((a, b) => {
      if (priceSort === 'Low') return a.min_price - b.min_price;
      if (priceSort === 'High') return b.min_price - a.min_price;
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
                 Cars For <span className="text-[var(--brand-yellow)]">Rent.</span>
               </h1>
               {/* TOGGLE BUTTON - Floating with icon */}
               <button 
                 onClick={() => setShowFilters(!showFilters)}
                 className="w-12 h-12 rounded-full bg-white border border-black/5 shadow-xl flex items-center justify-center text-[var(--bg-dark)] hover:scale-110 transition-all duration-500"
               >
                 {showFilters ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
               </button>
            </div>

            <div className="relative w-full max-w-lg group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[var(--bg-dark)]/20" />
              </div>
              <input 
                type="text"
                placeholder="Find your drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/5 h-16 pl-14 pr-6 rounded-2xl text-base font-black uppercase tracking-widest placeholder:text-[var(--bg-dark)]/10 focus:outline-none shadow-lg transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {showFilters && (
              <aside className="lg:w-72 shrink-0">
                <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-xl sticky top-32 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Category</h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`text-left px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                            activeCategory === cat ? 'bg-[var(--brand-yellow)] text-[var(--bg-dark)] shadow-md' : 'hover:bg-slate-50 text-[var(--bg-dark)]/60'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
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

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Price</h3>
                    <select 
                      value={priceSort}
                      onChange={(e) => setPriceSort(e.target.value)}
                      className="w-full bg-slate-50 border border-black/5 h-12 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] text-[var(--bg-dark)] focus:outline-none"
                    >
                      {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </aside>
            )}

            <div className="flex-grow">
              <div className={`grid gap-6 ${showFilters ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {loading ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="h-[480px] bg-white rounded-[3rem] animate-pulse" />)
                ) : (
                  filteredTemplates.map((template) => (
                    <Link 
                      key={template.id} 
                      href={`/fleet/${template.id}`}
                      className="group relative bg-white rounded-[2.5rem] border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-700 flex flex-col h-[480px] overflow-hidden p-0"
                    >
                      <div className="relative h-[180px] w-full bg-white overflow-hidden shrink-0">
                        <div className="absolute top-5 left-5 z-20 flex flex-col gap-1.5">
                           <span className="px-4 py-1 bg-[var(--brand-yellow)] rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)] shadow-sm">
                            {template.category === 'Sedan' ? 'Saloon' : template.category === 'Luxury' || template.category === 'Elite' ? 'Prestige' : template.category}
                           </span>
                           {template.available_count > 0 ? (
                             <span className="px-4 py-1 bg-green-500 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm">
                               {template.available_count} Available
                             </span>
                           ) : (
                             <span className="px-4 py-1 bg-red-500 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm">
                               Sold Out
                             </span>
                           )}
                        </div>
                        <div className="absolute inset-0 bg-white">
                           <SmartImage 
                             src={template.default_thumbnail || template.image_url} 
                             className="w-full h-full object-cover object-top transform scale-110 group-hover:scale-125 transition-transform duration-1000 mix-blend-multiply" 
                             alt={`${template.brand} ${template.model}`} 
                           />
                           <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/5"></div>
                        </div>
                      </div>

                      <div className="flex-grow px-6 pt-5 pb-5 flex flex-col justify-between bg-white">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                             <h3 className="text-[22px] font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-[0.85] pr-4 group-hover:text-[var(--brand-yellow)] transition-colors">
                                {template.brand} {template.model}
                             </h3>
                             <div className="flex items-center gap-1 pt-1 shrink-0">
                                <Star className="w-3 h-3 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                                <span className="text-[11px] font-black text-[var(--bg-dark)]">4.9</span>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                             <div className="flex items-center gap-2 p-2 rounded-xl border border-black/5 bg-slate-50/30">
                                <Users className="w-3.5 h-3.5 text-[var(--bg-dark)]/20" />
                                <span className="text-[8px] font-black text-[var(--bg-dark)] uppercase tracking-tight">{template.seats} Berths</span>
                             </div>
                             <div className="flex items-center gap-2 p-2 rounded-xl border border-black/5 bg-slate-50/30">
                                <Music className="w-3.5 h-3.5 text-[var(--bg-dark)]/20" />
                                <span className="text-[8px] font-black text-[var(--bg-dark)] uppercase tracking-tight">Hifi Audio</span>
                             </div>
                             <div className="flex items-center gap-2 p-2 rounded-xl border border-black/5 bg-slate-50/30">
                                <Zap className="w-3.5 h-3.5 text-[var(--bg-dark)]/20" />
                                <span className="text-[8px] font-black text-[var(--bg-dark)] uppercase tracking-tight">{template.transmission}</span>
                             </div>
                             <div className="flex items-center gap-2 p-2 rounded-xl border border-black/5 bg-slate-50/30">
                                <Wind className="w-3.5 h-3.5 text-[var(--bg-dark)]/20" />
                                <span className="text-[8px] font-black text-[var(--bg-dark)] uppercase tracking-tight">Full A/C</span>
                             </div>
                          </div>
                        </div>

                        <div className="pt-5 border-t border-black/5 flex items-center justify-between mt-3">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.3em] leading-none mb-1">Starting At</span>
                              <span className="text-[26px] font-black text-[var(--bg-dark)] tracking-tighter leading-none">
                                {formatPrice(template.min_price).replace('Rs ', 'Rs')}
                              </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--bg-dark)] shadow-lg group-hover:scale-110 transition-all duration-500">
                              <ArrowRight className="w-6 h-6" />
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