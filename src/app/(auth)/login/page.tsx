"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Zap, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      subtitle: "Sign in to continue creating viral content",
      email: "Email",
      password: "Password",
      signIn: "Sign In",
      or: "or",
      google: "Continue with Google",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      forgotPassword: "Forgot password?",
    },
    ru: {
      title: "С возвращением",
      subtitle: "Войдите, чтобы создавать вирусный контент",
      email: "Email",
      password: "Пароль",
      signIn: "Войти",
      or: "или",
      google: "Войти через Google",
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
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error(lang === 'ru' ? "Неверный email или пароль" : "Invalid email or password");
        }
        throw error;
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || (lang === 'ru' ? "Ошибка входа" : "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/dashboard';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        console.error("Google OAuth error:", error);
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030303]">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all">
              <Zap className="h-6 w-6 text-violet-400" fill="currentColor" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-black text-xl tracking-tight">
                TREND<span className="text-violet-400">SYNTHESIS</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest">AI VIDEO GENERATOR</span>
            </div>
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          {/* Glow border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-violet-500/20 via-transparent to-cyan-500/20 rounded-2xl opacity-50" />

          <div className="relative bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-0 text-center">
              <h1 className="text-2xl font-bold text-white mb-1">{c.title}</h1>
              <p className="text-sm text-zinc-400">{c.subtitle}</p>
            </div>

            {/* Language Toggle */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex bg-zinc-900/50 border border-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all ${
                    lang === "en"
                      ? "bg-violet-500/20 text-violet-300 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("ru")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all ${
                    lang === "ru"
                      ? "bg-violet-500/20 text-violet-300 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  RU
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {c.email}
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-zinc-900/50 border-zinc-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 rounded-xl text-sm placeholder:text-zinc-600 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      {c.password}
                    </label>
                    <button
                      type="button"
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
                    >
                      {c.forgotPassword}
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-zinc-900/50 border-zinc-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 rounded-xl text-sm placeholder:text-zinc-600 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all gap-2 group"
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs text-zinc-500 bg-zinc-950">{c.or}</span>
                </div>
              </div>

              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl gap-3 font-medium transition-all group"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span className="text-zinc-300">{c.google}</span>
              </Button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800/50 text-center bg-zinc-900/30">
              <p className="text-sm text-zinc-500">
                {c.noAccount}{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {c.signUp}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex justify-center"
        >
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Sparkles className="h-3 w-3" />
            <span>Powered by AI</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
