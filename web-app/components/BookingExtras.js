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

export default function BookingExtras({ onSelectionChange }) {
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useLocalization();

  useEffect(() => {
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
      <div className="h-8 bg-black/5 rounded-xl w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-black/5 rounded-3xl"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-8 bg-[var(--brand-yellow)] rounded-full"></div>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--bg-dark)]">
          Enhance Your <span className="text-[var(--brand-yellow)]">Journey.</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {extras.map((extra) => {
          const Icon = ICON_MAP[extra.icon_name] || Info;
          const isSelected = selectedExtras.find(e => e.id === extra.id);

          return (
            <button
              key={extra.id}
              type="button"
              onClick={() => toggleExtra(extra)}
              className={`group flex items-start gap-6 p-6 rounded-[2.5rem] border-2 transition-all duration-500 text-left ${
                isSelected 
                  ? 'bg-[var(--bg-dark)] border-[var(--bg-dark)] text-white shadow-2xl shadow-black/20' 
                  : 'bg-white border-black/5 hover:border-[var(--brand-yellow)] hover:shadow-xl'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isSelected 
                  ? 'bg-[var(--brand-yellow)] text-[var(--bg-dark)] scale-110' 
                  : 'bg-[var(--bg-primary)] text-[var(--bg-dark)]/20 group-hover:bg-[var(--brand-yellow)] group-hover:text-[var(--bg-dark)]'
              }`}>
                {isSelected ? <Check size={24} strokeWidth={3} /> : <Icon size={24} />}
              </div>

              <div className="flex-grow space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className={`text-sm font-black uppercase tracking-wider ${
                    isSelected ? 'text-white' : 'text-[var(--bg-dark)]'
                  }`}>
                    {extra.name}
                  </h4>
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed ${
                  isSelected ? 'text-white/40' : 'text-[var(--bg-dark)]/40'
                }`}>
                  {extra.description}
                </p>
                <div className="pt-2">
                  <span className={`text-xs font-black ${
                    isSelected ? 'text-[var(--brand-yellow)]' : 'text-[var(--bg-dark)]'
                  }`}>
                    {formatPrice(extra.price_per_day)}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ml-1 opacity-40 ${
                    isSelected ? 'text-white' : 'text-[var(--bg-dark)]'
                  }`}>
                    {extra.price_type === 'per_day' ? '/ Day' : '/ Rental'}
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
