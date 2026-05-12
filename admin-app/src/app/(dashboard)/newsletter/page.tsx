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
  Edit2
} from "lucide-react";

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
        <button className="btn-primary h-8 px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Integrated search into header */}

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
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase">
                        <CheckCircle2 size={12} />
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 text-[10px] font-bold text-admin-muted">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="View">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm("Remove subscriber?")) {
                              const { error } = await supabase.from("newsletters").delete().eq("id", sub.id);
                              if (error) alert("Error deleting subscriber");
                              else fetchSubscribers();
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete"
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
    </div>
  );
}
