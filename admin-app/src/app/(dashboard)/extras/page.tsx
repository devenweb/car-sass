"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Package, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Info, 
  CheckCircle2, 
  XCircle,
  Edit2,
  MapPin, 
  Baby, 
  UserPlus, 
  ShieldCheck, 
  Music, 
  Flower, 
  Smartphone, 
  Wifi,
  Search,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  { name: 'Package', icon: Package },
  { name: 'MapPin', icon: MapPin },
  { name: 'Baby', icon: Baby },
  { name: 'UserPlus', icon: UserPlus },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Music', icon: Music },
  { name: 'Flower', icon: Flower },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Wifi', icon: Wifi }
];

export default function ExtrasPage() {
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExtra, setCurrentExtra] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchExtras();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchExtras() {
    setLoading(true);
    const { data, error } = await supabase
      .from('booking_extras')
      .select('*')
      .order('category', { ascending: true });
    
    if (!error) setExtras(data || []);
    setLoading(false);
  }

  const handleOpenModal = (extra: any = null) => {
    setCurrentExtra(extra || {
      name: "",
      category: "Services",
      price_per_day: 0,
      icon_name: "Package",
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) {
      alert("Authentication required: You are currently identified as a guest. Please ensure you are logged in to save changes.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('booking_extras')
      .upsert(currentExtra);

    if (error) {
      console.error("Save Error:", error);
      alert("Error saving extra: " + error.message + " (Check console for detailed logs)");
    } else {
      setIsModalOpen(false);
      fetchExtras();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) {
      alert("Authentication required to delete.");
      return;
    }

    if (!confirm("Are you sure you want to delete this extra?")) return;
    
    const { error } = await supabase
      .from('booking_extras')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Delete Error:", error);
      alert("Error deleting extra: " + error.message);
    } else {
      fetchExtras();
    }
  };

  const toggleStatus = async (extra: any) => {
    if (!user) {
      alert("Authentication required to change status.");
      return;
    }

    const { error } = await supabase
      .from('booking_extras')
      .update({ is_active: !extra.is_active })
      .eq('id', extra.id);

    if (error) {
      console.error("Status Update Error:", error);
      alert("Error updating status: " + error.message);
    } else {
      fetchExtras();
    }
  };

  if (loading && extras.length === 0) return <div className="p-8 text-admin-muted uppercase font-black text-xs animate-pulse">Initializing Extras Manager...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      {!user && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-amber-500" size={20} />
          <p className="text-xs font-bold text-amber-700 uppercase tracking-tight">
            Authentication Required: You are currently viewing as a guest. Saving changes will be blocked by RLS policies.
          </p>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Booking Extras</h1>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Manage Upsells & Premium Add-ons</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary h-10 px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
        >
          <Plus size={16} />
          Add New Extra
        </button>
      </div>

      {/* Extras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {extras.map((extra) => {
          const IconObj = ICON_OPTIONS.find(i => i.name === extra.icon_name) || ICON_OPTIONS[0];
          const Icon = IconObj.icon;

          return (
            <div 
              key={extra.id}
              className={cn(
                "bg-white p-5 rounded-2xl border transition-all group relative overflow-hidden",
                extra.is_active ? "border-admin-border hover:border-primary/30" : "border-slate-100 opacity-60"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  extra.is_active ? "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white" : "bg-slate-100 text-slate-400"
                )}>
                  <Icon size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(extra)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg border border-slate-100 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(extra.id)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-black text-admin-text uppercase tracking-tight leading-none">{extra.name}</h3>
                <p className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">{extra.category}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-0.5">Price / Day</span>
                  <span className="text-sm font-black text-primary">Rs {extra.price_per_day}</span>
                </div>
                <button 
                  onClick={() => toggleStatus(extra)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all",
                    extra.is_active 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-slate-50 text-slate-400 border border-slate-100"
                  )}
                >
                  {extra.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                  {extra.is_active ? "Active" : "Hidden"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-admin-text uppercase tracking-tight">
                  {currentExtra.id ? "Edit Extra" : "New Extra"}
                </h2>
                <p className="text-[9px] text-admin-muted font-bold uppercase tracking-widest mt-0.5">Configuration Studio</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Extra Name</label>
                <input 
                  type="text" 
                  value={currentExtra.name}
                  onChange={e => setCurrentExtra({...currentExtra, name: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-xs outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="e.g. GPS Navigation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={currentExtra.category}
                    onChange={e => setCurrentExtra({...currentExtra, category: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-[10px] uppercase outline-none"
                  >
                    <option>Services</option>
                    <option>Equipment</option>
                    <option>Insurance</option>
                    <option>Logistic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (Rs / Day)</label>
                  <input 
                    type="number" 
                    value={currentExtra.price_per_day}
                    onChange={e => setCurrentExtra({...currentExtra, price_per_day: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-xs outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setCurrentExtra({...currentExtra, icon_name: opt.name})}
                      className={cn(
                        "w-full aspect-square rounded-xl flex items-center justify-center border transition-all",
                        currentExtra.icon_name === opt.name 
                          ? "bg-primary border-primary text-white shadow-md" 
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300"
                      )}
                    >
                      <opt.icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input 
                  type="checkbox" 
                  checked={currentExtra.is_active}
                  onChange={e => setCurrentExtra({...currentExtra, is_active: e.target.checked})}
                  className="w-5 h-5 rounded-lg text-primary border-slate-300"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-admin-text leading-none">Active Visibility</span>
                  <span className="text-[9px] font-bold text-admin-muted mt-1">Show this extra on the public booking form</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-2xl font-black uppercase text-[10px] text-slate-400 hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {extras.length === 0 && !loading && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
            <Package size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-admin-text uppercase">No Extras Defined</h3>
            <p className="text-slate-400 max-w-xs mx-auto text-sm">Start by adding your first premium extra to enhance customer experience and increase revenue.</p>
          </div>
        </div>
      )}
    </div>
  );
}
