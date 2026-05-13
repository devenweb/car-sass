"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Shield, 
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setAgents(data || []);
    setLoading(false);
  }

  async function handleSaveAgent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const agentData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      status: formData.get("status"),
    };

    let error;
    if (editingAgent) {
      const { error: err } = await supabase
        .from("agents")
        .update(agentData)
        .eq("id", editingAgent.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from("agents")
        .insert([agentData]);
      error = err;
    }

    if (error) {
      alert("Error saving agent: " + error.message);
    } else {
      setShowModal(false);
      setEditingAgent(null);
      fetchAgents();
    }
    setSaving(false);
  }

  async function deleteAgent(id: string) {
    if (!confirm("Remove this agent from the system?")) return;
    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (error) alert("Error deleting agent");
    else fetchAgents();
  }

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Users size={16} />
          </div>
          <div>
            <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Multi-Agent System</h1>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Personnel & Access Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 h-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search agents..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full h-full pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[10px]" 
            />
          </div>
          <button 
            onClick={() => { setEditingAgent(null); setShowModal(true); }}
            className="h-8 px-4 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <UserPlus size={14} />
            Add Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-admin-border animate-pulse" />)
        ) : filteredAgents.length > 0 ? (
          filteredAgents.map(agent => (
            <div key={agent.id} className="bg-white p-5 rounded-xl border border-admin-border shadow-sm hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-sm overflow-hidden">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-admin-text text-sm leading-tight">{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                        agent.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        agent.role === 'staff' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      )}>
                        {agent.role}
                      </span>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                        agent.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                      )}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingAgent(agent); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-primary transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => deleteAgent(agent.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-admin-muted font-bold">
                  <Mail size={12} className="text-slate-300" />
                  {agent.email}
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-2 text-[10px] text-admin-muted font-bold">
                    <Phone size={12} className="text-slate-300" />
                    {agent.phone}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-sm font-black text-admin-text uppercase">No Agents Registered</h3>
            <p className="text-[10px] text-admin-muted font-medium mt-1">Start building your team by adding your first agent.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {editingAgent ? "Edit Agent" : "Add New Agent"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveAgent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Full Name</label>
                  <input name="name" required defaultValue={editingAgent?.name} className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Email Address</label>
                  <input name="email" type="email" required defaultValue={editingAgent?.email} className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Phone Number</label>
                  <input name="phone" defaultValue={editingAgent?.phone} className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Access Role</label>
                  <select name="role" defaultValue={editingAgent?.role || 'driver'} className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                    <option value="driver">Driver</option>
                    <option value="staff">Operations Staff</option>
                    <option value="admin">Branch Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Status</label>
                  <select name="status" defaultValue={editingAgent?.status || 'active'} className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                    <option value="active">Active</option>
                    <option value="inactive">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
