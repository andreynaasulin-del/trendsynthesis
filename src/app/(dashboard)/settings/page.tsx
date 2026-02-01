"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { User as UserIcon, Key, Shield, Zap, Crown, Loader2, Check, Plus, X, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { fetchProfile, updateProfile } from "@/lib/api-client";

import { User } from "@/types";


// ... imports

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
      creatorDesc: "Customize global AI settings for your content.",
      fullName: "Full Name",
      systemPrompt: "System Prompt",
      systemPromptDesc: "Global instructions for the AI (e.g. 'You are a sarcastic tech blogger').",
      targetAudience: "Target Audience",
      targetAudienceDesc: "Who are your videos for? (e.g. 'Gen Z interested in crypto').",
      videoExamples: "Video Examples",
      videoExamplesDesc: "Paste links to videos you want to emulate (YouTube/TikTok).",
      addExample: "Add",
      trafficSource: "Traffic Source",
      trafficSourceDesc: "Where are you driving traffic?",
      namePlaceholder: "Your name",
      email: "Email",
      saveChanges: "Save Changes",
      saved: "Saved!",
      planBilling: "Plan & Billing",
      currentPlan: "Current Plan",
      planDesc: (credits: number) => `${credits} credits remaining`,
      free: "Free",
      pro: "Pro",
      agency: "Agency",
      upgrade: "Upgrade to Pro — $29/mo",
      manageBilling: "Manage Billing",
      apiAccess: "API Access",
      apiDesc: "API access is available on the Agency plan. Upgrade to get your API key.",
      generateKey: "Generate API Key",
      language: "Language",
      langDesc: "Select your preferred interface language",
      security: "Security",
      securityDesc: "Manage your account security settings",
      changePassword: "Change Password",
      twoFactor: "Enable 2FA",
    },
    ru: {
      title: "Настройки",
      subtitle: "Управление аккаунтом и предпочтениями",
      profile: "Профиль",
      creatorProfile: "Профиль Креатора",
      creatorDesc: "Настройте глобальные параметры AI для вашего контента.",
      fullName: "Полное имя",
      systemPrompt: "Системный промпт",
      systemPromptDesc: "Инструкция для AI (например: 'Ты саркастичный техно-блогер').",
      targetAudience: "Целевая аудитория (ЦА)",
      targetAudienceDesc: "Для кого ваши видео? (например: 'Молодежь, интересующаяся криптой').",
      videoExamples: "Примеры видео",
      videoExamplesDesc: "Ссылки на видео-референсы (YouTube/TikTok).",
      addExample: "Добавить",
      trafficSource: "Источник трафика",
      trafficSourceDesc: "Куда вы ведете трафик?",
      namePlaceholder: "Ваше имя",
      email: "Email",
      saveChanges: "Сохранить",
      saved: "Сохранено!",
      planBilling: "Подписка и Оплата",
      currentPlan: "Текущий план",
      planDesc: (credits: number) => `${credits} кредитов осталось`,
      free: "Бесплатно",
      pro: "Про",
      agency: "Агентство",
      upgrade: "Перейти на Pro — 2900₽/мес",
      manageBilling: "Управление подпиской",
      apiAccess: "API Доступ",
      apiDesc: "API доступен на тарифе Agency. Обновите план для получения API ключа.",
      generateKey: "Создать API ключ",
      language: "Язык",
      langDesc: "Выберите язык интерфейса",
      security: "Безопасность",
      securityDesc: "Управление настройками безопасности",
      changePassword: "Сменить пароль",
      twoFactor: "Включить 2FA",
    },
  };

  const c = content[language];

  const getPlanBadge = () => {
    if (!profile) return c.free;
    switch (profile.plan) {
      case "pro": return c.pro;
      case "agency": return c.agency;
      default: return c.free;
    }
  };

  const getPlanBadgeStyle = () => {
    if (!profile) return "bg-zinc-800 text-zinc-300";
    switch (profile.plan) {
      case "pro": return "bg-violet-600 text-white";
      case "agency": return "bg-amber-500 text-black";
      default: return "bg-zinc-800 text-zinc-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-6 pb-20"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{c.title}</h1>
        <p className="mt-1 text-muted-foreground">{c.subtitle}</p>
      </div>

      {/* Language Preference */}
      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Zap className="h-4 w-4 text-violet-400" />
          </div>
          <CardTitle className="text-base">{c.language}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{c.langDesc}</p>
          <div className="flex gap-2">
            {(["en", "ru"] as const).map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage(lang)}
                className={language === lang ? "bg-violet-600 hover:bg-violet-500" : ""}
              >
                {lang === "en" ? "English" : "Русский"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Creator Profile Sections */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <MonitorPlay className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-base">{c.creatorProfile}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{c.creatorDesc}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{c.systemPrompt}</label>
            <p className="text-xs text-muted-foreground">{c.systemPromptDesc}</p>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="You are an expert in..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{c.targetAudience}</label>
            <p className="text-xs text-muted-foreground">{c.targetAudienceDesc}</p>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g. Entrepreneurs aged 25-35..."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          {/* Traffic Source */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{c.trafficSource}</label>
            <p className="text-xs text-muted-foreground -mt-2">{c.trafficSourceDesc}</p>
            <div className="grid grid-cols-2 gap-3">
              {(['tiktok', 'instagram', 'youtube', 'telegram'] as const).map((source) => (
                <div
                  key={source}
                  className={`cursor-pointer rounded-lg border p-3 flex items-center gap-3 transition-colors ${trafficSource === source ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800 hover:bg-zinc-900'}`}
                  onClick={() => setTrafficSource(source)}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${trafficSource === source ? 'border-violet-500' : 'border-zinc-600'}`}>
                    {trafficSource === source && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                  </div>
                  <span className="capitalize text-sm font-medium">{source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Video Examples */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{c.videoExamples}</label>
            <p className="text-xs text-muted-foreground -mt-2">{c.videoExamplesDesc}</p>

            <div className="space-y-2">
              {videoExamples.map((ex, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-zinc-900/50 border border-zinc-800 text-sm">
                  <span className="flex-1 truncate font-mono text-xs">{ex}</span>
                  <button onClick={() => removeExample(i)} className="p-1 hover:bg-red-500/20 rounded text-muted-foreground hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                className="bg-zinc-900/50 border-zinc-800 h-9"
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExample()}
              />
              <Button size="sm" variant="outline" onClick={addExample} className="h-9">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-zinc-800">
            <UserIcon className="h-4 w-4 text-zinc-400" />
          </div>
          <CardTitle className="text-base">{c.profile}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{c.fullName}</label>
            <Input
              placeholder={c.namePlaceholder}
              className="bg-zinc-900/50 border-zinc-800"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{c.email}</label>
            <Input
              placeholder="you@example.com"
              disabled
              className="bg-zinc-900/50 border-zinc-800"
              value={profile?.email || ""}
            />
          </div>
          <Button
            className="bg-violet-600 hover:bg-violet-500"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : null}
            {saved ? c.saved : c.saveChanges}
          </Button>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          <CardTitle className="text-base">{c.planBilling}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div>
              <p className="font-medium">{c.currentPlan}</p>
              <p className="text-sm text-muted-foreground">
                {c.planDesc(profile?.credits_remaining || 0)}
              </p>
            </div>
            <Badge variant="secondary" className={`text-sm ${getPlanBadgeStyle()}`}>
              {getPlanBadge()}
            </Badge>
          </div>
          <Separator className="bg-zinc-800" />
          {profile?.plan === "free" ? (
            <Button asChild variant="outline" className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
              <Link href="/api/checkout?plan=pro">{c.upgrade}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link href="/api/checkout?action=portal">{c.manageBilling}</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Key className="h-4 w-4 text-zinc-400" />
          </div>
          <CardTitle className="text-base">{c.apiAccess}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{c.apiDesc}</p>
          <Button
            variant="outline"
            className="mt-4"
            disabled={profile?.plan !== "agency"}
          >
            {c.generateKey}
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Shield className="h-4 w-4 text-zinc-400" />
          </div>
          <CardTitle className="text-base">{c.security}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{c.securityDesc}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">{c.changePassword}</Button>
            <Button variant="outline" size="sm">{c.twoFactor}</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
