"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, FolderOpen, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function MobileNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { label: t("generate"), href: "/generate", icon: Zap, highlight: true },
        { label: t("projects"), href: "/projects", icon: FolderOpen },
        { label: t("settings"), href: "/settings", icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[60px] sm:h-[72px] items-center justify-around border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-1 sm:px-2 md:hidden safe-area-inset-bottom">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const ItemIcon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-medium transition-all duration-200 min-w-[50px] sm:min-w-[60px]",
                            isActive
                                ? "text-violet-400"
                                : "text-zinc-500 active:scale-95"
                        )}
                    >
                        <div className={cn(
                            "relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg transition-all",
                            isActive && "bg-violet-600/20",
                            item.highlight && isActive && "bg-violet-600/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        )}>
                            <ItemIcon className={cn(
                                "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                                isActive ? "text-violet-400" : "text-zinc-500"
                            )} />
                            {item.highlight && (
                                <span className={cn(
                                    "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                                    isActive ? "bg-violet-400" : "bg-violet-500/50"
                                )} />
                            )}
                        </div>
                        <span className={cn(
                            "transition-colors truncate max-w-[45px] sm:max-w-none",
                            isActive ? "text-violet-400" : "text-zinc-500"
                        )}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
