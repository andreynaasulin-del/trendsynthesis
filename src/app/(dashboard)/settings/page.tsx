"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { User, Key, Shield, Zap, Crown, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { fetchProfile, updateProfile } from "@/lib/api-client";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: "free" | "pro" | "agency";
  credits_remaining: number;
}

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetchProfile();
        if (res.data) {
          setProfile(res.data);
          setFullName(res.data.full_name || "");
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
      await updateProfile({ full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const content = {
    en: {
      title: "Settings",
      subtitle: "Manage your account and preferences",
      profile: "Profile",
      fullName: "Full Name",
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
      fullName: "Полное имя",
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
      className="mx-auto max-w-2xl space-y-6"
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

      {/* Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-zinc-800">
            <User className="h-4 w-4 text-zinc-400" />
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
