"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// New Components
import { CustomersHeader } from "@/components/customers/CustomersHeader";
import { CustomersStats } from "@/components/customers/CustomersStats";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { EditCustomerModal } from "@/components/customers/EditCustomerModal";
import { CustomerDetailsModal } from "@/components/customers/CustomerDetailsModal";

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
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function handleSaveCustomer() {
    if (!editingCustomer) return;
    setSaving(true);
    const { error } = await supabase
      .from("customers")
      .update({
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        license_number: editingCustomer.license_number
      })
      .eq("id", editingCustomer.id);

    if (error) {
      alert("Error saving customer: " + error.message);
    } else {
      setEditingCustomer(null);
      fetchCustomers();
    }
    setSaving(false);
  }

  async function handleDeleteCustomer(id: string) {
    if (!confirm("Permanently remove customer record? This cannot be undone.")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      if (error.code === '23503') {
        alert("CANNOT DELETE: This customer has active or past rental records. Please keep their record for auditing or contact support to archive.");
      } else {
        alert("Error deleting customer: " + error.message);
      }
    } else fetchCustomers();
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.license_number && c.license_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <CustomersHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      <CustomersStats customers={customers} />

      <CustomersTable 
        customers={filteredCustomers}
        loading={loading}
        onView={setSelectedCustomer}
        onEdit={setEditingCustomer}
        onDelete={handleDeleteCustomer}
      />

      <EditCustomerModal 
        customer={editingCustomer}
        setCustomer={setEditingCustomer}
        onClose={() => setEditingCustomer(null)}
        onSave={handleSaveCustomer}
        saving={saving}
      />

      <CustomerDetailsModal 
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
