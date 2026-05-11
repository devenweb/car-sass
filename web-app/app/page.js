'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRight, Star, Users, Settings2, Fuel, 
  ShieldCheck, MapPin, Sparkles, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SmartImage, optimizeImage } from '@/lib/image';
import { useLocalization } from '@/lib/currency';

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useLocalization();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .limit(4); // Keep it tight
        if (error) throw error;
        setFeaturedCars(data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const experiences = [
    { image: "/assets/hyundai_creta.png", label: 'Family & 7-Seaters', filter: 'SUV', desc: 'Space for everyone.' },
    { image: "/assets/wedding_happy_couple_luxury_car.png", label: 'Honeymoon Premium', filter: 'Premium', desc: 'Romance on wheels.' },
    { image: "/assets/kia_sportage_gt.png", label: 'Sporty & Dynamic', filter: 'Premium', desc: 'Power and style.' },
    { image: "/assets/bmw_3series.png", label: 'Luxury Executive', filter: 'Luxury', desc: 'Ultimate comfort.' },
    { image: "/assets/citroen_c1.png", label: 'Daily Commute', filter: 'Economy', desc: 'Simple & reliable.' }
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
      
      <section className="hero-standard min-h-[75vh] flex items-center">
        <img 
          src="/assets/hero_bg.png" 
          className="hero-bg-image scale-110" 
          alt="Hero Background" 
        />
        <div className="hero-overlay opacity-60"></div>

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
              Experience Mauritius with a curated fleet of verified vehicles. <br className="hidden md:block" />
              Transparent pricing and 24/7 support across the island.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link href="/fleet" className="bg-[var(--brand-yellow)] text-[var(--bg-dark)] px-12 py-6 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-[var(--brand-yellow)]/20">
                Explore The Fleet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Experiences Section - FULL BLEED EDGE TOUCH */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="content-container">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {experiences.map((exp, i) => (
                  <Link 
                    key={i} 
                    href={`/fleet?category=${exp.filter}`}
                    className="group relative h-[320px] rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-end border-[0px] shadow-2xl shadow-black/20 hover:-translate-y-3 transition-all duration-500 active:scale-95 bg-[var(--bg-primary)]"
                  >
                    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                       <img 
                         src={exp.image} 
                         className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700" 
                         alt={exp.label} 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100"></div>
                    </div>
                    
                    <div className="relative z-10 p-8 space-y-2 text-center w-full">
                       <h4 className="text-[14px] lg:text-[16px] font-black uppercase tracking-tight text-white leading-none">
                          {exp.label}
                       </h4>
                       <div className="h-1 w-10 bg-[var(--brand-yellow)] mx-auto rounded-full"></div>
                       <p className="text-[8px] font-bold text-white/50 uppercase tracking-[0.2em] leading-relaxed">
                          {exp.desc}
                       </p>
                    </div>
                  </Link>
                ))}
             </div>
        </div>
      </section>

      {/* 2. Body Type Categories - FULL BLEED EDGE TOUCH */}
      <section className="py-24 bg-white relative">
        <div className="content-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
             <div className="space-y-3">
                <h2 className="text-5xl md:text-7xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                   Browse By <br />
                   <span className="text-[var(--brand-yellow)]">Body Type.</span>
                </h2>
             </div>
             <Link href="/fleet" className="group flex items-center gap-4 text-[var(--bg-dark)] font-black uppercase tracking-widest text-sm">
                Full Collection
                <div className="w-14 h-14 rounded-full border-2 border-black/10 flex items-center justify-center group-hover:bg-[var(--brand-yellow)] group-hover:border-[var(--brand-yellow)] transition-all">
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
                       className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700" 
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

      {/* 3. Featured Fleet - FULL BLEED EDGE TOUCH */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {loading ? (
              [1, 2].map(i => <div key={i} className="aspect-[16/9] bg-white rounded-[3rem] animate-pulse" />)
            ) : (
              featuredCars.map((car) => (
                <Link 
                  key={car.id} 
                  href={`/fleet/${car.id}`}
                  className="group bg-white rounded-[3.5rem] overflow-hidden border border-black/5 shadow-xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 flex flex-col h-full"
                >
                  {/* Full Bleed Image - Edge Touch */}
                  <div className="relative h-[360px] w-full bg-[var(--bg-primary)] overflow-hidden">
                    <div className="absolute top-8 left-8 z-20">
                       <span className="px-6 py-2 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)] shadow-xl border border-black/5">
                        {car.category} Verified
                       </span>
                    </div>
                    <div className="w-full h-full">
                       <SmartImage 
                         src={car.image_url} 
                         className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[1s]" 
                         alt={car.name} 
                       />
                    </div>
                    <div className="absolute bottom-6 right-6 z-10">
                      <div className="bg-[var(--bg-dark)] text-[var(--brand-yellow)] px-8 py-4 rounded-[1.5rem] shadow-xl border-2 border-white/20">
                        <div className="text-2xl font-black tracking-tighter leading-none">
                           {formatPrice(car.price_per_day).replace('Rs ', 'Rs')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-10 py-10 space-y-10 flex-grow flex flex-col">
                    <div className="flex justify-between items-start">
                       <div className="space-y-2">
                          <h3 className="text-5xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-[0.8] group-hover:text-[var(--brand-yellow)] transition-colors duration-500">
                             {car.name}
                          </h3>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--bg-dark)]/30">Immediate Availability</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] rounded-xl border border-black/5">
                          <Star className="w-4 h-4 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                          <span className="text-[16px] font-black text-[var(--bg-dark)]">4.9</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-center gap-4 p-5 bg-[var(--bg-primary)]/50 rounded-2xl border border-black/5">
                          <Users className="w-6 h-6 text-[var(--bg-dark)]/20" />
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-[var(--bg-dark)]/40 uppercase tracking-[0.2em]">Capacity</span>
                             <span className="text-sm font-black text-[var(--bg-dark)] uppercase">{car.seats} Adults</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-5 bg-[var(--bg-primary)]/50 rounded-2xl border border-black/5">
                          <Settings2 className="w-6 h-6 text-[var(--bg-dark)]/20" />
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-[var(--bg-dark)]/40 uppercase tracking-[0.2em]">Transmission</span>
                             <span className="text-sm font-black text-[var(--bg-dark)] uppercase">{car.transmission}</span>
                          </div>
                       </div>
                    </div>

                    <div className="mt-auto pt-10 border-t border-black/5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]">Insured</span>
                       </div>
                       <div className="w-16 h-16 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--bg-dark)] shadow-xl group-hover:scale-110 transition-all duration-500">
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