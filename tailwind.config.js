/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // German-inspired Color Palette
        german: {
          black: "#000000",
          red: {
            50: "#FEF2F2",
            100: "#FEE2E2",
            200: "#FECACA",
            300: "#FCA5A5",
            400: "#F87171",
            500: "#DD0000", // German Red
            600: "#DC2626",
            700: "#B91C1C",
            800: "#991B1B",
            900: "#7F1D1D",
          },
          gold: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#FFCC02", // German Gold
            600: "#D97706",
            700: "#B45309",
            800: "#92400E",
            900: "#78350F",
          },
        },
        // Apple-inspired Neutrals
        appleGray: {
          50: "#FAFAFA",
          100: "#F5F5F7",
          200: "#E8E8ED",
          300: "#D2D2D7",
          400: "#86868B",
          500: "#6E6E73",
          600: "#515154",
          700: "#1D1D1F",
          800: "#000000",
        }, // Primary Brand Colors (Sky Blue Theme)
        primary: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9", // Sky Blue as primary
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
        },
        // Neutral Palette
        midnight: "#000000",
        slate: {
          50: "#FAFAFA",
          100: "#F5F5F7",
          200: "#E8E8ED",
          600: "#6E6E73",
          800: "#1D1D1F",
        },
        // Semantic Colors
        success: "#34C759", // Apple Green
        warning: "#FFCC02", // German Gold
        error: "#FF3B30", // Apple Red
      },
      fontFamily: {
        "sf-pro": [
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        "sf-text": [
          "SF Pro Text",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        hero: [
          "clamp(2.5rem, 5vw, 4rem)",
          { lineHeight: "1.2", fontWeight: "700" },
        ],
        "headline-lg": [
          "clamp(2rem, 4vw, 3rem)",
          { lineHeight: "1.2", fontWeight: "600" },
        ],
        "headline-md": [
          "clamp(1.5rem, 3vw, 2.25rem)",
          { lineHeight: "1.3", fontWeight: "600" },
        ],
        "headline-sm": [
          "clamp(1.25rem, 2.5vw, 1.875rem)",
          { lineHeight: "1.4", fontWeight: "600" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.7", fontWeight: "400" }],
        body: ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      boxShadow: {
        minimal: "0 1px 3px rgba(0, 0, 0, 0.1)",
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        medium:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        large:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 2s infinite",
        "gradient-move": "gradientMove 8s ease infinite",
        "partner-scroll": "partnerScroll 40s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        gradientMove: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        partnerScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backgroundSize: {
        "400%": "400%",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
