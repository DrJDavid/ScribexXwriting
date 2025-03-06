import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Synthwave palette
        synthwave: {
          background: "#121212",
          surface: "#1e1e1e",
          primary: "#6320ee",
          secondary: "#1c77c3",
          accent: "#39ff14",
          pink: "#ff3864",
          cyan: "#00fff5",
          purple: "#9d00ff",
          yellow: "#ffdf00",
        },
        // Botanical futurism palette
        botanical: {
          background: "#1a2f23",
          surface: "#2d4438",
          primary: "#3cb371",
          secondary: "#8b4513",
          accent: "#ffd700",
          leaf: "#3cb371",
          wood: "#8b4513",
          water: "#64dfdf",
          flower: "#ff7e67",
          earth: "#684e32",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(10px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "0.9" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "leaf-sway": {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        "grow-fade": {
          "0%": { transform: "scale(0.95)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Synthwave-specific animations
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "flicker": {
          "0%": { opacity: "1" },
          "2%": { opacity: "0.4" },
          "4%": { opacity: "1" },
          "8%": { opacity: "0.8" },
          "70%": { opacity: "0.8" },
          "80%": { opacity: "1" },
          "84%": { opacity: "0.6" },
          "87%": { opacity: "1" },
          "91%": { opacity: "0.2" },
          "92%": { opacity: "0.8" },
          "100%": { opacity: "1" },
        },
        "glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        "neon-pulse": {
          "0%": { textShadow: "0 0 5px #39ff14, 0 0 10px #39ff14" },
          "50%": { textShadow: "0 0 20px #39ff14, 0 0 30px #39ff14, 0 0 40px #39ff14" },
          "100%": { textShadow: "0 0 5px #39ff14, 0 0 10px #39ff14" },
        },
        "grid-move": {
          "0%": { backgroundPosition: "0px 0px" },
          "100%": { backgroundPosition: "50px 50px" },
        },
        "synthwave-horizon": {
          "0%": { transform: "translateZ(0)" },
          "100%": { transform: "translateZ(50px)" },
        },
        // Botanical futurism animations
        "grow": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "leaf-unfold": {
          "0%": { transform: "scale(0.1) rotate(-90deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "dappled-light": {
          "0%": { opacity: "0.3" },
          "25%": { opacity: "0.6" },
          "50%": { opacity: "0.3" },
          "75%": { opacity: "0.6" },
          "100%": { opacity: "0.3" },
        },
        "branch-sway": {
          "0%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(1deg) translateY(5px)" },
          "50%": { transform: "rotate(0deg)" },
          "75%": { transform: "rotate(-1deg) translateY(-5px)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "water-ripple": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-slow": "gradient-shift 8s ease infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "float-slow-reverse": "float-reverse 7s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "shimmer": "shimmer 2.5s infinite linear",
        "leaf-sway": "leaf-sway 3s ease-in-out infinite",
        "grow-fade": "grow-fade 0.5s ease-out forwards",
        // Synthwave animations
        "scanline": "scanline 3s linear infinite",
        "flicker": "flicker 5s linear infinite",
        "glitch": "glitch 200ms ease-in-out infinite",
        "glitch-once": "glitch 300ms ease-in-out 1",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "grid-move": "grid-move 3s linear infinite",
        "synthwave-horizon": "synthwave-horizon 5s ease-in-out infinite alternate",
        // Botanical animations
        "grow": "grow 1s ease-out forwards",
        "leaf-unfold": "leaf-unfold 1.5s ease-out forwards",
        "dappled-light": "dappled-light 10s ease-in-out infinite",
        "branch-sway": "branch-sway 8s ease-in-out infinite",
        "water-ripple": "water-ripple 2s ease-out infinite",
      },
      backgroundSize: {
        "300%": "300% 300%",
        "200%": "200% 200%",
        "400%": "400% 400%",
      },
      boxShadow: {
        'neon-green': '0 0 5px #39ff14, 0 0 10px #39ff14, 0 0 15px #39ff14',
        'neon-pink': '0 0 5px #ff3864, 0 0 10px #ff3864, 0 0 15px #ff3864',
        'neon-blue': '0 0 5px #00fff5, 0 0 10px #00fff5, 0 0 15px #00fff5',
        'neon-purple': '0 0 5px #9d00ff, 0 0 10px #9d00ff, 0 0 15px #9d00ff',
        'leaf': '0 0 20px rgba(60, 179, 113, 0.4)',
        'water': '0 0 20px rgba(100, 223, 223, 0.4)',
      },
      textShadow: {
        'neon-green': '0 0 5px #39ff14, 0 0 10px #39ff14',
        'neon-pink': '0 0 5px #ff3864, 0 0 10px #ff3864',
        'neon-blue': '0 0 5px #00fff5, 0 0 10px #00fff5',
        'neon-purple': '0 0 5px #9d00ff, 0 0 10px #9d00ff',
      },
      backgroundImage: {
        'synthwave-grid': 'linear-gradient(to right, rgba(57, 255, 20, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(57, 255, 20, 0.15) 1px, transparent 1px)',
        'synthwave-horizon': 'linear-gradient(0deg, #ff3864 0%, #6320ee 60%, #1e1e1e 100%)',
        'cyberpunk-gradient': 'linear-gradient(90deg, #9d00ff, #6320ee)',
        'neon-text-gradient': 'linear-gradient(90deg, #ff3864, #6320ee, #00fff5)',
        'botanical-gradient': 'linear-gradient(to bottom, #1a2f23, #2d4438)',
        'meadow-gradient': 'linear-gradient(to right, #3cb371, #64dfdf)',
        'leaf-pattern': 'radial-gradient(circle at 10% 20%, rgba(60, 179, 113, 0.05) 0%, transparent 20%), radial-gradient(circle at 30% 70%, rgba(60, 179, 113, 0.05) 0%, transparent 20%), radial-gradient(circle at 55% 35%, rgba(60, 179, 113, 0.05) 0%, transparent 20%), radial-gradient(circle at 70% 80%, rgba(60, 179, 113, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 10%, rgba(60, 179, 113, 0.05) 0%, transparent 20%)',
      },
      gridTemplateColumns: {
        'redi-map': 'repeat(8, minmax(80px, 1fr))',
      },
      gridTemplateRows: {
        'redi-map': 'repeat(8, minmax(80px, 1fr))',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
