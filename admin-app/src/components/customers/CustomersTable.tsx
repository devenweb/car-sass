"use client";

import React from "react";
import { Mail, Phone, Eye, Edit2, Trash2 } from "lucide-react";

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
  return (
    <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">License</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse h-16"><td colSpan={5} className="px-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td></tr>
              ))
            ) : customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                  <td className="px-6 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] border border-primary/20">
                        {customer.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-admin-text text-xs leading-none">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2.5">
                    <div className="flex flex-col text-[9px] font-bold text-admin-muted">
                      <span className="flex items-center gap-1.5 leading-none"><Mail size={10} className="text-primary/40" /> {customer.email}</span>
                      {customer.phone && <span className="flex items-center gap-1.5 mt-0.5 leading-none"><Phone size={10} className="text-primary/40" /> {customer.phone}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-2.5">
                    {customer.license_number ? (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-black font-mono rounded border border-slate-200 uppercase">
                        {customer.license_number}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-2.5 text-[10px] font-bold text-admin-muted">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-2.5 text-right">
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
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-admin-muted">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
