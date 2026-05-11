'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Info, Scale, Clock, CreditCard, Car, MapPin, Sparkles } from 'lucide-react';

function TermsContent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kudlhuakeegskajyxwxo.supabase.co';
  const getAssetUrl = (path) => `${supabaseUrl}/storage/v1/object/public/car-assets/${path}`;

  const sections = [
    {
      id: 'commitment',
      title: '1. Honesty & Fairness Commitment',
      icon: Shield,
      content: [
        'At DRIVE Mauritius, we are committed to upholding the highest standards of honesty, integrity, and ethical conduct in all aspects of our business.',
        '1.1 Honesty & Transparency: We provide clear and accurate information about our pricing, policies, and vehicle conditions, ensuring there are no hidden fees or misleading terms.',
        '1.2 Ethical Practices: We conduct our operations with fairness, accountability, and professionalism. Unethical practices—such as fraud, bribery, or misrepresentation—are strictly prohibited.',
        '1.3 Mutual Respect: We believe in mutual respect. Harassment, intimidation, or abusive behavior toward our staff will not be tolerated.'
      ]
    },
    {
      id: 'booking',
      title: '2. Online Booking: Book Directly & Save',
      icon: CreditCard,
      content: [
        'Why Choose DRIVE Over an online Broker?',
        'Save More: No commission fees or third-party markups!',
        'Insurance Included: Comprehensive insurance is included when you book directly with us.',
        'No Security Deposit: No large deposits blocked on your credit card—you only pay for the rental at pickup.',
        'Unlimited Mileage: Drive as much as you want without extra mileage fees.',
        'Direct Support: Get direct assistance from our team for fast & personalized service.'
      ]
    },
    {
      id: 'calculation',
      title: '3. Rate Calculation',
      icon: Scale,
      content: [
        '3.1 Calculated on a 24-hour basis.',
        '3.2 Minimum rental length is 3 days.',
        '3.3 Prices for last-minute bookings may be slightly higher. We recommend booking ahead.',
        '3.4 Late drop-offs will be charged at the local daily rate on a pro-rata basis.',
        '3.5 All online payments are converted into Euros currency.'
      ]
    },
    {
      id: 'insurance',
      title: '6. Comprehensive Insurance Cover',
      icon: Shield,
      content: [
        'We provide a comprehensive and transparent insurance policy to protect our customers from unexpected repair costs.',
        'Collision Damage Waiver (CDW): Covers accidental collision-related damage.',
        'Loss Damage Waiver (LDW): Protects against costs related to theft or total loss.',
        'Excess Waivers: Reduces the amount payable by the renter in case of an accident.',
        'Exclusions: Insurance is void if driving under influence or reckless driving.'
      ]
    },
    {
      id: 'cancellation',
      title: '8. Cancellation Policy',
      icon: Clock,
      content: [
        'Cancel at least 72 hours before scheduled delivery for eligibility.',
        'Cyclone Warning (Class 2+): Full refund (minus €15 service fee).',
        'Health/Emergencies: Full refund with documentation (minus €15 service fee).',
        'Non-Refundable: Personal preference or changing mind.',
        'Processing: Refunds may take 4 to 6 weeks to process.'
      ]
    },
    {
      id: 'delivery',
      title: '9. Car Delivery Regulations',
      icon: MapPin,
      content: [
        '9.1 Local and international driving licenses are accepted.',
        '9.2 Driver age: 18 to 75 years.',
        '9.4 Verification: Meet our staff at the DRIVE counter at the airport terminal.',
        '9.5 Checklist: A car checklist and rental agreement will be signed upon delivery.',
        '9.8 Late Pickup: 2-hour grace period.'
      ]
    }
  ];

  return (
    <div className="page-layout bg-[var(--bg-primary)]">
      <Navbar />

      <section className="hero-standard">
        <img 
          src={getAssetUrl("hero_bg.png")} 
          className="hero-bg-image" 
          alt="Terms Background" 
        />
        <div className="hero-overlay"></div>
        
        <div className="content-container relative z-10">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[var(--brand-yellow)]">
               <Shield className="w-3.5 h-3.5 mr-2" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Legal Framework</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
              Terms of <span className="text-[var(--brand-yellow)]">Service.</span>
            </h1>
            <p className="text-xl text-white/50 font-medium leading-relaxed max-w-2xl">
              Clear, honest, and professional. The rules of the road for your premium Mauritian journey.
            </p>
          </div>
        </div>
      </section>

      <div className="content-container py-24 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 border-t border-black/5 pt-20">
          {sections.map((section) => (
            <div key={section.id} className="space-y-8 group">
              <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-[var(--bg-dark)]/20 group-hover:bg-[var(--brand-yellow)] group-hover:text-[var(--bg-dark)] transition-all duration-500 shadow-sm">
                <section.icon size={28} />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-[var(--bg-dark)] uppercase tracking-tight">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.content.map((para, i) => (
                    <li key={i} className="text-[15px] text-[var(--bg-dark)]/50 font-medium leading-relaxed flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-yellow)] mt-2 shrink-0" />
                      {para}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 p-16 bg-[var(--bg-dark)] rounded-[3.5rem] text-center space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
              <Sparkles size={200} />
           </div>
           <div className="relative z-10 space-y-4">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Have Questions?</h2>
              <p className="text-white/40 font-medium max-w-xl mx-auto">If anything in our terms is unclear, our support team is happy to explain the details.</p>
           </div>
           <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="/contact" className="px-10 py-5 bg-[var(--brand-yellow)] text-[var(--bg-dark)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                 Contact Support
              </a>
           </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TermsContent />
    </Suspense>
  );
}