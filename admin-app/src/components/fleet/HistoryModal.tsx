"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryModalProps {
  selectedUnitHistory: any;
  onClose: () => void;
}

export function HistoryModal({ selectedUnitHistory, onClose }: HistoryModalProps) {
  if (!selectedUnitHistory) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-black uppercase leading-none">{selectedUnitHistory.unit.plate_number} History</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Operational Audit Trail</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-8 max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {selectedUnitHistory.history.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    record.type === 'delivery' ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  )} />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase leading-none">{record.type}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1.5">{record.rentals?.customers?.name || "Internal Record"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary leading-none">{record.mileage?.toLocaleString()} KM</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1.5">{new Date(record.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Dismiss</button>
        </div>
      </div>
    </div>
  );
}
