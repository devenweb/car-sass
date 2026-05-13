"use client";

import React from "react";
import { Search } from "lucide-react";

interface CustomersHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function CustomersHeader({ searchTerm, setSearchTerm }: CustomersHeaderProps) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Customer Registry</h1>
          <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Global User Database</p>
        </div>
        <div className="relative w-64 h-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full h-full pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[10px]" 
          />
        </div>
      </div>
    </div>
  );
}
