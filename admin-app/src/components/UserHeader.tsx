"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "lucide-react";

export default function UserHeader() {
  const [userData, setUserData] = useState<{ name: string; initials: string } | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Try to get name from public.users first
      const { data: profile } = await supabase.from("users").select("name").eq("id", user.id).single();
      
      const fullName = profile?.name || user.email?.split('@')[0] || "Staff";
      const initials = fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      setUserData({ name: fullName, initials });
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-7 h-7 rounded-full bg-slate-100" />
        <div className="w-20 h-3 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
        {userData.initials}
      </div>
      <span className="text-xs font-bold text-admin-text">{userData.name}</span>
    </div>
  );
}
