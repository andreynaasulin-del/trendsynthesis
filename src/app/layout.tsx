import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Force specific runtime to avoid Edge Network 404s
export const runtime = "nodejs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRENDSYNTHESIS — AI Viral Video Factory",
  description:
    "One topic — 30 viral videos in 5 minutes. AI-powered content generation for agencies, creators, and marketers.",
  keywords: [
    "AI video",
    "viral content",
    "video generation",
    "content automation",
    "SMM",
  ],
  openGraph: {
    title: "TRENDSYNTHESIS — AI Viral Video Factory",
    description: "One topic — 30 viral videos in 5 minutes.",
    url: "https://trendsynthesis.com",
    siteName: "TRENDSYNTHESIS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRENDSYNTHESIS",
    description: "One topic — 30 viral videos in 5 minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
