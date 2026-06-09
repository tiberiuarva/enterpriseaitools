import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--color-bg-primary)",
          surface: "var(--color-bg-surface)",
          card: "var(--color-bg-card)",
          "card-hover": "var(--color-bg-card-hover)",
          hover: "var(--color-bg-hover)",
          light: "var(--color-bg-light)",
        },
        accent: "var(--color-accent)",
        "accent-strong": "var(--color-accent-strong)",
        "accent-soft": "var(--color-accent-soft)",
        primary: "var(--color-accent)",
        secondary: "var(--color-accent)",
        success: "var(--color-success)",
        "success-soft": "var(--color-success-soft)",
        warning: "var(--color-warning)",
        "warning-soft": "var(--color-warning-soft)",
        danger: "var(--color-danger)",
        "danger-soft": "var(--color-danger-soft)",
        info: "var(--color-info)",
        "info-soft": "var(--color-info-soft)",
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },
        vendor: {
          azure: "var(--vendor-azure)",
          aws: "var(--vendor-aws)",
          gcp: "var(--vendor-gcp)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", '"Liberation Mono"', "monospace"],
      },
      maxWidth: {
        "7xl": "1280px",
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "14px",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
      },
    },
  },
};

export default config;
