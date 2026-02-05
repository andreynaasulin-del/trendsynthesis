"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, FolderOpen, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function MobileNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { label: t("generate"), href: "/generate", icon: Sparkles, highlight: true },
        { label: t("projects"), href: "/projects", icon: FolderOpen },
        { label: t("billing"), href: "/billing", icon: CreditCard },
        { label: t("settings"), href: "/settings", icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[65px] sm:h-[72px] items-center justify-around border-t border-white/5 bg-[#050505]/95 backdrop-blur-xl px-2 sm:px-4 md:hidden safe-area-inset-bottom">
            {/* Top Glow Line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

            {/* Nav Items */}
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const ItemIcon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-all duration-300 min-w-[64px]",
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <div className={cn(
                            "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                            isActive && !item.highlight && "bg-white/10",
                            item.highlight && isActive && "bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.6)] scale-110 -translate-y-2",
                            item.highlight && !isActive && "bg-transparent border border-white/10"
                        )}>
                            <ItemIcon className={cn(
                                "h-4 w-4 transition-colors",
                                item.highlight && isActive ? "text-white" : "",
                                isActive && !item.highlight ? "text-white" : "text-zinc-500",
                                item.highlight && !isActive ? "text-zinc-400" : ""
                            )} />
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium transition-colors tracking-wide",
                            isActive ? "text-white" : "text-zinc-600",
                            item.highlight && isActive ? "text-violet-300 font-bold" : ""
                        )}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
