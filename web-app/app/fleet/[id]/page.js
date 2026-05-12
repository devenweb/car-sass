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
    startTime: '10:00',
    endDate: '',
    endTime: '10:00',
    pickupLocation: 'airport',
    pickupAddress: '',
    returnLocation: 'airport',
    returnAddress: '',
    message: '',
    agreedToTerms: false
  });
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dynamic Invoice Calculation
  const [invoice, setInvoice] = useState({
    days: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    extrasTotal: 0
  });

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const extrasTotal = selectedExtras.reduce((acc, curr) => acc + (curr.price_per_day * diffDays), 0);
        const subtotal = (minPrice * diffDays) + extrasTotal;
        const tax = subtotal * 0.15;
        const total = subtotal + tax;

        setInvoice({
          days: diffDays,
          subtotal,
          tax,
          total,
          extrasTotal
        });
      } else {
        setInvoice({ days: 0, subtotal: 0, tax: 0, total: 0, extrasTotal: 0 });
      }
    }
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime, selectedExtras, minPrice]);

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
    if (!formData.agreedToTerms) {
      alert('Please agree to the Terms and Conditions.');
      return;
    }
    
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
          pickup_datetime: `${formData.startDate}T${formData.startTime}`,
          return_datetime: `${formData.endDate}T${formData.endTime}`,
          pickup_address: formData.pickupAddress,
          return_address: formData.returnAddress,
          pickup_location_type: formData.pickupLocation,
          return_location_type: formData.returnLocation,
          status: 'pending',
          subtotal: invoice.subtotal,
          tax_amount: invoice.tax,
          total_amount: invoice.total,
          agreed_to_terms: formData.agreedToTerms
        }]);
      }

      await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Vehicle: ${template.brand} ${template.model}\nDates: ${formData.startDate} ${formData.startTime} to ${formData.endDate} ${formData.endTime}\nPickup: ${formData.pickupLocation} (${formData.pickupAddress})\nReturn: ${formData.returnLocation} (${formData.returnAddress})\nExtras: ${selectedExtras.map(ex => ex.name).join(', ')}\nTotal: ${formatPrice(invoice.total)}\n\nNotes: ${formData.message}`,
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
                  <span className="px-4 py-1.5 bg-red-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-600">On Waitlist</span>
                )}
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                {template.brand} <span className="text-[var(--brand-yellow)]">{template.model}</span>
              </h1>
              <p className="text-[11px] font-bold text-[var(--bg-dark)]/30 uppercase tracking-[0.4em]">Verified Inventory • Mauritius Fleet</p>
            </div>

            <div className="relative group rounded-[3.3rem] bg-slate-50 p-11 border border-black/5 overflow-hidden">
               <SmartImage 
                 src={templateImageUrl} 
                 className="w-full h-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" 
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
                <div key={i} className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[var(--brand-yellow)]">
                    <spec.icon size={24} />
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-[8px] font-black text-[var(--bg-dark)]/30 uppercase tracking-widest leading-none mb-1">{spec.label}</span>
                     <span className="text-sm font-black text-[var(--bg-dark)] uppercase truncate">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--bg-dark)]">Premium Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Array.isArray(template.features_json) && template.features_json.length > 0 
                  ? template.features_json 
                  : ['Climate Control', 'Reverse Sensors', 'Multimedia System', 'Cruise Control']
                ).map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--bg-dark)]/60">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <aside className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="bg-[var(--bg-dark)] rounded-[3.3rem] p-11 md:p-14 text-white shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--brand-yellow)] opacity-10 blur-3xl"></div>
              
              <div className="mb-12 space-y-4">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Reservation Inquiry</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-[var(--brand-yellow)] tracking-tighter">
                    {mounted ? formatPrice(minPrice) : '...'}
                  </span>
                  <span className="text-sm font-bold text-white/20 uppercase tracking-widest">/ Day</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold text-sm focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      placeholder="Your Name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold text-sm focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      placeholder="your@email.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Pickup Date & Time</label>
                      <div className="flex gap-3">
                        <input 
                          required
                          type="date" 
                          className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 py-5 text-white font-bold text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                        <input 
                          required
                          type="time" 
                          className="w-28 bg-white/5 border border-white/10 rounded-2xl px-5 py-5 text-white font-bold text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Return Date & Time</label>
                      <div className="flex gap-3">
                        <input 
                          required
                          type="date" 
                          className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 py-5 text-white font-bold text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                        <input 
                          required
                          type="time" 
                          className="w-28 bg-white/5 border border-white/10 rounded-2xl px-5 py-5 text-white font-bold text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                          value={formData.endTime}
                          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="space-y-8 pt-6 border-t border-white/10">
                  <div className="space-y-5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Pickup Location & Address</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['airport', 'hotel', 'agency'].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setFormData({...formData, pickupLocation: loc})}
                          className={`py-4 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${
                            formData.pickupLocation === loc 
                              ? 'bg-[var(--brand-yellow)] border-[var(--brand-yellow)] text-[var(--bg-dark)]' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold text-sm focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      placeholder={formData.pickupLocation === 'hotel' ? "Hotel / Villa Name" : "Specific Address / Flight No"} 
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                    />
                  </div>

                  <div className="space-y-5 pt-6 border-t border-white/5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Return Location & Address</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['airport', 'hotel', 'agency'].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setFormData({...formData, returnLocation: loc})}
                          className={`py-4 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${
                            formData.returnLocation === loc 
                              ? 'bg-[var(--brand-yellow)] border-[var(--brand-yellow)] text-[var(--bg-dark)]' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold text-sm focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      placeholder={formData.returnLocation === 'hotel' ? "Hotel / Villa Name" : "Specific Address / Flight No"} 
                      value={formData.returnAddress}
                      onChange={(e) => setFormData({...formData, returnAddress: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-5 pt-6 border-t border-white/10">
                   <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Premium Extras</h4>
                   <BookingExtras onSelectionChange={setSelectedExtras} isDark={true} />
                </div>

                {/* Live Invoice Breakdown */}
                {invoice.days > 0 && (
                  <div className="bg-white/5 rounded-[2.5rem] p-8 space-y-6 border border-white/5 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4">
                      <span>Description</span>
                      <span>Amount</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-white/60">Rental ({invoice.days} Days)</span>
                        <span className="text-[11px] font-black text-white">{formatPrice(minPrice * invoice.days)}</span>
                      </div>
                      {invoice.extrasTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-white/60">Selected Extras</span>
                          <span className="text-[11px] font-black text-white">{formatPrice(invoice.extrasTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="text-[11px] font-bold text-white/40 italic">Subtotal</span>
                        <span className="text-[11px] font-black text-white/60">{formatPrice(invoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-[var(--brand-yellow)]/60">TVA (15%)</span>
                        <span className="text-[11px] font-black text-[var(--brand-yellow)]">{formatPrice(invoice.tax)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-white/10">
                       <span className="text-sm font-black uppercase tracking-widest text-white">Total TTC</span>
                       <span className="text-3xl font-black text-[var(--brand-yellow)] tracking-tighter">{formatPrice(invoice.total)}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4 px-4">
                    <input 
                      type="checkbox" 
                      required
                      id="terms"
                      className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[var(--brand-yellow)] focus:ring-[var(--brand-yellow)]"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                    />
                    <label htmlFor="terms" className="text-[9px] font-bold text-white/40 leading-relaxed cursor-pointer select-none">
                      I have read and agree to the <Link href="/terms" className="text-[var(--brand-yellow)] underline">Terms and Conditions of Sale</Link>.
                    </label>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-[var(--brand-yellow)] text-[var(--bg-dark)] py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[var(--brand-yellow)]/10 disabled:opacity-50"
                  >
                     {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
                     <ArrowRight size={16} />
                  </button>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-2">
                   <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Action Required</span>
                   </div>
                   <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                     Please <Link href="/login" className="text-white underline">login</Link> or <Link href="/register" className="text-white underline">Create an account</Link> to track your booking status.
                   </p>
                </div>
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