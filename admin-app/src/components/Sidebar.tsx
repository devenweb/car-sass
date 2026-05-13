"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Car, 
  CalendarRange, 
  Users, 
  MessageSquare, 
  Mail, 
  Settings, 
  LogOut,
  Sparkles,
  Gauge,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Car, label: "Fleet", href: "/fleet" },
  { icon: CalendarRange, label: "Rentals", href: "/rentals" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: MessageSquare, label: "Inquiries", href: "/inquiries" },
  { icon: Mail, label: "Newsletter", href: "/newsletter" },
  { icon: CalendarRange, label: "Pricing", href: "/pricing" },
  { icon: Package, label: "Extras", href: "/extras" },
  { icon: Sparkles, label: "Addons", href: "/addons" },
  { icon: Gauge, label: "KM Monitoring", href: "/km-monitoring" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="w-56 bg-secondary text-white h-screen flex flex-col fixed left-0 top-0 border-r border-white/5">
      <div className="p-4 border-b border-white/10">
        <h1 className="text-lg font-black text-primary flex items-center gap-2 tracking-tighter">
          ROYAL <span className="text-white">ADMIN</span>
        </h1>
        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Car Rental Management</p>
      </div>

      <nav className="flex-1 p-2 space-y-1 mt-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={16} />
              <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-white/10 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <Settings size={16} />
          <span className="text-xs font-bold uppercase tracking-tight">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all text-left"
        >
          <LogOut size={16} />
          <span className="text-xs font-bold uppercase tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
}
