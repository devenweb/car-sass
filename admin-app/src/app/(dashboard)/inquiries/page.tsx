"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Mail, 
  User, 
  Phone, 
  Calendar,
  Trash,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

export default function InquiriesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase.from("contact_messages").update({ status: newStatus }).eq("id", id);
    if (error) alert("Error updating status");
    else fetchMessages();
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) alert("Error deleting message");
    else fetchMessages();
  }

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Customer Inquiries</h1>
        <p className="text-admin-muted">Manage messages and contact requests from the website.</p>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-admin-border bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            [1, 2].map(i => <div key={i} className="p-8 animate-pulse bg-slate-50/30 h-32"></div>)
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div key={msg.id} className="p-6 hover:bg-slate-50 transition-colors group relative">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-admin-text">{msg.name}</h3>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border",
                          msg.status === 'new' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        )}>
                          {msg.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-admin-muted">
                        <span className="flex items-center gap-1"><Mail size={12} /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1"><Phone size={12} /> {msg.phone}</span>}
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {msg.status === 'new' && (
                      <button onClick={() => updateStatus(msg.id, 'read')} className="btn-secondary text-xs h-8">Mark as Read</button>
                    )}
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Inquiry">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pl-14">
                  <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-admin-muted">
              No inquiries found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
