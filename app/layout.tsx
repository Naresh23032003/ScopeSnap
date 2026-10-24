import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScopeSnap • Instant SOW & Risk Shield from Client Chaos',
  description:
    'Transform unstructured client call notes, Slack dumps, or voice transcripts into an interactive Statement of Work (SOW), Milestone & Pricing Matrix, Out-of-Scope Risk Shield, and Client-Ready PDF Proposal using Groq llama-3.3-70b-versatile.',
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#07080A',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-400 relative overflow-x-hidden">
        {/* Ambient Top Emerald Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.07),transparent_70%)]"
        />

        {/* Tactile Obsidian Noise Texture Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 bg-noise opacity-[0.025] mix-blend-overlay"
        />

        {/* Primary Application Content Shell */}
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
