import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    gradient?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    gradient = "from-violet-600/20 to-fuchsia-600/20",
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
        >
            {/* Animated Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`relative mb-6`}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-2xl opacity-50 rounded-full`} />
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} border border-white/10`}>
                    <Icon className="h-12 w-12 text-white" />
                </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2 max-w-md"
            >
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
            >
                <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25"
                >
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl" />
            </div>
        </motion.div>
    );
}
