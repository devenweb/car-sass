"use client";

import React from "react";
import { XCircle } from "lucide-react";

interface EditRentalModalProps {
  rental: any;
  setRental: (rental: any) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  statusColors: Record<string, string>;
}

export function EditRentalModal({
  rental,
  setRental,
  onClose,
  onSave,
  saving,
  statusColors
}: EditRentalModalProps) {
  if (!rental) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Reservation</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><XCircle size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Status</label>
              <select 
                value={rental.status}
                onChange={(e) => setRental({...rental, status: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.keys(statusColors).map(status => (
                  <option key={status} value={status}>{status.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Total Amount (Rs)</label>
              <input 
                type="number"
                value={rental.total_amount || rental.total_price || 0}
                onChange={(e) => setRental({...rental, total_amount: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Pickup Date & Time</label>
            <input 
              type="datetime-local"
              value={rental.pickup_datetime ? new Date(rental.pickup_datetime).toISOString().slice(0, 16) : ""}
              onChange={(e) => setRental({...rental, pickup_datetime: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Return Date & Time</label>
            <input 
              type="datetime-local"
              value={rental.return_datetime ? new Date(rental.return_datetime).toISOString().slice(0, 16) : ""}
              onChange={(e) => setRental({...rental, return_datetime: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
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
