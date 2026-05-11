"use client";

import { Save, User, Bell, Shield, Database } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
  ];

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

            {activeTab === "database" && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <strong>Warning:</strong> Database settings are critical. Changes may affect application stability.
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Supabase URL</label>
                  <input type="text" readOnly value={process.env.NEXT_PUBLIC_SUPABASE_URL} className="input-field bg-slate-50 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Sync Interval (seconds)</label>
                  <input type="number" defaultValue={30} className="input-field" />
                </div>
              </div>
            )}

            {activeTab !== "general" && activeTab !== "database" && (
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
