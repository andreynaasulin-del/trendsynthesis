"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    Wallet,
    Zap,
    Check,
    Clock,
    AlertCircle,
    Download,
    Loader2,
    Gem
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getUserStats, getTransactions, type UserStats, type Transaction } from "@/actions/user-data";
import { cn } from "@/lib/utils";

export default function BillingPage() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");

    useEffect(() => {
        async function loadData() {
            try {
                const [s, t] = await Promise.all([
                    getUserStats(),
                    getTransactions()
                ]);
                setStats(s);
                setTransactions(t);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Billing & Plans</h1>
                <p className="text-zinc-400">Manage your subscription, credits, and payment methods.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Plan Card */}
                <Card className="md:col-span-1 border-zinc-800 bg-zinc-900/30 backdrop-blur relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Gem className="w-24 h-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Current Plan</CardTitle>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold capitalize text-white">{stats?.plan}</span>
                            {stats?.plan === "free" && <Badge variant="outline" className="border-zinc-700 text-zinc-400">Basic</Badge>}
                            {stats?.plan === "pro" && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Active</Badge>}
                            {stats?.plan === "agency" && <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">Agency</Badge>}
                        </div>
                        <CardDescription>
                            {stats?.plan === "free" ? "Upgrade to unlock premium features." : "You are on the best plan."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Monthly Usage</span>
                                <span className="text-white">{stats?.monthlyVideos || 0} / {stats?.plan === "free" ? 3 : "Unl."}</span>
                            </div>
                            <Progress value={((stats?.monthlyVideos || 0) / (stats?.plan === "free" ? 3 : 100)) * 100} className="h-1.5 bg-zinc-800" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        {stats?.plan === "free" ? (
                            <Button className="w-full bg-white text-black hover:bg-zinc-200" onClick={() => window.location.href = '/#pricing'}>
                                Upgrade to Pro
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                Manage Subscription
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Credit Balance Card */}
                <Card className="md:col-span-2 border-zinc-800 bg-zinc-900/30 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Credit Balance</CardTitle>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                        {stats?.credits}
                                    </span>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                                        <Zap className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                                        <span className="text-xs font-bold text-amber-400">CREDITS</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white" disabled>
                                    Auto-topup Off
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-2">
                            <h3 className="text-sm font-medium text-white mb-4">Top Up Credits</h3>

                            <Tabs defaultValue="card" onValueChange={(v: string) => setPaymentMethod(v as "card" | "crypto")} className="w-full">
                                <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-zinc-900 border border-zinc-800">
                                    <TabsTrigger value="card" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Card
                                    </TabsTrigger>
                                    <TabsTrigger value="crypto" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                                        <Wallet className="w-4 h-4 mr-2" />
                                        Crypto
                                    </TabsTrigger>
                                </TabsList>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { amount: 50, price: paymentMethod === 'card' ? 15 : 14 },
                                        { amount: 100, price: paymentMethod === 'card' ? 25 : 24 },
                                        { amount: 500, price: paymentMethod === 'card' ? 100 : 95, popular: true },
                                    ].map((opt) => (
                                        <button
                                            key={opt.amount}
                                            className={cn(
                                                "relative group flex flex-col items-start p-4 rounded-xl border transition-all text-left",
                                                opt.popular
                                                    ? "bg-amber-500/5 border-amber-500/50 hover:bg-amber-500/10"
                                                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                                            )}
                                        >
                                            {opt.popular && (
                                                <span className="absolute -top-3 right-4 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full">
                                                    BEST VALUE
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2 mb-1">
                                                <Zap className="w-4 h-4 text-amber-400" />
                                                <span className="font-bold text-white">{opt.amount} Credits</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg text-zinc-400">$</span>
                                                <span className="text-2xl font-bold text-white">{opt.price}</span>
                                                {paymentMethod === 'crypto' && <span className="text-xs text-zinc-500 ml-1">USDT</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-white">Transaction History</CardTitle>
                    <CardDescription>Recent payments and credit usages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-zinc-800 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-900/50 text-zinc-400 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                                            <td className="px-4 py-3 text-zinc-400">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-white">
                                                {tx.description}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-300">
                                                ${tx.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {tx.status === 'succeeded' ? (
                                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/10">Paid</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">Pending</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
