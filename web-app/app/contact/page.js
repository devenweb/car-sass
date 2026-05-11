'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, ShieldCheck, Clock, CheckCircle2, Search } from 'lucide-react';

function ContactContent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kudlhuakeegskajyxwxo.supabase.co';
  const getAssetUrl = (path) => `${supabaseUrl}/storage/v1/object/public/car-assets/${path}`;

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
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contact Us</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
              Get In <span className="text-[var(--brand-yellow)]">Touch.</span>
            </h1>
            <p className="text-xl text-white/50 font-medium leading-relaxed max-w-2xl">
              Our concierge team is available 24/7 to assist with your premium rental requirements across Mauritius.
            </p>
          </div>
        </div>
      </section>

      <div className="content-container py-24 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-12">
            <div className="grid grid-cols-1 gap-8">
              {[
                { icon: Phone, title: 'Call Us', value: '+230 5XXX XXXX', desc: 'Direct line for bookings' },
                { icon: Mail, title: 'Email', value: 'hello@drive.mu', desc: 'General inquiries' },
                { icon: MapPin, title: 'Location', value: 'Royal Road, Grand Baie', desc: 'Main Agency Hub' }
              ].map((item, i) => (
                <div key={i} className="group bg-white rounded-[2.5rem] p-10 border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center text-[var(--bg-dark)]/20 group-hover:bg-[var(--brand-yellow)] group-hover:text-[var(--bg-dark)] transition-all">
                      <item.icon size={28} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/40">{item.title}</h4>
                      <p className="text-2xl font-black text-[var(--bg-dark)]">{item.value}</p>
                      <p className="text-[11px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-widest">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[var(--bg-dark)] rounded-[2.5rem] p-10 space-y-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Clock size={80} />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tighter">Support Hours</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                     <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Vehicle Delivery</span>
                     <span className="text-[11px] font-black uppercase tracking-widest text-[var(--brand-yellow)]">24/7 Service</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Office Support</span>
                     <span className="text-[11px] font-black uppercase tracking-widest">08:00 - 20:00</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-[3.5rem] p-12 md:p-16 border border-black/5 shadow-sm">
            <div className="max-w-2xl space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                   Send a <span className="text-[var(--brand-yellow)]">Message.</span>
                </h2>
                <p className="text-[11px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-[0.2em]">Expect a response within 30 minutes</p>
              </div>

              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Full Name</label>
                    <input type="text" className="w-full bg-[var(--bg-primary)] border-none rounded-2xl px-8 py-5 text-[var(--bg-dark)] font-black text-sm focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Email Address</label>
                    <input type="email" className="w-full bg-[var(--bg-primary)] border-none rounded-2xl px-8 py-5 text-[var(--bg-dark)] font-black text-sm focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Subject</label>
                  <div className="relative">
                     <select className="w-full bg-[var(--bg-primary)] border-none rounded-2xl px-8 py-5 text-[var(--bg-dark)] font-black text-sm focus:ring-2 focus:ring-[var(--brand-yellow)] appearance-none">
                       <option>General Inquiry</option>
                       <option>Booking Modification</option>
                       <option>Partnership</option>
                       <option>Other</option>
                     </select>
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--bg-dark)]/20">
                        <Search size={16} />
                     </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40 ml-4">Message</label>
                  <textarea rows="6" className="w-full bg-[var(--bg-primary)] border-none rounded-3xl px-8 py-6 text-[var(--bg-dark)] font-black text-sm focus:ring-2 focus:ring-[var(--brand-yellow)] resize-none" placeholder="Tell us how we can help..."></textarea>
                </div>

                <button className="w-full bg-[var(--bg-dark)] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--brand-yellow)] hover:text-[var(--bg-dark)] transition-all shadow-2xl shadow-black/10">
                   Deliver Message
                </button>
              </form>
            </div>
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