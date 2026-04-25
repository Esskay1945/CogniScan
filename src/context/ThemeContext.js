import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme';

const ThemeContext = createContext();

const FONT_KEY = '@cogniscan_fontscale';
const THEME_KEY = '@cogniscan_theme';

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [fontScale, setFontScale] = useState(1.0); // 0.8, 0.9, 1.0, 1.1, 1.2, 1.3
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const savedScale = await AsyncStorage.getItem(FONT_KEY);
        if (savedScale) setFontScale(parseFloat(savedScale));
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        setIsDark(savedTheme === 'dark');
      } catch (e) { /* first run */ }
      setFontLoaded(true);
    })();
  }, []);

  const toggle = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    try { await AsyncStorage.setItem(THEME_KEY, newVal ? 'dark' : 'light'); } catch (e) {}
  };

  const updateFontScale = async (scale) => {
    setFontScale(scale);
    try { await AsyncStorage.setItem(FONT_KEY, scale.toString()); } catch (e) {}
  };

  const colors = isDark ? Colors.dark : Colors.light;
  const theme = isDark ? 'dark' : 'light';

  // Scale font sizes
  const scaledFont = (size) => Math.round(size * fontScale);

  return (
    <ThemeContext.Provider value={{ isDark, toggle, colors, theme, fontScale, updateFontScale, fontLoaded, scaledFont }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
