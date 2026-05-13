"use client";

import React from "react";
import { Mail, Phone, Eye, Edit2, Trash2 } from "lucide-react";
import { DataTable } from "../DataTable";

interface CustomersTableProps {
  customers: any[];
  loading: boolean;
  onView: (customer: any) => void;
  onEdit: (customer: any) => void;
  onDelete: (id: string) => void;
}

export function CustomersTable({
  customers,
  loading,
  onView,
  onEdit,
  onDelete
}: CustomersTableProps) {
  const columns = [
    {
      header: "Customer",
      accessorKey: "name",
      sortable: true,
      cell: (customer: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] border border-primary/20 shrink-0">
            {customer.name?.charAt(0)}
          </div>
          <span className="font-bold text-admin-text text-xs leading-none">{customer.name}</span>
        </div>
      )
    },
    {
      header: "Contact",
      accessorKey: "email",
      sortable: true,
      cell: (customer: any) => (
        <div className="flex flex-col text-[9px] font-bold text-admin-muted">
          <span className="flex items-center gap-1.5 leading-none">
            <Mail size={10} className="text-primary/40" /> {customer.email}
          </span>
          {customer.phone && (
            <span className="flex items-center gap-1.5 mt-0.5 leading-none">
              <Phone size={10} className="text-primary/40" /> {customer.phone}
            </span>
          )}
        </div>
      )
    },
    {
      header: "License",
      accessorKey: "license_number",
      sortable: true,
      cell: (customer: any) => (
        customer.license_number ? (
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-black font-mono rounded border border-slate-200 uppercase">
            {customer.license_number}
          </span>
        ) : (
          <span className="text-[10px] text-slate-300 italic">N/A</span>
        )
      )
    },
    {
      header: "Joined",
      accessorKey: "created_at",
      sortable: true,
      cell: (customer: any) => (
        <span className="text-[10px] font-bold text-admin-muted">
          {new Date(customer.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "",
      className: "text-right",
      cell: (customer: any) => (
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={() => onView(customer)}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="View Details">
            <Eye size={14} />
          </button>
          <button 
            onClick={() => onEdit(customer)}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="Edit">
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => onDelete(customer.id)}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable 
      data={customers}
      columns={columns}
      loading={loading}
      searchPlaceholder="Search Name, Email, License..."
      emptyMessage="No customers found."
    />
  );
}
  );
}
