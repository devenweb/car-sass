"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { X, Fuel, Gauge, FileText, Image as ImageIcon, User, Calendar, Plus, Save } from "lucide-react";
import SmartUploader from "./SmartUploader";

interface InspectionModalProps {
  rentalId: string;
  onClose: () => void;
}

export default function InspectionModal({ rentalId, onClose }: InspectionModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newInspection, setNewInspection] = useState({
    type: 'delivery',
    fuel_level: 100,
    mileage: 0,
    condition_notes: '',
    photos: [] as string[]
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, [rentalId]);

  async function fetchInspections() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rental_inspections")
      .select("*")
      .eq("rental_id", rentalId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching inspections:", error);
    } else {
      setInspections(data || []);
    }
    setLoading(false);
  }

  async function handleAddInspection() {
    if (newInspection.mileage <= 0) return alert("Please enter valid mileage");
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("rental_inspections")
        .insert([{
          ...newInspection,
          rental_id: rentalId
        }]);

      if (error) throw error;
      
      setIsAdding(false);
      setNewInspection({ type: 'delivery', fuel_level: 100, mileage: 0, condition_notes: '', photos: [] });
      fetchInspections();
    } catch (err: any) {
      alert("Error adding inspection: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Inspection Reports</h2>
            <p className="text-sm text-slate-500 uppercase tracking-tighter">Booking #{rentalId.slice(0, 8)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                isAdding ? "bg-slate-200 text-slate-600" : "bg-primary text-white shadow-lg shadow-primary/20"
              )}
            >
              {isAdding ? <X size={14} /> : <Plus size={14} />}
              {isAdding ? "Cancel" : "Add Inspection"}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {isAdding && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-black text-admin-text uppercase tracking-tight">New Inspection Entry</h3>
                 <div className="flex p-1 bg-white rounded-lg border border-slate-200">
                    <button 
                      onClick={() => setNewInspection({...newInspection, type: 'delivery'})}
                      className={cn("px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all", newInspection.type === 'delivery' ? 'bg-primary text-white' : 'text-slate-400')}
                    >Delivery</button>
                    <button 
                      onClick={() => setNewInspection({...newInspection, type: 'return'})}
                      className={cn("px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all", newInspection.type === 'return' ? 'bg-primary text-white' : 'text-slate-400')}
                    >Return</button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Fuel Level (%)</label>
                         <input 
                           type="number" 
                           value={newInspection.fuel_level}
                           onChange={(e) => setNewInspection({...newInspection, fuel_level: parseInt(e.target.value)})}
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Current Odometer (KM)</label>
                         <input 
                           type="number" 
                           value={newInspection.mileage}
                           onChange={(e) => setNewInspection({...newInspection, mileage: parseInt(e.target.value)})}
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                         />
                       </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Condition Notes</label>
                      <textarea 
                        rows={3}
                        value={newInspection.condition_notes}
                        onChange={(e) => setNewInspection({...newInspection, condition_notes: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold resize-none"
                        placeholder="Detail any scratches, cleanings, or mechanical observations..."
                      />
                    </div>
                  </div>

                  <div>
                     <SmartUploader 
                       label="Upload Evidence Photo"
                       bucket="inspections"
                       onUploadComplete={(url) => {
                         if (url) setNewInspection({...newInspection, photos: [...newInspection.photos, url]});
                       }}
                     />
                     <div className="mt-3 flex flex-wrap gap-2">
                        {newInspection.photos.map((photo, i) => (
                          <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                             <img src={photo} className="w-full h-full object-cover" />
                             <button 
                               onClick={() => setNewInspection({...newInspection, photos: newInspection.photos.filter((_, idx) => idx !== i)})}
                               className="absolute top-0 right-0 bg-rose-500 text-white p-0.5 rounded-bl-lg"
                             ><X size={8} /></button>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex justify-end">
                  <button 
                    onClick={handleAddInspection}
                    disabled={isSaving}
                    className="btn-primary h-10 px-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                  >
                    {isSaving ? "Saving..." : <><Save size={14} /> Submit Inspection</>}
                  </button>
               </div>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
            </div>
          ) : inspections.length > 0 ? (
            inspections.map((inspection) => (
              <div key={inspection.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                    inspection.type === 'delivery' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {inspection.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(inspection.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Fuel size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Fuel Level</p>
                        <p className="text-lg font-bold">{inspection.fuel_level}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Gauge size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Mileage</p>
                        <p className="text-lg font-bold">{inspection.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-1">
                        <FileText size={12} /> Condition Notes
                      </p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                        &ldquo;{inspection.condition_notes || 'No notes provided.'}&rdquo;
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-2">
                        <ImageIcon size={12} /> Photo Evidence
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {inspection.photos && inspection.photos.map((photo: string, idx: number) => (
                          <a key={idx} href={photo} target="_blank" rel="noreferrer" className="group relative w-20 h-20">
                            <Image 
                              src={photo} 
                              alt={`Inspection photo ${idx + 1}`} 
                              fill
                              className="object-cover rounded-lg border border-slate-200 group-hover:opacity-75 transition-opacity"
                            />
                          </a>
                        ))}
                        {(!inspection.photos || inspection.photos.length === 0) && (
                          <p className="text-xs text-slate-400 italic">No photos available.</p>
                        )}
                      </div>
                    </div>

                    {inspection.customer_signature && (
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Customer Signature</p>
                        <div className="relative h-20 w-40 border border-slate-200 rounded bg-white">
                          <Image 
                            src={inspection.customer_signature} 
                            alt="Customer Signature" 
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400">No inspection reports found for this rental.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
