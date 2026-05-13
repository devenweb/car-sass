"use client";

import React from "react";
import { X } from "lucide-react";

interface EditCustomerModalProps {
  customer: any;
  setCustomer: (customer: any) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export function EditCustomerModal({
  customer,
  setCustomer,
  onClose,
  onSave,
  saving
}: EditCustomerModalProps) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Customer</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Full Name</label>
            <input 
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Email Address</label>
            <input 
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({...customer, email: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Phone</label>
              <input 
                type="text"
                value={customer.phone || ""}
                onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">License Number</label>
              <input 
                type="text"
                value={customer.license_number || ""}
                onChange={(e) => setCustomer({...customer, license_number: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={saving}
              className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
