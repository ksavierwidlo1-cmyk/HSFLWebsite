'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'ocean';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      applyTheme(stored);
    } else {
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'midnight', 'forest', 'sunset', 'ocean');
    
    // Apply new theme
    if (newTheme !== 'light') {
      document.documentElement.classList.add(newTheme);
      // All non-light themes use the 'dark' class for base dark mode styling
      if (!document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
      }
    }
    
    // Apply theme-specific CSS variables
    const root = document.documentElement;
    switch (newTheme) {
      case 'light':
        root.style.setProperty('--bg-primary', '255, 255, 255');
        root.style.setProperty('--bg-secondary', '249, 250, 251');
        root.style.setProperty('--text-primary', '17, 24, 39');
        root.style.setProperty('--text-secondary', '107, 114, 128');
        break;
      case 'dark':
        root.style.setProperty('--bg-primary', '31, 41, 55');
        root.style.setProperty('--bg-secondary', '17, 24, 39');
        root.style.setProperty('--text-primary', '255, 255, 255');
        root.style.setProperty('--text-secondary', '156, 163, 175');
        break;
      case 'midnight':
        root.style.setProperty('--bg-primary', '23, 37, 84');
        root.style.setProperty('--bg-secondary', '15, 23, 42');
        root.style.setProperty('--text-primary', '255, 255, 255');
        root.style.setProperty('--text-secondary', '148, 163, 184');
        break;
      case 'forest':
        root.style.setProperty('--bg-primary', '20, 83, 45');
        root.style.setProperty('--bg-secondary', '5, 46, 22');
        root.style.setProperty('--text-primary', '255, 255, 255');
        root.style.setProperty('--text-secondary', '134, 239, 172');
        break;
      case 'sunset':
        root.style.setProperty('--bg-primary', '124, 45, 18');
        root.style.setProperty('--bg-secondary', '67, 20, 7');
        root.style.setProperty('--text-primary', '255, 255, 255');
        root.style.setProperty('--text-secondary', '254, 215, 170');
        break;
      case 'ocean':
        root.style.setProperty('--bg-primary', '22, 78, 99');
        root.style.setProperty('--bg-secondary', '8, 51, 68');
        root.style.setProperty('--text-primary', '255, 255, 255');
        root.style.setProperty('--text-secondary', '165, 243, 252');
        break;
    }
  };

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
