"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Calendar, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    // Fetch real data for stats
    const [
      { data: rentals },
      { data: cars },
      { data: customers }
    ] = await Promise.all([
      supabase.from("rentals").select("total_amount, total_price, created_at, status"),
      supabase.from("vehicle_units").select("availability_status"),
      supabase.from("customers").select("id", { count: "exact" })
    ]);

    const totalRevenue = rentals?.reduce((acc: number, curr: any) => acc + (curr.total_amount || curr.total_price || 0), 0) || 0;
    const avgBookingValue = rentals && rentals.length > 0 ? totalRevenue / rentals.length : 0;
    
    // Simulated Time-Series Data (Weekly)
    const weeklyRevenue = [
      { day: "Mon", value: 12500 },
      { day: "Tue", value: 18000 },
      { day: "Wed", value: 15500 },
      { day: "Thu", value: 22000 },
      { day: "Fri", value: 31000 },
      { day: "Sat", value: 28500 },
      { day: "Sun", value: 14000 },
    ];

    setData({
      totalRevenue,
      avgBookingValue,
      totalRentals: rentals?.length || 0,
      totalCustomers: customers?.length || 0,
      weeklyRevenue,
      utilization: {
        available: cars?.filter((c: any) => c.availability_status === 'available').length || 0,
        rented: cars?.filter((c: any) => c.availability_status === 'rented' || c.availability_status === 'booked').length || 0,
        maintenance: cars?.filter((c: any) => c.availability_status === 'maintenance').length || 0,
      }
    });
    setLoading(false);
  }

  if (loading) return <div className="p-8 text-admin-muted font-bold uppercase tracking-widest animate-pulse">Assembling Intel...</div>;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <BarChart3 size={16} />
          </div>
          <div>
            <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Fleet Analytics Pro</h1>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Advanced Performance Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 hover:bg-slate-100 transition-all">
            <Filter size={14} />
            Last 30 Days
          </button>
          <button className="h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 hover:bg-slate-100 transition-all">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `Rs ${data.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "emerald" },
          { label: "Avg. Booking", value: `Rs ${Math.round(data.avgBookingValue).toLocaleString()}`, icon: Calendar, color: "blue" },
          { label: "Total Rentals", value: data.totalRentals, icon: Car, color: "indigo" },
          { label: "Active Customers", value: data.totalCustomers, icon: Users, color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-admin-border shadow-sm">
            <div className="flex justify-between items-start">
              <div className={cn("p-1.5 rounded-lg", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                <stat.icon size={16} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">+12.5% <ArrowUpRight size={12} /></span>
            </div>
            <div className="mt-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
              <p className="text-xl font-black text-admin-text mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-admin-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-admin-text uppercase tracking-tight">Revenue Trends</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Last Week</span>
              </div>
            </div>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-4 px-2">
            {data.weeklyRevenue.map((day: any) => {
              const height = (day.value / 35000) * 100;
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="absolute -top-6 bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Rs {day.value.toLocaleString()}
                    </div>
                    <div 
                      className="w-full max-w-[40px] bg-primary/10 rounded-t-lg group-hover:bg-primary/20 transition-all absolute bottom-0"
                      style={{ height: `${height + 10}%`, opacity: 0.3 }}
                    />
                    <div 
                      className="w-full max-w-[40px] bg-primary rounded-t-lg group-hover:scale-y-105 transition-all origin-bottom shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-admin-border shadow-sm">
          <h3 className="text-sm font-black text-admin-text uppercase tracking-tight mb-6">Fleet Utilization</h3>
          <div className="flex flex-col items-center justify-center pt-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-slate-100 fill-none" strokeWidth="12" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  className="stroke-primary fill-none transition-all duration-1000" 
                  strokeWidth="12" 
                  strokeDasharray="351.85" 
                  strokeDashoffset={351.85 - (351.85 * (data.utilization.rented / (data.utilization.available + data.utilization.rented || 1)))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-admin-text">
                  {Math.round((data.utilization.rented / (data.utilization.available + data.utilization.rented || 1)) * 100)}%
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">In Use</span>
              </div>
            </div>

            <div className="mt-8 w-full space-y-4">
              {[
                { label: "Available", value: data.utilization.available, color: "bg-emerald-500" },
                { label: "Booked / Rented", value: data.utilization.rented, color: "bg-primary" },
                { label: "Under Maintenance", value: data.utilization.maintenance, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", item.color)} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-admin-text">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
