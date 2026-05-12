'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  ArrowRight, Users, Settings2, Fuel, Star, 
  MapPin, CheckCircle2, ShieldCheck, Clock, 
  ChevronRight, Sparkles, MessageSquare, Phone, Car,
  Shield, AlertTriangle, Music
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SmartImage } from '@/lib/image';
import { useLocalization } from '@/lib/currency';
import BookingExtras from '@/components/BookingExtras';

function CarDetailContent() {
  const params = useParams();
  const id = params?.id;
  const [template, setTemplate] = useState(null);
  const [units, setUnits] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { formatPrice } = useLocalization();

  // Booking form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    message: ''
  });
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (id) fetchTemplateData();
  }, [id]);

  async function fetchTemplateData() {
    setLoading(true);
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from('vehicle_templates').select('*');
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }

      const { data: templateData, error: templateError } = await query.single();
      if (templateError) throw templateError;

      if (templateData) {
        setTemplate(templateData);
        const templateId = templateData.id;
        const { data: unitData, error: unitError } = await supabase
          .from('vehicle_units')
          .select('*')
          .eq('vehicle_template_id', templateId)
          .eq('availability_status', 'available');
        
        if (unitError) throw unitError;
        setUnits(unitData || []);

        const { data: pricingData, error: pricingError } = await supabase
          .from('vehicle_pricing')
          .select('daily_price')
          .eq('vehicle_template_id', templateId);

        if (pricingError) throw pricingError;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let customerId;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', formData.email)
        .single();
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{ name: formData.name, email: formData.email, phone: formData.phone }])
          .select().single();
        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      if (template?.id && customerId) {
        const availableUnitId = units[0]?.id;
        
        await supabase.from('rentals').insert([{
          customer_id: customerId,
          vehicle_unit_id: availableUnitId || null,
          start_date: formData.startDate || new Date().toISOString().split('T')[0],
          end_date: formData.endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          status: 'pending',
          total_price: 0
        }]);
      }

      await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Vehicle: ${template.brand} ${template.model}\nDates: ${formData.startDate} to ${formData.endDate}\nExtras: ${selectedExtras.map(ex => ex.name).join(', ')}\n\nNotes: ${formData.message}`,
        status: 'new'
      }]);

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error processing booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[var(--brand-yellow)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!template) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
      <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">Model Not Found</h2>
      <Link href="/fleet" className="text-[var(--bg-dark)] font-black uppercase tracking-widest text-xs underline">Back to Fleet</Link>
    </div>
  );

  const templateImageUrl = template.default_thumbnail || template.image_url;
  const availableCount = units.filter(u => u.availability_status === 'available').length;

  if (submitted) {
    return (
      <div className="page-layout bg-white min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-20 px-6">
          <div className="max-w-xl w-full text-center space-y-8">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} />
             </div>
             <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">Booking Received.</h2>
             <p className="text-[10px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-[0.2em] leading-relaxed">
               Our concierge team will review your requirements for the {template.brand} {template.model} and contact you shortly.
             </p>
             <Link href="/fleet" className="inline-block bg-[var(--bg-dark)] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">Return to Fleet</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-layout bg-white min-h-screen">
      <Navbar />

      <main className="content-container pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Vehicle Info */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-[var(--bg-dark)]/60">{template.category}</span>
                {availableCount > 0 ? (
                  <span className="px-3 py-1 bg-emerald-50 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-600">Available Now</span>
                ) : (
                  <span className="px-3 py-1 bg-red-50 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-600">On Waitlist</span>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                {template.brand} <span className="text-[var(--brand-yellow)]">{template.model}</span>
              </h1>
              <p className="text-[10px] font-bold text-[var(--bg-dark)]/30 uppercase tracking-[0.4em]">Verified Inventory • Mauritius Fleet</p>
            </div>

            <div className="relative group rounded-[3rem] bg-slate-50 p-10 border border-black/5 overflow-hidden">
               <SmartImage 
                 src={templateImageUrl} 
                 className="w-full h-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
                 alt={`${template.brand} ${template.model}`} 
               />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { label: 'Seats', value: `${template.seats}`, icon: Users },
                { label: 'Gearbox', value: template.transmission, icon: Settings2 },
                { label: 'Fuel', value: template.fuel_type || 'Petrol', icon: Fuel },
                { label: 'Audio', value: template.has_hifi ? 'HiFi' : 'BT', icon: Music },
                { label: 'Safety', value: `${template.airbag_count || 2} Bags`, icon: Shield },
                { label: 'Rating', value: Number(template.rating || 5.0).toFixed(1), icon: Star }
              ].map((spec, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-black/5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[var(--brand-yellow)]">
                    <spec.icon size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-[7px] font-black text-[var(--bg-dark)]/30 uppercase tracking-widest leading-none mb-1">{spec.label}</span>
                     <span className="text-xs font-black text-[var(--bg-dark)] uppercase truncate">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--bg-dark)]">Premium Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Array.isArray(template.features_json) && template.features_json.length > 0 
                  ? template.features_json 
                  : ['Climate Control', 'Reverse Sensors', 'Multimedia System', 'Cruise Control']
                ).map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/60">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <aside className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="bg-[var(--bg-dark)] rounded-[3rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-yellow)] opacity-10 blur-3xl"></div>
              
              <div className="mb-10 space-y-4">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Reservation Inquiry</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[var(--brand-yellow)] tracking-tighter">
                    {mounted ? formatPrice(minPrice) : '...'}
                  </span>
                  <span className="text-xs font-bold text-white/20 uppercase tracking-widest">/ Day</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-4">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-xs focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      placeholder="Your Name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-4">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-xs focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      placeholder="your@email.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-4">Start Date</label>
                      <input 
                        required
                        type="date" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold text-[10px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-4">End Date</label>
                      <input 
                        required
                        type="date" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold text-[10px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

{/* <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Premium Extras</h4>
                   <BookingExtras onSelectionChange={setSelectedExtras} isDark={true} />
                </div> */}

                <button 
                  disabled={isSubmitting}
                  className="w-full bg-[var(--brand-yellow)] text-[var(--bg-dark)] py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[var(--brand-yellow)]/10 disabled:opacity-50 mt-4"
                >
                   {isSubmitting ? 'Processing...' : 'Reserve This Drive'}
                   <ArrowRight size={16} />
                </button>

                <p className="text-[8px] text-center text-white/20 font-bold uppercase tracking-widest">No immediate payment required • Quote provided via email</p>
              </form>
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