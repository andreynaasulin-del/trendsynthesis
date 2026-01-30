"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const badItems = [
  "2-4 hours per video",
  "$500/mo editor salary",
  "Same angles, same content",
  "Algorithm flags duplicates",
  "Zero scalability",
];

const goodItems = [
  "30 videos in 5 minutes",
  "$49/month flat",
  "10 angles × 3 styles = 30 unique",
  "0% duplication detection",
  "Infinite scalability",
];

export function ProblemSection() {
  return (
    <section id="features" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl"
        >
          The Old Way vs.{" "}
          <span className="font-mono tracking-wider">TRENDSYNTHESIS</span>
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bad card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full border-destructive/20 bg-destructive/[0.03]">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">
                  Traditional Approach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {badItems.map((text) => (
                  <div key={text} className="flex items-start gap-3">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Good card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full border-emerald-500/20 bg-emerald-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-400">
                  TRENDSYNTHESIS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goodItems.map((text) => (
                  <div key={text} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
