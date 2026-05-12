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
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2
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
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-admin-text uppercase tracking-tight">Rentals & Bookings</h1>
          <p className="text-[11px] text-admin-muted font-bold tracking-tight uppercase">Live oversight of all car rental transactions and reservations.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="p-3 border-b border-admin-border flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search reservations..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary h-8 px-4 text-xs">
            <Filter size={14} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Logistics</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Revenue</th>
                <th className="px-5 py-3"></th>
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
                  <tr key={rental.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-5 py-2.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">#{rental.id.slice(0, 6)}</p>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary/60">
                          <User size={12} />
                        </div>
                        <div>
                          <p className="font-bold text-admin-text text-xs leading-none">{rental.customers?.name}</p>
                          <p className="text-[9px] text-admin-muted font-bold tracking-tight">{rental.customers?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <p className="text-xs font-bold text-admin-text leading-none">
                        {rental.vehicle_units?.vehicle_templates 
                          ? `${rental.vehicle_units.vehicle_templates.brand} ${rental.vehicle_units.vehicle_templates.model}`
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex flex-col text-[10px] font-bold text-admin-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={10} className="text-primary/40" /> {rental.pickup_datetime ? new Date(rental.pickup_datetime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                        statusColors[rental.status.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <p className="font-black text-admin-text text-xs leading-none">Rs {(rental.total_amount || rental.total_price || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedRentalId(rental.id)}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all" 
                          title="View Inspection"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => setEditingRental(rental)}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg border border-slate-100 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm("Delete rental record?")) {
                              const { error } = await supabase.from("rentals").delete().eq("id", rental.id);
                              if (error) {
                                console.error("Rental delete error:", error);
                                alert("Error deleting rental: " + error.message);
                              } else {
                                fetchRentals();
                              }
                            }
                          }}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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

      {/* Edit Rental Modal */}
      {editingRental && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Reservation</h2>
              <button onClick={() => setEditingRental(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><XCircle size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Status</label>
                  <select 
                    value={editingRental.status}
                    onChange={(e) => setEditingRental({...editingRental, status: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {Object.keys(statusColors).map(status => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Total Amount (Rs)</label>
                  <input 
                    type="number"
                    value={editingRental.total_amount || editingRental.total_price || 0}
                    onChange={(e) => setEditingRental({...editingRental, total_amount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Pickup Date & Time</label>
                <input 
                  type="datetime-local"
                  value={editingRental.pickup_datetime ? new Date(editingRental.pickup_datetime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingRental({...editingRental, pickup_datetime: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Return Date & Time</label>
                <input 
                  type="datetime-local"
                  value={editingRental.return_datetime ? new Date(editingRental.return_datetime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingRental({...editingRental, return_datetime: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setEditingRental(null)}
                  className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveRental}
                  disabled={saving}
                  className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRentalId && (
        <InspectionModal 
          rentalId={selectedRentalId} 
          onClose={() => setSelectedRentalId(null)} 
        />
      )}
    </div>
  );
}
