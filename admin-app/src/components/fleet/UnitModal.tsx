"use client";

import React from "react";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUnit: any;
  setEditingUnit: (unit: any) => void;
  onSave: () => void;
}

export function UnitModal({
  isOpen,
  onClose,
  editingUnit,
  setEditingUnit,
  onSave
}: UnitModalProps) {
  if (!isOpen || !editingUnit) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-10">
        <h3 className="text-2xl font-black uppercase mb-6">Unit Configuration</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input type="text" value={editingUnit.plate_number || ''} onChange={e => setEditingUnit({...editingUnit, plate_number: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold uppercase text-sm" placeholder="Plate Number" />
          <input type="text" value={editingUnit.vin || ""} onChange={e => setEditingUnit({...editingUnit, vin: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold text-sm" placeholder="VIN" />
          <input type="text" value={editingUnit.color || ''} onChange={e => setEditingUnit({...editingUnit, color: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold text-sm" placeholder="Color" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={editingUnit.mileage ?? 0} onChange={e => setEditingUnit({...editingUnit, mileage: parseInt(e.target.value)})} className="p-4 bg-slate-50 border rounded-xl font-bold text-sm" placeholder="Mileage" />
            <input type="number" value={editingUnit.daily_price ?? 0} onChange={e => setEditingUnit({...editingUnit, daily_price: parseInt(e.target.value)})} className="p-4 bg-slate-50 border rounded-xl font-bold text-emerald-600 text-sm" placeholder="Price/Day" />
          </div>
          <select value={editingUnit.availability_status || 'available'} onChange={e => setEditingUnit({...editingUnit, availability_status: e.target.value})} className="p-4 bg-slate-50 border rounded-xl font-bold text-sm col-span-2">
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="rented">Rented</option>
          </select>
        </div>
        <button onClick={onSave} className="w-full py-4 bg-admin-text text-white rounded-xl font-black uppercase text-sm">Save Unit</button>
      </div>
    </div>
  );
}
