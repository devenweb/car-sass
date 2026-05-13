'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Star, Users, Fuel, ArrowRight, Briefcase, Smartphone, LayoutGrid, List 
} from 'lucide-react';
import { SmartImage } from '@/lib/image';

export default function VehicleCard({ template, viewMode = 'grid', formatPrice, mounted, addons = {} }) {
  const isGrid = viewMode === 'grid';
  const slug = template.slug || template.id;
  const showDynamicPricing = addons.dynamic_pricing !== false;

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
            {mounted && showDynamicPricing && template.percentage_discount_rate > 0 && (
              <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                -{template.percentage_discount_rate}% DISCOUNT
              </span>
            )}
            {mounted && (template.available_count > 0 ? (
               <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/20">
                 {template.available_count} Available
               </span>
             ) : (
               <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/20">
                 All Units Rented Out
               </span>
             ))}
          </div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[var(--brand-yellow)] fill-[var(--brand-yellow)]" />
            <span className="text-[11px] font-black text-[var(--bg-dark)]">{Number(template.rating || 5.0).toFixed(1)}</span>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-[var(--bg-dark)] text-lg font-black uppercase group-hover:text-[var(--brand-yellow)] transition-colors mb-1 leading-tight">{template.brand} {template.model}</h3>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <span className="text-[9px] font-black tracking-[0.2em] text-[var(--bg-dark)]/30">Verified Drive</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-3 border-y border-black/5 mb-4">
            <Spec icon={Users} label="Seats" value={mounted ? `${template.seats}` : '...'} />
            <Spec icon={Briefcase} label="Luggage" value={mounted ? `${template.luggage_large || 2} Large` : '...'} />
            <Spec icon={Fuel} label="Fuel" value={mounted ? (template.fuel_type || 'Gasoline') : '...'} />
            <Spec icon={Smartphone} label="Tech" value={mounted ? (template.has_apple_carplay ? 'CarPlay' : 'BT Audio') : '...'} />
          </div>
          
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5">
              <div className="flex flex-col">
                {showDynamicPricing && template.marketing_strikethrough_price && (
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] text-rose-500 font-bold line-through opacity-50">
                       {formatPrice(template.marketing_strikethrough_price)}
                     </span>
                     <span className="text-[9px] font-black text-rose-600 bg-rose-50/80 px-2 py-0.5 rounded-lg border border-rose-100 uppercase">Save {formatPrice(template.marketing_strikethrough_price - template.min_price)} /D</span>
                  </div>
                )}
                <span className="text-[8px] text-[var(--bg-dark)]/30 font-black uppercase tracking-[0.3em] mb-1 leading-none">Starting At</span>
                <div className="flex items-baseline gap-1.5">
                   <span className="text-3xl font-black text-[var(--bg-dark)] leading-none">
                     {mounted ? formatPrice(template.min_price) : '...'}
                   </span>
                   <span className="text-[10px] font-bold text-[var(--bg-dark)]/20 uppercase tracking-widest">/D</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-[1.25rem] bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--bg-dark)] shadow-xl shadow-[var(--brand-yellow)]/20 group-hover:bg-[var(--bg-dark)] group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                <ArrowRight className="w-7 h-7" strokeWidth={2.5} />
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
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
            <span className="badge-deal !bg-white/95 !text-[var(--bg-dark)] !shadow-lg !border-black/5 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">{template.category}</span>
            {mounted && (template.available_count > 0 ? (
               <span className="px-4 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                 {template.available_count} Available
               </span>
             ) : (
               <span className="px-4 py-1.5 bg-rose-500/90 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                 All Units Rented Out
               </span>
             ))}
          </div>
       </div>

       <div className="flex-grow p-7 flex flex-col border-t md:border-t-0 md:border-l border-black/5">
          <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-[var(--bg-dark)] text-3xl font-black uppercase group-hover:text-[var(--brand-yellow)] transition-colors mb-1.5">{template.brand} {template.model}</h3>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-black/5 mb-6">
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

           <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5">
              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-[var(--bg-dark)]/30 font-black uppercase tracking-[0.2em]">Starting At</span>
                    {template.marketing_strikethrough_price && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-rose-500 line-through opacity-60">
                          {formatPrice(template.marketing_strikethrough_price)}
                        </span>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-widest">Save {formatPrice(template.marketing_strikethrough_price - template.min_price)} /D</span>
                      </div>
                    )}
                    {template.percentage_discount_rate > 0 && (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
                        -{template.percentage_discount_rate}% DISCOUNT APPLIED
                      </span>
                    )}
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-[var(--bg-dark)] leading-none">
                      {mounted ? formatPrice(template.min_price) : '...'}
                    </span>
                    <span className="text-sm font-black text-[var(--bg-dark)]/30 uppercase tracking-[0.3em]">MUR / Day</span>
                 </div>
               </div>
              <div className="flex items-center gap-8">
                 {mounted && template.available_count > 0 && (
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{template.available_count} Units Left</span>
                      <span className="text-[8px] font-bold text-emerald-600/40 uppercase tracking-widest animate-pulse">High Demand</span>
                   </div>
                 )}
                 <div className="h-20 px-14 rounded-[2rem] bg-[var(--brand-yellow)] flex items-center justify-center gap-4 text-[var(--bg-dark)] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-[var(--brand-yellow)]/20 group-hover:bg-[var(--bg-dark)] group-hover:text-white transition-all duration-500">
                   Experience Drive
                   <ArrowRight size={24} strokeWidth={3} />
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
           "font-black text-[var(--bg-dark)] uppercase  truncate",
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
