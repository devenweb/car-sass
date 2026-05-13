"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import InspectionModal from "@/components/InspectionModal";

// New Components
import { RentalsHeader } from "@/components/rentals/RentalsHeader";
import { RentalsStats } from "@/components/rentals/RentalsStats";
import { RentalsTable } from "@/components/rentals/RentalsTable";
import { EditRentalModal } from "@/components/rentals/EditRentalModal";

interface Rental {
  id: string;
  pickup_datetime: string;
  return_datetime: string;
  total_amount: number;
  total_price: number; 
  status: string;
  customers: { name: string; email: string };
  vehicle_units: { 
    plate_number: string;
    vehicle_templates: { brand: string; model: string } 
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  delivered: "bg-teal-100 text-teal-700 border-teal-200",
  collected: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [editingRental, setEditingRental] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, []);

  async function fetchRentals() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rentals")
      .select(`
        *,
        customers (name, email),
        vehicle_units (
          plate_number,
          vehicle_templates (brand, model)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching rentals:", error);
    } else {
      setRentals(data || []);
    }
    setLoading(false);
  }

  async function handleSaveRental() {
    if (!editingRental) return;
    setSaving(true);
    const updateData = {
      status: editingRental.status,
      total_amount: editingRental.total_amount,
      total_price: editingRental.total_price,
      pickup_datetime: editingRental.pickup_datetime,
      return_datetime: editingRental.return_datetime,
      pickup_location: editingRental.pickup_location,
      return_location: editingRental.return_location,
      notes: editingRental.notes
    };
    
    const { error } = await supabase
      .from("rentals")
      .update(updateData)
      .eq("id", editingRental.id);

    if (error) {
      alert("Error saving rental: " + error.message);
    } else {
      setEditingRental(null);
      fetchRentals();
    }
    setSaving(false);
  }

  const handleDeleteRental = async (id: string) => {
    if (!confirm("Delete rental record?")) return;
    const { error } = await supabase.from("rentals").delete().eq("id", id);
    if (error) {
      console.error("Rental delete error:", error);
      alert("Error deleting rental: " + error.message);
    } else {
      fetchRentals();
    }
  };

  return (
    <div className="space-y-4">
      <RentalsHeader />

      <RentalsStats rentals={rentals} />

      <RentalsTable 
        rentals={rentals}
        loading={loading}
        statusColors={statusColors}
        onViewInspection={setSelectedRentalId}
        onEdit={setEditingRental}
        onDelete={handleDeleteRental}
      />

      <EditRentalModal 
        rental={editingRental}
        setRental={setEditingRental}
        onClose={() => setEditingRental(null)}
        onSave={handleSaveRental}
        saving={saving}
        statusColors={statusColors}
      />

      {selectedRentalId && (
        <InspectionModal 
          rentalId={selectedRentalId} 
          onClose={() => setSelectedRentalId(null)} 
        />
      )}
    </div>
  );
}
