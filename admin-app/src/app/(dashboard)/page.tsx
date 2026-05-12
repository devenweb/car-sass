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
      trend: "up" 
    },
    { 
      label: "Active Rentals", 
      value: rentalCount?.toString() || "0", 
      icon: CalendarCheck, 
      change: "+0", 
      trend: "up" 
    },
    { 
      label: "Total Customers", 
      value: customerCount?.toString() || "0", 
      icon: Users, 
      change: "+0", 
      trend: "up" 
    },
    { 
      label: "Revenue (MTD)", 
      value: `Rs ${mtdRevenue.toLocaleString()}`, 
      icon: TrendingUp, 
      change: "+0%", 
      trend: "up" 
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Dashboard Overview</h1>
        <p className="text-admin-muted">Welcome back, here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-stat">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-admin-muted text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-admin-text mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm">
          <h3 className="text-lg font-bold text-admin-text mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {recentRentals && recentRentals.length > 0 ? (
              recentRentals.map((rental: any) => (
                <Link key={rental.id} href={`/rentals/${rental.id}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <Car size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-admin-text">{(rental.vehicle_templates as any)?.brand} {(rental.vehicle_templates as any)?.model}</p>
                      <p className="text-xs text-admin-muted">Customer: {(rental.customers as any)?.name || 'Unknown Customer'}</p>
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

        <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm">
          <Link href="/fleet" className="group flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-admin-text">Fleet Status</h3>
            <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Manage Fleet →</span>
          </Link>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-admin-muted">Available</span>
              <span className="text-sm font-bold text-emerald-600">{availableCount}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${availablePercent}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-admin-muted">In Use</span>
              <span className="text-sm font-bold text-primary">{inUseCount}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${inUsePercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-admin-muted">Maintenance</span>
              <span className="text-sm font-bold text-amber-500">{maintenanceCount}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full transition-all duration-500" 
                style={{ width: `${maintenancePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
