import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Main Content Area - Mobile optimized */}
        <main className="min-h-screen px-4 py-6 pb-24 md:ml-64 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
