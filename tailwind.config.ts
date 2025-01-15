import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background-primary': 'var(--background-primary)',
        'background-secondary': 'var(--background-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
        'hover-color': 'var(--hover-color)',
        'accent-color': 'var(--accent-color)',
        'accent-hover': 'var(--accent-hover)',
        'success-color': 'var(--success-color)',
        'warning-color': 'var(--warning-color)',
        'error-color': 'var(--error-color)',
        'info-color': 'var(--info-color)',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
