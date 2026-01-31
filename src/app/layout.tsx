import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://trendsynthesis.com"),
  title: {
    default: "TRENDSYNTHESIS — AI Viral Video Factory",
    template: "%s | TRENDSYNTHESIS",
  },
  description:
    "One topic — 30 viral videos in 5 minutes. AI-powered content generation for agencies, creators, and marketers. No editing skills required.",
  keywords: [
    "AI video",
    "viral content",
    "video generation",
    "content automation",
    "SMM",
    "TikTok",
    "Reels",
    "short-form video",
    "viral marketing",
    "AI content creator",
  ],
  authors: [{ name: "TRENDSYNTHESIS" }],
  creator: "TRENDSYNTHESIS",
  publisher: "TRENDSYNTHESIS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "TRENDSYNTHESIS — AI Viral Video Factory",
    description: "One topic — 30 viral videos in 5 minutes. No editing skills required.",
    url: "https://trendsynthesis.com",
    siteName: "TRENDSYNTHESIS",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TRENDSYNTHESIS - AI Viral Video Factory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRENDSYNTHESIS — AI Viral Video Factory",
    description: "One topic — 30 viral videos in 5 minutes.",
    images: ["/og-image.png"],
    creator: "@trendsynthesis",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
