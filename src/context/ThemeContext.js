import React, { createContext, useContext, useState } from 'react';
import { Colors } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const toggle = () => setIsDark(prev => !prev);
  const colors = isDark ? Colors.dark : Colors.light;
  const theme = isDark ? 'dark' : 'light';
  return (
    <ThemeContext.Provider value={{ isDark, toggle, colors, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
