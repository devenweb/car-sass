'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Minus, Search, MessageCircle, HelpCircle, Car, CreditCard, Shield, MapPin, MoveRight } from 'lucide-react';

export default function FAQs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      id: 'booking',
      title: 'Booking',
      questions: [
        {
          q: "How do I book a car online?",
          a: "It's simple. Choose your car, select your dates, and follow our 3-step checkout. You'll get an instant confirmation via email."
        },
        {
          q: "Do I need to pay upfront?",
          a: "We offer flexibility. You can pay a 25% deposit now or the full amount. Any balance is settled when you collect the car."
        },
        {
          q: "Is there a minimum rental duration?",
          a: "Our minimum rental period is 3 days. This ensures we can provide the best service and car preparation."
        }
      ]
    },
    {
      id: 'pickup',
      title: 'Pickup',
      questions: [
        {
          q: "Where is the airport counter?",
          a: "We are located at Counter No. 6, Level 0 of the SSR International Airport terminal."
        },
        {
          q: "Do you deliver to hotels?",
          a: "Yes. We deliver cars across Mauritius — hotels, villas, or private residences. Just specify your location during booking."
        }
      ]
    },
    {
      id: 'insurance',
      title: 'Insurance',
      questions: [
        {
          q: "What is your deposit policy?",
          a: "Unlike traditional agencies, we do NOT block a security deposit on your credit card. We trust our clients."
        },
        {
          q: "Is mileage limited?",
          a: "No. All our rentals include unlimited mileage. Explore the whole island as much as you want."
        }
      ]
    }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#F1EDE4] selection:bg-brand-yellow/30">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 relative overflow-hidden">
        {/* Grid Background Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Header */}
            <div className="space-y-8 text-center">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-black/10 bg-white/50 backdrop-blur-sm shadow-sm">
                <span className="text-[13px] font-bold text-[#1A1A1A] uppercase tracking-wider">Help Center</span>
              </div>
              
              <h1 className="text-6xl sm:text-7xl md:text-[110px] font-black text-[#1A1A1A] tracking-[-0.05em] leading-[0.85] uppercase">
                Got <br />
                <span className="text-brand-yellow relative">
                  Questions?
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0 5C20 2 40 2 60 5C80 8 100 5 100 5" stroke="#FFB300" strokeWidth="2" fill="none" opacity="0.5" />
                  </svg>
                </span>
              </h1>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto pt-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                <input 
                  type="text" 
                  placeholder="Search for answers..."
                  className="w-full pl-14 pr-6 py-6 bg-white rounded-3xl border border-black/5 shadow-xl shadow-black/5 outline-none font-bold text-[#1A1A1A] placeholder:text-black/20 focus:border-brand-yellow transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-16 pt-8">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((category) => (
                  <div key={category.id} className="space-y-8">
                    <h2 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-widest border-l-4 border-brand-yellow pl-6">
                      {category.title}
                    </h2>
                    
                    <div className="space-y-4">
                      {category.questions.map((item, idx) => {
                        const globalIdx = `${category.id}-${idx}`;
                        const isOpen = openIndex === globalIdx;
                        return (
                          <div 
                            key={idx} 
                            className={`bg-white rounded-3xl border transition-all duration-300 ${isOpen ? 'border-brand-yellow' : 'border-black/5 hover:border-black/10'}`}
                          >
                            <button 
                              onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                              className="w-full flex items-center justify-between p-8 text-left"
                            >
                              <span className="text-xl font-black text-[#1A1A1A] tracking-tight">
                                {item.q}
                              </span>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-[#1A1A1A] text-brand-yellow rotate-180' : 'bg-[#F1EDE4] text-[#1A1A1A]'}`}>
                                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </div>
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                              <div className="p-8 pt-0 border-t border-black/5 text-[#1A1A1A]/50 text-lg font-medium leading-relaxed">
                                {item.a}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-black/5">
                   <p className="text-xl font-bold text-[#1A1A1A]/20">No matching questions found.</p>
                </div>
              )}
            </div>

            {/* Still Need Help */}
            <div className="bg-[#1A1A1A] rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-black/20">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-black uppercase tracking-tight">Still Need Help?</h3>
                <p className="text-white/40 font-medium">Chat with our local team in Mauritius.</p>
              </div>
              <div className="flex gap-4">
                <a href="https://wa.me/2306378080" className="bg-[#25D366] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a href="/contact" className="bg-brand-yellow text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
