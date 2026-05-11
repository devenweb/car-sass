"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, Car as CarIcon, 
  X, ChevronDown, ChevronRight, Settings, Calendar, Tool
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface VehicleUnit {
  id: string;
  plate_number: string;
  vin_number: string;
  status: string;
  availability_status: string;
  mileage: number;
  daily_price: number;
}

interface VehicleTemplate {
  id: string;
  brand: string;
  model: string;
  category: string;
  transmission: string;
  seats: number;
  default_thumbnail: string;
  units: VehicleUnit[];
}

export default function FleetPage() {
  const [templates, setTemplates] = useState<VehicleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFleet();
  }, []);

  async function fetchFleet() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicle_templates")
      .select(`
        *,
        units:vehicle_units(*)
      `)
      .order("brand");

    if (error) {
      console.error("Error fetching fleet:", error);
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  }

  const toggleExpand = (id: string) => {
    const next = new Set(expandedTemplates);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTemplates(next);
  };

  const filteredTemplates = templates.filter(t => 
    `${t.brand} ${t.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Fleet Inventory</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Catalog & Unit Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
            <Plus className="w-4 h-4" /> Add Template
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Templates", value: templates.length, color: "blue" },
          { label: "Total Units", value: templates.reduce((acc, t) => acc + (t.units?.length || 0), 0), color: "emerald" },
          { label: "Available", value: templates.reduce((acc, t) => acc + (t.units?.filter(u => u.availability_status === 'available').length || 0), 0), color: "indigo" },
          { label: "Maintenance", value: templates.reduce((acc, t) => acc + (t.units?.filter(u => u.availability_status === 'maintenance').length || 0), 0), color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search brand, model or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 h-16 pl-16 pr-6 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm"
        />
      </div>

      {/* Fleet List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Model</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Units</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Avg Price</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">Loading Inventory...</td></tr>
              ) : filteredTemplates.map((template) => (
                <React.Fragment key={template.id}>
                  <tr className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => toggleExpand(template.id)}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 relative bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                          {template.default_thumbnail && (
                            <Image src={template.default_thumbnail} fill className="object-cover mix-blend-multiply" alt={template.model} />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight">{template.brand} {template.model}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{template.transmission} • {template.seats} Seats</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-black text-slate-900">{template.units?.length || 0}</span>
                        {expandedTemplates.has(template.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-900">Rs {Math.min(...(template.units?.map(u => u.daily_price) || [0]))}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Units View */}
                  {expandedTemplates.has(template.id) && (
                    <tr className="bg-slate-50/30">
                      <td colSpan={5} className="px-12 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {template.units?.map(unit => (
                            <div key={unit.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Plate Number</p>
                                  <p className="font-black text-slate-900 uppercase tracking-widest text-lg">{unit.plate_number}</p>
                                </div>
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                  unit.availability_status === 'available' ? "bg-emerald-100 text-emerald-700" :
                                  unit.availability_status === 'rented' ? "bg-blue-100 text-blue-700" :
                                  "bg-amber-100 text-amber-700"
                                )}>
                                  {unit.availability_status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Mileage</p>
                                  <p className="text-sm font-black text-slate-600">{unit.mileage.toLocaleString()} KM</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Daily Price</p>
                                  <p className="text-sm font-black text-slate-600">Rs {unit.daily_price}</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 pt-4 border-t border-slate-50">
                                <button title="Unit Settings" className="flex-1 flex items-center justify-center py-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button title="Maintenance" className="flex-1 flex items-center justify-center py-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                  <Tool className="w-4 h-4" />
                                </button>
                                <button title="Bookings" className="flex-1 flex items-center justify-center py-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                  <Calendar className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all">
                            <Plus className="w-6 h-6 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Add Physical Unit</p>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from "react";