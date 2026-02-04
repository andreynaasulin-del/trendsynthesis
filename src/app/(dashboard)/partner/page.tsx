"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  DollarSign,
  Users,
  MousePointer,
  TrendingUp,
  ExternalLink,
  Loader2,
  Share2,
  Gift,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================
interface AffiliateData {
  id: string;
  user_id: string;
  referral_code: string;
  total_clicks: number;
  total_signups: number;
  total_earnings: number;
  pending_payout: number;
  commission_rate: number;
  status: string;
  created_at: string;
}

interface Referral {
  id: string;
  status: string;
  created_at: string;
  commission_amount: number;
}

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  gradient: string;
  delay?: number;
}> = ({ icon: Icon, label, value, prefix = "", suffix = "", gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative group"
  >
    <div className={cn(
      "absolute inset-0 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity",
      gradient
    )} />
    <div className="relative p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", gradient)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
      </p>
    </div>
  </motion.div>
);

// ============================================
// COPY BUTTON COMPONENT
// ============================================
const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "border-zinc-700 transition-all",
        copied ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "hover:bg-zinc-800"
      )}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-1.5" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1.5" />
          {label || "Copy"}
        </>
      )}
    </Button>
  );
};

// ============================================
// MAIN PARTNER DASHBOARD
// ============================================
export default function PartnerDashboard() {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const res = await fetch("/api/affiliate");
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load affiliate data");
      }

      setAffiliate(data.data.affiliate);
      setReferrals(data.data.referrals || []);
      setReferralLink(data.data.referralLink);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-zinc-500">Loading partner dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <Button onClick={fetchAffiliateData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500">No affiliate data found</p>
      </div>
    );
  }

  const conversionRate = affiliate.total_clicks > 0
    ? ((affiliate.total_signups / affiliate.total_clicks) * 100).toFixed(1)
    : "0";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Partner Dashboard</h1>
            <p className="text-sm text-zinc-500">
              Earn {affiliate.commission_rate}% on every referral
            </p>
          </div>
        </div>
      </motion.div>

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl blur-xl" />
          <div className="relative p-6 rounded-2xl border border-emerald-500/20 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
                  Your Referral Link
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 px-4 py-3 rounded-lg bg-zinc-800/80 text-zinc-200 font-mono text-sm truncate border border-zinc-700">
                    {referralLink}
                  </code>
                  <CopyButton text={referralLink} label="Copy Link" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-zinc-700 hover:bg-zinc-800"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check%20out%20TrendSynthesis%20-%20AI%20Viral%20Video%20Generator%20${encodeURIComponent(referralLink)}`, "_blank")}
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Code badge */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-zinc-500">Your code:</span>
              <span className="px-2 py-1 rounded bg-zinc-800 text-emerald-400 font-mono text-xs">
                {affiliate.referral_code}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={MousePointer}
          label="Total Clicks"
          value={affiliate.total_clicks}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          delay={0.2}
        />
        <StatCard
          icon={Users}
          label="Signups"
          value={affiliate.total_signups}
          gradient="bg-gradient-to-br from-violet-500 to-purple-500"
          delay={0.25}
        />
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={affiliate.total_earnings}
          prefix="$"
          gradient="bg-gradient-to-br from-emerald-500 to-green-500"
          delay={0.3}
        />
        <StatCard
          icon={Wallet}
          label="Pending Payout"
          value={affiliate.pending_payout}
          prefix="$"
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          delay={0.35}
        />
      </div>

      {/* Conversion Rate & Status */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Conversion Rate
              </p>
              <p className="text-3xl font-bold text-white">{conversionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
              style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Account Status
              </p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  affiliate.status === "active" ? "bg-emerald-500" : "bg-zinc-500"
                )} />
                <p className="text-lg font-semibold text-white capitalize">{affiliate.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Commission</p>
              <p className="text-2xl font-bold text-emerald-400">{affiliate.commission_rate}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Referrals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Recent Referrals</h2>
        {referrals.length > 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-mono text-zinc-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-zinc-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-zinc-500 uppercase">Commission</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref, i) => (
                  <tr key={ref.id} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        ref.status === "converted" ? "bg-emerald-500/20 text-emerald-400" :
                        ref.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-zinc-500/20 text-zinc-400"
                      )}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-white">
                      ${ref.commission_amount?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
            <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 mb-2">No referrals yet</p>
            <p className="text-sm text-zinc-500">Share your link to start earning!</p>
          </div>
        )}
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-8 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Tips to maximize earnings</h3>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            Share your link in your social media bio
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            Create tutorial videos about TrendSynthesis
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            Write reviews on your blog or newsletter
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            Share success stories from your content
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
