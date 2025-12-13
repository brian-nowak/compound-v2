'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center rounded-md bg-muted p-3">
        <div className="h-6 w-6" />
      </div>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-6 w-6" />;
      case 'dark':
        return <MoonIcon className="h-6 w-6" />;
      case 'system':
        return <ComputerDesktopIcon className="h-6 w-6" />;
      default:
        return <ComputerDesktopIcon className="h-6 w-6" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-muted p-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground md:flex-none md:justify-start md:p-2 md:px-3 transition-colors"
      aria-label="Toggle theme"
    >
      {getIcon()}
      <div className="hidden md:block">{getThemeLabel()}</div>
    </button>
  );
}
