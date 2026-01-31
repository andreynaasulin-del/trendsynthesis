"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { User, CreditCard, Key, Shield, Zap, Crown } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();

  const content = {
    en: {
      title: "Settings",
      subtitle: "Manage your account and preferences",
      profile: "Profile",
      fullName: "Full Name",
      namePlaceholder: "Your name",
      email: "Email",
      saveChanges: "Save Changes",
      planBilling: "Plan & Billing",
      currentPlan: "Current Plan",
      planDesc: "1 free generation included",
      free: "Free",
      upgrade: "Upgrade to Creator — $29/mo",
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
      planBilling: "Подписка и Оплата",
      currentPlan: "Текущий план",
      planDesc: "1 бесплатная генерация",
      free: "Бесплатно",
      upgrade: "Перейти на Creator — 2900₽/мес",
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
            <Input placeholder={c.namePlaceholder} className="bg-zinc-900/50 border-zinc-800" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{c.email}</label>
            <Input placeholder="you@example.com" disabled className="bg-zinc-900/50 border-zinc-800" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-500">{c.saveChanges}</Button>
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
              <p className="text-sm text-muted-foreground">{c.planDesc}</p>
            </div>
            <Badge variant="secondary" className="text-sm bg-zinc-800 text-zinc-300">
              {c.free}
            </Badge>
          </div>
          <Separator className="bg-zinc-800" />
          <Button asChild variant="outline" className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
            <Link href="/#pricing">{c.upgrade}</Link>
          </Button>
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
          <Button variant="outline" className="mt-4" disabled>
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
