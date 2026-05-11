"use client";

import { Save, User, Bell, Shield, Database, History, Download, Upload, RefreshCcw, AlertTriangle, FileJson, CheckCircle2, Trash2, Package } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
    { id: "backups", label: "Backup & Restore", icon: History },
  ];

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

      // Create and download file
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

          // Restore in specific order to satisfy foreign key constraints
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Settings</h1>
        <p className="text-admin-muted">Manage your application configuration and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-admin-border">
            <h3 className="text-lg font-bold text-admin-text uppercase tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Agency Name</label>
                    <input type="text" defaultValue="Royal Car Rental" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Contact Email</label>
                    <input type="email" defaultValue="admin@royalrentals.com" className="input-field" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Address</label>
                  <textarea rows={3} className="input-field" defaultValue="123 Royal Avenue, Port Louis, Mauritius" />
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
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleRestoreBackup} 
                    className="hidden" 
                    accept=".json" 
                  />
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

                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex items-start gap-4">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-black text-rose-900 uppercase tracking-tight">System Integrity Warning</p>
                    <p className="text-xs text-rose-700 mt-2 leading-relaxed font-medium">
                      The restore process uses **UPSERT** logic. It will overwrite existing records with the same IDs from the backup file but will **NOT** delete records created after the backup was taken. This tool is designed for ecosystem synchronization and emergency recovery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "general" && activeTab !== "database" && activeTab !== "backups" && (
              <div className="py-12 text-center text-slate-400 italic">
                Settings for {activeTab} will be implemented in the next update.
              </div>
            )}

            <div className="pt-6 flex justify-end">
              <button className="btn-primary">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
