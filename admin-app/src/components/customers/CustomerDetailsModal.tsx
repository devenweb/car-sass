"use client";

import React from "react";
import { X, Mail, Phone, FileText, Calendar, History } from "lucide-react";

interface CustomerDetailsModalProps {
  customer: any;
  onClose: () => void;
}

export function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="relative h-32 bg-primary/10 flex items-center justify-center">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-all">
              <X size={20} className="text-slate-600" />
            </button>
          </div>
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-primary font-black text-3xl border-4 border-white shadow-lg translate-y-10">
            {customer.name?.charAt(0)}
          </div>
        </div>
        
        <div className="pt-14 p-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{customer.name}</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Loyal Member since {new Date(customer.created_at).getFullYear()}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
              <Mail size={18} className="text-primary/40 mb-2" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</span>
              <span className="text-[11px] font-bold text-slate-700">{customer.email}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
              <Phone size={18} className="text-primary/40 mb-2" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</span>
              <span className="text-[11px] font-bold text-slate-700">{customer.phone || 'Not Provided'}</span>
            </div>
          </div>

          <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-primary/40" />
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">License Number</p>
                <p className="text-sm font-black text-slate-700 font-mono mt-1">{customer.license_number || 'N/A'}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <UserCheck size={20} className="text-emerald-500" />
            </div>
          </div>

          <button className="w-full mt-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-primary transition-all">
            <History size={16} />
            View Rental History
          </button>
        </div>
      </div>
    </div>
  );
}

// Internal small icon component
function UserCheck({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
