"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Target, Rocket, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { updateProfile } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface OnboardingWizardProps {
    open: boolean;
    onComplete: () => void;
}

const NICHES = [
    { id: "crypto", label: "Crypto & Web3", emoji: "₿" },
    { id: "health", label: "Health & Fitness", emoji: "💪" },
    { id: "finance", label: "Finance & Money", emoji: "💰" },
    { id: "tech", label: "Tech & AI", emoji: "🤖" },
    { id: "lifestyle", label: "Lifestyle", emoji: "✨" },
    { id: "education", label: "Education", emoji: "📚" },
];

const PLATFORMS = [
    { id: "tiktok", label: "TikTok" },
    { id: "instagram", label: "Instagram" },
    { id: "youtube", label: "YouTube Shorts" },
    { id: "telegram", label: "Telegram" },
];

export default function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [niche, setNiche] = useState("");
    const [audience, setAudience] = useState("");
    const [platform, setPlatform] = useState("tiktok");
    const [topic, setTopic] = useState("");
    const [saving, setSaving] = useState(false);

    const handleComplete = async () => {
        setSaving(true);
        try {
            await updateProfile({
                system_prompt: `You are a ${niche} content expert creating viral short-form videos.`,
                target_audience: audience || `${niche} enthusiasts`,
                traffic_source: platform as any,
            });

            localStorage.setItem("onboarding_completed", "true");
            onComplete();

            if (topic) {
                router.push(`/generate?topic=${encodeURIComponent(topic)}`);
            }
        } catch (error) {
            console.error("Onboarding save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, 3));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="max-w-lg border-zinc-800 bg-zinc-950 p-0 overflow-hidden">
                <div className="relative">
                    {/* Progress Bar — Subtle */}
                    <div className="h-0.5 bg-zinc-900">
                        <motion.div
                            className="h-full bg-white"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        />
                    </div>

                    {/* Step indicators */}
                    <div className="flex justify-center gap-2 pt-6">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-2 h-2 rounded-full transition-colors ${s <= step ? "bg-white" : "bg-zinc-800"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Choose Niche */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2">
                                        <h2 className="text-xl font-semibold text-white">Welcome to TrendSynthesis</h2>
                                        <p className="text-sm text-zinc-500">Let's set up your profile in 30 seconds</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 tracking-wide">Select your niche</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {NICHES.map((n) => (
                                                <button
                                                    key={n.id}
                                                    onClick={() => setNiche(n.id)}
                                                    className={`p-3 rounded-lg border text-left transition-all ${niche === n.id
                                                            ? "border-white bg-white/5"
                                                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
                                                        }`}
                                                >
                                                    <div className="text-lg mb-0.5">{n.emoji}</div>
                                                    <div className="text-sm font-medium text-zinc-300">{n.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={nextStep}
                                        disabled={!niche}
                                        className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                    </Button>
                                </motion.div>
                            )}

                            {/* Step 2: Target Audience & Platform */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2">
                                        <h2 className="text-xl font-semibold text-white">Your audience</h2>
                                        <p className="text-sm text-zinc-500">This helps AI create relevant content</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400 tracking-wide">Describe your audience</label>
                                            <Input
                                                placeholder="e.g. Entrepreneurs aged 25-35 interested in crypto"
                                                value={audience}
                                                onChange={(e) => setAudience(e.target.value)}
                                                className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400 tracking-wide">Primary platform</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {PLATFORMS.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setPlatform(p.id)}
                                                        className={`p-3 rounded-lg border text-center text-sm font-medium transition-all ${platform === p.id
                                                                ? "border-white bg-white/5 text-white"
                                                                : "border-zinc-800 hover:border-zinc-700 text-zinc-400"
                                                            }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={prevStep} variant="ghost" className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-900">
                                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                                        </Button>
                                        <Button onClick={nextStep} className="flex-1 bg-white text-black hover:bg-zinc-200">
                                            Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: First Video */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2">
                                        <h2 className="text-xl font-semibold text-white">Create your first video</h2>
                                        <p className="text-sm text-zinc-500">What topic should we start with?</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 tracking-wide">Topic (optional)</label>
                                        <Input
                                            placeholder={`e.g., Top 5 ways to earn in ${niche}`}
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-sm"
                                        />
                                        <p className="text-xs text-zinc-600">
                                            You can skip this and create videos later
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={prevStep} variant="ghost" className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-900">
                                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                                        </Button>
                                        <Button
                                            onClick={handleComplete}
                                            disabled={saving}
                                            className="flex-1 bg-white text-black hover:bg-zinc-200"
                                        >
                                            {saving ? "Saving..." : topic ? "Create video" : "Get started"}
                                            {!saving && <Check className="ml-1.5 h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
