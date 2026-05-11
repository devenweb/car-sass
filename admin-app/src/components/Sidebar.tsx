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
  LogOut 
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
];

export default function Sidebar() {
  const pathname = usePathname();

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="w-64 bg-secondary text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          Royal <span className="text-white">Admin</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Car Rental Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all text-left"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
