"use client";

import React from "react";
import { Search, Filter } from "lucide-react";

interface RentalsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function RentalsHeader() {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Rentals & Bookings</h1>
          <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Live Transaction Oversight</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn-secondary h-8 px-4 text-[10px] font-bold uppercase tracking-wider">
          <Filter size={14} /> Filters
        </button>
      </div>
    </div>
  );
}
