'use client';

import Link from 'next/link';
import { Search, MessageSquare, MapPin, Menu, X, Globe, Languages } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGeolocation } from '@/lib/geolocation';
import { useLocalization } from '@/lib/currency';

export default function Navbar() {
  const pathname = usePathname();
  const geo = useGeolocation();
  const { currency, setCurrency, currencies, language, setLanguage, languages } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPicker, setShowPicker] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  const navLinks = [
    { href: '/fleet', label: 'Our Fleet' },
    { href: '/services', label: 'How It Works' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  // Colors based on page context and scroll state
  const isDarkHero = pathname === '/' && !scrolled;
  const linkColor = isDarkHero ? 'text-white/80 hover:text-brand-yellow' : 'text-[#1A1A1A]/70 hover:text-brand-yellow';
  const logoColor = isDarkHero ? 'text-white' : 'text-[#1A1A1A]';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-lg shadow-black/5' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo & Geo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11">
                <div className="absolute inset-0 bg-brand-yellow rounded-xl rotate-12 group-hover:rotate-0 transition-transform duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-black text-xl sm:text-2xl italic">
                  D
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className={`font-black text-2xl sm:text-2xl tracking-tighter leading-none uppercase transition-colors duration-500 ${logoColor}`}>DRIVE</span>
                <span className="text-brand-yellow font-bold text-[9px] sm:text-[10px] tracking-[0.4em] leading-none uppercase -mt-0.5">Mauritius</span>
              </div>
            </Link>

            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
              isDarkHero ? 'bg-white/10 border-white/10 text-white/40' : 'bg-[#F1EDE4] border-black/5 text-[#1A1A1A]/40'
            }`}>
               <div className={`w-1.5 h-1.5 rounded-full ${geo.loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
               <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                 <MapPin size={10} className="text-brand-yellow" />
                 {geo.loading ? 'Locating...' : (geo.address || 'Mauritius')}
               </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className={`hidden lg:flex items-center gap-8 xl:gap-10 text-[13px] font-black uppercase tracking-widest transition-colors duration-500 ${linkColor}`}>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`transition-colors ${pathname === link.href ? 'text-brand-yellow' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Language Picker */}
            <div className="relative hidden xl:block">
              <button 
                onClick={() => setShowPicker(showPicker === 'language' ? null : 'language')}
                className={`flex items-center gap-2 px-3 py-2 border rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                  isDarkHero ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-black/5 text-[#1A1A1A]'
                }`}
              >
                <span className="text-sm">{languages[language].flag}</span>
                {language}
              </button>
              {showPicker === 'language' && (
                <div className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-black/5 p-2 animate-in slide-in-from-top-2 duration-300">
                  {Object.keys(languages).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLanguage(code);
                        setShowPicker(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-between transition-colors ${
                        language === code ? 'bg-brand-yellow text-black' : 'hover:bg-[#F1EDE4] text-[#1A1A1A]/50'
                      }`}
                    >
                      {languages[code].label}
                      <span>{languages[code].flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Picker */}
            <div className="relative">
              <button 
                onClick={() => setShowPicker(showPicker === 'currency' ? null : 'currency')}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-full font-black text-[11px] uppercase tracking-widest transition-all ${
                  isDarkHero ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-black/5 text-[#1A1A1A]'
                }`}
              >
                <Globe size={14} className="text-brand-yellow" />
                {currency}
              </button>
              {showPicker === 'currency' && (
                <div className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-black/5 p-2 animate-in slide-in-from-top-2 duration-300">
                  {Object.keys(currencies).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setShowPicker(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${
                        currency === code ? 'bg-brand-yellow text-black' : 'hover:bg-[#F1EDE4] text-[#1A1A1A]/50'
                      }`}
                    >
                      {currencies[code].symbol} {code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a 
              href="https://wa.me/23051234567" 
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#25D366] text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#25D366]/20"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden w-11 h-11 flex items-center justify-center border rounded-xl transition-colors ${
                isDarkHero ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-black/5 text-[#1A1A1A]'
              }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-50 bg-[#F1EDE4] transition-all duration-500 flex flex-col ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-black/5 bg-white">
          <div className="flex flex-col text-left">
            <span className="text-[#1A1A1A] font-black text-2xl tracking-tighter leading-none uppercase">DRIVE</span>
            <span className="text-brand-yellow font-bold text-[10px] tracking-[0.4em] leading-none uppercase">Mauritius</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-11 h-11 flex items-center justify-center bg-white border border-black/5 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow flex flex-col justify-start items-center gap-6 p-6 overflow-y-auto">
          <div className="flex flex-col items-center gap-6 pt-10">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-4xl font-black uppercase tracking-tighter hover:text-brand-yellow transition-colors ${
                  pathname === link.href ? 'text-brand-yellow' : 'text-[#1A1A1A]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="mt-auto py-8 border-t border-black/5 w-full flex flex-col items-center gap-8">
             <div className="flex flex-col items-center gap-4 w-full">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]/30">Select Currency</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.keys(currencies).map((code) => (
                    <button
                      key={code}
                      onClick={() => setCurrency(code)}
                      className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                        currency === code ? 'bg-brand-yellow text-black border-brand-yellow shadow-lg' : 'bg-white border-black/5 text-[#1A1A1A]/40'
                      }`}
                    >
                      {currencies[code].symbol} {code}
                    </button>
                  ))}
                </div>
             </div>

             <div className="flex flex-col items-center gap-4 w-full">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]/30">Select Language</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.keys(languages).map((code) => (
                    <button
                      key={code}
                      onClick={() => setLanguage(code)}
                      className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                        language === code ? 'bg-brand-yellow text-black border-brand-yellow shadow-lg' : 'bg-white border-black/5 text-[#1A1A1A]/40'
                      }`}
                    >
                      {languages[code].flag} {languages[code].label}
                    </button>
                  ))}
                </div>
             </div>

             <a href="https://wa.me/23051234567" className="w-full max-w-xs flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-[#25D366]/20">
                <MessageSquare className="w-5 h-5 fill-current" />
                Contact via WhatsApp
             </a>
          </div>
        </div>
      </div>
    </nav>
  );
}