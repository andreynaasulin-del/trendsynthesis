import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // MVP MODE: No auth check - allow everyone
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px]" />
        </div>

        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex relative z-20" />

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Main Content Area */}
        <main className="relative z-10 min-h-screen px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24 md:ml-64 md:px-6 lg:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
