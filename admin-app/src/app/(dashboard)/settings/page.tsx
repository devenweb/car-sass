"use client";

import { Save, User, Bell, Shield, Database, History, Download, Upload, RefreshCcw, AlertTriangle, FileJson, CheckCircle2, Trash2, Package, Key, Smartphone, Mail, Server, Globe, MapPin, Phone } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [tenant, setTenant] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any>({});
  const [notificationSettings, setNotificationSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "api", label: "API Configurations", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
    { id: "backups", label: "Backup & Restore", icon: History },
  ];

  useEffect(() => {
    fetchTenant();
  }, []);

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
                  <div className="max-w-xl space-y-8">
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
                      <Shield className="text-amber-500 shrink-0" size={24} />
                      <div>
                        <p className="text-sm font-black text-amber-900 uppercase">Access Management</p>
                        <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                          Admin authentication is currently managed via Supabase Auth. To change your password or manage team members, please use the Supabase Dashboard or the primary auth interface.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Sessions</h4>
                      <div className="bg-white border border-slate-100 rounded-2xl divide-y">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <div>
                              <p className="text-xs font-bold">Current Browser Session</p>
                              <p className="text-[9px] text-slate-400 font-medium uppercase">Active Now • Windows Chrome</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black uppercase text-slate-500 tracking-widest">Self</span>
                        </div>
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
