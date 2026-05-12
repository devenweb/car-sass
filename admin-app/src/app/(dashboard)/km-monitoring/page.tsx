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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text flex items-center gap-2">
          <Gauge className="text-primary" size={28} />
          KM Monitoring & Management
        </h1>
        <p className="text-admin-muted">Automated mileage tracking from agent inspections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Car size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Fleet</span>
          </div>
          <p className="text-3xl font-bold text-admin-text">{records.length}</p>
          <p className="text-xs text-admin-muted mt-1">Active vehicle units</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">KM Tracked Today</span>
          </div>
          <p className="text-3xl font-bold text-admin-text">
            {records.reduce((acc, curr) => acc + (curr.inspections.filter(i => 
              new Date(i.created_at).toDateString() === new Date().toDateString()
            ).length), 0)}
          </p>
          <p className="text-xs text-admin-muted mt-1">Updates in the last 24h</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Service Alerts</span>
          </div>
          <p className="text-3xl font-bold text-admin-text">
            {records.filter(r => (r.mileage || 0) > 100000).length}
          </p>
          <p className="text-xs text-admin-muted mt-1">Vehicles over 100k KM</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-admin-border bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by plate, brand or model..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-black border-b border-slate-100">
                <th className="px-6 py-4">Vehicle Unit</th>
                <th className="px-6 py-4">Current Mileage</th>
                <th className="px-6 py-4">Last recorded</th>
                <th className="px-6 py-4">Recent History</th>
                <th className="px-6 py-4 text-right">Action</th>
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
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black tracking-widest border border-slate-700">
                          {record.plate_number}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {record.vehicle_templates?.brand} {record.vehicle_templates?.model}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-primary font-black">
                        <Gauge size={14} />
                        <span className="text-lg">{record.mileage?.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 uppercase">KM</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {record.inspections[0] ? (
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {record.inspections[0].mileage?.toLocaleString()} KM
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                            <History size={10} />
                            {new Date(record.inspections[0].created_at).toLocaleDateString()} via {record.inspections[0].type}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No recordings yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {record.inspections.slice(0, 3).map((ins, idx) => (
                          <div 
                            key={ins.id} 
                            className={cn(
                              "w-2 h-8 rounded-full",
                              ins.type === 'delivery' ? 'bg-teal-100' : 'bg-amber-100'
                            )}
                            title={`${ins.type}: ${ins.mileage} KM on ${new Date(ins.created_at).toLocaleDateString()}`}
                          />
                        ))}
                        {record.inspections.length > 3 && (
                          <div className="w-2 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                            +
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-primary transition-all border border-transparent hover:border-slate-200">
                        <ChevronRight size={18} />
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
