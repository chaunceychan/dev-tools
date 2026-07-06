import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  systemTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = 'dev-tools-theme';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeClass = (theme: ThemeMode, systemTheme: 'light' | 'dark') => {
  const effective = theme === 'system' ? systemTheme : theme;
  if (effective === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored;
  }
  return 'system';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  systemTheme: 'light',

  setTheme: (theme) => {
    applyThemeClass(theme, getSystemTheme());
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    set({ theme });
  },
}));

/**
 * 初始化主题系统：
 * 1. 读取本地缓存或默认 system
 * 2. 应用有效主题到 <html>
 * 3. 监听系统主题变化，在 system 模式下自动切换
 */
export const initTheme = () => {
  if (typeof window === 'undefined') return;

  const initialTheme = getInitialTheme();
  const initialSystemTheme = getSystemTheme();

  applyThemeClass(initialTheme, initialSystemTheme);

  useThemeStore.setState({
    theme: initialTheme,
    systemTheme: initialSystemTheme,
  });

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (event: MediaQueryListEvent) => {
    const systemTheme = event.matches ? 'dark' : 'light';
    useThemeStore.setState({ systemTheme });
    const { theme } = useThemeStore.getState();
    applyThemeClass(theme, systemTheme);
  };

  mediaQuery.addEventListener('change', handleChange);
};

