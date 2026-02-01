"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center justify-center min-h-[50vh] py-16 text-center"
        >
            {/* Icon */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="mb-5 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50"
            >
                <Icon className="h-6 w-6 text-zinc-500" />
            </motion.div>

            {/* Text */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="space-y-2 max-w-sm"
            >
                <h3 className="text-base font-medium text-white">{title}</h3>
                <p className="text-sm text-zinc-500">{description}</p>
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mt-6"
            >
                <Button
                    asChild
                    size="sm"
                    className="bg-white text-black hover:bg-zinc-200 transition-colors"
                >
                    <Link href={actionHref}>
                        {actionLabel}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                </Button>
            </motion.div>
        </motion.div>
    );
}
