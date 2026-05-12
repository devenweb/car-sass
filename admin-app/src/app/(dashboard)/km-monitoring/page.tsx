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
  Car
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

  useEffect(() => {
    fetchKMData();
  }, []);

  async function fetchKMData() {
    setLoading(true);
    // Fetch vehicle units with their templates and inspections (via rentals)
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
      // Flatten the data for easier display
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

      {/* Integrated search into header */}

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
                      <button className="p-1 text-slate-300 hover:text-primary transition-colors">
                        <ChevronRight size={14} />
                      </button>
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
    </div>
  );
}
