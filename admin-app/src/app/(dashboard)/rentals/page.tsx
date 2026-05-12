"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import InspectionModal from "@/components/InspectionModal";

interface Rental {
  id: string;
  pickup_datetime: string;
  return_datetime: string;
  total_amount: number;
  total_price: number; // Keep for legacy compatibility
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);

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

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("rentals")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } else {
      fetchRentals();
    }
  }

  const filteredRentals = rentals.filter(rental => {
    const customerName = rental.customers?.name?.toLowerCase() || "";
    const vehicleBrand = rental.vehicle_units?.vehicle_templates?.brand?.toLowerCase() || "";
    const vehicleModel = rental.vehicle_units?.vehicle_templates?.model?.toLowerCase() || "";
    const searchTermLower = searchTerm.toLowerCase();
    
    return customerName.includes(searchTermLower) || 
           vehicleBrand.includes(searchTermLower) || 
           vehicleModel.includes(searchTermLower);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Rentals & Bookings</h1>
        <p className="text-admin-muted">Monitor and manage all car rental transactions.</p>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-admin-border flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by customer or car..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary w-full md:w-auto">
            <Filter size={18} />
            Filter Status
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Booking Info</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Car</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8">
                      <div className="h-8 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredRentals.length > 0 ? (
                filteredRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-slate-400 uppercase">#{rental.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-admin-text text-sm">{rental.customers?.name}</p>
                          <p className="text-[10px] text-admin-muted">{rental.customers?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-admin-text">
                        {rental.vehicle_units?.vehicle_templates 
                          ? `${rental.vehicle_units.vehicle_templates.brand} ${rental.vehicle_units.vehicle_templates.model}`
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-[11px] text-admin-muted">
                        <span className="flex items-center gap-1 font-bold">
                          <Clock size={10} /> {rental.pickup_datetime ? new Date(rental.pickup_datetime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-500" /> {rental.return_datetime ? new Date(rental.return_datetime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                        statusColors[rental.status.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-admin-text text-sm">Rs {(rental.total_amount || rental.total_price || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {rental.status === "pending" && (
                          <button 
                            onClick={() => updateStatus(rental.id, "confirmed")}
                            className="p-1.5 hover:bg-emerald-50 rounded-md text-emerald-600 border border-transparent hover:border-emerald-200"
                            title="Confirm Booking"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        {(rental.status === "delivered" || rental.status === "collected") && (
                          <button 
                            onClick={() => setSelectedRentalId(rental.id)}
                            className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600 border border-transparent hover:border-blue-200"
                            title="View Inspection"
                          >
                            <Search size={16} />
                          </button>
                        )}
                        <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-admin-muted">
                    No rentals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRentalId && (
        <InspectionModal 
          rentalId={selectedRentalId} 
          onClose={() => setSelectedRentalId(null)} 
        />
      )}
    </div>
  );
}
