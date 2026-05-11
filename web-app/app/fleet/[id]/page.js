'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  ArrowRight, Users, Settings2, Fuel, Star, 
  MapPin, CheckCircle2, ShieldCheck, Clock, 
  ChevronRight, Sparkles, MessageSquare, Phone, Car,
  Shield, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SmartImage } from '@/lib/image';
import { useLocalization } from '@/lib/currency';

function CarDetailContent() {
  const params = useParams();
  const id = params?.id;
  const [template, setTemplate] = useState(null);
  const [units, setUnits] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useLocalization();

  useEffect(() => {
    if (id) fetchTemplateData();
  }, [id]);

  async function fetchTemplateData() {
    setLoading(true);
    try {
      // 1. Fetch Template
      const { data: templateData, error: templateError } = await supabase
        .from('vehicle_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (templateError) throw templateError;

      if (templateData) {
        setTemplate(templateData);
        
        // 2. Fetch Units for this template
        const { data: unitData, error: unitError } = await supabase
          .from('vehicle_units')
          .select('*')
          .eq('vehicle_template_id', id)
          .eq('availability_status', 'available');
        
        if (unitError) throw unitError;
        setUnits(unitData || []);

        // 3. Fetch Pricing for this template
        const { data: pricingData, error: pricingError } = await supabase
          .from('vehicle_pricing')
          .select('daily_price')
          .eq('vehicle_template_id', id);

        if (pricingError) throw pricingError;

        // Determine starting price (dynamic > default)
        const dailyPrices = pricingData?.map(p => p.daily_price) || [];
        const dynamicMin = dailyPrices.length > 0 ? Math.min(...dailyPrices) : (templateData.daily_price || 1500);
        setMinPrice(dynamicMin);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[var(--brand-yellow)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!template) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center space-y-6">
      <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">Model Not Found</h2>
      <Link href="/fleet" className="bg-[var(--brand-yellow)] text-[var(--bg-dark)] px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm">
        Back to Fleet
      </Link>
    </div>
  );

  const templateImageUrl = template.image_url;
  const availableCount = units.filter(u => u.availability_status === 'available').length;

  return (
    <div className="page-layout bg-[var(--bg-primary)]">
      <Navbar />

      <section className="hero-standard min-h-[60vh] flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <SmartImage src={templateImageUrl} className="w-full h-full object-cover blur-[80px] opacity-30 scale-125" alt={`Rent ${template?.brand} ${template?.model} Mauritius`} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-dark)]/60 to-[var(--bg-dark)]"></div>
        </div>
        
        <div className="content-container relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[var(--brand-yellow)] shadow-2xl">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{template.category} COLLECTION</span>
                </div>
                {availableCount > 0 ? (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{availableCount} AVAILABLE NOW</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-400">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">FULLY BOOKED</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-[100px] font-black text-white uppercase tracking-tighter leading-[0.8]">
                  {template.brand} <br/>
                  <span className="text-[var(--brand-yellow)]">{template.model}</span>
                </h1>
                <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-sm">Verified Inventory • Mauritius Fleet</p>
              </div>

              <div className="flex flex-wrap gap-10 pt-4">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--brand-yellow)] shadow-xl shadow-black/20">
                       <Users size={24} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1">Seating</span>
                       <span className="text-xl font-black text-white uppercase tracking-tight">{template.seats} Adults</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--brand-yellow)] shadow-xl shadow-black/20">
                       <Settings2 size={24} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1">Gearbox</span>
                       <span className="text-xl font-black text-white uppercase tracking-tight">{template.transmission}</span>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="relative group perspective-1000">
               <div className="absolute inset-0 bg-[var(--brand-yellow)] blur-[150px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
               <div className="relative z-10 transform group-hover:scale-110 group-hover:-rotate-2 transition-all duration-1000 origin-center drop-shadow-[0_50px_50px_rgba(0,0,0,0.5)]">
                 <img 
                   src={templateImageUrl} 
                   className="w-full h-auto object-contain" 
                   alt={`${template.brand} ${template.model}`} 
                 />
               </div>
            </div>
          </div>
        </div>
      </section>

      <main className="content-container py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-8 space-y-24">
            <div className="space-y-12">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--bg-dark)] border-l-8 border-[var(--brand-yellow)] pl-8">Vehicle Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'Body Type', value: template.category, icon: Car },
                  { label: 'Transmission', value: template.transmission, icon: Settings2 },
                  { label: 'Fuel Configuration', value: 'Efficient Hybrid/Petrol', icon: Fuel },
                  { label: 'Interior Capacity', value: `${template.seats} Seater`, icon: Users },
                  { label: 'Location Coverage', value: 'Mauritius Island-wide', icon: MapPin },
                  { label: 'Assistance Plan', value: 'Premium Roadside Support', icon: ShieldCheck }
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-8 p-10 bg-white rounded-[3rem] border border-black/5 shadow-sm group hover:shadow-2xl transition-all duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center text-[var(--bg-dark)]/20 group-hover:bg-[var(--brand-yellow)] group-hover:text-[var(--bg-dark)] transition-all">
                      <spec.icon size={28} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.3em] mb-1">{spec.label}</span>
                       <span className="text-xl font-black text-[var(--bg-dark)] uppercase tracking-tight">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10 bg-white rounded-[4rem] p-16 border border-black/5 relative overflow-hidden shadow-2xl shadow-black/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-yellow)] opacity-[0.03] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <h3 className="text-3xl font-black uppercase tracking-tighter relative z-10">Premium Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 relative z-10">
                {['Premium Sound System', 'Touchscreen Infotainment', 'Reverse Park Assist', 'Multizone Climate Control', 'Safety Airbag Suite', 'Dynamic Stability Control'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-5 text-[var(--bg-dark)]/70 font-bold group">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 sticky top-32 space-y-10">
            <div className="bg-[var(--bg-dark)] rounded-[3.5rem] p-12 text-white shadow-3xl shadow-[var(--brand-yellow)]/5 space-y-10 relative overflow-hidden border border-white/5">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--brand-yellow)] opacity-10 blur-3xl rounded-full"></div>
              <div className="space-y-3 relative z-10">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">STARTING FROM</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black text-[var(--brand-yellow)] tracking-tighter">{formatPrice(minPrice)}</span>
                  <span className="text-lg font-bold text-white/20 uppercase">/ Day</span>
                </div>
              </div>

              <div className="space-y-6 border-t border-white/10 pt-10 relative z-10">
                {['Unlimited Island Mileage', 'Verified Mechanical State', 'Included Rental Insurance'].map((benefit) => (
                   <div key={benefit} className="flex items-center gap-5 group">
                      <div className="w-6 h-6 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--bg-dark)] shadow-lg shadow-[var(--brand-yellow)]/20 group-hover:scale-110 transition-transform">
                         <CheckCircle2 size={14} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/80">{benefit}</span>
                   </div>
                ))}
              </div>

              <Link 
                href={`/contact?template=${template.id}`}
                className="w-full bg-[var(--brand-yellow)] text-[var(--bg-dark)] py-7 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-[var(--brand-yellow)]/20 relative z-10"
              >
                Inquire Availability
                <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="flex items-center justify-center gap-2 pt-4 relative z-10 opacity-30">
                 <Shield size={12} className="text-emerald-500" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em]">SECURE SERVICE GUARANTEE</span>
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-10 border border-black/5 space-y-10 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--bg-dark)] flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-yellow)]"></div>
                Assigned Asset
              </h3>
              <p className="text-[10px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-widest leading-relaxed">
                Booking this model guarantees a vehicle of this exact specification. The physical unit (plate number) will be assigned at pickup.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CarDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--brand-yellow)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CarDetailContent />
    </Suspense>
  );
}