'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, ShieldCheck, Clock, CheckCircle2, Search, Calendar, Car as CarIcon, ArrowRight } from 'lucide-react';
import BookingExtras from '@/components/BookingExtras';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function ContactContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  const [template, setTemplate] = useState(null);
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
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId]);

  async function fetchTemplate(id) {
    const { data } = await supabase
      .from('vehicle_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setTemplate(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        vehicle_template_id: templateId,
        extras: selectedExtras.map(e => e.name),
        status: 'new'
      };

      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Vehicle: ${template ? `${template.brand} ${template.model}` : 'General Inquiry'}\nDates: ${formData.startDate} to ${formData.endDate}\nExtras: ${selectedExtras.map(e => e.name).join(', ')}\n\nMessage: ${formData.message}`,
          status: 'new'
        }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kudlhuakeegskajyxwxo.supabase.co';
  const getAssetUrl = (path) => `${supabaseUrl}/storage/v1/object/public/car-assets/${path}`;

  if (submitted) {
    return (
      <div className="page-layout bg-[var(--bg-primary)]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-32">
          <div className="max-w-xl w-full mx-auto text-center space-y-10 bg-white p-20 rounded-[4rem] shadow-2xl border border-black/5">
             <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
             </div>
             <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">Inquiry <span className="text-emerald-500">Sent.</span></h2>
             <p className="text-[11px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-[0.2em] leading-relaxed">
               Thank you for choosing Royal Road Car Rental. Our concierge team will review your requirements and contact you within 30 minutes to finalize your reservation.
             </p>
             <Link href="/fleet" className="inline-flex items-center gap-4 bg-[var(--bg-dark)] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[var(--brand-yellow)] hover:text-[var(--bg-dark)] transition-all">
               Return to Fleet <ArrowRight size={16} />
             </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-layout bg-[var(--bg-primary)]">
      <Navbar />

      <section className="hero-standard">
        {/* Page Specific Background */}
        <img 
          src={getAssetUrl("hero_bg.png")} 
          className="hero-bg-image" 
          alt="Contact Background" 
        />
        <div className="hero-overlay"></div>
        
        <div className="content-container relative z-10">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[var(--brand-yellow)]">
               <Mail className="w-3.5 h-3.5 mr-2" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Rental Inquiry</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
              Reserve Your <span className="text-[var(--brand-yellow)]">Drive.</span>
            </h1>
            <p className="text-xl text-white/50 font-medium leading-relaxed max-w-2xl">
              Complete the inquiry form below. Our team provides bespoke quotes inclusive of premium extras and island-wide delivery.
            </p>
          </div>
        </div>
      </section>

      <div className="content-container py-24 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Sidebar / Info */}
          <div className="lg:col-span-4 space-y-12">
            {template && (
              <div className="bg-white rounded-[3rem] p-10 border border-black/5 shadow-xl space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <CarIcon size={120} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[var(--brand-yellow)] uppercase tracking-[0.3em]">Selected Vehicle</span>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">
                    {template.brand} {template.model}
                  </h3>
                </div>
                <img src={template.image_url} alt={template.model} className="w-full h-auto object-contain drop-shadow-2xl" />
                <div className="pt-6 border-t border-black/5 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <Users size={14} className="text-[var(--brand-yellow)]" />
                      <span className="text-[10px] font-black uppercase">{template.seats} Seats</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Settings2 size={14} className="text-[var(--brand-yellow)]" />
                      <span className="text-[10px] font-black uppercase">{template.transmission}</span>
                   </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {[
                { icon: Phone, title: 'Concierge', value: '+230 5XXX XXXX' },
                { icon: Mail, title: 'Email', value: 'bookings@drive.mu' }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-black/5 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center text-[var(--brand-yellow)]">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40">{item.title}</h4>
                    <p className="text-lg font-black text-[var(--bg-dark)]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8 space-y-12">
            <form onSubmit={handleSubmit} className="space-y-16">
              <div className="bg-white rounded-[4rem] p-12 md:p-16 border border-black/5 shadow-sm space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                     Personal <span className="text-[var(--brand-yellow)]">Details.</span>
                  </h2>
                  <p className="text-[11px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-[0.2em]">How should we reach you?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="form-input-premium" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="form-input-premium" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      className="form-input-premium" 
                      placeholder="+230 5XXX XXXX" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Rental Duration</label>
                    <div className="grid grid-cols-2 gap-4">
                       <input 
                         required
                         type="date" 
                         className="form-input-premium text-xs" 
                         value={formData.startDate}
                         onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                       />
                       <input 
                         required
                         type="date" 
                         className="form-input-premium text-xs" 
                         value={formData.endDate}
                         onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Additional Notes</label>
                  <textarea 
                    rows="4" 
                    className="w-full bg-[var(--bg-primary)] border-none rounded-[2.5rem] px-8 py-6 text-[var(--bg-dark)] font-black text-sm focus:ring-2 focus:ring-[var(--brand-yellow)] resize-none transition-all" 
                    placeholder="E.g. Delivery at SSR International Airport..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
              </div>

              {/* Extras Module Integration */}
              <BookingExtras onSelectionChange={setSelectedExtras} />

              <div className="pt-8">
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-[var(--bg-dark)] text-white py-8 rounded-3xl font-black uppercase tracking-[0.3em] text-sm hover:bg-[var(--brand-yellow)] hover:text-[var(--bg-dark)] transition-all shadow-3xl shadow-black/20 flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                   {isSubmitting ? 'Processing...' : 'Request Luxury Quote'}
                   <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>


      <Footer />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactContent />
    </Suspense>
  );
}