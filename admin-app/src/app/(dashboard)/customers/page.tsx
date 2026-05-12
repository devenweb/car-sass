"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  FileText,
  Calendar,
  Trash2,
  Eye,
  Edit2,
  History
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  }

  async function deleteCustomer(id: string) {
    if (!confirm("Permanently remove customer record?")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) alert("Error deleting customer");
    else fetchCustomers();
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.license_number && c.license_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
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
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] border border-primary/20">
                          {customer.name.charAt(0)}
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
                          onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="View History">
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); alert("Edit Customer logic to be implemented."); }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteCustomer(customer.id); }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-muted">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
