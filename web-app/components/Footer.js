'use client';

import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-dark)] text-white pt-32 pb-6 overflow-hidden relative">
      {/* Decorative Brand Background Text */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-[0.03]">
        <span className="text-[25vw] font-black leading-none uppercase whitespace-nowrap tracking-tighter">
          DRIVE
        </span>
      </div>

      <div className="content-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 pb-24 border-b border-white/5">
          {/* Brand Identity */}
          <div className="lg:col-span-5 space-y-10 -mt-[60px]">
            <Link href="/" className="inline-block">
              <span className="text-5xl font-black tracking-tighter uppercase leading-none">
                DRIVE<span className="text-[var(--brand-yellow)]">.</span>
              </span>
            </Link>
            
            <p className="text-xl text-white/50 font-medium leading-relaxed max-w-md">
              Elevating the rental experience in Mauritius with a verified, luxury-focused fleet and 24/7 concierge support.
            </p>

            <div className="flex gap-4">
              {[
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[var(--brand-yellow)] hover:text-[var(--bg-dark)] transition-all duration-500 group"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[11px] font-black tracking-[0.3em] text-[var(--brand-yellow)]">Drive</h4>
              <ul className="space-y-5">
                {['SUV Selections', 'Luxury Executive', 'Economy Daily', 'Family MPVs'].map((item) => (
                  <li key={item}>
                    <Link href="/fleet" className="text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-[11px] flex items-center group">
                      {item}
                      <ArrowUpRight className="w-3 h-3 ml-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--brand-yellow)]">Agency</h4>
              <ul className="space-y-5">
                {['About Us', 'Contact', 'Services', 'Terms'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-[11px] flex items-center group">
                      {item}
                      <ArrowUpRight className="w-3 h-3 ml-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 col-span-2 md:col-span-1">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--brand-yellow)]">Contact</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4 text-white/40 group">
                  <MapPin className="w-5 h-5 shrink-0 text-[var(--brand-yellow)]/50 group-hover:text-[var(--brand-yellow)] transition-colors" />
                  <span className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                    Royal Road,<br />Grand Baie, Mauritius
                  </span>
                </li>
                <li className="flex items-center gap-4 text-white/40 group">
                  <Phone className="w-5 h-5 shrink-0 text-[var(--brand-yellow)]/50 group-hover:text-[var(--brand-yellow)] transition-colors" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">+230 5XXX XXXX</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
              © 2026 DRIVE Mauritius. All Rights Reserved.
            </span>
          </div>

          {/* Signature Credit */}
          <div className="flex items-center gap-4 group">
             <div className="h-px w-8 bg-white/10 group-hover:w-12 transition-all"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Created and produced by <span className="text-white group-hover:text-[var(--brand-yellow)] transition-colors">DEVEN</span>
             </span>
             <div className="h-px w-8 bg-white/10 group-hover:w-12 transition-all"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}