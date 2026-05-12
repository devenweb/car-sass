import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen bg-admin-bg">
        <header className="h-14 bg-white border-b border-admin-border flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-md font-bold text-admin-text tracking-tight">Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
              JD
            </div>
            <span className="text-xs font-bold text-admin-text">John Doe</span>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
