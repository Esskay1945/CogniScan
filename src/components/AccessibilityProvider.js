import React, { createContext, useContext } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';

const AccessibilityContext = createContext({ fontScale: 1, clutterFree: false });

export const useAccessibility = () => useContext(AccessibilityContext);

export function AccessibilityProvider({ children }) {
  const settings = useAdaptiveUI();
  return <AccessibilityContext.Provider value={settings}>{children}</AccessibilityContext.Provider>;
}

export function AdaptiveText({ style, priority = 'primary', children, ...props }) {
  const { fontScale, clutterFree } = useAccessibility();
  if (clutterFree && priority === 'tertiary') return null;
  const flattened = StyleSheet.flatten(style) || {};
  const scaledStyle = {
    fontSize: Math.round((flattened.fontSize ?? 14) * fontScale),
    ...(flattened.lineHeight ? { lineHeight: Math.round(flattened.lineHeight * fontScale) } : {}),
  };
  return <Text style={[style, scaledStyle]} {...props}>{children}</Text>;
}

export function AccessibleTouchable({ children, ...props }) {
  return <TouchableOpacity accessibilityRole="button" hitSlop={6} {...props}>{children}</TouchableOpacity>;
}
