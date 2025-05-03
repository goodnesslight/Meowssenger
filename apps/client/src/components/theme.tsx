import { useLayoutEffect, useState } from 'react';

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const stored: string | null = localStorage.getItem('theme');

  if (stored === 'dark') {
    return true;
  }

  if (stored === 'light') {
    return false;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const Theme = () => {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  useLayoutEffect(() => {
    const root: HTMLElement = document.documentElement;
    const classList: DOMTokenList = root.classList;

    if (isDark) {
      classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      aria-label="Toggle theme"
      className="absolute top-4 right-20 px-2 py-1 rounded border text-xl"
    >
      {isDark ? '☀' : '🌙'}
    </button>
  );
};

export default Theme;
