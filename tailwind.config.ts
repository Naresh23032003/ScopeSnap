import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct CSS variable bindings
        canvas: "var(--bg-canvas)",
        panel: "var(--bg-panel)",
        control: "var(--bg-control)",
        glass: "var(--bg-glass)",
        "accent-primary": "var(--accent-primary)",
        "accent-warning": "var(--accent-warning)",
        "accent-danger": "var(--accent-danger)",
        "accent-telemetry": "var(--accent-telemetry)",
        "paper-bg": "var(--paper-bg)",
        "paper-text": "var(--paper-text)",
        "paper-secondary": "var(--paper-secondary)",
        "paper-border": "var(--paper-border)",
        "paper-accent": "var(--paper-accent)",

        // Tactile Obsidian Surface Palette
        obsidian: {
          canvas: "#07080A",
          panel: "#0D0F14",
          control: "#13161E",
          card: "#11141D",
          border: "#1C202C",
          hover: "#1A1E29",
          muted: "#8A94A6",
          text: "#F1F5F9",
        },
        // Semantic Accents
        emerald: {
          primary: "#10B981",
          glow: "rgba(16, 185, 129, 0.15)",
          border: "#065F46",
        },
        amber: {
          warning: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.15)",
          border: "#92400E",
        },
        crimson: {
          danger: "#F43F5E",
          glow: "rgba(244, 63, 94, 0.15)",
          border: "#9F1239",
        },
        cyan: {
          telemetry: "#06B6D4",
          glow: "rgba(6, 182, 212, 0.15)",
        },
        // Paper SOW Preview Surface
        paper: {
          bg: "#FAF9F6",
          surface: "#FFFFFF",
          border: "#E5E5E0",
          text: "#1A1A18",
          muted: "#666660",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "var(--font-grotesk)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "keycap": "0 4px 0 #065F46, 0 8px 20px rgba(16, 185, 129, 0.25)",
        "keycap-depressed": "0 1px 0 #065F46, 0 2px 8px rgba(16, 185, 129, 0.20)",
        "keycap-emerald": "0 4px 0 #065F46, 0 8px 20px rgba(16, 185, 129, 0.25)",
        "keycap-emerald-pressed": "0 1px 0 #065F46, 0 2px 8px rgba(16, 185, 129, 0.15)",
        "keycap-neutral": "0 3px 0 #07080A, 0 6px 12px rgba(0, 0, 0, 0.45)",
        "keycap-neutral-pressed": "0 1px 0 #07080A, 0 2px 4px rgba(0, 0, 0, 0.2)",
        "keycap-amber": "0 4px 0 #92400E, 0 8px 20px rgba(245, 158, 11, 0.25)",
        "panel-depth": "0 12px 36px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
