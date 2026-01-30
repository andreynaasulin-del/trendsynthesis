"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] as const } },
};

const stats = [
  { value: "2,400+", label: "Videos Created" },
  { value: "156", label: "Creators" },
  { value: "12M+", label: "Total Views" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32 lg:py-40">
      {/* Subtle radial gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.65_0.25_265_/_6%)_0%,_transparent_70%)]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-5xl flex-col items-center text-center"
      >
        <motion.div variants={item}>
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 font-mono text-xs tracking-wider">
            AI-Powered Video Factory
          </Badge>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl lg:text-8xl"
        >
          One Topic.
          <br />
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            30 Viral Videos.
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          Upload a topic. Get 30 unique, algorithm-ready videos in 5 minutes.
          No editors. No bans. Pure content machine.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2 px-8 text-base">
            <Link href="/generate">
              Generate Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 px-8 text-base">
            <a href="#demo">
              <Play className="h-4 w-4" />
              Watch Demo
            </a>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={item}
          className="mt-16 flex items-center gap-8 text-center"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8">
              {i > 0 && (
                <Separator orientation="vertical" className="h-8 bg-border" />
              )}
              <div>
                <p className="font-mono text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
