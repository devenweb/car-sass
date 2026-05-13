"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronDown, ChevronRight, Eye, Edit2, Trash2, 
  Wrench, History, Gauge 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FleetTableProps {
  templates: any[];
  loading: boolean;
  expandedRows: Set<string>;
  toggleRow: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onAddUnit: (templateId: string) => void;
  onEditUnit: (unit: any) => void;
  onDeleteUnit: (id: string) => void;
  onMaintenance: (unit: any) => void;
  onShowHistory: (unit: any) => void;
}

export function FleetTable({
  templates,
  loading,
  expandedRows,
  toggleRow,
  onDeleteTemplate,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onMaintenance,
  onShowHistory
}: FleetTableProps) {
  return (
    <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-admin-border">
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Model Details</th>
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory</th>
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Catalog</th>
              <th className="px-6 py-3 text-right text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400">Loading...</td></tr>
            ) : templates.map((template) => {
              const units = template.units || [];
              return (
                <React.Fragment key={template.id}>
                  <tr 
                    className={cn(
                      "group hover:bg-slate-50/50 cursor-pointer border-b border-slate-50 transition-colors", 
                      expandedRows.has(template.id) && "bg-slate-50/80"
                    )} 
                    onClick={() => toggleRow(template.id)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {expandedRows.has(template.id) ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} className="text-slate-300" />}
                        <div className="w-14 h-9 relative rounded-lg overflow-hidden border bg-slate-100 shrink-0">
                          <Image src={template.default_thumbnail || "/placeholder-car.png"} alt={template.brand} fill className="object-cover" />
                        </div>
                        <div><p className="text-sm font-bold tracking-tight">{template.brand} {template.model}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase border border-slate-200">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-4">
                        <div><p className="text-sm font-black">{units.length}</p><p className="text-[7px] uppercase text-slate-400 font-bold">Total</p></div>
                        <div><p className="text-sm font-black text-emerald-500">{units.filter((u:any) => u.availability_status === 'available').length}</p><p className="text-[7px] uppercase text-slate-400 font-bold">Ready</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        template.published_status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                      )}>
                        {template.published_status === 'published' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <Link 
                          href={`https://royalcarmauritius.vercel.app/fleet/${template.id}`} 
                          target="_blank" 
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" 
                          title="View on Public Site"
                        >
                          <Eye size={14}/>
                        </Link>
                        <Link href={`/fleet/${template.id}/edit`} className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="Edit Template"><Edit2 size={14}/></Link>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteTemplate(template.id); }} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all" title="Delete Template"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(template.id) && (
                    <tr className="bg-slate-50/30">
                      <td colSpan={5} className="px-8 py-4">
                        <div className="flex justify-between border-b border-slate-200 pb-1.5 mb-3">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Physical Units ({units.length})</h4>
                          <button onClick={() => onAddUnit(template.id)} className="text-[9px] font-black text-primary uppercase hover:underline">+ Add Unit</button>
                        </div>
                        <div className="grid gap-2">
                          {units.map((unit: any) => (
                            <div key={unit.id} className="bg-white p-2.5 rounded-lg border border-slate-100 flex justify-between items-center group/unit shadow-sm">
                              <div className="flex gap-4 items-center">
                                <div onClick={() => onEditUnit(unit)} className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono text-[10px] cursor-pointer hover:bg-primary transition-colors">{unit.plate_number}</div>
                                <div className="flex gap-4 text-xs font-bold text-slate-500">
                                  <span className="flex items-center gap-1"><Gauge size={14}/>{unit.mileage} KM</span>
                                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor:unit.color}}/>{unit.color}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase", unit.availability_status === 'available' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}>{unit.availability_status}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => onMaintenance(unit)} className="p-1.5 hover:bg-primary/10 rounded text-slate-400 hover:text-primary transition-colors" title="Log Maintenance"><Wrench size={14}/></button>
                                  <button 
                                    onClick={() => onShowHistory(unit)}
                                    className="p-1.5 hover:bg-primary/10 rounded text-slate-400 hover:text-primary transition-colors" 
                                    title="Mileage History"
                                  >
                                    <History size={14}/>
                                  </button>
                                  <button onClick={() => onDeleteUnit(unit.id)} className="p-1.5 hover:bg-rose-500/10 rounded text-rose-500 transition-colors" title="Delete Unit"><Trash2 size={14}/></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
