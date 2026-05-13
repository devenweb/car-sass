'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRight, Star, Users, Settings2, Fuel, 
  ShieldCheck, MapPin, Sparkles, ChevronRight, Music, Shield
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SmartImage } from '@/lib/image';
import { useLocalization } from '@/lib/currency';

export default function HomePage() {
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { formatPrice } = useLocalization();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // 1. Fetch Templates
        const { data: templates, error: tError } = await supabase
          .from('vehicle_templates')
          .select('*')
          .eq('published_status', 'published')
          .limit(4);
        if (tError) throw tError;

        // 2. Fetch Pricing
        const { data: pricing, error: pError } = await supabase
          .from('vehicle_pricing')
          .select('vehicle_template_id, daily_price');

        // 3. Fetch Units
        const { data: units, error: uError } = await supabase
          .from('vehicle_units')
          .select('vehicle_template_id, availability_status');

        const enriched = (templates || []).map(t => {
          const carPricing = pricing?.filter(p => p.vehicle_template_id === t.id) || [];
          const carUnits = units?.filter(u => u.vehicle_template_id === t.id) || [];
          const availableCount = carUnits.filter(u => u.availability_status === "available").length;
          
          // Dynamic Pricing Logic
          const dailyPrices = carPricing.map(p => p.daily_price);
          const minPrice = dailyPrices.length > 0 ? Math.min(...dailyPrices) : (t.daily_price || 1500);
          
          return { ...t, available_count: availableCount, min_price: minPrice };
        });

        setFeaturedTemplates(enriched);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const experiences = [
    { image: "/assets/hyundai_creta.png", label: 'Family & 7-Seaters', filter: 'family', desc: 'Space for everyone.' },
    { image: "/assets/wedding_happy_couple_luxury_car.png", label: 'Honeymoon Premium', filter: 'honeymoon', desc: 'Romance on wheels.' },
    { image: "/assets/kia_sportage_gt.png", label: 'Sporty & Dynamic', filter: 'sporty', desc: 'Power and style.' },
    { image: "/assets/bmw_3series.png", label: 'Luxury Executive', filter: 'luxury', desc: 'Ultimate comfort.' },
    { image: "/assets/citroen_c1.png", label: 'Daily Commute', filter: 'economy', desc: 'Simple & reliable.' }
  ];

  const categories = [
    { image: "/assets/kia_sportage.png", label: 'SUV', filter: 'SUV', count: '12' },
    { image: "/assets/audi_a4.png", label: 'Sedan', filter: 'Sedan', count: '8' },
    { image: "/assets/suzuki_celerio.png", label: 'Compact', filter: 'Economy', count: '15' },
    { image: "/assets/mercedes_cclass.png", label: 'Luxury', filter: 'Luxury', count: '5' },
    { image: "/assets/toyota_avanza.png", label: 'MPV', filter: 'SUV', count: '6' }
  ];

  return (
    <div className="page-layout bg-[var(--bg-primary)]">
      <Navbar />
      
      <section className="hero-standard min-h-[85vh] flex items-center">
        <img 
          src="/assets/vibrant_hero_bg.png" 
          className="hero-bg-image" 
          alt="Hero Background" 
        />
        <div className="hero-overlay"></div>

        <div className="content-container relative z-10 py-16">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[var(--brand-yellow)]">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Premium Island Experience</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-[110px] font-black text-white leading-[0.75] tracking-tighter uppercase">
              Drive The <br />
              <span className="text-[var(--brand-yellow)]">Difference.</span>
            </h1>

            <p className="text-xl text-white/60 max-w-xl font-medium leading-relaxed italic">
              Experience Mauritius with a curated fleet of verified vehicles. Transparent pricing and 24/7 support across the island.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link href="/fleet" className="bg-[var(--brand-yellow)] text-[var(--bg-dark)] px-12 py-6 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-[var(--brand-yellow)]/20">
                Explore Our DRIVE
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Experiences Section */}
      {/* 1. Experiences Section - Hidden as per user request
      <section className="py-12 -mt-16 relative z-20">
        <div className="content-container">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {experiences.map((exp, i) => (
                  <Link 
                    key={i} 
                    href={`/fleet?experience=${exp.filter}`}
                    className="group relative h-[450px] rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-end border-8 border-white shadow-2xl shadow-black/20 hover:-translate-y-3 transition-all duration-500 active:scale-95 bg-[var(--bg-primary)]"
                  >
                    <div className="absolute inset-0 z-0">
                       <img 
                         src={exp.image} 
                         className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[1.5s]" 
                         alt={exp.label} 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    
                    <div className="relative z-10 p-10 space-y-3 text-center">
                       <h4 className="text-[20px] font-black uppercase tracking-tight text-white leading-none">
                          {exp.label}
                       </h4>
                       <p className="text-[10px] font-bold text-[var(--brand-yellow)] uppercase tracking-[0.3em]">
                          {exp.desc}
                       </p>
                    </div>

                    <div className="absolute top-8 right-8 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[var(--brand-yellow)] group-hover:text-[var(--bg-dark)] transition-all">
                       <ChevronRight className="w-6 h-6" />
                    </div>
                  </Link>
                ))}
           </div>
        </div>
      </section>
      */}

      {/* 2. Categories Section */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="content-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                Browse By <br />
                <span className="text-[var(--brand-yellow)]">Category.</span>
              </h2>
            </div>
            <Link href="/fleet" className="group flex items-center gap-4 text-[var(--bg-dark)] font-black uppercase tracking-widest text-sm">
                 Explore All
                <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-[var(--bg-dark)] group-hover:text-white transition-all">
                   <ChevronRight className="w-6 h-6" />
                </div>
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
             {categories.map((cat, i) => (
                <Link 
                  key={i} 
                  href={`/fleet?category=${cat.filter}`}
                  className="group relative h-[320px] rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-end border-[0px] shadow-2xl shadow-black/20 hover:-translate-y-3 transition-all duration-500 active:scale-95 bg-[var(--bg-primary)]"
                >
                  <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                     <img 
                       src={cat.image} 
                       className="w-full h-full object-contain transform scale-100 group-hover:scale-110 transition-transform duration-700" 
                       alt={cat.label} 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100"></div>
                  </div>
                  
                  <div className="relative z-10 p-8 space-y-2 text-center w-full">
                     <h4 className="text-[14px] lg:text-[16px] font-black uppercase tracking-tight text-white leading-none">
                        {cat.label}
                     </h4>
                     <div className="h-1 w-10 bg-[var(--brand-yellow)] mx-auto rounded-full"></div>
                     <p className="text-[8px] font-bold text-white/50 uppercase tracking-[0.2em]">
                        {cat.count} Vehicles
                     </p>
                  </div>
                </Link>
             ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Fleet */}
      <section className="py-24 relative bg-[var(--bg-primary)]">
        <div className="content-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-3">
              <h2 className="text-5xl md:text-7xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                Featured <br />
                <span className="text-[var(--brand-yellow)]">Selections.</span>
              </h2>
            </div>
            <Link href="/fleet" className="group flex items-center gap-4 text-[var(--bg-dark)] font-black uppercase tracking-widest text-sm">
              View All Vehicles
              <div className="w-14 h-14 rounded-full border-2 border-black/10 flex items-center justify-center group-hover:bg-[var(--bg-dark)] group-hover:text-white transition-all">
                <ChevronRight className="w-8 h-8" />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="aspect-[16/9] bg-white rounded-[3rem] animate-pulse" />)
            ) : (
              featuredTemplates.map((template) => (
                <Link 
                  key={template.id} 
                  href={`/fleet/${template.id}`}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-black/5 shadow-xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 flex flex-col h-full"
                >
                  <div className="relative h-[300px] w-full bg-[var(--bg-primary)] overflow-hidden transition-colors duration-700">
                    <div className="absolute top-8 left-8 z-20 flex flex-col gap-2">
                       <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-[0.1em] text-[var(--bg-dark)] shadow-xl border border-black/5">
                        {template.category} Verified
                       </span>
                       {mounted && template.available_count > 0 && (
                         <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-xl w-fit">
                           {template.available_count} Available
                         </span>
                       )}
                    </div>
                    <div className="w-full h-full p-2 flex items-center justify-center relative">
                       <SmartImage 
                         src={template.default_thumbnail || template.image_url} 
                         className="w-full h-full object-contain transform scale-100 group-hover:scale-110 transition-transform duration-[1s] z-10" 
                         alt={`${template.brand} ${template.model}`} 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-100"></div>
                    </div>
                  </div>

                  <div className="px-6 py-6 space-y-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start">
                       <div className="space-y-2">
                          <h3 className="text-2xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-[0.9] group-hover:text-[var(--brand-yellow)] transition-colors duration-500">
                             {template.brand} {template.model}
                          </h3>
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-primary)] rounded-lg border border-black/5 shrink-0">
                          <Star className="w-3 h-3 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                          <span className="text-[12px] font-black text-[var(--bg-dark)]">{Number(template.rating || 5.0).toFixed(1)}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 border-y border-black/5 mb-5">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-black/5 flex items-center justify-center shrink-0">
                             <Users className="w-4 h-4 text-[var(--brand-yellow)]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                             <span className="text-[7px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.2em] leading-none">Seats</span>
                             <span className="text-[10px] font-black text-[var(--bg-dark)] uppercase tracking-tight truncate">
                               {mounted ? `${template.seats}` : '...'}
                             </span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-black/5 flex items-center justify-center shrink-0">
                             <Settings2 className="w-4 h-4 text-[var(--brand-yellow)]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                             <span className="text-[7px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.2em] leading-none">Gearbox</span>
                             <span className="text-[10px] font-black text-[var(--bg-dark)] uppercase tracking-tight truncate">
                               {mounted ? (template.transmission?.slice(0, 4) || 'Auto') : '...'}
                             </span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-black/5 flex items-center justify-center shrink-0">
                             <Music className="w-4 h-4 text-[var(--brand-yellow)]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                             <span className="text-[7px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.2em] leading-none">Audio</span>
                             <span className="text-[10px] font-black text-[var(--bg-dark)] uppercase tracking-tight truncate">
                               {mounted ? (template.has_hifi ? 'HiFi' : 'BT') : '...'}
                             </span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-black/5 flex items-center justify-center shrink-0">
                             <Shield className="w-4 h-4 text-[var(--brand-yellow)]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                             <span className="text-[7px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.2em] leading-none">Safety</span>
                             <span className="text-[10px] font-black text-[var(--bg-dark)] uppercase tracking-tight truncate">
                               {mounted ? `${template.airbag_count || 2} Airbags` : '...'}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="pt-5 border-t border-black/5 flex items-center justify-between mt-3">
                      <div className="flex flex-col">
                         {template.marketing_strikethrough_price && (
                           <span className="text-[11px] font-bold text-rose-500 line-through mb-0.5 opacity-60 leading-none">
                             {formatPrice(template.marketing_strikethrough_price)}
                           </span>
                         )}
                         <span className="text-[8px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.3em] leading-none mb-1">Starting At</span>
                         <span className="text-[26px] font-black text-[var(--bg-dark)] tracking-tighter leading-none">
                           {mounted ? formatPrice(template.min_price) : '...'}
                         </span>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--bg-dark)] shadow-lg group-hover:scale-110 transition-all duration-500">
                         <ArrowRight className="w-7 h-7" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}