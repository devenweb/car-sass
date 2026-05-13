"use client";

import React from "react";
import { Car as CarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FleetStatsProps {
  templates: any[];
}

export function FleetStats({ templates }: FleetStatsProps) {
  const stats = [
    { 
      label: "Total Models", 
      value: templates.length, 
      color: "bg-blue-500" 
    },
    { 
      label: "Total Units", 
      value: templates.reduce((acc, t) => acc + (t.units?.length || 0), 0), 
      color: "bg-indigo-500" 
    },
    { 
      label: "Available", 
      value: templates.reduce((acc, t) => acc + (t.units?.filter((u:any) => u.availability_status === 'available').length || 0), 0), 
      color: "bg-emerald-500" 
    },
    { 
      label: "Maintenance", 
      value: templates.reduce((acc, t) => acc + (t.units?.filter((u:any) => u.availability_status === 'maintenance').length || 0), 0), 
      color: "bg-amber-500" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-admin-border shadow-sm flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md", stat.color)}>
            <CarIcon size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-lg font-black text-admin-text leading-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
