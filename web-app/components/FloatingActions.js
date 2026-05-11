'use client';

import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Mail, 
  X, 
  ChevronUp, 
  MessageSquare 
} from 'lucide-react';

export default function FloatingActions() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-5">
      {/* Social Icons Stack */}
      <div className={`flex flex-col gap-4 transition-all duration-500 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        {/* WhatsApp */}
        <a 
          href="https://wa.me/2301234567" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#00D95F] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-[4px] border-[#2C3344]"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </a>

        {/* Instagram */}
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#E1306C] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-[4px] border-[#2C3344]"
        >
          <Instagram className="w-6 h-6" />
        </a>

        {/* Facebook */}
        <a 
          href="https://facebook.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#1877F2] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-[4px] border-[#2C3344]"
        >
          <Facebook className="w-6 h-6 fill-current" />
        </a>

        {/* Email */}
        <a 
          href="mailto:info@royalrentals.mu" 
          className="w-12 h-12 bg-[#4F46E5] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-[4px] border-[#2C3344]"
        >
          <Mail className="w-6 h-6" />
        </a>

        {/* Toggle Button (X) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-[#0F172A] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-black transition-colors border-[1px] border-white/20"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-[#0F172A] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-black transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* Back to Top Button */}
      <button 
        onClick={scrollToTop}
        className={`w-16 h-16 bg-[#E10000] text-white rounded-[1.2rem] shadow-2xl flex items-center justify-center transition-all duration-500 hover:bg-red-700 hover:-translate-y-1 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
      >
        <ChevronUp className="w-9 h-9 stroke-[3]" />
      </button>
    </div>
  );
}
