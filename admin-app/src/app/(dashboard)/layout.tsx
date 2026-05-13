import Sidebar from "@/components/Sidebar";
import UserHeader from "@/components/UserHeader";

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
            <UserHeader />
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
