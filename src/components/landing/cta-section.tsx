"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="glow mx-auto max-w-3xl rounded-3xl border border-border bg-secondary/50 p-12 text-center md:p-16"
      >
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Ready to Build Your
          <br />
          Content Factory?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Your first generation is free. 30 videos. 5 minutes. Zero risk.
        </p>
        <Button asChild size="lg" className="mt-8 gap-2 px-10 text-base">
          <Link href="/signup">
            Start Free Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
