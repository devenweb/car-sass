'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  CheckCircle2, MoveRight, ChevronDown, 
  Heart, Zap, ShieldCheck, Users, 
  Car, Clock, Smile, Euro, Search,
  Map, Calendar, Shield, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('integrity');

  const timeline = [
    { year: '2019', title: 'The Vision', desc: 'Founded on a single principle: providing a transparent car rental marketplace for Mauritius travelers.' },
    { year: '2020', title: 'Digital Transformation', desc: 'Developed a proprietary real-time booking engine to eliminate availability delays.' },
    { year: '2022', title: 'Curated Fleet', desc: 'Strategic expansion to include premium SUVs and verified luxury vehicles.' },
    { year: '2023', title: 'Island-Wide Reach', desc: 'Perfected our logistics network to offer seamless delivery to any location in Mauritius.' },
    { year: '2025', title: 'DRIVE Mauritius', desc: 'Relaunched with a focus on high-fidelity service and a zero-hidden-fee guarantee.' },
  ];

  const pillars = {
    integrity: {
      title: 'Integrity',
      icon: <ShieldCheck className="w-10 h-10" />,
      subtitle: 'Transparency in every transaction.',
      desc: 'We operate with absolute clarity. The quote you receive includes all necessary insurance, local taxes, and service fees. No surprises, no hidden line items — just honest value.'
    },
    efficiency: {
      title: 'Efficiency',
      icon: <Zap className="w-10 h-10" />,
      subtitle: 'Optimized for your island experience.',
      desc: 'Our digital-first approach streamlines the entire process. From instant mobile booking to contactless delivery, we value your time as much as you do.'
    },
    excellence: {
      title: 'Excellence',
      icon: <Heart className="w-10 h-10" />,
      subtitle: 'Personalized service, island-wide.',
      desc: 'Every traveler is unique. Our local team is dedicated to ensuring your vehicle is perfectly prepared, your route is clear, and your journey is effortless.'
    }
  };

  return (
    <div className="page-layout bg-[var(--bg-primary)]">
      <Navbar />

      <main className="relative pt-32 pb-32 overflow-hidden min-h-[80vh] flex flex-col justify-center border-b border-black/5">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl space-y-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-black/10 bg-white/50 backdrop-blur-sm shadow-sm">
               <Sparkles className="w-4 h-4 text-[var(--brand-yellow)] mr-2" />
               <span className="text-[13px] font-bold text-[var(--bg-dark)] uppercase tracking-wider">Defining Modern Rental</span>
            </div>

            <div className="space-y-8">
              <h1 className="text-6xl sm:text-7xl md:text-[130px] font-black text-[var(--bg-dark)] tracking-[-0.05em] leading-[0.85] uppercase">
                Redefining <br />
                The Road Trip <br />
                In <span className="text-[var(--brand-yellow)] relative">
                  Mauritius
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0 5C20 2 40 2 60 5C80 8 100 5 100 5" stroke="#FFB300" strokeWidth="2" fill="none" opacity="0.5" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-[var(--bg-dark)]/50 max-w-2xl font-medium leading-relaxed">
                DRIVE Mauritius was established to bridge the gap between traditional car rental and the modern traveler’s need for speed, transparency, and high-fidelity service.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <Link href="/fleet" className="bg-[var(--bg-dark)] text-white px-10 py-5 rounded-full font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-black/10 group">
                Explore the fleet
                <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full border-t border-black/5 bg-white/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
              {[
                { label: 'Vehicles in fleet', val: '25+', icon: Car },
                { label: 'Customer Satisfaction', val: '99%', icon: Smile },
                { label: 'Support Coverage', val: '24/7', icon: Clock },
                { label: 'Hidden Service Fees', val: '0', icon: Shield }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="w-12 h-12 rounded-xl bg-[var(--brand-yellow)]/10 flex items-center justify-center text-[var(--brand-yellow)] shrink-0">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[var(--bg-dark)]">{stat.val}</div>
                    <div className="text-[10px] font-bold text-[var(--bg-dark)]/40 uppercase tracking-widest leading-none">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <section id="story" className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[var(--bg-primary)] -skew-x-12 translate-x-1/2 opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl font-black text-[var(--bg-dark)] uppercase tracking-tighter leading-none">
                  A commitment to <br />
                  <span className="text-[var(--brand-yellow)]">unfiltered quality.</span>
                </h2>
                <p className="text-xl text-[var(--bg-dark)]/60 leading-relaxed font-medium">
                  We recognized that travel is about freedom, not fine print. Our mission is to eliminate the friction typically associated with island rentals through proprietary technology and a dedicated local team.
                </p>
                <p className="text-lg text-[var(--bg-dark)]/50 leading-relaxed font-medium italic">
                  "Our goal wasn't just to rent cars, but to redefine how travelers experience the beauty of Mauritius — with absolute confidence and style."
                </p>
              </div>
            </div>

            <div className="relative space-y-12 pl-12 border-l-4 border-[var(--brand-yellow)]/20">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative space-y-2 group">
                  <div className="absolute -left-[54px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[var(--brand-yellow)] group-hover:scale-125 transition-transform"></div>
                  <div className="text-[var(--brand-yellow)] font-black text-2xl leading-none">{item.year}</div>
                  <h4 className="text-xl font-black text-[var(--bg-dark)] uppercase tracking-tight">{item.title}</h4>
                  <p className="text-[var(--bg-dark)]/40 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[var(--bg-dark)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              The <span className="text-[var(--brand-yellow)]">Pillars</span> of <br />
              DRIVE Mauritius.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {Object.entries(pillars).map(([key, pillar]) => (
              <div 
                key={key}
                onMouseEnter={() => setActiveTab(key)}
                className={`p-10 rounded-[3rem] border-2 transition-all duration-700 cursor-pointer space-y-8 ${
                  activeTab === key ? 'bg-white/10 border-[var(--brand-yellow)] shadow-2xl shadow-[var(--brand-yellow)]/5' : 'bg-white/5 border-transparent'
                }`}
              >
                <div className={`text-[var(--brand-yellow)] transition-transform duration-700 ${activeTab === key ? 'scale-110 -rotate-3' : 'scale-100'}`}>
                  {pillar.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tight">{pillar.title}</h3>
                  <h4 className={`text-lg font-bold transition-colors ${activeTab === key ? 'text-[var(--brand-yellow)]' : 'text-white/40'}`}>
                    {pillar.subtitle}
                  </h4>
                  <p className="text-white/60 font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}