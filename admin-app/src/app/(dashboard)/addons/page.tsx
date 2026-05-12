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
    id: "analytics",
    key: "advanced_analytics",
    name: "Advanced Fleet Analytics",
    description: "Detailed occupancy heatmaps, revenue forecasting, and vehicle performance reports.",
    icon: BarChart3,
    price: "Rs 750 / mo"
  },
  {
    id: "inspection",
    key: "digital_inspection",
    name: "Digital Inspection Suite",
    description: "High-res damage mapping, unlimited photo storage, and digital handover e-signatures.",
    icon: ShieldCheck,
    price: "Rs 600 / mo"
  },
  {
    id: "reviews",
    key: "review_manager",
    name: "Automated Review Manager",
    description: "Automated post-rental requests to boost your agency reputation and trust score.",
    icon: Star,
    price: "Rs 400 / mo"
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-text flex items-center gap-2">
            <Sparkles className="text-[var(--brand-yellow)]" />
            Marketplace Addons
          </h1>
          <p className="text-admin-muted">Supercharge your agency operations with premium utility features.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 flex items-center gap-2"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADDONS.map((addon) => {
          const isActive = tenant?.addons?.[addon.key];
          return (
            <div 
              key={addon.id}
              className={cn(
                "p-5 rounded-2xl border transition-all cursor-pointer group relative",
                isActive 
                  ? "bg-white border-[var(--brand-yellow)] shadow-lg" 
                  : "bg-white border-admin-border hover:border-slate-300"
              )}
              onClick={() => toggleAddon(addon.key)}
            >
              {isActive && (
                <div className="absolute top-4 right-4 text-[var(--brand-yellow)]">
                  <CheckCircle2 size={20} />
                </div>
              )}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                isActive ? "bg-[var(--brand-yellow)]/10 text-[var(--brand-yellow)]" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              )}>
                <addon.icon size={24} />
              </div>
              <h3 className="font-bold text-admin-text mb-1">{addon.name}</h3>
              <p className="text-[11px] text-admin-muted mb-4 leading-relaxed">{addon.description}</p>
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
          "bg-white p-6 rounded-2xl border transition-opacity",
          !tenant?.addons?.whatsapp_notifications && "opacity-50 pointer-events-none"
        )}>
          <h2 className="text-lg font-bold text-admin-text mb-4 flex items-center gap-2">
            <Smartphone size={20} className="text-emerald-500" />
            WhatsApp Notification Setup
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase mb-1.5 ml-1">WhatsApp Number (incl. Country Code)</label>
              <input 
                type="text" 
                placeholder="+230 XXX XXXX"
                className="input-field"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex gap-3">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Ensure this number has an active WhatsApp account. We will send automated booking summaries to this number as soon as a customer reserves a car.
              </p>
            </div>
          </div>
        </div>

        {/* Email Config */}
        <div className={cn(
          "bg-white p-6 rounded-2xl border transition-opacity",
          !tenant?.addons?.extra_emails && "opacity-50 pointer-events-none"
        )}>
          <h2 className="text-lg font-bold text-admin-text mb-4 flex items-center gap-2">
            <Mail size={20} className="text-blue-500" />
            Additional Notification Emails
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase mb-1.5 ml-1">Recipient List (Comma separated)</label>
              <textarea 
                placeholder="ops@agency.com, booking@agency.com"
                className="input-field min-h-[100px] py-3"
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex gap-3">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                The free tier includes 2 primary accounts. Activating this addon allows you to add up to 10 additional operational email addresses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
