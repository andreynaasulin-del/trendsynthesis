import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Main Content Area */}
        <main className="min-h-screen p-4 pb-24 md:ml-64 md:p-8 md:pb-8">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
