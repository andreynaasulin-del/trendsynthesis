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
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Main Content Area - Mobile optimized */}
        <main className="min-h-screen px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24 md:ml-64 md:px-6 lg:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
