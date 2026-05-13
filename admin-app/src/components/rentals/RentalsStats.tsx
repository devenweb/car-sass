"use client";

import React from "react";
import { Calendar, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface RentalsStatsProps {
  rentals: any[];
}

export function RentalsStats({ rentals }: RentalsStatsProps) {
  const stats = [
    { 
      label: "Total Bookings", 
      value: rentals.length, 
      color: "bg-blue-500",
      icon: Calendar
    },
    { 
      label: "Pending", 
      value: rentals.filter(r => r.status.toLowerCase() === 'pending').length, 
      color: "bg-amber-500",
      icon: Clock
    },
    { 
      label: "Active", 
      value: rentals.filter(r => ['confirmed', 'delivered'].includes(r.status.toLowerCase())).length, 
      color: "bg-emerald-500",
      icon: CheckCircle2
    },
    { 
      label: "Revenue", 
      value: `Rs ${rentals.reduce((acc, r) => acc + (r.total_amount || r.total_price || 0), 0).toLocaleString()}`, 
      color: "bg-indigo-500",
      icon: CreditCard
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
