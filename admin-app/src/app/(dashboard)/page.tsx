import { 
  Car, 
  CalendarCheck, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

async function getDashboardData() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Parallel fetching for performance
  const [
    { count: carCount },
    { count: rentalCount },
    { count: customerCount },
    { data: recentRentals },
    { data: allCars },
    { data: revenueData }
  ] = await Promise.all([
    supabase.from("cars").select("*", { count: "exact" }).limit(1),
    supabase.from("rentals").select("*", { count: "exact" }).limit(1),
    supabase.from("customers").select("*", { count: "exact" }).limit(1),
    supabase.from("rentals").select(`
      id,
      total_amount,
      total_price,
      status,
      created_at,
      vehicle_templates (brand, model),
      customers (name)
    `).order("created_at", { ascending: false }).limit(5),
    supabase.from("vehicle_units").select("availability_status"),
    supabase.from("rentals").select("total_amount, total_price").gte("created_at", firstDayOfMonth)
  ]);

  if (revenueData?.[0]) {
    console.log('Revenue Data Sample:', revenueData[0]);
  }

  const mtdRevenue = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || curr.total_price || 0), 0) || 0;

  console.log('Dashboard Data Debug:', {
    carCount,
    rentalCount,
    customerCount,
    recentRentalsCount: recentRentals?.length,
    revenueDataCount: revenueData?.length
  });

  // Calculate fleet status
  const availableCount = allCars?.filter(c => c.availability_status === 'available').length || 0;
  const inUseCount = allCars?.filter(c => (c as any).availability_status === 'rented').length || 0;
  const maintenanceCount = allCars?.filter(c => (c as any).availability_status === 'maintenance').length || 0;

  const stats = [
    { 
      label: "Total Cars", 
      value: carCount?.toString() || "0", 
      icon: Car, 
      change: "+0", 
      trend: "up",
      href: "/fleet"
    },
    { 
      label: "Active Rentals", 
      value: rentalCount?.toString() || "0", 
      icon: CalendarCheck, 
      change: "+0", 
      trend: "up",
      href: "/rentals"
    },
    { 
      label: "Total Customers", 
      value: customerCount?.toString() || "0", 
      icon: Users, 
      change: "+0", 
      trend: "up",
      href: "/customers"
    },
    { 
      label: "Revenue (MTD)", 
      value: `Rs ${mtdRevenue.toLocaleString()}`, 
      icon: TrendingUp, 
      change: "+0%", 
      trend: "up",
      href: "/rentals"
    },
  ];

  return { stats, recentRentals, totalCars: carCount || 0, availableCount, inUseCount, maintenanceCount };
}

export default async function Dashboard() {
  const { stats, recentRentals, totalCars, availableCount, inUseCount, maintenanceCount } = await getDashboardData();

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
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white p-4 rounded-xl border border-admin-border shadow-sm hover:border-primary/50 transition-all group">
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-admin-border shadow-sm">
          <h3 className="text-sm font-black text-admin-text uppercase tracking-tight mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {recentRentals && recentRentals.length > 0 ? (
              recentRentals.map((rental: any) => (
                <Link key={rental.id} href="/rentals" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                      <Car size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-admin-text text-sm">{(rental.vehicle_templates as any)?.brand} {(rental.vehicle_templates as any)?.model}</p>
                      <p className="text-[10px] text-admin-muted font-bold uppercase tracking-tight">{(rental.customers as any)?.name || 'Guest'}</p>
                    </div>
                  </div>
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
                </Link>
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

        <div className="bg-white p-5 rounded-xl border border-admin-border shadow-sm">
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
