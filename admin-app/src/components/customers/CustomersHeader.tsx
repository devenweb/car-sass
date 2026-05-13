"use client";

import React from "react";
import { Search } from "lucide-react";

interface CustomersHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function CustomersHeader() {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Customer Registry</h1>
          <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Global User Database</p>
        </div>
      </div>
    </div>
  );
}
