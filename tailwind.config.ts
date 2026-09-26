import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Secondary — brand styling color (individual readers)
        gold: {
          DEFAULT: "#C89B3C",
          light: "#DABB6B",
          dark: "#A67C1E",
          deep: "#7D5C0F",
        },
        // Primary — church / institutional sections + footer
        navy: { DEFAULT: "#16324F", light: "#1E4770", dark: "#0E2237" },
        // Accent — high-contrast action color
        cta: { DEFAULT: "#2F5D50", light: "#3D7567", dark: "#20453A" },
        // Neutrals
        offwhite: "#FAF8F2",
        cream: "#F2EDE2",
        sand: "#E6DFD1",
        charcoal: "#2C2C2C",
        // Semantic aliases
        royal: { DEFAULT: "#16324F", light: "#1E4770", dark: "#0E2237" },
        primary: { DEFAULT: "#16324F", light: "#1E4770", dark: "#0E2237" },
        secondary: { DEFAULT: "#C89B3C", light: "#DABB6B", dark: "#A67C1E" },
        accent: { DEFAULT: "#2F5D50", light: "#3D7567" },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-merriweather)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Display scale for headings
        "display-sm": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["2.75rem", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-xl": ["5rem", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
      },
      boxShadow: {
        book: "0 12px 24px -8px rgba(22, 50, 79, 0.30)",
        "book-lg": "0 28px 48px -14px rgba(22, 50, 79, 0.35)",
        card: "0 1px 3px rgba(22, 50, 79, 0.05), 0 10px 30px -12px rgba(22, 50, 79, 0.10)",
        "card-hover":
          "0 12px 24px -8px rgba(22, 50, 79, 0.14), 0 28px 56px -16px rgba(22, 50, 79, 0.18)",
        gold: "0 10px 26px -8px rgba(200, 155, 60, 0.45)",
        cta: "0 10px 26px -8px rgba(47, 93, 80, 0.40)",
        panel: "0 30px 60px -20px rgba(22, 50, 79, 0.20)",
        ledge: "0 18px 26px -12px rgba(22, 50, 79, 0.25)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(120deg, #A67C1E 0%, #C89B3C 35%, #DABB6B 55%, #C89B3C 75%, #A67C1E 100%)",
        "gold-sheen":
          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
        "navy-gradient":
          "linear-gradient(135deg, #0E2237 0%, #16324F 55%, #1E4770 100%)",
        "royal-gradient":
          "linear-gradient(135deg, #0E2237 0%, #16324F 55%, #1E4770 100%)",
        "cream-mesh":
          "radial-gradient(50rem 26rem at 90% -10%, rgba(200,155,60,0.15), transparent 60%), radial-gradient(36rem 22rem at -10% 110%, rgba(200,155,60,0.10), transparent 60%), linear-gradient(160deg, #FDFBF6 0%, #FAF8F2 60%, #F2EDE2 100%)",
        // Subtle paper texture for hero
        "paper-texture":
          "repeating-linear-gradient(115deg, rgba(22,50,79,0.03) 0px, rgba(22,50,79,0.03) 1px, transparent 1px, transparent 5px)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-up-slow": "fadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        sheen: "sheen 3.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        sheen: {
          "0%, 60%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "250% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
