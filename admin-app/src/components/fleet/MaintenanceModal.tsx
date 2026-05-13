"use client";

import React from "react";
import { Wrench, Loader2 } from "lucide-react";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnit: any;
  maintDescription: string;
  setMaintDescription: (desc: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function MaintenanceModal({
  isOpen,
  onClose,
  selectedUnit,
  maintDescription,
  setMaintDescription,
  onSave,
  isSaving
}: MaintenanceModalProps) {
  if (!isOpen || !selectedUnit) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && onClose()}></div>
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-10 text-center animate-in zoom-in-95">
         <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6 shadow-sm"><Wrench size={32} /></div>
         <h3 className="text-xl font-black uppercase mb-2">Record Maintenance</h3>
         <p className="text-slate-500 text-sm mb-6 font-medium">Record entry for <span className="font-bold text-admin-text">{selectedUnit.plate_number}</span></p>
         <input 
           type="text" 
           placeholder="Service (e.g. Oil Change)" 
           className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-sm mb-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
           value={maintDescription}
           onChange={(e) => setMaintDescription(e.target.value)}
           disabled={isSaving}
         />
         <button 
           onClick={onSave}
           disabled={isSaving || !maintDescription}
           className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
         >
           {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Log Service"}
         </button>
      </div>
    </div>
  );
}
