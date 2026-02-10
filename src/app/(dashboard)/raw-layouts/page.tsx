"use client";

import { useState } from "react";
import { Film, Download, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Player } from "@remotion/player";
import { RawMontage } from "@/remotion/components/RawMontage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function RawLayoutsPage() {
    const router = useRouter();
    const [topic, setTopic] = useState("");
    const [duration, setDuration] = useState(15);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        projectId: string;
        videoId: string;
        assets: string[];
        duration: number;
        queries: string[];
    } | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleGenerate = async () => {
        if (!topic) {
            setMessage({ type: 'error', text: "Please enter a topic" });
            return;
        }

        setLoading(true);
        setResult(null);
        setMessage(null);

        try {
            const response = await fetch("/api/generate/raw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, duration }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Generation failed");
            }

            setResult(data.data);
            setMessage({ type: 'success', text: "Raw Layout Generated!" });
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl py-6 md:py-12 space-y-8 md:space-y-12 px-4 md:px-6 mb-20">
            {/* Header */}
            <div className="space-y-4 text-center">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
                    RAW SOURCE GENERATOR
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Create clean, high-quality video montages (5-30s) without text or music.
                    Perfect for manual editing in CapCut or Premiere.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Input Form */}
                <Card className="border-yellow-500/20 bg-background/80 backdrop-blur-none md:backdrop-blur-sm">
                    <CardContent className="p-4 md:p-6 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="topic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Topic / Visual Concept
                            </label>
                            <Input
                                id="topic"
                                placeholder="e.g. Luxurious Miami Nightlife, Bitcoin Trading..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="bg-background/80"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Duration (Seconds)
                            </label>

                            {/* Custom Radio Group Replacement */}
                            <div className="grid grid-cols-3 gap-3 md:gap-4">
                                {[5, 10, 15, 20, 25, 30].map((sec) => (
                                    <button
                                        key={sec}
                                        onClick={() => setDuration(sec)}
                                        className={`
                      flex flex-col items-center justify-between rounded-md border-2 p-3 md:p-4 transition-all hover:scale-[1.02] active:scale-95
                      ${duration === sec
                                                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                                : 'border-muted bg-popover hover:bg-accent hover:text-accent-foreground opacity-70 hover:opacity-100'}
                    `}
                                    >
                                        <Film className="mb-2 h-5 w-5 md:h-6 md:w-6 opacity-50" />
                                        <span className="font-bold text-sm md:text-base">{sec}st</span>
                                        <span className="text-[10px] md:text-xs text-muted-foreground mt-1">
                                            {Math.ceil(sec / 5)} {sec === 5 ? 'Scene' : 'Scenes'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating Assets...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Generate Source ({Math.max(1, Math.round(duration / 5))} Credit)
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="bg-yellow-500/10 p-3 md:p-4 rounded-lg flex items-start space-x-3 text-xs md:text-sm text-yellow-200/80 border border-yellow-500/10">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                            <p>
                                Credits are deducted immediately. Ensure your prompt is clear.
                                Output is a raw MP4 file without subtitles or music.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview / Result */}
                <div className="space-y-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
                    {result ? (
                        <>
                            <div className="relative aspect-[9/16] w-full max-w-[240px] md:max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-500 bg-black group mx-auto">
                                <Player
                                    component={RawMontage}
                                    durationInFrames={result.duration * 30}
                                    fps={30}
                                    compositionWidth={1080}
                                    compositionHeight={1920}
                                    inputProps={{
                                        assets: result.assets,
                                        clipDurationInSeconds: 5
                                    }}
                                    controls
                                    loop
                                    autoPlay
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="w-full max-w-sm space-y-3 px-4 md:px-0">
                                <Button
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                                    onClick={() => alert("Client-side export not implemented. Use screen record or API.")}
                                >
                                    <Download className="mr-2 h-5 w-5" />
                                    Download Raw MP4
                                </Button>
                                <div className="text-xs text-center text-muted-foreground px-2">
                                    <span className="font-semibold block mb-1">Assets Used:</span>
                                    {result.queries.join(", ")}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4 opacity-50 px-4">
                            <div className="w-48 h-[300px] md:w-64 md:h-[440px] border-2 border-dashed border-muted-foreground/30 rounded-2xl flex items-center justify-center mx-auto bg-muted/5">
                                <Film className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30" />
                            </div>
                            <p className="text-sm">Preview will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
