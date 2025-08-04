import React from 'react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary border border-border bg-card hover:bg-accent transition"
      style={{ position: 'absolute', top: 16, right: 16 }}
    >
      {theme === 'dark' ? (
        <span role="img" aria-label="Light mode">🌞</span>
      ) : (
        <span role="img" aria-label="Dark mode">🌜</span>
      )}
    </button>
  );
};

export default ThemeToggle;
