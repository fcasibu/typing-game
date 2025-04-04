'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Keyboard } from './keyboard';
import { cn } from '@/lib/utils';

interface PlayerInputProps {
  onSubmit?: (value: string) => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  initialTheme?: 'cyberpunk' | 'arcade' | 'fantasy' | 'scifi';
  layout?: 'standard' | 'compact' | 'split';
  showThemeSelector?: boolean;
}

export function PlayerInput({
  onSubmit,
  placeholder = 'Type here...',
  maxLength = 50,
  initialTheme = 'cyberpunk',
  layout = 'standard',
  showThemeSelector = true,
}: PlayerInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [theme, setTheme] = useState(initialTheme);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Enter') {
      if (onSubmit && inputValue.trim()) {
        onSubmit(inputValue);
        setInputValue('');
      }
      return;
    }

    if (key === 'Backspace') {
      setInputValue((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'Space') {
      setInputValue((prev) => prev + ' ');
      return;
    }

    // Only add the key if we haven't reached maxLength
    if (inputValue.length < maxLength) {
      setInputValue((prev) => prev + key);
    }
  };

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setActiveKey('Enter');
        if (onSubmit && inputValue.trim()) {
          onSubmit(inputValue);
          setInputValue('');
        }
      } else if (e.key === ' ') {
        setActiveKey('Space');
        if (inputValue.length < maxLength) {
          setInputValue((prev) => prev + ' ');
        }
        e.preventDefault(); // Prevent page scroll on space
      } else if (e.key === 'Backspace') {
        setActiveKey('Backspace');
        setInputValue((prev) => prev.slice(0, -1));
      } else if (e.key.length === 1 && inputValue.length < maxLength) {
        setActiveKey(e.key.toUpperCase());
        setInputValue((prev) => prev + e.key);
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inputValue, maxLength, onSubmit]);

  // Get theme-specific input styles
  const getInputStyles = () => {
    switch (theme) {
      case 'cyberpunk':
        return 'bg-purple-950 border-fuchsia-700 text-fuchsia-300 placeholder-fuchsia-500/50 focus:ring-fuchsia-500 focus:border-fuchsia-500';
      case 'arcade':
        return 'bg-red-950 border-yellow-700 text-yellow-300 placeholder-yellow-600/50 focus:ring-yellow-500 focus:border-yellow-500';
      case 'fantasy':
        return 'bg-emerald-950 border-amber-700 text-emerald-300 placeholder-emerald-500/50 focus:ring-amber-500 focus:border-amber-500';
      case 'scifi':
        return 'bg-sky-950 border-cyan-700 text-cyan-300 placeholder-cyan-500/50 focus:ring-cyan-500 focus:border-cyan-500';
      default:
        return 'bg-purple-950 border-fuchsia-700 text-fuchsia-300 placeholder-fuchsia-500/50 focus:ring-fuchsia-500 focus:border-fuchsia-500';
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {showThemeSelector && (
        <ThemeSelector
          currentTheme={theme}
          onThemeChange={(newTheme) => setTheme(newTheme as any)}
          className="mb-4"
        />
      )}

      <label className="block mb-4 relative">
        <span className="sr-only">Type here...</span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 text-lg rounded-lg border-2 focus:outline-none focus:ring-2 transition-all',
            'shadow-[0_0_15px_rgba(0,0,0,0.2)]',
            getInputStyles(),
          )}
        />

        {/* Input glow effect based on theme */}
        <div
          className={cn(
            'absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none',
            theme === 'cyberpunk' && 'shadow-[0_0_15px_rgba(217,70,239,0.5)]',
            theme === 'arcade' && 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
            theme === 'fantasy' && 'shadow-[0_0_15px_rgba(217,119,6,0.5)]',
            theme === 'scifi' && 'shadow-[0_0_15px_rgba(6,182,212,0.5)]',
            inputValue && 'opacity-100',
          )}
        ></div>
      </label>

      <Keyboard
        onKeyPress={handleKeyPress}
        activeKey={activeKey}
        theme={theme}
        layout={layout}
      />
    </div>
  );
}
