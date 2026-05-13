"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Save, Sparkles, AlertCircle, Ban, CheckCircle2, Loader2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addDays,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek
} from "date-fns";

export default function PricingPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pricingData, setPricingData] = useState<Record<string, { price: number; stopSale: boolean }>>({});
  
  // Bulk Update State
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStopSale, setBulkStopSale] = useState<boolean>(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchPricing(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    const { data } = await supabase.from('vehicle_templates').select('*').order('brand');
    setTemplates(data || []);
    setLoading(false);
  };

  const fetchPricing = async (templateId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('vehicle_pricing')
      .select('*')
      .eq('vehicle_template_id', templateId);
    
    const mapped: Record<string, any> = {};
    data?.forEach((row: any) => {
      mapped[row.pricing_date] = { price: row.daily_price, stopSale: row.is_stop_sale };
    });
    setPricingData(mapped);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    
    const rows = Object.entries(pricingData).map(([date, data]) => ({
      vehicle_template_id: selectedTemplate.id,
      pricing_date: date,
      daily_price: data.price,
      is_stop_sale: data.stopSale
    }));

    const { error } = await supabase
      .from('vehicle_pricing')
      .upsert(rows, { onConflict: 'vehicle_template_id,pricing_date' });

    if (error) {
      console.error("Save error:", error);
      alert("Error saving pricing. Check console.");
    } else {
      alert("Pricing updated successfully!");
    }
    setSaving(false);
  };

  const applyBulkToYear = () => {
    const start = startOfYear(currentMonth);
    const end = endOfYear(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const newData = { ...pricingData };
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      newData[dateStr] = { 
        price: bulkPrice ? parseFloat(bulkPrice) : (newData[dateStr]?.price || 0), 
        stopSale: bulkStopSale 
      };
    });
    setPricingData(newData);
    alert(`Successfully applied to all days in ${format(currentMonth, 'yyyy')} (Jan - Dec)`);
  };

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Pricing Manager</h1>
          <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Dynamic Rate & Inventory Control</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={!selectedTemplate || saving}
            className="btn-primary h-8 px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
            Save Pricing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Sidebar: Vehicle Selection */}
        <aside className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-admin-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-admin-border bg-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter models..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={cn(
                    "w-full p-2.5 text-left flex items-center gap-3 transition-all hover:bg-slate-50",
                    selectedTemplate?.id === t.id ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"
                  )}
                >
                  <div className="w-10 h-7 relative rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <Image src={t.default_thumbnail || "/placeholder-car.png"} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-bold truncate", selectedTemplate?.id === t.id ? "text-primary" : "text-admin-text")}>
                        {t.brand} {t.model}
                      </p>
                      {t.published_status !== 'published' && (
                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded text-[7px] font-black uppercase border border-rose-100 shrink-0">Inactive</span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content: Pricing Calendar */}
        <div className="xl:col-span-3 space-y-4">
          {!selectedTemplate ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                <CarIcon size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-admin-text">No Model Selected</h3>
                <p className="text-slate-400 max-w-xs mx-auto text-sm">Please select a vehicle model from the left sidebar to manage its dynamic pricing.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Bulk Updater */}
              <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Monthly Bulk Update (Price)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 2500"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stop Sale Status</label>
                   <button 
                    onClick={() => setBulkStopSale(!bulkStopSale)}
                    className={cn(
                      "w-full h-8 px-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all text-[10px] uppercase",
                      bulkStopSale ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-600"
                    )}
                   >
                     {bulkStopSale ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                     {bulkStopSale ? "Stop Sale ON" : "No Stop Sale"}
                   </button>
                </div>
                <button 
                  onClick={applyBulkToYear}
                  className="h-8 px-6 bg-admin-text text-white rounded-lg font-bold hover:bg-black transition-all flex items-center gap-2 shrink-0 text-[10px] uppercase"
                >
                  <Sparkles size={14} className="text-primary" />
                  Populate Year
                </button>
              </div>

              {/* Calendar Container */}
              <div className="bg-white rounded-2xl border border-admin-border shadow-sm overflow-hidden">
                <div className="p-3 border-b border-admin-border flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-black text-admin-text uppercase tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-primary transition-colors"><ChevronLeft size={16}/></button>
                      <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Today</button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-primary transition-colors"><ChevronRight size={16}/></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stop Sale</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 border-b border-admin-border bg-slate-50/30">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {calendarDays.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayData = pricingData[dateStr] || { price: 0, stopSale: false };
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "min-h-[100px] p-2.5 border-r border-b border-slate-100 flex flex-col group transition-all",
                          !isCurrentMonth ? "bg-slate-50/30" : "bg-white hover:bg-slate-50/50",
                          dayData.stopSale && "bg-rose-50/30"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn(
                            "text-xs font-black",
                            !isCurrentMonth ? "text-slate-300" : 
                            isSameDay(day, new Date()) ? "text-primary underline decoration-2 underline-offset-4" : "text-admin-text"
                          )}>
                            {format(day, 'd')}
                          </span>
                          <button 
                            onClick={() => {
                              const newData = { ...pricingData };
                              newData[dateStr] = { ...dayData, stopSale: !dayData.stopSale };
                              setPricingData(newData);
                            }}
                            className={cn(
                              "p-1.5 rounded-md transition-all",
                              dayData.stopSale ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white"
                            )}
                          >
                            <Ban size={12} />
                          </button>
                        </div>
                        
                        <div className="mt-auto space-y-2">
                           <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Rs</span>
                              <input 
                                type="number" 
                                value={dayData.price || ""}
                                onChange={(e) => {
                                  const newData = { ...pricingData };
                                  newData[dateStr] = { ...dayData, price: parseFloat(e.target.value) || 0 };
                                  setPricingData(newData);
                                }}
                                className={cn(
                                  "w-full pl-7 pr-2 py-2 bg-transparent border-b-2 font-black text-sm focus:outline-none transition-all",
                                  dayData.stopSale ? "border-rose-300 text-rose-700" : "border-slate-100 focus:border-primary text-admin-text"
                                )}
                                placeholder="0"
                              />
                           </div>
                           {dayData.stopSale && (
                             <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest text-center animate-pulse">Stop Sale Active</p>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-blue-900">Expert Tip</p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Setting a price of 0 or leaving it blank will use the vehicle&apos;s default daily price. <br/>
                    Use the **Stop Sale** feature to instantly block bookings for specific dates across all units of this model.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { Car as CarIcon } from "lucide-react";