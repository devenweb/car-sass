"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Mail, 
  User, 
  Phone, 
  Calendar,
  Trash2,
  CheckCircle,
  Clock,
  Reply,
  Eye,
  Edit2,
  CheckSquare,
  Square,
  MessageSquare,
  Send,
  X
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [replyModal, setReplyModal] = useState<{ open: boolean; message: Message | null; bulk: boolean }>({
    open: false,
    message: null,
    bulk: false
  });
  const [replyText, setReplyText] = useState("");

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

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selectedIds.size} inquiries?`)) return;
    setLoading(true);
    const { error } = await supabase.from("contact_messages").delete().in("id", Array.from(selectedIds));
    if (error) alert("Error deleting messages");
    else {
      setSelectedIds(new Set());
      fetchMessages();
    }
  }

  async function handleBulkMarkRead() {
    setLoading(true);
    const { error } = await supabase.from("contact_messages").update({ status: 'read' }).in("id", Array.from(selectedIds));
    if (error) alert("Error updating messages");
    else {
      setSelectedIds(new Set());
      fetchMessages();
    }
  }

  async function handleSendReply() {
    if (!replyText.trim()) return;
    setLoading(true);
    // In a real app, this would send an actual email via SMTP/Resend
    // For now, we simulate success and update status
    const targetIds = replyModal.bulk ? Array.from(selectedIds) : [replyModal.message?.id];
    
    const { error } = await supabase.from("contact_messages").update({ 
      status: 'replied'
    }).in("id", targetIds as string[]);

    if (error) alert("Error sending reply");
    else {
      alert("Reply sent successfully (simulated)!");
      setReplyText("");
      setReplyModal({ open: false, message: null, bulk: false });
      setSelectedIds(new Set());
      fetchMessages();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Customer Inquiries</h1>
        <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Website Correspondence & Lead Management</p>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden relative">
        <div className="p-3 border-b border-admin-border bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSelectAll}
              className="p-1.5 text-slate-300 hover:text-primary transition-colors"
            >
              {selectedIds.size > 0 && selectedIds.size === filteredMessages.length ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} />
              )}
            </button>
            <div className="relative w-full md:w-64 h-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full h-full pl-9 pr-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[10px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
              <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20 uppercase tracking-tight">
                {selectedIds.size} Selected
              </span>
              <button 
                onClick={() => setReplyModal({ open: true, message: null, bulk: true })}
                className="h-7 px-3 bg-white border border-admin-border text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <Reply size={12} /> Bulk Reply
              </button>
              <button 
                onClick={handleBulkMarkRead}
                className="h-7 px-3 bg-white border border-admin-border text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <CheckCircle size={12} /> Read
              </button>
              <button 
                onClick={handleBulkDelete}
                className="h-7 px-3 bg-white border border-rose-100 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-1.5"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            [1, 2].map(i => <div key={i} className="p-8 animate-pulse bg-slate-50/30 h-32"></div>)
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div key={msg.id} className={cn(
                "p-4 hover:bg-slate-50 transition-colors group relative border-l-2",
                selectedIds.has(msg.id) ? "bg-primary/5 border-primary" : "border-transparent"
              )}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => toggleSelect(msg.id)}
                      className="mt-0.5 p-1 text-slate-200 hover:text-primary transition-colors shrink-0"
                    >
                      {selectedIds.has(msg.id) ? (
                        <CheckSquare size={14} className="text-primary" />
                      ) : (
                        <Square size={14} />
                      )}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-admin-text text-sm leading-none uppercase tracking-tight">{msg.name}</h3>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded font-black uppercase border leading-none",
                          msg.status === 'new' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                          msg.status === 'replied' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        )}>
                          {msg.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[9px] text-admin-muted uppercase tracking-tight font-bold">
                        <span className="flex items-center gap-1"><Mail size={10} className="text-primary/60" /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1"><Phone size={10} className="text-primary/60" /> {msg.phone}</span>}
                        <span className="flex items-center gap-1"><Clock size={10} className="text-primary/60" /> {new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); alert("Message is already visible in view."); }}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="View">
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setReplyModal({ open: true, message: msg, bulk: false }); }}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Reply / Edit">
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pl-12">
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-sm whitespace-pre-wrap font-medium">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-admin-muted">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-slate-200" />
              </div>
              <p className="font-bold">No inquiries found.</p>
              <p className="text-xs mt-1">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReplyModal({ open: false, message: null, bulk: false })}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                  <Reply size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    {replyModal.bulk ? `Bulk Reply (${selectedIds.size})` : `Reply to ${replyModal.message?.name}`}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {replyModal.bulk ? "Broadcast to selected" : `Recipient: ${replyModal.message?.email}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setReplyModal({ open: false, message: null, bulk: false })}
                className="p-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Response</label>
                <textarea 
                  rows={5}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-xs resize-none"
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setReplyModal({ open: false, message: null, bulk: false })}
                  className="h-9 px-6 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || loading}
                  className="btn-primary h-9 px-8 flex items-center gap-2 text-[10px] font-black uppercase disabled:opacity-50"
                >
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
