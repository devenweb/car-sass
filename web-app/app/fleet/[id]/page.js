'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { 
  ArrowRight, Users, Settings2, Fuel, Star, 
  MapPin, CheckCircle2, ShieldCheck, Clock, 
  ChevronRight, Sparkles, MessageSquare, Phone, Car,
  Shield, AlertTriangle, Music, Calendar, Plus, UserPlus, FileText
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
  const [pricing, setPricing] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { formatPrice } = useLocalization();

  // Image Gallery state
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);

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
    extrasTotal: 0,
    dailyBaseApplied: 0,
    longTermDiscountApplied: 0
  });

  // Get today's date for validation
  const todayStr = new Date().toISOString().split('T')[0];

  const calculatedInvoice = useMemo(() => {
    if (!template) return null;
    
    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    // Base Price logic - Robust filtering to exclude null/zero prices
    const validUnitPrices = units.map(u => u.daily_price).filter(p => p && Number(p) > 0);
    const basePriceFromUnits = validUnitPrices.length > 0 ? Math.min(...validUnitPrices) : Infinity;

    const validPricingPrices = pricing.map(p => p.daily_price).filter(p => p && Number(p) > 0);
    const basePriceFromPricing = validPricingPrices.length > 0 ? Math.min(...validPricingPrices) : Infinity;

    const overridePrices = [basePriceFromUnits, basePriceFromPricing].filter(p => p !== Infinity);
    let dailyRate = overridePrices.length > 0 ? Math.min(...overridePrices) : (template.daily_price || 1500);
    
    const originalDailyRate = dailyRate;

    // Apply Fixed Discount
    if (template.fixed_discount_amount > 0) {
      dailyRate = Math.max(0, dailyRate - template.fixed_discount_amount);
    }

    // Apply Percentage Discount
    if (template.percentage_discount_rate > 0) {
      dailyRate = dailyRate * (1 - (template.percentage_discount_rate / 100));
    }

    // Apply Long-Term Rental Reward
    const threshold = template.long_term_threshold_days || 5;
    const longTermDiscount = template.long_term_discount_percent || 10;
    let appliedLongTermDiscount = 0;
    if (days >= threshold) {
      dailyRate = dailyRate * (1 - (longTermDiscount / 100));
      appliedLongTermDiscount = longTermDiscount;
    }

    const subtotal = dailyRate * days;
    const marketingSaving = (originalDailyRate - dailyRate) * days;
    
    const extrasTotal = selectedExtras.reduce((sum, extra) => {
      return sum + (Number(extra.price_per_day) * days);
    }, 0);

    const totalBeforeTax = subtotal + extrasTotal;
    const tax = totalBeforeTax * 0.15;
    const total = totalBeforeTax + tax;

    return {
      days,
      dailyBaseApplied: dailyRate,
      originalDailyRate,
      subtotal: totalBeforeTax,
      marketingSaving,
      extrasTotal,
      tax,
      total,
      longTermDiscountApplied: appliedLongTermDiscount,
      threshold
    };
  }, [template, pricing, units, formData, selectedExtras]);

  // Sync calculatedInvoice to invoice state for backward compatibility with existing JSX if needed, 
  // though we should ideally use calculatedInvoice directly.
  useEffect(() => {
    if (calculatedInvoice) {
      setInvoice(calculatedInvoice);
    }
  }, [calculatedInvoice]);

  const availableCount = units.filter(u => u.availability_status === 'available').length;

  // Remove addon fetching since all features are now core
  // useEffect(() => {
  //   fetchAddons();
  // }, []);

  // async function fetchAddons() {
  //   const { data } = await supabase.from("tenants").select("addons").single();
  //   if (data?.addons) setAddons(data.addons);
  // }

  useEffect(() => {
    if (id) fetchCarData();
  }, [id]);

  async function fetchCarData() {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      let query = supabase
        .from("vehicle_templates")
        .select(`
          *,
          vehicle_pricing (*),
          vehicle_units (*)
        `);

      if (isUUID) {
        query = query.or(`id.eq.${id},slug.eq.${id}`);
      } else {
        query = query.eq('slug', id);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      setTemplate(data);
      setPricing(data.vehicle_pricing || []);
      setUnits(data.vehicle_units || []);
      setActiveImage(data.default_thumbnail || data.image_url);

      const { data: imageData } = await supabase
        .from('vehicle_template_images')
        .select('image_url')
        .eq('vehicle_template_id', data.id)
        .order('sort_order', { ascending: true });
      
      const gallery = imageData?.map(img => img.image_url) || [];
      const defaultImg = data.default_thumbnail || data.image_url;
      if (defaultImg && !gallery.includes(defaultImg)) {
        gallery.unshift(defaultImg);
      }
      setGalleryImages(gallery);

      const pricingPrices = data.vehicle_pricing?.map(p => p.daily_price).filter(p => p && Number(p) > 0) || [];
      const unitPrices = data.vehicle_units?.map(u => u.daily_price).filter(p => p && Number(p) > 0) || [];
      const allPrices = [...pricingPrices, ...unitPrices];
      const dynamicMin = allPrices.length > 0 ? Math.min(...allPrices) : (data.daily_price || 1500);
      setMinPrice(dynamicMin);
    } catch (err) {
      console.error("Error fetching car:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Block Rs 0 bookings
    if (invoice.total <= 0) {
      alert('Invalid booking total. Please check your selected dates and extras.');
      return;
    }

    // 1.5 Date Validations
    if (!formData.startDate || !formData.endDate) {
      alert('Please select both Pickup and Return dates.');
      return;
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();

    if (start < now && formData.startDate !== todayStr) {
      alert('Pickup date cannot be in the past.');
      return;
    }

    if (end <= start) {
      alert('Return date must be after the Pickup date.');
      return;
    }

    // 2. Require Customer Name
    if (!formData.name?.trim()) {
      alert('Please provide your Full Name.');
      return;
    }

    // 3. Require Email OR Phone
    if (!formData.email?.trim() && !formData.phone?.trim()) {
      alert('Please provide either an Email Address or a Phone Number so we can contact you.');
      return;
    }

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
      <Link href="/fleet" className="text-[var(--bg-dark)] font-black tracking-widest text-xs underline">Back to Drive</Link>
    </div>
  );

  const templateImageUrl = template.default_thumbnail || template.image_url;

  if (submitted) {
    return (
      <div className="page-layout bg-white min-h-screen">
        <Navbar />
        <main className="content-container pt-32 pb-24">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header Status */}
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">Booking Received.</h1>
                <p className="text-[11px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.4em]">Reservation ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left: Vehicle & Logistics */}
              <div className="md:col-span-7 space-y-8">
                <div className="bg-transparent rounded-[3rem] p-0 border border-black/5 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-24 bg-white rounded-3xl p-4 border border-black/5 flex items-center justify-center shadow-sm">
                      <SmartImage src={activeImage} className="w-full h-full object-contain" alt="Selected Car" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">{template.brand} {template.model}</h3>
                      <span className="px-3 py-1 bg-[var(--brand-yellow)] text-[var(--bg-dark)] rounded-lg text-[8px] font-black uppercase tracking-widest">{template.category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-black/5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-[var(--brand-yellow)]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/40">Pickup Logistics</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-[var(--bg-dark)] uppercase">{formData.startDate} • {formData.startTime}</p>
                        <p className="text-[10px] font-bold text-[var(--bg-dark)]/60 uppercase leading-relaxed">{formData.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-[var(--brand-yellow)]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/40">Return Logistics</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-[var(--bg-dark)] uppercase">{formData.endDate} • {formData.endTime}</p>
                        <p className="text-[10px] font-bold text-[var(--bg-dark)]/60 uppercase leading-relaxed">{formData.returnAddress}</p>
                      </div>
                    </div>
                  </div>

                  {selectedExtras.length > 0 && (
                    <div className="pt-8 border-t border-black/5 space-y-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/40 ml-1">Selected Services</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedExtras.map(ex => (
                          <span key={ex.id} className="px-4 py-2 bg-white border border-black/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--bg-dark)]/60">
                            {ex.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-0 bg-transparent flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                    <Phone size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--bg-dark)]">Concierge Review</h4>
                    <p className="text-[10px] font-bold text-[var(--bg-dark)]/50 uppercase leading-relaxed">
                      Our team is currently verifying vehicle availability and your specific delivery requirements. You will receive a confirmation call or email within 30 minutes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Financial Summary */}
              <div className="md:col-span-5">
                <div className="bg-[var(--bg-dark)] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-yellow)] opacity-5 blur-3xl"></div>
                  
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 border-b border-white/5 pb-4">Payment Summary</h4>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-white/50">Rental ({invoice.days} Days)</span>
                      <span className="text-[11px] font-black text-white">{formatPrice((invoice.dailyBaseApplied || minPrice) * invoice.days)}</span>
                    </div>
                    {invoice.extrasTotal > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-white/50">Add-ons & Extras</span>
                        <span className="text-[11px] font-black text-white">{formatPrice(invoice.extrasTotal)}</span>
                      </div>
                    )}
                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-white/30 italic">Subtotal</span>
                        <span className="text-[11px] font-black text-white/60">{formatPrice(invoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-[var(--brand-yellow)]/60 uppercase tracking-widest">TVA (15 %)</span>
                        <span className="text-[11px] font-black text-[var(--brand-yellow)]">{formatPrice(invoice.tax)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Final Total</span>
                        <span className="text-sm font-black uppercase tracking-widest text-white">Total TTC</span>
                      </div>
                      <span className="text-4xl font-black text-[var(--brand-yellow)] tracking-tighter">{formatPrice(invoice.total)}</span>
                    </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    <Link href="/fleet" className="flex items-center justify-center gap-3 w-full bg-white text-[var(--bg-dark)] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--brand-yellow)] transition-all">
                      Return to Drive
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-layout bg-white min-h-screen">
      <Navbar />

      <main className="content-container pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Vehicle Visuals & Details */}
          <div className="space-y-12">
            <div className="space-y-8">
              {/* Main Image Gallery */}
              <div className="space-y-6">
                <div className="relative group rounded-[3.5rem] bg-transparent p-0 border border-black/5 overflow-hidden">
                  <SmartImage 
                    src={activeImage} 
                    className="w-full h-[300px] md:h-[450px] object-contain drop-shadow-2xl transition-all duration-700 hover:scale-105" 
                    alt={`${template.brand} ${template.model}`} 
                  />
                </div>
                
                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-24 h-20 md:w-32 md:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                          activeImage === img ? 'border-[var(--brand-yellow)] shadow-lg' : 'border-black/5 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <SmartImage src={img} className="w-full h-full object-cover" alt="Gallery thumbnail" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-1.5 bg-transparent border border-black/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/60">{template.category}</span>
                {availableCount > 0 ? (
                  <span className="px-4 py-1.5 bg-emerald-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    Available Now
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-red-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-600">On Waitlist</span>
                )}
                {template.luggage_large > 0 && (
                  <span className="px-4 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40">{template.luggage_large} Large Bags</span>
                )}
              </div>

              {/* Login CTA Banner (Prominent as seen in competitor image) */}
              <Link href="/login" className="flex items-center justify-between p-6 bg-slate-50 border border-black/5 rounded-3xl group transition-all hover:bg-[var(--brand-yellow)]/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[var(--brand-yellow)]">
                    <UserPlus size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]">Exclusive Member Rates</span>
                    <span className="text-[9px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-widest">Login or Create an account to Book your Car</span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-[var(--bg-dark)]/20 group-hover:text-[var(--brand-yellow)] group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { label: 'Seats', value: `${template.seats} Adults`, icon: Users },
                { label: 'Gearbox', value: template.transmission, icon: Settings2 },
                { label: 'Fuel', value: template.fuel_type || 'Gasoline', icon: Fuel },
                { label: 'Audio', value: template.has_hifi ? 'HiFi System' : 'Bluetooth', icon: Music },
                { label: 'Safety', value: `${template.airbag_count || 2} Airbags`, icon: Shield },
                { label: 'Rating', value: `${Number(template.rating || 5.0).toFixed(1)} / 5.0`, icon: Star }
              ].map((spec, i) => (
                <div key={i} className="flex flex-col gap-4 p-8 bg-white rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-transparent border border-black/5 flex items-center justify-center text-[var(--brand-yellow)]">
                    <spec.icon size={24} />
                  </div>
                  <div>
                     <span className="block text-[8px] font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.2em] mb-1">{spec.label}</span>
                     <span className="block text-sm font-black text-[var(--bg-dark)] uppercase tracking-tight">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Marketing Description */}
            {template.description && (
              <div className="p-0 bg-transparent space-y-6">
                <div className="flex items-center gap-4">
                  <FileText className="text-[var(--brand-yellow)]" size={24} />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">Experience the Drive</h3>
                </div>
                <div 
                  className="prose prose-sm max-w-none text-[var(--bg-dark)]/70 font-medium leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: template.description }}
                />
              </div>
            )}

            {/* Features List */}
            <div className="p-0 bg-transparent space-y-8">
              <div className="flex items-center gap-4">
                <Sparkles className="text-[var(--brand-yellow)]" size={24} />
                <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">Premium Standard Features</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
                {(Array.isArray(template.features_json) && template.features_json.length > 0 
                  ? template.features_json 
                  : ['Climate Control', 'Reverse Sensors', 'Multimedia System', 'Cruise Control', 'Anti-lock Braking', 'Power Steering']
                ).map((feat, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <CheckCircle2 size={12} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--bg-dark)]/60">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form (Sidebar) */}
          <aside className="lg:sticky lg:top-32">
            <div className="bg-white rounded-[3.5rem] p-8 md:p-10 text-[var(--bg-dark)] shadow-xl relative overflow-hidden border border-black/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--brand-yellow)] opacity-[0.03] blur-[100px]"></div>
              
              {/* Header: Title & Base Price */}
              <div className="mb-8 space-y-3">
                <h2 className="text-5xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                  {template.brand} <span className="text-[var(--brand-yellow)]">{template.model}</span>
                </h2>
                  <div className="flex flex-col gap-1 pt-2">
                    <div className="flex items-baseline gap-2">
                      {template.marketing_strikethrough_price && (
                        <span className="text-xl font-bold text-rose-500 line-through opacity-40">
                          {formatPrice(template.marketing_strikethrough_price)}
                        </span>
                      )}
                      <span className="text-4xl font-black text-[var(--brand-yellow)] tracking-tighter">
                        {mounted ? formatPrice(invoice.dailyBaseApplied || minPrice) : '...'}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--bg-dark)]/20 uppercase tracking-[0.3em]">/ Day</span>
                    </div>
                    {invoice.longTermDiscountApplied > 0 && (
                      <div className="flex items-center gap-2">
                         <Sparkles size={12} className="text-emerald-500" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                           {invoice.longTermDiscountApplied}% Long-Term Reward Applied
                         </span>
                      </div>
                    )}
                  </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 ml-2">
                    <UserPlus size={14} className="text-[var(--brand-yellow)]" />
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/40">Contact Information</label>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input 
                      required
                      type="text" 
                      placeholder="Full Name"
                      className="w-full bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-black text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        required
                        type="email" 
                        placeholder="Email Address"
                        className="w-full bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-black text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                      <input 
                        required
                        type="tel" 
                        placeholder="Phone Number"
                        className="w-full bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-black text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Logistics: Pickup & Return Grouped */}
                <div className="space-y-4">
                  <div className="space-y-3 p-0 bg-transparent">
                    <div className="flex items-center gap-3 ml-2">
                      <Calendar size={14} className="text-[var(--brand-yellow)]" />
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/40">Pickup Date, Time & Address</label>
                    </div>
                    <div className="flex gap-3">
                      <input 
                        required
                        type="date" 
                        min={todayStr}
                        className="flex-grow bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-black text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value, endDate: e.target.value > formData.endDate ? e.target.value : formData.endDate})}
                      />
                      <input 
                        required
                        type="time" 
                        className="w-28 bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-black text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      />
                    </div>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-bold text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      placeholder="Pickup Address (Airport, Hotel, Villa...)" 
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                    />
                  </div>

                  {/* Return Section */}
                  <div className="space-y-3 p-0 bg-transparent">
                    <div className="flex items-center gap-3 ml-2">
                      <Clock size={14} className="text-[var(--brand-yellow)]" />
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/40">Return Date, Time & Address</label>
                    </div>
                    <div className="flex gap-3">
                      <input 
                        required
                        type="date" 
                        min={formData.startDate || todayStr}
                        className="flex-grow bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-black text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                      <input 
                        required
                        type="time" 
                        className="w-28 bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-black text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      />
                    </div>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white border border-black/5 rounded-2xl px-6 py-3 text-[var(--bg-dark)] font-bold text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all" 
                      placeholder="Return Address" 
                      value={formData.returnAddress}
                      onChange={(e) => setFormData({...formData, returnAddress: e.target.value})}
                    />
                  </div>
                </div>

                   <div className="space-y-6 pt-2">
                      <div className="flex items-center gap-3 ml-4">
                        <Plus size={14} className="text-[var(--brand-yellow)]" />
                        <h4 className="text-[10px] font-black text-[var(--bg-dark)] uppercase tracking-[0.2em]">Resources / Extras</h4>
                      </div>
                      <BookingExtras onSelectionChange={setSelectedExtras} isDark={false} />
                   </div>

                {/* Formal Invoice Table */}
                {invoice.days > 0 && (
                  <div className="bg-transparent rounded-2xl overflow-hidden border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/[0.02]">
                          <th className="px-8 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Description</th>
                          <th className="px-8 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        <tr>
                          <td className="px-8 py-2.5 text-[11px] font-bold text-[var(--bg-dark)]/60">
                             Rental ({invoice.days} Days)
                             {invoice.longTermDiscountApplied > 0 && (
                               <span className="block text-[8px] text-emerald-600 font-black uppercase tracking-widest mt-1">
                                 {invoice.longTermDiscountApplied}% Duration Discount
                               </span>
                             )}
                          </td>
                          <td className="px-8 py-2.5 text-[11px] font-black text-[var(--bg-dark)] text-right">{formatPrice(invoice.dailyBaseApplied * invoice.days)}</td>
                        </tr>
                        {invoice.extrasTotal > 0 && (
                          <tr>
                            <td className="px-8 py-2.5 text-[11px] font-bold text-[var(--bg-dark)]/60">Selected Extras</td>
                            <td className="px-8 py-2.5 text-[11px] font-black text-[var(--bg-dark)] text-right">{formatPrice(invoice.extrasTotal)}</td>
                          </tr>
                        )}
                        {template.marketing_strikethrough_price && (
                          <tr className="bg-rose-50/30">
                            <td className="px-8 py-2.5 text-[10px] font-black text-rose-600 uppercase tracking-widest">Instant Marketing Saving</td>
                            <td className="px-8 py-2.5 text-[11px] font-black text-rose-600 text-right">-{formatPrice((template.marketing_strikethrough_price - template.min_price) * invoice.days)}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="px-8 py-2.5 text-[11px] font-bold text-[var(--bg-dark)]/30 italic">Total excluding tax</td>
                          <td className="px-8 py-2.5 text-[11px] font-black text-[var(--bg-dark)]/40 text-right">{formatPrice(invoice.subtotal)}</td>
                        </tr>
                        <tr>
                          <td className="px-8 py-2.5 text-[11px] font-black text-[var(--brand-yellow)] uppercase tracking-widest">TVA (15 %)</td>
                          <td className="px-8 py-2.5 text-[11px] font-black text-[var(--brand-yellow)] text-right">{formatPrice(invoice.tax)}</td>
                        </tr>
                        <tr className="bg-[var(--brand-yellow)]/5">
                          <td className="px-8 py-4 text-sm font-black uppercase tracking-widest text-[var(--bg-dark)]">Total TTC</td>
                          <td className="px-8 py-4 text-2xl font-black text-[var(--brand-yellow)] tracking-tighter text-right">{formatPrice(invoice.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Comment Area */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3 ml-4">
                     <MessageSquare size={14} className="text-[var(--brand-yellow)]" />
                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/40">Comments</label>
                   </div>
                   <textarea 
                     rows="2"
                     className="w-full bg-white border border-black/5 rounded-3xl px-8 py-3 text-[var(--bg-dark)] font-bold text-[11px] focus:ring-1 focus:ring-[var(--brand-yellow)] outline-none transition-all resize-none" 
                     placeholder="Special requests..." 
                     value={formData.message}
                     onChange={(e) => setFormData({...formData, message: e.target.value})}
                   ></textarea>
                </div>

                {/* Final Confirmation */}
                <div className="space-y-6 pt-2">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-6 py-4 bg-transparent rounded-2xl border border-black/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40">
                        {invoice.days > 0 ? 'Live Total' : 'Est. Daily Total'}
                      </span>
                      <span className="text-xl font-black text-[var(--bg-dark)] tracking-tighter">
                        {formatPrice(invoice.total)}
                      </span>
                    </div>

                    <div className="flex items-start gap-4 px-4">
                      <input 
                        type="checkbox" 
                        required
                        id="terms"
                        className="mt-1 w-5 h-5 rounded-lg border-black/10 bg-slate-50 text-[var(--brand-yellow)] focus:ring-[var(--brand-yellow)] transition-all cursor-pointer"
                        checked={formData.agreedToTerms}
                        onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                      />
                      <label htmlFor="terms" className="text-[10px] font-bold text-[var(--bg-dark)]/40 leading-relaxed cursor-pointer select-none">
                        I agree to the <Link href="/terms" className="text-[var(--brand-yellow)] underline hover:text-[var(--bg-dark)] transition-colors">Terms of Sale</Link>.
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full bg-[var(--bg-dark)] text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[var(--brand-yellow)] hover:text-[var(--bg-dark)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50"
                    >
                       {isSubmitting ? 'Processing...' : 'Confirm'}
                       <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
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