'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Star, Users, Fuel, ArrowRight, Briefcase, Smartphone, LayoutGrid, List 
} from 'lucide-react';
import { SmartImage } from '@/lib/image';

export default function VehicleCard({ template, viewMode = 'grid', formatPrice, mounted }) {
  const isGrid = viewMode === 'grid';
  const slug = template.slug || template.id;

  if (isGrid) {
    return (
      <Link 
        href={`/fleet/${slug}`}
        className="group relative bg-white rounded-[2.5rem] border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden cursor-pointer"
      >
        <div className="relative aspect-[16/11] overflow-hidden shrink-0 bg-[var(--bg-primary)] transition-colors duration-700 p-2">
          <SmartImage 
            src={template.default_thumbnail || template.image_url} 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 relative z-10" 
            alt={`${template.brand} ${template.model}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-100"></div>
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
            <span className="badge-deal !bg-white/95 !text-[var(--bg-dark)] !shadow-lg !border-black/5 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">{template.category}</span>
            {mounted && template.percentage_discount_rate > 0 && (
              <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                -{template.percentage_discount_rate}% SALE
              </span>
            )}
            {mounted && (template.available_count > 0 ? (
               <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                 {template.available_count} Available
               </span>
             ) : (
               <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                 Sold Out
               </span>
             ))}
          </div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[var(--brand-yellow)] fill-[var(--brand-yellow)]" />
            <span className="text-[11px] font-black text-[var(--bg-dark)]">{Number(template.rating || 5.0).toFixed(1)}</span>
          </div>
        </div>
        
        <div className="p-7 flex flex-col flex-1">
          <h3 className="text-[var(--bg-dark)] text-xl font-black uppercase group-hover:text-[var(--brand-yellow)] transition-colors mb-1 tracking-tighter leading-tight">{template.brand} {template.model}</h3>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <span className="text-[9px] font-black tracking-[0.2em] text-[var(--bg-dark)]/30">Verified Drive</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 border-y border-black/5 mb-5">
            <Spec icon={Users} label="Seats" value={mounted ? `${template.seats}` : '...'} />
            <Spec icon={Briefcase} label="Luggage" value={mounted ? `${template.luggage_large || 2} Large` : '...'} />
            <Spec icon={Fuel} label="Fuel" value={mounted ? (template.fuel_type || 'Gasoline') : '...'} />
            <Spec icon={Smartphone} label="Tech" value={mounted ? (template.has_apple_carplay ? 'CarPlay' : 'BT Audio') : '...'} />
          </div>
          
           <div className="mt-auto flex items-center justify-between">
             <div className="flex flex-col">
               {template.marketing_strikethrough_price && (
                 <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-rose-500 font-bold line-through opacity-60">
                      {formatPrice(template.marketing_strikethrough_price)}
                    </span>
                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-tighter">Save {formatPrice(template.marketing_strikethrough_price - template.min_price)}</span>
                 </div>
               )}
               <span className="text-[8px] text-[var(--bg-dark)]/30 font-black uppercase tracking-[0.2em] mb-0.5 leading-none">Starting At</span>
               <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[var(--bg-dark)] tracking-tighter leading-none">
                    {mounted ? formatPrice(template.min_price) : '...'}
                  </span>
                  <span className="text-[9px] font-bold text-[var(--bg-dark)]/30 uppercase tracking-widest">/D</span>
               </div>
             </div>
             <div className="flex flex-col items-end gap-2">
                <div className="w-12 h-12 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--bg-dark)] shadow-md group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6" />
                </div>
             </div>
           </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={`/fleet/${slug}`}
      className="group relative bg-white rounded-[3rem] border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row overflow-hidden cursor-pointer"
    >
       <div className="w-full md:w-[460px] relative overflow-hidden bg-[var(--bg-primary)] transition-colors duration-700 p-4 flex items-center justify-center">
          <SmartImage 
            src={template.default_thumbnail || template.image_url} 
            className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-110 relative z-10" 
            alt={`${template.brand} ${template.model}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-100"></div>
          <div className="absolute top-6 left-6 flex flex-col gap-1.5 z-20">
            <span className="badge-deal !bg-white/95 !text-[var(--bg-dark)] !shadow-lg !border-black/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{template.category}</span>
          </div>
       </div>

       <div className="flex-grow p-10 flex flex-col border-t md:border-t-0 md:border-l border-black/5">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h3 className="text-[var(--bg-dark)] text-3xl font-black uppercase group-hover:text-[var(--brand-yellow)] transition-colors mb-1.5 tracking-tighter">{template.brand} {template.model}</h3>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg-dark)]/30">Immediate Confirmation • Premium Quality</span>
                </div>
             </div>
             <div className="bg-white/90 backdrop-blur-md border border-black/5 px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-[var(--brand-yellow)] fill-[var(--brand-yellow)]" />
                <span className="text-sm font-black text-[var(--bg-dark)]">{Number(template.rating || 5.0).toFixed(1)}</span>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-black/5 mb-8">
            <Spec icon={Users} label="Seats" value={mounted ? template.seats : '...'} isLarge />
            <Spec icon={Briefcase} label="Luggage" value={mounted ? `${template.luggage_large || 2} Large` : '...'} isLarge />
            <Spec icon={Fuel} label="Fuel" value={mounted ? (template.fuel_type || 'Gasoline') : '...'} isLarge />
            <Spec icon={Smartphone} label="Tech" value={mounted ? (template.has_apple_carplay ? 'CarPlay' : 'BT') : '...'} isLarge />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
             {template.tags?.slice(0, 3).map((tag, idx) => (
               <span key={idx} className="px-3 py-1 bg-slate-50 border border-black/5 rounded-lg text-[7px] font-black uppercase tracking-widest text-[var(--bg-dark)]/40">
                 {tag}
               </span>
             ))}
          </div>

           <div className="mt-auto flex items-center justify-between pt-6 border-t border-black/5">
              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-[var(--bg-dark)]/30 font-black uppercase tracking-[0.2em]">Starting At</span>
                    {template.marketing_strikethrough_price && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-rose-500 line-through opacity-60">
                          {formatPrice(template.marketing_strikethrough_price)}
                        </span>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-widest">You Save {formatPrice(template.marketing_strikethrough_price - template.min_price)}</span>
                      </div>
                    )}
                    {template.percentage_discount_rate > 0 && (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
                        -{template.percentage_discount_rate}% Member Rate Applied
                      </span>
                    )}
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-[var(--bg-dark)] tracking-tighter leading-none">
                      {mounted ? formatPrice(template.min_price) : '...'}
                    </span>
                    <span className="text-sm font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.3em]">MUR / Day</span>
                 </div>
               </div>
             <div className="flex items-center gap-6">
                {mounted && template.available_count > 0 && (
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{template.available_count} Cars Left</span>
                )}
                <div className="h-16 px-10 rounded-2xl bg-[var(--brand-yellow)] flex items-center justify-center gap-3 text-[var(--bg-dark)] font-black uppercase tracking-widest text-[11px] shadow-lg group-hover:scale-[1.02] transition-all">
                  View Details
                  <ArrowRight size={20} />
                </div>
             </div>
          </div>
       </div>
    </Link>
  );
}

function Spec({ icon: Icon, label, value, isLarge = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "rounded-lg bg-slate-50 border border-black/5 flex items-center justify-center shrink-0",
        isLarge ? "w-11 h-11" : "w-8 h-8"
      )}>
        <Icon className={cn("text-[var(--brand-yellow)]", isLarge ? "w-5 h-5" : "w-4 h-4")} />
      </div>
      <div className="flex flex-col min-w-0">
         <span className={cn(
           "font-black text-[var(--bg-dark)]/30 uppercase tracking-widest leading-none",
           isLarge ? "text-[8px]" : "text-[7px]"
         )}>{label}</span>
         <span className={cn(
           "font-black text-[var(--bg-dark)] uppercase tracking-tight truncate",
           isLarge ? "text-[11px]" : "text-[10px]"
         )}>
           {value}
         </span>
      </div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
