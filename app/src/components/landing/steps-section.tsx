"use client";

import { motion } from "framer-motion";
import { Upload, Zap, Download } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload Topic",
    desc: "Enter your topic or niche. Our AI parses it into 10 unique content angles.",
  },
  {
    num: "02",
    icon: Zap,
    title: "AI Generates",
    desc: "Neural engine creates scenarios, finds stock footage, renders 30 unique videos.",
  },
  {
    num: "03",
    icon: Download,
    title: "Download & Post",
    desc: "Get 30 ready-to-post videos. Each one unique — different hooks, visuals, styles.",
  },
];

export function StepsSection() {
  return (
    <section id="how-it-works" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl"
        >
          How It Works
        </motion.h2>

        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-12 z-0 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              {/* Number badge */}
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-secondary">
                <step.icon className="h-8 w-8 text-foreground" />
              </div>

              <span className="mb-2 font-mono text-xs text-muted-foreground">
                STEP {step.num}
              </span>
              <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
