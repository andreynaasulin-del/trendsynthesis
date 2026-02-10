import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // MVP MODE: No auth check - allow everyone
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Animated Background Beams - Desktop Only for Performance */}
        <div className="hidden md:block fixed inset-0 z-0">
          <BackgroundBeams />
        </div>

        {/* Mobile Static Gradient Fallback */}
        <div className="md:hidden fixed inset-0 z-0 bg-gradient-to-b from-slate-900/50 to-black pointer-events-none" />

        {/* Ambient Glow Overlay - Optimized for Mobile */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-violet-600/5 md:bg-violet-600/8 rounded-full blur-[80px] md:blur-[150px] md:animate-float" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-cyan-600/3 md:bg-cyan-600/5 rounded-full blur-[80px] md:blur-[150px] md:animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute top-[40%] right-[20%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-amber-500/2 md:bg-amber-500/3 rounded-full blur-[60px] md:blur-[100px] md:animate-float" style={{ animationDelay: "-5s" }} />
        </div>

        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex relative z-20" />

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Main Content Area */}
        <main className="relative z-10 min-h-screen px-3 sm:px-4 py-4 sm:py-6 pb-[calc(80px+env(safe-area-inset-bottom))] sm:pb-[calc(88px+env(safe-area-inset-bottom))] md:ml-64 md:px-6 lg:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
