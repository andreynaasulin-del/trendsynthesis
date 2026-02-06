"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CreditCard,
    Wallet,
    Zap,
    Check,
    Download,
    Loader2,
    Coins,
    Brain,
    Sparkles,
    ArrowRight,
    Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserStats, getTransactions, type UserStats, type Transaction } from "@/actions/user-data";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export default function BillingPage() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

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

    const creditPacks = siteConfig.creditPacks;
    const businessSub = siteConfig.businessSubscription;

    return (
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-10 px-4 sm:px-0">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">Баланс и покупки</h1>
                <p className="text-sm sm:text-base text-zinc-400">Управляй кредитами и подпиской Business AI</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Credit Balance Card */}
                <Card className="lg:col-span-2 border-zinc-800 bg-zinc-900/30 backdrop-blur">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400 uppercase tracking-wider">Баланс кредитов</CardTitle>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-500">
                                        {stats?.credits || 0}
                                    </span>
                                    <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                                        <Coins className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-violet-400" />
                                        <span className="text-[10px] sm:text-xs font-bold text-violet-400">CREDITS</span>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">1 кредит = 1 генерация (до 30 видео)</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-2">
                            <h3 className="text-xs sm:text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-400" />
                                Пополнить кредиты
                            </h3>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                                {creditPacks.map((pack) => (
                                    <Link
                                        key={pack.id}
                                        href={`/api/checkout?type=credits&pack=${pack.id}`}
                                        className={cn(
                                            "relative group flex flex-col items-start p-3 sm:p-4 rounded-xl border transition-all text-left",
                                            pack.highlighted
                                                ? "bg-violet-500/5 border-violet-500/50 hover:bg-violet-500/10"
                                                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                                        )}
                                    >
                                        {pack.highlighted && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-violet-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full whitespace-nowrap">
                                                ПОПУЛЯРНЫЙ
                                            </span>
                                        )}
                                        {pack.bonus > 0 && (
                                            <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded">
                                                +{pack.bonus}%
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-xs sm:text-sm font-bold text-white">{pack.credits}</span>
                                            <span className="text-[10px] text-zinc-500">кред.</span>
                                        </div>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-xs text-zinc-400">$</span>
                                            <span className="text-lg sm:text-xl font-bold text-white">{pack.price}</span>
                                        </div>
                                        <span className="text-[9px] text-zinc-500 mt-1">${pack.pricePerCredit.toFixed(2)}/кредит</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Business AI Subscription Card */}
                <Card className="lg:col-span-1 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 backdrop-blur">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-5 h-5 text-amber-400" />
                            <CardTitle className="text-sm font-medium text-amber-400">Business AI</CardTitle>
                        </div>
                        {stats?.hasBusinessAi ? (
                            <Badge className="w-fit bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                <Check className="w-3 h-3 mr-1" /> Активно
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="w-fit border-zinc-700 text-zinc-400">
                                Не подключено
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-xs text-zinc-400">
                            Безлимитный бизнес-ассистент для стратегий и монетизации
                        </p>
                        <div className="space-y-1.5">
                            {businessSub.features.ru.slice(0, 4).map((f, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-300">
                                    <Check className="w-3 h-3 text-amber-400 shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        {stats?.hasBusinessAi ? (
                            <Link href="/api/checkout?action=portal" className="w-full">
                                <Button variant="outline" className="w-full text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                                    Управлять подпиской
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/api/checkout?type=subscription" className="w-full">
                                <Button className="w-full bg-amber-500 text-black hover:bg-amber-400 text-xs sm:text-sm">
                                    Подключить ${businessSub.price}/мес
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* Free Credits Banner (if low balance) */}
            {(stats?.credits || 0) < 3 && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                        <div className="flex items-center gap-3">
                            <Gift className="w-8 h-8 text-emerald-400" />
                            <div>
                                <p className="font-medium text-white text-sm">Мало кредитов?</p>
                                <p className="text-xs text-zinc-400">Пригласи друга и получи +3 бесплатных кредита</p>
                            </div>
                        </div>
                        <Link href="/partner">
                            <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs">
                                Пригласить друзей
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Transaction History */}
            <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm sm:text-base font-medium text-white">История транзакций</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Покупки кредитов и платежи за подписку</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-zinc-800 overflow-hidden overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm text-left min-w-[500px]">
                            <thead className="bg-zinc-900/50 text-zinc-400 font-medium">
                                <tr>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3">Дата</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3">Описание</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3">Сумма</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3">Статус</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">Чек</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-zinc-400">
                                                {new Date(tx.created_at).toLocaleDateString('ru-RU')}
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-white">
                                                {tx.description}
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-zinc-300">
                                                ${tx.amount.toFixed(2)}
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3">
                                                {tx.status === 'succeeded' ? (
                                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/10 text-[10px]">Оплачено</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">Ожидание</Badge>
                                                )}
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white">
                                                    <Download className="w-3.5 h-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 text-xs">
                                            Транзакций пока нет. Купите кредиты, чтобы начать!
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
