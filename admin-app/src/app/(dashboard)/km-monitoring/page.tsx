"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Gauge, 
  Search, 
  History, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Car,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KMRecord {
  id: string;
  plate_number: string;
  mileage: number;
  vehicle_templates: {
    brand: string;
    model: string;
  };
  inspections: {
    id: string;
    type: string;
    mileage: number;
    created_at: string;
    rentals: {
      customers: {
        name: string;
      }
    }
  }[];
}

export default function KMMonitoringPage() {
  const [records, setRecords] = useState<KMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<KMRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<KMRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchKMData();
  }, []);

  async function fetchKMData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicle_units")
      .select(`
        id,
        plate_number,
        mileage,
        vehicle_templates (brand, model),
        rentals (
          id,
          customers (name),
          rental_inspections (
            id,
            type,
            mileage,
            created_at
          )
        )
      `)
      .order("plate_number");

    if (error) {
      console.error("Error fetching KM data:", error);
    } else {
      const formattedRecords = data?.map((unit: any) => {
        const inspections = unit.rentals?.flatMap((r: any) => 
          r.rental_inspections?.map((ins: any) => ({
            ...ins,
            customer_name: r.customers?.name
          })) || []
        ).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

        return {
          id: unit.id,
          plate_number: unit.plate_number,
          mileage: unit.mileage,
          vehicle_templates: unit.vehicle_templates,
          inspections: inspections
        };
      }) || [];

      setRecords(formattedRecords);
    }
    setLoading(false);
  }

  async function handleUpdateMileage() {
    if (!editingRecord) return;
    setSaving(true);
    const { error } = await supabase
      .from("vehicle_units")
      .update({ mileage: editingRecord.mileage })
      .eq("id", editingRecord.id);

    if (error) {
      alert("Error updating mileage: " + error.message);
    } else {
      setEditingRecord(null);
      fetchKMData();
    }
    setSaving(false);
  }

  const filteredRecords = records.filter(record => 
    record.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.vehicle_templates?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.vehicle_templates?.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Gauge size={16} />
          </div>
          <div>
            <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">KM Monitoring</h1>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Automated Mileage Intelligence</p>
          </div>
        </div>
        <div className="relative w-64 h-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Filter by plate or model..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full h-full pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[10px]" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Car size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Fleet</p>
            <p className="text-lg font-black text-admin-text leading-tight mt-1">{records.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Tracked Today</p>
            <p className="text-lg font-black text-admin-text leading-tight mt-1">
              {records.reduce((acc, curr) => acc + (curr.inspections.filter(i => 
                new Date(i.created_at).toDateString() === new Date().toDateString()
              ).length), 0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <AlertCircle size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Service Alerts</p>
            <p className="text-lg font-black text-admin-text leading-tight mt-1">
              {records.filter(r => (r.mileage || 0) > 100000).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-6 py-3">Vehicle Unit</th>
                <th className="px-6 py-3">Mileage</th>
                <th className="px-6 py-3">Last Recorded</th>
                <th className="px-6 py-3">History</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6">
                      <div className="h-6 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest border border-slate-700 leading-none">
                          {record.plate_number}
                        </div>
                        <p className="font-bold text-slate-900 text-xs leading-none">
                          {record.vehicle_templates?.brand} {record.vehicle_templates?.model}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-1.5 text-primary font-black leading-none">
                        <Gauge size={12} />
                        <span className="text-sm">{record.mileage?.toLocaleString()}</span>
                        <span className="text-[8px] text-slate-400 uppercase tracking-tighter">KM</span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      {record.inspections[0] ? (
                        <div className="leading-tight">
                          <p className="text-xs font-black text-slate-700 leading-none">
                            {record.inspections[0].mileage?.toLocaleString()} KM
                          </p>
                          <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tight mt-0.5">
                            {new Date(record.inspections[0].created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">No Recordings</span>
                      )}
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex gap-0.5">
                        {record.inspections.slice(0, 5).map((ins, idx) => (
                          <div 
                            key={ins.id} 
                            className={cn(
                              "w-1.5 h-6 rounded-full",
                              ins.type === 'delivery' ? 'bg-teal-200' : 'bg-amber-200'
                            )}
                            title={`${ins.type}: ${ins.mileage} KM`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="View History">
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingRecord(record); }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Remove KM tracking record?")) {
                              const { error } = await supabase.from("vehicle_units").delete().eq("id", record.id);
                              if (error) {
                                if (error.code === '23503') {
                                  alert("CANNOT DELETE: This unit has active or past rental history. Please change its status to 'Inactive' in the Fleet Manager instead.");
                                } else {
                                  alert("Error deleting record: " + error.message);
                                }
                              } else fetchKMData();
                            }
                          }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all" title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-muted">
                    No vehicle units found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{selectedRecord.plate_number} History</h2>
                <p className="text-[10px] text-admin-muted font-bold tracking-tight uppercase mt-1">{selectedRecord.vehicle_templates.brand} {selectedRecord.vehicle_templates.model}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {selectedRecord.inspections.length > 0 ? (
                  selectedRecord.inspections.map((ins, idx) => (
                    <div key={ins.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          ins.type === 'delivery' ? 'bg-teal-400' : 'bg-amber-400'
                        )} />
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase leading-none">{ins.type}</p>
                          <p className="text-[9px] text-admin-muted font-bold mt-1">{(ins as any).customer_name || "Internal"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary leading-none">{ins.mileage.toLocaleString()} KM</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">{new Date(ins.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-admin-muted italic text-xs">No historical recordings found for this unit.</div>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button onClick={() => setSelectedRecord(null)} className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm">Close History</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mileage Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Update Mileage</h2>
              <button onClick={() => setEditingRecord(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Plate Number</label>
                <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-black text-slate-500">{editingRecord.plate_number}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Current Mileage (KM)</label>
                <input 
                  type="number"
                  value={editingRecord.mileage}
                  onChange={(e) => setEditingRecord({...editingRecord, mileage: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateMileage}
                  disabled={saving}
                  className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update KM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
