"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Zap, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "ru">("en");

  useEffect(() => {
    const saved = localStorage.getItem("trendsynthesis-language");
    if (saved === "ru") setLang("ru");
  }, []);

  const content = {
    en: {
      title: "Welcome back",
      subtitle: "Sign in to your account to continue",
      email: "Email",
      password: "Password",
      signIn: "Sign In",
      or: "or continue with",
      google: "Continue with Google",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      forgotPassword: "Forgot password?",
    },
    ru: {
      title: "С возвращением",
      subtitle: "Войдите в аккаунт для продолжения",
      email: "Email",
      password: "Пароль",
      signIn: "Войти",
      or: "или продолжить с",
      google: "Продолжить с Google",
      noAccount: "Нет аккаунта?",
      signUp: "Регистрация",
      forgotPassword: "Забыли пароль?",
    },
  };

  const c = content[lang];

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const sanitizedEmail = email.trim();
      const sanitizedPassword = password.trim();

      // MVP BYPASS: Allow any email/password for demo
      if (sanitizedEmail && sanitizedPassword.length >= 1) {
        console.log("🔓 MVP DEMO ACCESS - bypassing auth");
        document.cookie = "demo-user=true; path=/; max-age=86400";
        localStorage.setItem("demo-user-email", sanitizedEmail);
        window.location.assign("/dashboard");
        return;
      }

      // Original Supabase auth (fallback)
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/dashboard";
    } catch (err: any) {
      // MVP: Still allow in even on error
      console.log("🔓 MVP FALLBACK - allowing access anyway");
      document.cookie = "demo-user=true; path=/; max-age=86400";
      localStorage.setItem("demo-user-email", email.trim() || "demo@trendsynthesis.app");
      window.location.assign("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#050505]">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
              <Zap className="h-5 w-5 text-violet-400" />
            </div>
            <span className="font-mono text-lg font-bold tracking-tight">
              TREND<span className="text-white/40">SYNTHESIS</span>
            </span>
          </Link>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex text-xs font-bold tracking-widest cursor-pointer bg-zinc-900/50 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-md transition-colors ${lang === "en" ? "bg-violet-600/20 text-violet-300" : "text-zinc-500"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ru")}
              className={`px-3 py-1.5 rounded-md transition-colors ${lang === "ru" ? "bg-violet-600/20 text-violet-300" : "text-zinc-500"}`}
            >
              RU
            </button>
          </div>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <h1 className="text-2xl font-bold">{c.title}</h1>
            <p className="text-sm text-muted-foreground">{c.subtitle}</p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  {c.email}
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-950/50 border-zinc-800 focus:border-violet-500/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-zinc-500" />
                    {c.password}
                  </label>
                  <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    {c.forgotPassword}
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-950/50 border-zinc-800 focus:border-violet-500/50 transition-colors"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 gap-2 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {c.signIn}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator className="bg-zinc-800" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-3 text-xs text-muted-foreground">
                {c.or}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-800 hover:bg-zinc-800/50 gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {c.google}
            </Button>
          </CardContent>

          <CardFooter className="justify-center border-t border-zinc-800 pt-6">
            <p className="text-sm text-muted-foreground">
              {c.noAccount}{" "}
              <Link href="/signup" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
                {c.signUp}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
