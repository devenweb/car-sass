"use client";

import React from "react";
import { Plus, Search } from "lucide-react";

import Link from "next/link";

interface FleetHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function FleetHeader({ searchQuery, setSearchQuery }: FleetHeaderProps) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-lg font-black text-admin-text uppercase leading-none">Fleet Manager</h1>
          <p className="text-[9px] text-admin-muted font-bold uppercase mt-1">Vehicle Control Center</p>
        </div>
        <div className="relative w-64 h-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Filter models..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full h-full pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[10px]" 
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Link href="/fleet/new" className="btn-primary h-8 px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          <Plus size={14} /> New Model
        </Link>
      </div>
    </div>
  );
}
