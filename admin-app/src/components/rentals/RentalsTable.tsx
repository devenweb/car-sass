"use client";

import React from "react";
import { User, Clock, Eye, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "../DataTable";

interface RentalsTableProps {
  rentals: any[];
  loading: boolean;
  statusColors: Record<string, string>;
  onViewInspection: (id: string) => void;
  onEdit: (rental: any) => void;
  onDelete: (id: string) => void;
}

export function RentalsTable({
  rentals,
  loading,
  statusColors,
  onViewInspection,
  onEdit,
  onDelete
}: RentalsTableProps) {
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
      cell: (rental: any) => (
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">#{rental.id.slice(0, 6)}</p>
      )
    },
    {
      header: "Customer",
      accessorKey: "customers.name",
      sortable: true,
      cell: (rental: any) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary/60 shrink-0">
            <User size={12} />
          </div>
          <div>
            <p className="font-bold text-admin-text text-xs leading-none">{rental.customers?.name}</p>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight">{rental.customers?.email}</p>
          </div>
        </div>
      )
    },
    {
      header: "Vehicle",
      accessorKey: "vehicle_units.vehicle_templates.model",
      sortable: true,
      cell: (rental: any) => (
        <p className="text-xs font-bold text-admin-text leading-none">
          {rental.vehicle_units?.vehicle_templates 
            ? `${rental.vehicle_units.vehicle_templates.brand} ${rental.vehicle_units.vehicle_templates.model}`
            : "N/A"}
        </p>
      )
    },
    {
      header: "Logistics",
      accessorKey: "pickup_datetime",
      sortable: true,
      cell: (rental: any) => (
        <div className="flex flex-col text-[10px] font-bold text-admin-muted">
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-primary/40" /> 
            {rental.pickup_datetime 
              ? new Date(rental.pickup_datetime).toLocaleString('en-GB', { 
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                }) 
              : 'N/A'}
          </span>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (rental: any) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
          statusColors[rental.status.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200"
        )}>
          {rental.status}
        </span>
      )
    },
    {
      header: "Revenue",
      accessorKey: "total_amount",
      sortable: true,
      cell: (rental: any) => (
        <p className="font-black text-admin-text text-xs leading-none">
          Rs {(rental.total_amount || rental.total_price || 0).toLocaleString()}
        </p>
      )
    },
    {
      header: "",
      className: "text-right",
      cell: (rental: any) => (
        <div className="flex justify-end gap-1.5">
          <button 
            onClick={() => onViewInspection(rental.id)}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" 
            title="View Inspection"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={() => onEdit(rental)}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => onDelete(rental.id)}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable 
      data={rentals}
      columns={columns}
      loading={loading}
      searchPlaceholder="Search ID, Customer, Vehicle..."
      emptyMessage="No rentals found."
    />
  );
}
