"use client";

import React from "react";
import { Users, UserCheck, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomersStatsProps {
  customers: any[];
}

export function CustomersStats({ customers }: CustomersStatsProps) {
  const stats = [
    { 
      label: "Total Users", 
      value: customers.length, 
      color: "bg-blue-500",
      icon: Users
    },
    { 
      label: "With License", 
      value: customers.filter(c => c.license_number).length, 
      color: "bg-emerald-500",
      icon: UserCheck
    },
    { 
      label: "Recent", 
      value: customers.filter(c => {
        const joined = new Date(c.created_at);
        const now = new Date();
        return (now.getTime() - joined.getTime()) < (30 * 24 * 60 * 60 * 1000);
      }).length, 
      color: "bg-indigo-500",
      icon: Mail
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-admin-border shadow-sm flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md", stat.color)}>
            <stat.icon size={18} />
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
