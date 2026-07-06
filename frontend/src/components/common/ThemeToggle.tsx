import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';

interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: React.ReactNode;
}

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const MonitorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="18" height="12" x="3" y="4" rx="2" />
    <line x1="8" x2="16" y1="20" y2="20" />
    <line x1="12" x2="12" y1="16" y2="20" />
  </svg>
);

const options: ThemeOption[] = [
  { value: 'light', label: '白天', icon: <SunIcon /> },
  { value: 'dark', label: '黑夜', icon: <MoonIcon /> },
  { value: 'system', label: '系统', icon: <MonitorIcon /> },
];

/**
 * ThemeToggle — 主题切换器
 *
 * 支持 Light / Dark / System 三态切换，通过下拉菜单选择。
 * 当前激活项使用主色高亮。
 */
const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = options.find((o) => o.value === theme) || options[2];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: ThemeMode) => {
    setTheme(value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover transition-colors cursor-pointer"
        aria-label={`当前主题：${activeOption.label}，点击切换`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-sidebar-active">{activeOption.icon}</span>
        <span className="flex-1 text-left">{activeOption.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-sidebar-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-2 right-2 mb-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50"
          role="listbox"
        >
          {options.map((option) => {
            const isActive = option.value === theme;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(option.value)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary-subtle text-primary'
                    : 'text-text hover:bg-surface-elevated'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-muted'}>
                  {option.icon}
                </span>
                <span>{option.label}</span>
                {isActive && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-auto"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
