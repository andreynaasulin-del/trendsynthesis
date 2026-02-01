"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { User as UserIcon, Key, Shield, Zap, Crown, Loader2, Check, Plus, X, MonitorPlay, Globe } from "lucide-react";
import Link from "next/link";
import { fetchProfile, updateProfile } from "@/lib/api-client";
import { User } from "@/types";

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [videoExamples, setVideoExamples] = useState<string[]>([]);
  const [trafficSource, setTrafficSource] = useState<string>("tiktok");
  const [newExample, setNewExample] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetchProfile();
        if (res.data) {
          setProfile(res.data);
          setFullName(res.data.full_name || "");
          setSystemPrompt(res.data.system_prompt || "You are a viral content strategist.");
          setTargetAudience(res.data.target_audience || "General audience");
          setVideoExamples(res.data.video_examples || []);
          setTrafficSource(res.data.traffic_source || "tiktok");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Save profile changes
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        full_name: fullName,
        system_prompt: systemPrompt,
        target_audience: targetAudience,
        video_examples: videoExamples,
        traffic_source: trafficSource as any,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const addExample = () => {
    if (newExample.trim()) {
      setVideoExamples([...videoExamples, newExample.trim()]);
      setNewExample("");
    }
  };

  const removeExample = (index: number) => {
    setVideoExamples(videoExamples.filter((_, i) => i !== index));
  };

  const content = {
    en: {
      title: "Settings",
      subtitle: "Manage your account and preferences",
      profile: "Profile",
      creatorProfile: "Creator Profile",
      creatorDesc: "Global AI settings for your content strategy.",
      fullName: "Full Name",
      systemPrompt: "System Persona",
      systemPromptDesc: "Instructions for the AI (e.g. 'You are a sarcastic tech blogger').",
      targetAudience: "Target Audience",
      targetAudienceDesc: "Who are your videos for? (e.g. 'Gen Z interested in crypto').",
      videoExamples: "Video References",
      videoExamplesDesc: "Paste links to videos you want to emulate.",
      addExample: "Add",
      trafficSource: "Primary Platform",
      trafficSourceDesc: "Where do you post content?",
      namePlaceholder: "Your name",
      email: "Email",
      saveChanges: "Save Changes",
      saved: "Saved",
      planBilling: "Plan & Billing",
      currentPlan: "Current Plan",
      planDesc: (credits: number) => `${credits} credits remaining`,
      free: "Free",
      pro: "Pro",
      agency: "Agency",
      upgrade: "Upgrade to Pro — $29/mo",
      manageBilling: "Manage Billing",
      apiAccess: "API Access",
      apiDesc: "Available on Agency plan.",
      generateKey: "Generate Key",
      language: "Interface Language",
      security: "Security",
      changePassword: "Change Password",
      twoFactor: "Enable 2FA",
    },
    ru: {
      title: "Настройки",
      subtitle: "Управление аккаунтом и предпочтениями",
      profile: "Профиль",
      creatorProfile: "Профиль Креатора",
      creatorDesc: "Глобальные настройки AI для вашего контента.",
      fullName: "Имя",
      systemPrompt: "Персона AI",
      systemPromptDesc: "Инструкция для AI (например: 'Ты саркастичный техно-блогер').",
      targetAudience: "Целевая аудитория",
      targetAudienceDesc: "Для кого видео? (например: 'Крипто-энтузиасты').",
      videoExamples: "Референсы",
      videoExamplesDesc: "Ссылки на видео для подражания.",
      addExample: "Добавить",
      trafficSource: "Платформа",
      trafficSourceDesc: "Основная площадка для контента",
      namePlaceholder: "Ваше имя",
      email: "Email",
      saveChanges: "Сохранить",
      saved: "Сохранено",
      planBilling: "Тариф",
      currentPlan: "Текущий план",
      planDesc: (credits: number) => `${credits} кредитов`,
      free: "Бесплатно",
      pro: "Про",
      agency: "Агентство",
      upgrade: "Купить Pro — 2900₽",
      manageBilling: "Управление",
      apiAccess: "API Доступ",
      apiDesc: "Доступно на тарифе Agency.",
      generateKey: "Создать ключ",
      language: "Язык интерфейса",
      security: "Безопасность",
      changePassword: "Сменить пароль",
      twoFactor: "Включить 2FA",
    },
  };

  const c = content[language];

  // Minimal badges
  const getPlanBadge = () => {
    if (!profile) return c.free;
    switch (profile.plan) {
      case "pro": return c.pro;
      case "agency": return c.agency;
      default: return c.free;
    }
  };

  const getPlanBadgeStyle = () => {
    // Minimal monochrome badges
    return "bg-white text-black border border-zinc-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-2xl space-y-8 pb-20 pt-4"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white mb-1">{c.title}</h1>
        <p className="text-sm text-zinc-500">{c.subtitle}</p>
      </div>

      {/* Language */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider px-1">{c.language}</h3>
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-zinc-800/50">
                <Globe className="h-4 w-4 text-zinc-400" />
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {language === "en" ? "English" : "Russian"}
              </span>
            </div>
            <div className="flex gap-2">
              {(["en", "ru"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`
                      px-3 py-1.5 text-xs font-medium rounded transition-colors border
                      ${language === lang
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300"}
                    `}
                >
                  {lang === "en" ? "EN" : "RU"}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Creator Profile */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider px-1">{c.creatorProfile}</h3>
        <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <CardContent className="p-0">
            {/* System Prompt */}
            <div className="p-5 border-b border-zinc-800/50 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-200">{c.systemPrompt}</label>
                <p className="text-xs text-zinc-500">{c.systemPromptDesc}</p>
              </div>
              <textarea
                className="w-full min-h-[80px] rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all resize-none"
                placeholder="You are an expert in..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
            </div>

            {/* Target Audience */}
            <div className="p-5 border-b border-zinc-800/50 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-200">{c.targetAudience}</label>
                <p className="text-xs text-zinc-500">{c.targetAudienceDesc}</p>
              </div>
              <Input
                className="bg-zinc-950/50 border-zinc-800 text-zinc-300 h-10"
                placeholder="e.g. Crypto enthusiasts..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* Traffic Source */}
            <div className="p-5 border-b border-zinc-800/50 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-200">{c.trafficSource}</label>
                <p className="text-xs text-zinc-500">{c.trafficSourceDesc}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['tiktok', 'instagram', 'youtube', 'telegram'] as const).map((source) => (
                  <button
                    key={source}
                    className={`
                        py-2 px-3 rounded-md border text-xs font-medium transition-all capitalize
                        ${trafficSource === source
                        ? "bg-white text-black border-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"}
                      `}
                    onClick={() => setTrafficSource(source)}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Examples */}
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-200">{c.videoExamples}</label>
                <p className="text-xs text-zinc-500">{c.videoExamplesDesc}</p>
              </div>

              <div className="space-y-2">
                {videoExamples.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                    <span className="flex-1 truncate font-mono">{ex}</span>
                    <button onClick={() => removeExample(i)} className="hover:text-red-400 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  className="bg-zinc-950/50 border-zinc-800 h-9 text-xs"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addExample()}
                />
                <Button size="sm" variant="outline" onClick={addExample} className="h-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-zinc-400">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Account Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider px-1">{c.profile}</h3>
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">{c.fullName}</label>
                <Input
                  className="bg-zinc-950/50 border-zinc-800 text-zinc-200 h-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">{c.email}</label>
                <Input
                  disabled
                  className="bg-zinc-950/30 border-zinc-800/50 text-zinc-500 h-9 cursor-not-allowed"
                  value={profile?.email || ""}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-white text-black hover:bg-zinc-200 min-w-[100px]"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : saved ? (
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                ) : null}
                {saved ? c.saved : c.saveChanges}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Subscription (Minimal) */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider px-1">{c.planBilling}</h3>
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-200">{c.currentPlan}</span>
                <Badge variant="secondary" className={getPlanBadgeStyle()}>
                  {getPlanBadge()}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500">{c.planDesc(profile?.credits_remaining || 0)}</p>
            </div>

            {profile?.plan === "free" ? (
              <Button asChild size="sm" variant="outline" className="h-8 border-zinc-700 hover:bg-zinc-800 hover:text-white bg-transparent">
                <Link href="/api/checkout?plan=pro">{c.upgrade}</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="h-8 border-zinc-700 hover:bg-zinc-800 hover:text-white bg-transparent">
                <Link href="/api/checkout?action=portal">{c.manageBilling}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer Links (Security/API) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-zinc-800 bg-zinc-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">{c.security}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-zinc-500 hover:text-zinc-300 -ml-2">
                {c.changePassword}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
              <Key className="h-4 w-4" />
              <span className="text-sm font-medium">{c.apiAccess}</span>
            </div>
            <p className="text-xs text-zinc-600 mb-3">{c.apiDesc}</p>
            <Button
              variant="outline"
              size="sm"
              disabled={profile?.plan !== "agency"}
              className="h-7 text-xs border-zinc-800 bg-transparent text-zinc-500"
            >
              {c.generateKey}
            </Button>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  );
}
