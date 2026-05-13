'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Car, ChevronDown, MoveRight, 
  Search, CheckCircle2, Zap, Key, 
  Mail, ShieldCheck, MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F1EDE4] selection:bg-brand-yellow/30">
      <Navbar />

      <main className="relative pt-20 pb-32 overflow-hidden min-h-[calc(100vh-80px)] flex flex-col justify-center border-b border-black/5">
        {/* Grid Background Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-black/10 bg-white/50 backdrop-blur-sm shadow-sm">
              <span className="text-[13px] font-bold text-[#1A1A1A] uppercase tracking-wider">How It Works</span>
            </div>

            {/* Hero Text */}
            <div className="space-y-8">
              <h1 className="text-7xl sm:text-8xl md:text-[140px] font-black text-[#1A1A1A] tracking-[-0.05em] leading-[0.85] uppercase">
                Rent a car <br />
                in <span className="text-brand-yellow relative">
                  3 steps
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0 5C20 2 40 2 60 5C80 8 100 5 100 5" stroke="#FFB300" strokeWidth="2" fill="none" opacity="0.5" />
                  </svg>
                </span> <br />
                flat.
              </h1>

              <p className="text-xl sm:text-2xl text-[#1A1A1A]/50 max-w-2xl font-medium leading-relaxed">
                No queues. No paperwork. No surprises. Search, 
                confirm, and drive — the whole thing takes less time 
                than making a coffee.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <a href="#step1" className="bg-[#1A1A1A] text-white px-10 py-5 rounded-full font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-black/10 group">
                See how it works
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </a>
              <Link href="/fleet" className="text-[#1A1A1A]/40 hover:text-brand-yellow font-bold text-lg flex items-center gap-2 transition-colors">
                Browse our Drive
                <MoveRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 w-full border-t border-black/5 bg-white/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="space-y-1">
                <div className="text-4xl font-black text-[#1A1A1A]">~2 min</div>
                <div className="text-[12px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em]">TO BOOK</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black text-[#1A1A1A]">€0</div>
                <div className="text-[12px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em]">HIDDEN FEES</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black text-[#1A1A1A]">24/7</div>
                <div className="text-[12px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em]">SUPPORT</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black text-[#1A1A1A]">19+</div>
                <div className="text-[12px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em]">VEHICLES</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Step 1 */}
      <section id="step1" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <span className="text-brand-yellow font-black text-6xl italic leading-none">01</span>
                <h2 className="text-5xl md:text-6xl font-black text-[#1A1A1A] uppercase tracking-tighter leading-none">
                  Search & choose your <br />
                  <span className="text-brand-yellow">perfect car.</span>
                </h2>
                <p className="text-xl text-[#1A1A1A]/60 leading-relaxed font-medium">
                  Enter your pickup dates and browse our full fleet in real time. 
                  Every car you see is actually available — no ghost listings, 
                  no disappointment.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   "Filter by category, seats, fuel type or price",
                   "Live availability — updated in real time",
                   "Every price shown is the final price you pay",
                   "No account needed to browse"
                 ].map((bullet, idx) => (
                   <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wide">{bullet}</span>
                   </div>
                 ))}
              </div>
            </div>
            <div className="bg-[#F1EDE4] aspect-video rounded-[3rem] p-12 flex items-center justify-center shadow-inner relative overflow-hidden">
               <Search className="w-32 h-32 text-brand-yellow opacity-10 absolute -right-4 -bottom-4" />
               <div className="bg-white p-8 rounded-[2rem] shadow-2xl space-y-6 w-full max-w-sm rotate-2">
                  <div className="flex justify-between items-center">
                     <div className="h-4 w-24 bg-black/5 rounded-full"></div>
                     <div className="h-4 w-12 bg-brand-yellow/20 rounded-full"></div>
                  </div>
                  <div className="h-40 bg-black/5 rounded-2xl"></div>
                  <div className="space-y-3">
                     <div className="h-4 w-full bg-black/5 rounded-full"></div>
                     <div className="h-4 w-2/3 bg-black/5 rounded-full"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="py-32 bg-[#F1EDE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="lg:order-2 space-y-10">
              <div className="space-y-6">
                <span className="text-brand-yellow font-black text-6xl italic leading-none">02</span>
                <h2 className="text-5xl md:text-6xl font-black text-[#1A1A1A] uppercase tracking-tighter leading-none">
                  Book in seconds. <br />
                  <span className="text-brand-yellow">Not minutes.</span>
                </h2>
                <p className="text-xl text-[#1A1A1A]/60 leading-relaxed font-medium">
                  No approval process, no waiting on hold. Fill in your details, 
                  confirm the booking, and your confirmation lands in your 
                  inbox instantly.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   "Instant booking confirmation by email",
                   "No credit card holding fees",
                   "Free cancellation up to 24h before pickup",
                   "All taxes included — zero surprise charges"
                 ].map((bullet, idx) => (
                   <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wide">{bullet}</span>
                   </div>
                 ))}
              </div>
            </div>
            <div className="bg-white aspect-video rounded-[3rem] p-12 flex items-center justify-center shadow-inner relative overflow-hidden -rotate-2">
               <Zap className="w-32 h-32 text-brand-yellow opacity-10 absolute -left-4 -top-4" />
               <div className="bg-[#1A1A1A] p-8 rounded-[2rem] shadow-2xl text-white space-y-6 w-full max-w-sm">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-[#1A1A1A]" />
                     </div>
                     <span className="font-black uppercase tracking-widest text-[12px]">Confirmed</span>
                  </div>
                  <div className="h-32 bg-white/5 rounded-2xl flex items-center justify-center">
                     <Mail className="w-12 h-12 text-white/20" />
                  </div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Confirmation sent to your email</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <span className="text-brand-yellow font-black text-6xl italic leading-none">03</span>
                <h2 className="text-5xl md:text-6xl font-black text-[#1A1A1A] uppercase tracking-tighter leading-none">
                  Pick up & drive. <br />
                  <span className="text-brand-yellow">That's it.</span>
                </h2>
                <p className="text-xl text-[#1A1A1A]/60 leading-relaxed font-medium">
                  Arrive at the pickup point, show your confirmation, and 
                  you're done. No queues, no forms. The keys are ready 
                  when you are.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   "Show your confirmation — digital or printed",
                   "Car is cleaned and ready at your pickup time",
                   "Quick vehicle walkthrough on handover",
                   "Same-day return available if plans change"
                 ].map((bullet, idx) => (
                   <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wide">{bullet}</span>
                   </div>
                 ))}
              </div>
            </div>
            <div className="relative group">
              <div className="bg-[#1A1A1A] aspect-[4/3] rounded-[3rem] overflow-hidden flex items-center justify-center p-12">
                 <div className="text-center space-y-4">
                    <div className="text-8xl font-black text-white leading-none">{"<"}5</div>
                    <div className="text-xl font-bold text-brand-yellow uppercase tracking-widest leading-none">Minutes</div>
                    <div className="text-[12px] font-bold text-white/40 uppercase tracking-widest max-w-[140px] mx-auto">Average handover time at pickup</div>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 bg-brand-yellow p-8 rounded-[2rem] shadow-2xl rotate-3">
                 <Key className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#F1EDE4]">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
            <h2 className="text-5xl md:text-8xl font-black text-[#1A1A1A] uppercase tracking-tighter leading-none">
              Your journey <br />
              <span className="text-brand-yellow">starts now.</span>
            </h2>
            <div className="flex justify-center gap-6">
              <Link href="/fleet" className="bg-[#1A1A1A] text-white px-12 py-6 rounded-full font-black text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl shadow-black/20">
                Browse the Drive
              </Link>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}


