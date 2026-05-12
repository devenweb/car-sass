"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Mail, 
  Download, 
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [viewingSubscriber, setViewingSubscriber] = useState<Subscriber | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscribers:", error);
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  }

  async function handleSaveSubscriber() {
    if (!editingSubscriber) return;
    setSaving(true);
    const { error } = await supabase
      .from("newsletters")
      .update({ status: editingSubscriber.status })
      .eq("id", editingSubscriber.id);

    if (error) {
      alert("Error updating subscriber: " + error.message);
    } else {
      setEditingSubscriber(null);
      fetchSubscribers();
    }
    setSaving(false);
  }

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ["Email", "Status", "Joined"];
    const rows = subscribers.map(s => [s.email, s.status, new Date(s.created_at).toLocaleDateString()]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Newsletters</h1>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Email Marketing List</p>
          </div>
          <div className="relative w-60 h-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search subscribers..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full h-full pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[10px]" 
            />
          </div>
        </div>
        <button 
          onClick={handleExportCSV}
          className="btn-primary h-8 px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-6"><div className="h-6 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                          <Mail size={12} />
                        </div>
                        <span className="font-bold text-admin-text text-xs leading-none">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <span className={cn(
                        "flex items-center gap-1.5 text-[9px] font-black uppercase",
                        sub.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                      )}>
                        <CheckCircle2 size={12} />
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 text-[10px] font-bold text-admin-muted">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingSubscriber(sub); }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="View">
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingSubscriber(sub); }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Remove subscriber?")) {
                              const { error } = await supabase.from("newsletters").delete().eq("id", sub.id);
                              if (error) alert("Error deleting subscriber");
                              else fetchSubscribers();
                            }
                          }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all" title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-admin-muted">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subscriber Modal */}
      {editingSubscriber && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Subscriber</h2>
              <button onClick={() => setEditingSubscriber(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Email Address</label>
                <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-black text-slate-500">{editingSubscriber.email}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Status</label>
                <select 
                  value={editingSubscriber.status}
                  onChange={(e) => setEditingSubscriber({...editingSubscriber, status: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="active">ACTIVE</option>
                  <option value="unsubscribed">UNSUBSCRIBED</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setEditingSubscriber(null)}
                  className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSubscriber}
                  disabled={saving}
                  className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Subscriber Modal */}
      {viewingSubscriber && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Subscriber Details</h2>
              <button onClick={() => setViewingSubscriber(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-lg shadow-primary/10">
                  <Mail size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900">{viewingSubscriber.email}</h3>
                <span className={cn(
                  "mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  viewingSubscriber.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                )}>
                  {viewingSubscriber.status}
                </span>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription ID</span>
                  <span className="text-[10px] font-mono font-bold text-slate-600">{viewingSubscriber.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</span>
                  <span className="text-[10px] font-bold text-slate-600">{new Date(viewingSubscriber.created_at).toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => setViewingSubscriber(null)}
                className="w-full py-3 bg-admin-text text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
