import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        bg: 'var(--color-bg)',
        text: 'var(--color-text)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
        sidebarCollapsed: 'var(--sidebar-collapsed-width)',
      },
    },
  },
  plugins: [],
} satisfies Config;
