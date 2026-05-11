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
  Trash,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Customer Registry</h1>
        <p className="text-admin-muted">Manage customer profiles and rental history.</p>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-admin-border bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or license..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Driving License</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse h-16"><td colSpan={5} className="px-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td></tr>
                ))
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-bold text-admin-text">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs space-y-1 text-admin-muted">
                        <span className="flex items-center gap-1.5"><Mail size={12} /> {customer.email}</span>
                        {customer.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {customer.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.license_number ? (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-mono rounded border border-slate-200">
                          {customer.license_number}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 italic">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-admin-muted">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="View History">
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                          <Trash size={18} />
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
