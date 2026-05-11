"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Fuel, Gauge, FileText, Image as ImageIcon, User, Calendar } from "lucide-react";

interface InspectionModalProps {
  rentalId: string;
  onClose: () => void;
}

export default function InspectionModal({ rentalId, onClose }: InspectionModalProps) {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInspections() {
      setLoading(true);
      const { data, error } = await supabase
        .from("rental_inspections")
        .select("*")
        .eq("rental_id", rentalId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching inspections:", error);
      } else {
        setInspections(data || []);
      }
      setLoading(false);
    }
    fetchInspections();
  }, [rentalId]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Inspection Reports</h2>
            <p className="text-sm text-slate-500 uppercase tracking-tighter">Booking #{rentalId.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
                          <a key={idx} href={photo} target="_blank" rel="noreferrer" className="group relative">
                            <img 
                              src={photo} 
                              alt={`Inspection photo ${idx + 1}`} 
                              className="w-20 h-20 object-cover rounded-lg border border-slate-200 group-hover:opacity-75 transition-opacity"
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
                        <img 
                          src={inspection.customer_signature} 
                          alt="Customer Signature" 
                          className="h-20 border border-slate-200 rounded bg-white"
                        />
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
