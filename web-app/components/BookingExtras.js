'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLocalization } from '@/lib/currency';
import { 
  Plus, Check, Info, ShieldCheck, 
  MapPin, Baby, UserPlus, Package 
} from 'lucide-react';

const ICON_MAP = {
  MapPin: MapPin,
  Baby: Baby,
  UserPlus: UserPlus,
  ShieldCheck: ShieldCheck,
  Package: Package
};

export default function BookingExtras({ onSelectionChange, isDark = false }) {
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { formatPrice } = useLocalization();

  useEffect(() => {
    setMounted(true);
    fetchExtras();
  }, []);

  async function fetchExtras() {
    try {
      const { data, error } = await supabase
        .from('booking_extras')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setExtras(data || []);
    } catch (err) {
      console.error('Error fetching extras:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleExtra = (extra) => {
    const isSelected = selectedExtras.find(e => e.id === extra.id);
    let newSelection;
    if (isSelected) {
      newSelection = selectedExtras.filter(e => e.id !== extra.id);
    } else {
      newSelection = [...selectedExtras, extra];
    }
    setSelectedExtras(newSelection);
    if (onSelectionChange) onSelectionChange(newSelection);
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className={`grid ${isDark ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
        {[1, 2].map(i => (
          <div key={i} className={`h-16 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!isDark && (
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-[var(--brand-yellow)] rounded-full"></div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">
            Enhance Your <span className="text-[var(--brand-yellow)]">Journey.</span>
          </h3>
        </div>
      )}

      <div className={`grid ${isDark ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
        {extras.map((extra) => {
          const Icon = ICON_MAP[extra.icon_name] || Info;
          const isSelected = selectedExtras.find(e => e.id === extra.id);

          return (
            <button
              key={extra.id}
              type="button"
              onClick={() => toggleExtra(extra)}
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${
                isSelected 
                  ? (isDark ? 'bg-white/10 border-white/20' : 'bg-[var(--bg-dark)] border-[var(--bg-dark)] text-white shadow-lg') 
                  : (isDark ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-white border-black/5 hover:border-[var(--brand-yellow)] shadow-sm')
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isSelected 
                  ? 'bg-[var(--brand-yellow)] text-[var(--bg-dark)]' 
                  : (isDark ? 'bg-white/10 text-white/40' : 'bg-[var(--bg-primary)] text-[var(--bg-dark)]/20')
              }`}>
                {isSelected ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className={`text-[10px] font-black uppercase tracking-wider truncate ${
                    isSelected ? 'text-white' : (isDark ? 'text-white/80' : 'text-[var(--bg-dark)]')
                  }`}>
                    {extra.name}
                  </h4>
                  <span className={`text-[10px] font-black shrink-0 ml-2 ${
                    isSelected ? 'text-[var(--brand-yellow)]' : (isDark ? 'text-white/40' : 'text-[var(--bg-dark)]/60')
                  }`}>
                    {mounted ? formatPrice(extra.price_per_day) : '...'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
