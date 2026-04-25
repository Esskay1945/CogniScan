import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

// ─── GLOBAL ADAPTIVE UI ENGINE ───
// Bridges ThemeContext (FontSizeScreen) and DataContext (AccessibilitySetup/CareMode)
// to produce a single unified accessibility state for all screens.
export const useAdaptiveUI = () => {
  const { data } = useData();
  const { fontScale: themeFontScale } = useTheme();

  const prefs = data.adaptivePrefs || {
    fontSizeScale: 1.0,
    oneTaskMode: false,
    voiceGuidance: false,
    clutterFree: false,
    elderMode: false,
  };
  const careMode = data.careMode?.enabled || false;
  const elderMode = prefs.elderMode || false;

  // Font scale priority chain:
  // 1. Care Mode or Elder Mode → force minimum 1.4x
  // 2. DataContext fontSizeScale (from AccessibilitySetup/CareMode toggles)
  // 3. ThemeContext fontScale (from FontSizeScreen on first launch)
  // Use the LARGEST of all active sources
  const baseFontScale = Math.max(prefs.fontSizeScale || 1.0, themeFontScale || 1.0);
  const fontScale = (elderMode || careMode) ? Math.max(1.4, baseFontScale) : baseFontScale;

  const oneTaskMode = careMode || elderMode || prefs.oneTaskMode || false;
  const clutterFree = careMode || elderMode || prefs.clutterFree || false;
  const voiceAssist = prefs.voiceGuidance || false;

  const adaptiveStyles = useMemo(() => ({
    // Typography
    text: { fontSize: Math.round(16 * fontScale) },
    textSmall: { fontSize: Math.round(12 * fontScale) },
    textCaption: { fontSize: Math.round(10 * fontScale) },
    h1: { fontSize: Math.round(24 * fontScale) },
    h2: { fontSize: Math.round(20 * fontScale) },
    h3: { fontSize: Math.round(17 * fontScale) },
    label: { fontSize: Math.round(14 * fontScale) },

    // Interactive elements
    button: {
      padding: Math.round(16 * fontScale),
      minHeight: Math.round(58 * fontScale),
      borderRadius: Math.round(16 * fontScale),
    },
    buttonText: { fontSize: Math.round(14 * fontScale) },
    touchTarget: {
      minWidth: Math.round(48 * fontScale),
      minHeight: Math.round(48 * fontScale),
    },

    // Layout
    container: {
      padding: clutterFree ? 32 : 24,
    },
    card: {
      padding: Math.round(20 * fontScale),
      borderRadius: Math.round(24 * fontScale),
    },
    gap: Math.round(12 * fontScale),

    // Game-specific
    gameTarget: {
      width: Math.round(60 * fontScale),
      height: Math.round(60 * fontScale),
      borderRadius: Math.round(16 * fontScale),
    },
    gameGrid: {
      gap: Math.round(8 * fontScale),
    },
  }), [fontScale, clutterFree]);

  // Scaling utility for arbitrary values
  const scale = (value) => Math.round(value * fontScale);

  return {
    prefs,
    adaptiveStyles,
    fontScale,
    oneTaskMode,
    clutterFree,
    voiceAssist,
    careMode,
    elderMode,
    scale,
  };
};
