"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Target, Rocket, ArrowRight, ArrowLeft } from "lucide-react";
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
    { id: "tiktok", label: "TikTok", color: "from-pink-500 to-cyan-500" },
    { id: "instagram", label: "Instagram", color: "from-purple-500 to-pink-500" },
    { id: "youtube", label: "YouTube Shorts", color: "from-red-500 to-red-600" },
    { id: "telegram", label: "Telegram", color: "from-blue-500 to-cyan-500" },
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
            // Save profile settings
            await updateProfile({
                system_prompt: `You are a ${niche} content expert creating viral short-form videos.`,
                target_audience: audience || `${niche} enthusiasts`,
                traffic_source: platform as any,
            });

            // Mark onboarding as complete
            localStorage.setItem("onboarding_completed", "true");

            onComplete();

            // Redirect to generate page with pre-filled topic
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
            <DialogContent className="max-w-2xl border-violet-500/20 bg-black/95 backdrop-blur-xl p-0 overflow-hidden">
                <div className="relative">
                    {/* Progress Bar */}
                    <div className="h-1 bg-zinc-800">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Choose Niche */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex p-3 rounded-full bg-violet-500/10 mb-4">
                                            <Sparkles className="h-8 w-8 text-violet-400" />
                                        </div>
                                        <h2 className="text-3xl font-bold">Добро пожаловать в TrendSynthesis!</h2>
                                        <p className="text-muted-foreground">Давайте настроим ваш профиль за 30 секунд</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-3 block">Выберите вашу нишу:</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {NICHES.map((n) => (
                                                <button
                                                    key={n.id}
                                                    onClick={() => setNiche(n.id)}
                                                    className={`p-4 rounded-lg border-2 transition-all text-left ${niche === n.id
                                                            ? "border-violet-500 bg-violet-500/10"
                                                            : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                                                        }`}
                                                >
                                                    <div className="text-2xl mb-1">{n.emoji}</div>
                                                    <div className="font-medium">{n.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={nextStep}
                                        disabled={!niche}
                                        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                                        size="lg"
                                    >
                                        Продолжить <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                            )}

                            {/* Step 2: Target Audience & Platform */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex p-3 rounded-full bg-amber-500/10 mb-4">
                                            <Target className="h-8 w-8 text-amber-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Кто ваша аудитория?</h2>
                                        <p className="text-muted-foreground">Это поможет AI создавать релевантный контент</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Опишите вашу целевую аудиторию:</label>
                                            <Input
                                                placeholder="Например: Предприниматели 25-35 лет, интересующиеся пассивным доходом"
                                                value={audience}
                                                onChange={(e) => setAudience(e.target.value)}
                                                className="bg-zinc-900/50 border-zinc-800"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-3 block">Куда будете постить?</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {PLATFORMS.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setPlatform(p.id)}
                                                        className={`p-4 rounded-lg border-2 transition-all ${platform === p.id
                                                                ? "border-violet-500 bg-violet-500/10"
                                                                : "border-zinc-800 hover:border-zinc-700"
                                                            }`}
                                                    >
                                                        <div className={`text-sm font-bold bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}>
                                                            {p.label}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                                        </Button>
                                        <Button
                                            onClick={nextStep}
                                            className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600"
                                            size="lg"
                                        >
                                            Продолжить <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: First Video */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-4">
                                            <Rocket className="h-8 w-8 text-green-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Создайте первое видео!</h2>
                                        <p className="text-muted-foreground">О чем хотите снять ролик?</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Тема видео (опционально):</label>
                                        <Input
                                            placeholder={`Например: Топ-5 способов заработка в ${niche}`}
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="bg-zinc-900/50 border-zinc-800"
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Можете пропустить и создать позже в разделе "Генерация"
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                                        </Button>
                                        <Button
                                            onClick={handleComplete}
                                            disabled={saving}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                                            size="lg"
                                        >
                                            {saving ? "Сохранение..." : topic ? "Создать видео!" : "Начать работу!"}
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
