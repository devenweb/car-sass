"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Sparkles, 
  MessageSquare, 
  Mail, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Users2, 
  Star,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Addon {
  id: string;
  name: string;
  description: string;
  icon: any;
  price: string;
  key: string;
}

const ADDONS: Addon[] = [
  {
    id: "whatsapp",
    key: "whatsapp_notifications",
    name: "WhatsApp Notifications",
    description: "Receive instant WhatsApp messages for every new booking and customer inquiry.",
    icon: Smartphone,
    price: "Rs 500 / mo"
  },
  {
    id: "emails",
    key: "extra_emails",
    name: "Extended Email Network",
    description: "Add more than 2 notification recipients to keep your entire operations team informed.",
    icon: Mail,
    price: "Rs 250 / mo"
  },
  {
    id: "boost",
    key: "priority_boost",
    name: "Priority 'Boost' Visibility",
    description: "Get featured at the top of search results and category pages for 2.5x more clicks.",
    icon: Zap,
    price: "Rs 1,500 / mo"
  },
  {
    id: "multi-agent",
    key: "multi_agent",
    name: "Multi-Agent System",
    description: "Dedicated sub-accounts for drivers and staff with custom access level controls.",
    icon: Users2,
    price: "Rs 900 / mo"
  }
];

export default function AddonsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [emailList, setEmailList] = useState("");

  useEffect(() => {
    fetchTenantData();
  }, []);

  async function fetchTenantData() {
    setLoading(true);
    // Assuming we have one tenant for now as per schema
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .single();

    if (!error && data) {
      setTenant(data);
      setWhatsappNumber(data.whatsapp_number || "");
      setEmailList(data.notification_emails?.join(", ") || "");
    }
    setLoading(false);
  }

  const toggleAddon = (key: string) => {
    const currentAddons = { ...(tenant?.addons || {}) };
    currentAddons[key] = !currentAddons[key];
    setTenant({ ...tenant, addons: currentAddons });
  };

  async function handleSave() {
    setSaving(true);
    const emails = emailList.split(",").map(e => e.trim()).filter(e => e !== "");
    
    const { error } = await supabase
      .from("tenants")
      .update({
        addons: tenant.addons,
        whatsapp_number: whatsappNumber,
        notification_emails: emails
      })
      .eq("id", tenant.id);

    if (error) {
      alert("Error saving addons: " + error.message);
    } else {
      alert("Addons updated successfully!");
    }
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-admin-muted">Loading Marketplace Store...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Marketplace Addons</h1>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Premium Operational Utilities</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary h-8 px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
          Save Config
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADDONS.map((addon) => {
          const isActive = tenant?.addons?.[addon.key];
          return (
            <div 
              key={addon.id}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer group relative",
                isActive 
                  ? "bg-white border-primary shadow-md" 
                  : "bg-white border-admin-border hover:border-slate-300"
              )}
              onClick={() => toggleAddon(addon.key)}
            >
              {isActive && (
                <div className="absolute top-3 right-3 text-primary">
                  <CheckCircle2 size={16} />
                </div>
              )}
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors",
                isActive ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              )}>
                <addon.icon size={18} />
              </div>
              <h3 className="text-xs font-black text-admin-text mb-1 uppercase tracking-tight">{addon.name}</h3>
              <p className="text-[9px] text-admin-muted mb-3 leading-tight h-7 line-clamp-2">{addon.description}</p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{addon.price}</span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                  isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* WhatsApp Config */}
        <div className={cn(
          "bg-white p-4 rounded-xl border transition-opacity",
          !tenant?.addons?.whatsapp_notifications && "opacity-50 pointer-events-none"
        )}>
          <h2 className="text-sm font-black text-admin-text mb-3 flex items-center gap-2 uppercase tracking-tight">
            <Smartphone size={16} className="text-emerald-500" />
            WhatsApp Setup
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[8px] font-black text-admin-muted uppercase mb-1 ml-1 tracking-widest">WhatsApp Number</label>
              <input 
                type="text" 
                placeholder="+230 XXX XXXX"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>
            <div className="p-2 bg-slate-50 rounded-lg flex gap-2">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <p className="text-[9px] text-slate-500 font-medium">
                Instant booking summaries sent via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Email Config */}
        <div className={cn(
          "bg-white p-4 rounded-xl border transition-opacity",
          !tenant?.addons?.extra_emails && "opacity-50 pointer-events-none"
        )}>
          <h2 className="text-sm font-black text-admin-text mb-3 flex items-center gap-2 uppercase tracking-tight">
            <Mail size={16} className="text-blue-500" />
            Email Distribution
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[8px] font-black text-admin-muted uppercase mb-1 ml-1 tracking-widest">Recipient List</label>
              <textarea 
                placeholder="ops@agency.com, booking@agency.com"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold min-h-[60px]"
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
              />
            </div>
            <div className="p-2 bg-slate-50 rounded-lg flex gap-2">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <p className="text-[9px] text-slate-500 font-medium">
                Add up to 10 operational email addresses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
