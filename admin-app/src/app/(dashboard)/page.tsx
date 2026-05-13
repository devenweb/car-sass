"use client";

import { 
  Car, 
  CalendarCheck, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  BarChart3
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: [],
    recentRentals: [],
    totalCars: 0,
    availableCount: 0,
    inUseCount: 0,
    maintenanceCount: 0
  });

  const [addons, setAddons] = useState<any>({});

  useEffect(() => {
    fetchDashboardData();
    fetchAddons();
  }, []);

  async function fetchAddons() {
    const { data } = await supabase.from("tenants").select("addons").single();
    if (data?.addons) setAddons(data.addons);
  }

  async function fetchDashboardData() {
    setLoading(true);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    try {
      const { data: statsData, error } = await supabase.rpc('get_dashboard_stats', { 
        first_day_of_month: firstDayOfMonth 
      });

      if (error) throw error;

      const stats = [
        { 
          label: "Total Cars", 
          value: statsData.carCount.toString(), 
          icon: Car, 
          change: "+0", 
          trend: "up",
          href: "/fleet"
        },
        { 
          label: "Active Rentals", 
          value: statsData.rentalCount.toString(), 
          icon: CalendarCheck, 
          change: "+0", 
          trend: "up",
          href: "/rentals"
        },
        { 
          label: "Total Customers", 
          value: statsData.customerCount.toString(), 
          icon: Users, 
          change: "+0", 
          trend: "up",
          href: "/customers"
        },
        { 
          label: "Revenue (MTD)", 
          value: `Rs ${statsData.mtdRevenue.toLocaleString()}`, 
          icon: TrendingUp, 
          change: "+0%", 
          trend: "up",
          href: "/rentals"
        },
      ];

      setData({
        stats,
        recentRentals: statsData.recentRentals.map((r: any) => ({
          ...r,
          vehicle_templates: { brand: r.brand, model: r.model },
          customers: { name: r.customer_name }
        })),
        totalCars: statsData.carCount,
        availableCount: statsData.availableCount,
        inUseCount: statsData.inUseCount,
        maintenanceCount: statsData.maintenanceCount
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRental(id: string) {
    if (!confirm("Delete rental record?")) return;
    const { error } = await supabase.from("rentals").delete().eq("id", id);
    if (error) alert("Error deleting rental");
    else fetchDashboardData();
  }

  if (loading) return <div className="p-8 text-admin-muted font-bold uppercase tracking-widest animate-pulse">Initializing Command Center...</div>;

  const { stats, recentRentals, totalCars, availableCount, inUseCount, maintenanceCount } = data;
  const availablePercent = totalCars > 0 ? (availableCount / totalCars) * 100 : 0;
  const inUsePercent = totalCars > 0 ? (inUseCount / totalCars) * 100 : 0;
  const maintenancePercent = totalCars > 0 ? (maintenanceCount / totalCars) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-admin-text uppercase tracking-tight">System Overview</h1>
          <p className="text-xs text-admin-muted font-medium">Real-time status of Royal Car Rental ecosystems.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat: any) => {
          const isRevenue = stat.label === "Revenue (MTD)";
          const isLocked = isRevenue && addons.advanced_analytics !== true;
          
          return (
            <div key={stat.label} className="relative group">
              <Link 
                href={isLocked ? "#" : stat.href} 
                className={cn(
                  "block bg-white p-4 rounded-xl border border-admin-border shadow-sm hover:border-primary/50 transition-all group",
                  isLocked && "opacity-50 blur-[2px] pointer-events-none"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <stat.icon size={20} />
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {stat.change}
                    {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-admin-muted text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
                  <p className="text-xl font-black text-admin-text mt-0.5">{stat.value}</p>
                </div>
              </Link>
              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <Sparkles size={16} className="text-primary animate-pulse mb-1" />
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest">Unlock Analytics</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-admin-border shadow-sm">
          <h3 className="text-sm font-black text-admin-text uppercase tracking-tight mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {recentRentals && recentRentals.length > 0 ? (
              recentRentals.map((rental: any) => (
                <div key={rental.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                  <Link href="/rentals" className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                      <Car size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-admin-text text-sm">{(rental.vehicle_templates as any)?.brand} {(rental.vehicle_templates as any)?.model}</p>
                      <p className="text-[10px] text-admin-muted font-bold uppercase tracking-tight">{(rental.customers as any)?.name || 'Guest'}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-admin-text text-sm">Rs {(rental.total_amount || rental.total_price || 0).toLocaleString()}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        rental.status === 'collected' ? 'bg-emerald-100 text-emerald-700' : 
                        rental.status === 'delivered' ? 'bg-teal-100 text-teal-700' : 
                        rental.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                        rental.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Link href="/rentals" className="p-1 text-slate-400 hover:text-primary transition-colors" title="View"><Eye size={14} /></Link>
                      <Link href="/rentals" className="p-1 text-slate-400 hover:text-primary transition-colors" title="Edit"><Edit2 size={14} /></Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteRental(rental.id); }}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors" title="Delete"
                      ><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-admin-muted">
                No recent bookings found.
              </div>
            )}
          </div>
          <Link href="/rentals" className="block w-full mt-6 text-center text-primary text-sm font-semibold hover:underline">
            View All Bookings
          </Link>
        </div>

        <div className="relative group overflow-hidden bg-white p-5 rounded-xl border border-admin-border shadow-sm">
          {addons.advanced_analytics !== true && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center text-center p-6 transition-all group-hover:backdrop-blur-[2px]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                <BarChart3 size={20} />
              </div>
              <h4 className="text-xs font-black text-admin-text uppercase mb-1">Fleet Performance Locked</h4>
              <p className="text-[9px] text-admin-muted font-medium mb-4 max-w-[200px]">Activate the Fleet Analytics Pro addon to visualize your utilization and status trends.</p>
              <Link href="/addons" className="btn-primary h-7 px-4 text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={10} />
                View Addons
              </Link>
            </div>
          )}
          <Link href="/fleet" className="group flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-admin-text uppercase tracking-tight">Fleet Status</h3>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Manage Fleet →</span>
          </Link>
          <div className="space-y-6">
            <Link href="/fleet" className="block group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-admin-muted group-hover:text-primary transition-colors">Available</span>
                <span className="text-sm font-bold text-emerald-600">{availableCount}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                  style={{ width: `${availablePercent}%` }}
                ></div>
              </div>
            </Link>
            
            <Link href="/fleet" className="block group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-admin-muted group-hover:text-primary transition-colors">In Use</span>
                <span className="text-sm font-bold text-primary">{inUseCount}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                <div 
                  className="bg-primary h-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" 
                  style={{ width: `${inUsePercent}%` }}
                ></div>
              </div>
            </Link>

            <Link href="/fleet" className="block group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-admin-muted group-hover:text-primary transition-colors">Maintenance</span>
                <span className="text-sm font-bold text-amber-500">{maintenanceCount}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
                  style={{ width: `${maintenancePercent}%` }}
                ></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
