"use client";

import { Save, User, Users, Bell, Shield, Database, History, Download, Upload, RefreshCcw, AlertTriangle, FileJson, CheckCircle2, Trash2, Package, Key, Smartphone, Mail, Server, Globe, MapPin, Phone, UserPlus, Lock, ShieldCheck, Crown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [tenant, setTenant] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any>({});
  const [notificationSettings, setNotificationSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", role: "admin" });
  const [currentUser, setCurrentUser] = useState<any>(null);

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "api", label: "API Configurations", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
    { id: "backups", label: "Backup & Restore", icon: History },
    { id: "maintenance", label: "Maintenance", icon: RefreshCcw },
  ];

  useEffect(() => {
    fetchTenant();
    fetchAdmins();
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
      setCurrentUser(data);
    }
  }

  async function fetchAdmins() {
    setAdminsLoading(true);
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (data) setAdmins(data);
    setAdminsLoading(false);
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) return;
    
    setAdminsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-admins', {
        body: { 
          action: 'create_admin',
          email: newAdmin.email,
          password: newAdmin.password,
          name: newAdmin.name,
          role: newAdmin.role
        }
      });

      if (error) throw error;
      alert("Admin account created successfully!");
      setNewAdmin({ name: "", email: "", password: "", role: "admin" });
      fetchAdmins();
    } catch (error: any) {
      alert("Error creating admin: " + error.message);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string, role: string) => {
    if (role === 'super_admin') {
      alert("Super Admin cannot be deleted.");
      return;
    }
    if (!confirm("Are you sure you want to remove this admin? Access will be revoked immediately.")) return;
    
    setAdminsLoading(true);
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      fetchAdmins();
    } catch (error: any) {
      alert("Error deleting admin: " + error.message);
    } finally {
      setAdminsLoading(false);
    }
  };

  async function fetchTenant() {
    setLoading(true);
    const { data } = await supabase.from("tenants").select("*").single();
    if (data) {
      setTenant(data);
      setApiKeys(data.api_keys || {});
      setNotificationSettings(data.settings?.notifications || {
        email_alerts: true,
        whatsapp_alerts: false,
        new_booking_admin: true,
        new_message_admin: true,
        rental_start_reminder: true
      });
    }
    setLoading(false);
  }

  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys({ ...apiKeys, [key]: value });
  };

  const handleSaveAll = async () => {
    if (!tenant) return;
    setSaving(true);
    
    const updateData: any = {
      api_keys: apiKeys,
      settings: {
        ...tenant.settings,
        notifications: notificationSettings
      }
    };

    // If on general tab, also update tenant basic info
    if (activeTab === "general") {
      updateData.name = tenant.name;
      updateData.email = tenant.email;
      updateData.address = tenant.address;
      updateData.phone = tenant.phone;
    }

    const { error } = await supabase
      .from("tenants")
      .update(updateData)
      .eq("id", tenant.id);
    
    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      alert("Settings updated successfully!");
      fetchTenant();
    }
    setSaving(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const TABLES_TO_BACKUP = [
    'vehicle_templates',
    'vehicle_units',
    'vehicle_pricing',
    'customers',
    'rentals',
    'contact_messages',
    'newsletters',
    'rental_inspections',
    'vehicle_template_images'
  ];

  const handleCreateBackup = async () => {
    setIsProcessing(true);
    setBackupStatus(null);
    try {
      const backupData: Record<string, any> = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        tables: {}
      };

      for (const table of TABLES_TO_BACKUP) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
        backupData.tables[table] = data;
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `royal-rental-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setBackupStatus({ type: 'success', message: 'Ecosystem backup created and downloaded successfully!' });
    } catch (error: any) {
      console.error(error);
      setBackupStatus({ type: 'error', message: error.message || 'Failed to create backup' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("CRITICAL WARNING: Restoring a backup will attempt to merge data with your current database. It is highly recommended to have a manual SQL backup of your Supabase instance before proceeding. Continue?")) {
      event.target.value = '';
      return;
    }

    setIsProcessing(true);
    setBackupStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          
          if (!backupData.tables || typeof backupData.tables !== 'object') {
            throw new Error('Invalid backup file format');
          }

          const ORDERED_RESTORE = [
            'vehicle_templates',
            'vehicle_template_images',
            'customers',
            'newsletters',
            'contact_messages',
            'vehicle_units',
            'vehicle_pricing',
            'rentals',
            'rental_inspections'
          ];

          for (const table of ORDERED_RESTORE) {
            const data = backupData.tables[table];
            if (data && data.length > 0) {
              const { error } = await supabase.from(table).upsert(data);
              if (error) throw new Error(`Restoring ${table} failed: ${error.message}`);
            }
          }

          setBackupStatus({ type: 'success', message: 'Ecosystem restored successfully! Changes are now live.' });
        } catch (err: any) {
          setBackupStatus({ type: 'error', message: err.message || 'Failed to parse backup file' });
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      setBackupStatus({ type: 'error', message: 'Failed to read file' });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">System Settings</h1>
        <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Application Configuration & Preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-56 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon size={16} />
              <span className="text-xs font-bold uppercase tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-4 border-b border-admin-border bg-slate-50/50">
            <h3 className="text-sm font-black text-admin-text uppercase tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
            </h3>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {!tenant && loading && (
              <div className="flex items-center justify-center py-20"><RefreshCcw className="animate-spin text-primary" /></div>
            )}

            {tenant && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {activeTab === "general" && (
                  <div className="max-w-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> Agency Name</label>
                        <input 
                          type="text" 
                          value={tenant.name || ""} 
                          onChange={(e) => setTenant({...tenant, name: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> Admin Email</label>
                        <input 
                          type="email" 
                          value={tenant.email || ""} 
                          onChange={(e) => setTenant({...tenant, email: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone size={12}/> Contact Number</label>
                        <input 
                          type="text" 
                          value={tenant.phone || ""} 
                          onChange={(e) => setTenant({...tenant, phone: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> Office Address</label>
                      <textarea 
                        rows={3} 
                        value={tenant.address || ""} 
                        onChange={(e) => setTenant({...tenant, address: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                    </div>
                  </div>
                )}

                {activeTab === "api" && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
                        <Smartphone size={18} />
                        <h4 className="text-xs font-black uppercase tracking-widest">Twilio (WhatsApp Business)</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Account SID</label>
                          <input type="password" value={apiKeys.twilio_sid || ""} onChange={(e) => handleApiKeyChange("twilio_sid", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Auth Token</label>
                          <input type="password" value={apiKeys.twilio_auth_token || ""} onChange={(e) => handleApiKeyChange("twilio_auth_token", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="••••••••••••••••••••••••" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
                        <Server size={18} />
                        <h4 className="text-xs font-black uppercase tracking-widest">SMTP & Email Infrastructure</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase">SMTP Host</label>
                          <input type="text" value={apiKeys.smtp_host || ""} onChange={(e) => handleApiKeyChange("smtp_host", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="smtp.resend.com" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Port</label>
                          <input type="text" value={apiKeys.smtp_port || ""} onChange={(e) => handleApiKeyChange("smtp_port", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="587" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase">User / API Key</label>
                          <input type="text" value={apiKeys.smtp_user || ""} onChange={(e) => handleApiKeyChange("smtp_user", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Password</label>
                          <input type="password" value={apiKeys.smtp_pass || ""} onChange={(e) => handleApiKeyChange("smtp_pass", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Sender Identity</label>
                          <input type="email" value={apiKeys.smtp_from_email || ""} onChange={(e) => handleApiKeyChange("smtp_from_email", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="noreply@royalrentals.com" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="max-w-xl space-y-6">
                    <div className="space-y-1 pb-4">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Notification Channels</p>
                      <p className="text-[10px] text-slate-400 font-medium">Configure where you receive operational alerts.</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: 'email_alerts', label: 'Email Notifications', desc: 'Send transactional emails for bookings & messages', icon: Mail },
                        { id: 'whatsapp_alerts', label: 'WhatsApp Alerts', desc: 'Real-time booking updates via WhatsApp', icon: Smartphone },
                        { id: 'new_booking_admin', label: 'Admin Booking Alerts', desc: 'Notify admin when a new reservation is made', icon: Bell },
                        { id: 'rental_start_reminder', label: 'Rental Start Reminders', desc: 'Auto-send reminders 24h before pickup', icon: History },
                      ].map((pref) => (
                        <div key={pref.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100"><pref.icon size={18}/></div>
                            <div>
                              <p className="text-xs font-black text-slate-900 uppercase leading-none">{pref.label}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-1.5">{pref.desc}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setNotificationSettings({...notificationSettings, [pref.id]: !notificationSettings[pref.id]})}
                            className={cn(
                              "w-10 h-5 rounded-full p-1 transition-all duration-300",
                              notificationSettings[pref.id] ? "bg-primary" : "bg-slate-200"
                            )}
                          >
                            <div className={cn("w-3 h-3 bg-white rounded-full transition-all duration-300", notificationSettings[pref.id] ? "translate-x-5" : "translate-x-0")} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black uppercase tracking-tight">Access Management</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ecosystem Governance & Personnel Control</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
                          Manage administrative access for your team. You can provision new staff accounts, define roles, and revoke access immediately. 
                          <span className="text-primary font-black ml-1">Super Admin accounts are protected and cannot be deleted.</span>
                        </p>
                      </div>
                      <Shield className="absolute -right-10 -bottom-10 text-white/5" size={240} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Admin List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Users size={14} /> Active Personnel
                          </h4>
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{admins.length} Total</span>
                        </div>
                        <div className="space-y-3">
                          {adminsLoading && admins.length === 0 ? (
                            <div className="space-y-3">
                              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)}
                            </div>
                          ) : admins.map((admin) => (
                            <div key={admin.id} className={cn(
                              "p-5 rounded-2xl border transition-all hover:shadow-lg hover:shadow-slate-100 group",
                              admin.role === 'super_admin' ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white border-slate-100"
                            )}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110",
                                    admin.role === 'super_admin' ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
                                  )}>
                                    {admin.role === 'super_admin' ? <Crown size={20} /> : <User size={20} />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-900 leading-none flex items-center gap-2">
                                      {admin.role === 'super_admin' ? 'Ecosystem Owner' : 'Administrative Staff'}
                                      {admin.role === 'super_admin' && <Shield size={12} className="text-amber-500" />}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={cn(
                                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest",
                                        admin.role === 'super_admin' ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"
                                      )}>
                                        {admin.role}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tabular-nums">
                                        Added {new Date(admin.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {admin.role !== 'super_admin' && currentUser?.role === 'super_admin' && (
                                  <button 
                                    onClick={() => handleDeleteAdmin(admin.id, admin.role)}
                                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center border border-transparent hover:border-rose-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add Admin Form */}
                      {currentUser?.role === 'super_admin' ? (
                        <div className="space-y-6 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                              <UserPlus size={16} className="text-primary" /> Provision New Account
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Create a new dashboard identity</p>
                          </div>
                          
                          <form onSubmit={handleCreateAdmin} className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Legal Full Name</label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input 
                                  type="text" 
                                  value={newAdmin.name}
                                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                                  required
                                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" 
                                  placeholder="Ex: John Doe"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Professional Email</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input 
                                  type="email" 
                                  value={newAdmin.email}
                                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                                  required
                                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" 
                                  placeholder="staff@royalrentals.com"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Initial Access Key</label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                  <input 
                                    type="password" 
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                                    required
                                    minLength={6}
                                    className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" 
                                    placeholder="••••••••"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Assigned Role</label>
                                <select 
                                  value={newAdmin.role}
                                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                >
                                  <option value="admin">Administrator</option>
                                  <option value="secretary">Secretary</option>
                                  <option value="consultant">Consultant</option>
                                  <option value="accountant">Accountant</option>
                                </select>
                              </div>
                            </div>

                            <button 
                              type="submit" 
                              disabled={adminsLoading}
                              className="w-full h-12 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {adminsLoading ? <RefreshCcw size={16} className="animate-spin" /> : <UserPlus size={16} />}
                              {adminsLoading ? "Provisioning System Identity..." : "Provision New Account"}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 text-center space-y-4">
                          <AlertTriangle className="mx-auto text-amber-500" size={48} />
                          <h4 className="text-sm font-black uppercase text-amber-900 tracking-tight">Privileged Action Required</h4>
                          <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            Account provisioning is restricted to the <span className="font-black">Super Admin</span> only. 
                            Contact the ecosystem owner to manage administrative identities.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "maintenance" && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <RefreshCcw size={32} />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-admin-text uppercase">System Cache Optimization</h4>
                        <p className="text-sm text-admin-muted mt-1">Clear operational cache and re-synchronize global states to resolve minor UI discrepancies.</p>
                      </div>
                      <button className="btn-primary h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs">
                        Run Optimization
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-white rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3 text-slate-900">
                          <Database size={20} className="text-primary" />
                          <h5 className="text-xs font-black uppercase tracking-tight">Database Integrity</h5>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">Perform a deep scan of relational integrity between fleet, rentals, and customers.</p>
                        <button className="w-full h-10 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Verify Integrity</button>
                      </div>

                      <div className="p-6 bg-white rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3 text-slate-900">
                          <Smartphone size={20} className="text-primary" />
                          <h5 className="text-xs font-black uppercase tracking-tight">API Connectivity</h5>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">Test live connections to Twilio, Resend, and external telemetry services.</p>
                        <button className="w-full h-10 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Test Endpoints</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "backups" && (
                  <div className="space-y-8">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <Package size={32} />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-admin-text uppercase">Full Ecosystem Snapshot</h4>
                        <p className="text-sm text-admin-muted mt-1">Generate a comprehensive JSON backup of all tables, configurations, and system states.</p>
                      </div>
                      <button 
                        onClick={handleCreateBackup}
                        disabled={isProcessing}
                        className="btn-primary whitespace-nowrap"
                      >
                        {isProcessing ? <RefreshCcw size={18} className="animate-spin" /> : <Download size={18} />}
                        Create Backup
                      </button>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border border-admin-border flex flex-col md:flex-row items-center gap-8">
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 border border-amber-100">
                        <Upload size={32} />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-admin-text uppercase">Restore System State</h4>
                        <p className="text-sm text-admin-muted mt-1">Upload a previous ecosystem snapshot to restore the database to its previous state.</p>
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="btn-secondary whitespace-nowrap border-slate-200"
                      >
                        {isProcessing ? <RefreshCcw size={18} className="animate-spin" /> : <FileJson size={18} />}
                        Upload & Restore
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleRestoreBackup} className="hidden" accept=".json" />
                    </div>

                    {backupStatus && (
                      <div className={cn(
                        "p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                        backupStatus.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                      )}>
                        {backupStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                        <p className="text-sm font-bold">{backupStatus.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-admin-border flex justify-end items-center gap-4">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Changes are saved to the cloud ecosystem</p>
            <button 
              className="btn-primary h-10 px-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
              disabled={saving || !tenant}
              onClick={handleSaveAll}
            >
              {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving Changes..." : "Commit Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
