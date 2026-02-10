"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, FolderOpen, Settings, LogOut, Zap, Crown, CreditCard, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { language, t } = useLanguage();

  const navItems = [
    { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("generate"), href: "/generate", icon: Sparkles, highlight: true },
    { label: t("raw_source"), href: "/raw-layouts", icon: Film },
    { label: t("projects"), href: "/projects", icon: FolderOpen },
    { label: t("billing"), href: "/billing", icon: CreditCard },
    { label: t("settings"), href: "/settings", icon: Settings },
  ];

  async function handleLogout() {
    // Clear admin bypass cookie
    document.cookie = "admin-bypass=; path=/; max-age=0";
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/5 bg-slate-900/50 backdrop-blur-xl",
      className
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300">
            <Zap className="h-4 w-4 text-violet-400" />
          </div>
          <span className="font-mono text-sm font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
            TREND<span className="text-zinc-500 group-hover:text-zinc-400">SYNTHESIS</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-r-lg rounded-l-sm px-3 py-2.5 text-sm transition-all duration-200 border-l-2",
                isActive
                  ? "bg-violet-600/10 text-violet-300 border-violet-500 shadow-[inset_10px_0_20px_-10px_rgba(139,92,246,0.2)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border-transparent",
                item.highlight && !isActive && "hover:border-violet-500/50"
              )}
            >
              <ItemIcon className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-violet-400 drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]" : "text-zinc-600 group-hover:text-zinc-300"
              )} />
              <span className={cn(isActive && "font-medium tracking-wide")}>{item.label}</span>
              {item.highlight && !isActive && (
                <span className="ml-auto text-[9px] font-bold tracking-wider text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Card */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded bg-amber-500/20">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-100/80 tracking-wide">
            {language === "ru" ? "Free план" : "Free Plan"}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 mb-3 ml-1">
          {language === "ru"
            ? "1 генерация осталось"
            : "1 generation remaining"}
        </p>
        <Link
          href="/#pricing"
          className="block w-full text-center text-[10px] uppercase tracking-wider font-bold py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
        >
          {language === "ru" ? "Улучшить план" : "UPGRADE"}
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-zinc-500 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {t("signOut")}
        </Button>
      </div>
    </aside>
  );
}
