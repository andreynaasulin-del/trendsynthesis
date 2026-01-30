"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Simple Pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Scale when ready.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {siteConfig.pricing.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Card
                className={`relative h-full ${
                  "highlighted" in plan && plan.highlighted
                    ? "glow-accent border-foreground/20"
                    : "border-border"
                }`}
              >
                {"highlighted" in plan && plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground px-3 text-background">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={"highlighted" in plan && plan.highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link href="/signup">
                      {plan.price === 0 ? "Start Free" : "Get Started"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
