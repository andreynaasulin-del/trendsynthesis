"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, FolderOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function MobileNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { label: t("generate"), href: "/generate", icon: Sparkles },
        { label: t("projects"), href: "/projects", icon: FolderOpen },
        { label: t("settings"), href: "/settings", icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/80 px-2 backdrop-blur-lg md:hidden">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
