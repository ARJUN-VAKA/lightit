'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 text-gray-400 hover:text-white" /> : <Moon className="w-4 h-4 text-gray-600 hover:text-black" />}
    </button>
  );
}
