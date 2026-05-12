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
  Clock,
  Reply,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Customer Inquiries</h1>
        <p className="text-admin-muted">Manage messages and contact requests from the website.</p>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden relative">
        <div className="p-4 border-b border-admin-border bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSelectAll}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
            >
              {selectedIds.size > 0 && selectedIds.size === filteredMessages.length ? (
                <CheckSquare size={20} className="text-primary" />
              ) : (
                <Square size={20} />
              )}
            </button>
            <div className="relative w-full md:w-80">
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

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg">
                {selectedIds.size} Selected
              </span>
              <button 
                onClick={() => setReplyModal({ open: true, message: null, bulk: true })}
                className="btn-secondary text-xs h-9 flex items-center gap-2"
              >
                <Reply size={14} /> Bulk Reply
              </button>
              <button 
                onClick={handleBulkMarkRead}
                className="btn-secondary text-xs h-9 flex items-center gap-2"
              >
                <CheckCircle size={14} /> Mark Read
              </button>
              <button 
                onClick={handleBulkDelete}
                className="btn-secondary text-xs h-9 flex items-center gap-2 text-rose-500 hover:bg-rose-50 border-rose-100"
              >
                <Trash size={14} /> Delete
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
                "p-6 hover:bg-slate-50 transition-colors group relative border-l-4",
                selectedIds.has(msg.id) ? "bg-primary/5 border-primary" : "border-transparent"
              )}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => toggleSelect(msg.id)}
                      className="mt-1 p-1 text-slate-300 hover:text-primary transition-colors shrink-0"
                    >
                      {selectedIds.has(msg.id) ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-admin-text">{msg.name}</h3>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border",
                          msg.status === 'new' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                          msg.status === 'replied' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        )}>
                          {msg.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-admin-muted">
                        <span className="flex items-center gap-1 font-medium"><Mail size={12} className="text-primary/60" /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1 font-medium"><Phone size={12} className="text-primary/60" /> {msg.phone}</span>}
                        <span className="flex items-center gap-1 font-medium"><Clock size={12} className="text-primary/60" /> {new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setReplyModal({ open: true, message: msg, bulk: false })}
                      className="btn-secondary text-xs h-8 flex items-center gap-2"
                    >
                      <Reply size={14} /> Reply
                    </button>
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
                <div className="mt-4 pl-20">
                  <p className="text-sm text-slate-600 leading-relaxed bg-white p-5 rounded-2xl border border-slate-100 shadow-sm whitespace-pre-wrap">
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
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Reply size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">
                    {replyModal.bulk ? `Bulk Reply to ${selectedIds.size} Items` : `Reply to ${replyModal.message?.name}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {replyModal.bulk ? "Individual messages will be sent to all selected emails" : `Sending to: ${replyModal.message?.email}`}
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

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Response</label>
                <textarea 
                  rows={6}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm resize-none"
                  placeholder="Type your message here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setReplyModal({ open: false, message: null, bulk: false })}
                  className="btn-secondary h-12 px-8"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || loading}
                  className="btn-primary h-12 px-10 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} /> Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
