import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
          TRENDSYNTHESIS
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <a href="mailto:hello@trendsynthesis.com" className="hover:text-foreground transition-colors">
            Contact
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} TRENDSYNTHESIS
        </p>
      </div>
    </footer>
  );
}
