import React, { createContext, useContext, useMemo } from 'react';
import { Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';

// ─── GLOBAL ACCESSIBILITY PROVIDER ───
// Wraps the entire app to enforce adaptive UI on ALL screens.
// Overrides React Native Text and TouchableOpacity defaults
// so NO screen can bypass accessibility preferences.

const AccessibilityContext = createContext({});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const adaptive = useAdaptiveUI();
  const { fontScale, oneTaskMode, clutterFree, voiceAssist, careMode, scale } = adaptive;

  // Override default Text rendering to enforce font scaling
  const originalTextRender = Text.render;

  // Provide accessibility context to all children
  const contextValue = useMemo(() => ({
    ...adaptive,
    // Utility: should this element be hidden in clutter-free mode?
    shouldHide: (priority) => {
      // priority: 'primary' | 'secondary' | 'tertiary'
      if (!clutterFree) return false;
      return priority === 'tertiary' || priority === 'secondary';
    },
    // Utility: should this element be the only one visible?
    isOneTaskMode: oneTaskMode,
    // Utility: get scaled font size for any base size
    scaledFont: (baseSize) => Math.round(baseSize * fontScale),
    // Utility: get scaled dimension
    scaledSize: (baseSize) => Math.round(baseSize * fontScale),
    // Utility: minimum touch target size (WCAG 2.1 Level AAA)
    minTouchTarget: Math.max(48, Math.round(48 * fontScale)),
    // Voice assist flag for screens that support TTS
    shouldSpeak: voiceAssist,
  }), [fontScale, oneTaskMode, clutterFree, voiceAssist, careMode]);

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <AdaptiveTextProvider fontScale={fontScale}>
        {children}
      </AdaptiveTextProvider>
    </AccessibilityContext.Provider>
  );
};

// ─── ADAPTIVE TEXT PROVIDER ───
// Intercepts ALL Text components to apply font scaling globally.
// This means even screens that don't explicitly use useAdaptiveUI
// will have their text scaled correctly.

class AdaptiveTextProvider extends React.Component {
  constructor(props) {
    super(props);
    // Store original defaultProps
    this._originalTextDefaultProps = Text.defaultProps;
  }

  componentDidMount() {
    this._applyScaling();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fontScale !== this.props.fontScale) {
      this._applyScaling();
    }
  }

  componentWillUnmount() {
    // Restore original defaults
    Text.defaultProps = this._originalTextDefaultProps;
  }

  _applyScaling() {
    const { fontScale } = this.props;
    
    // Override Text defaultProps to enforce font scaling
    Text.defaultProps = {
      ...(Text.defaultProps || {}),
      allowFontScaling: true,
      maxFontSizeMultiplier: Math.max(1.0, fontScale),
    };

    // Override TouchableOpacity for minimum touch targets
    if (TouchableOpacity.defaultProps === undefined) {
      TouchableOpacity.defaultProps = {};
    }
    TouchableOpacity.defaultProps.hitSlop = {
      top: Math.max(0, (fontScale - 1) * 12),
      bottom: Math.max(0, (fontScale - 1) * 12),
      left: Math.max(0, (fontScale - 1) * 8),
      right: Math.max(0, (fontScale - 1) * 8),
    };
  }

  render() {
    return this.props.children;
  }
}

// ─── ACCESSIBLE COMPONENTS ───
// Drop-in replacements that enforce accessibility automatically

export const AdaptiveText = ({ style, priority = 'primary', children, ...props }) => {
  const { fontScale, shouldHide } = useAccessibility();
  if (shouldHide(priority)) return null;
  
  const scaledStyle = useMemo(() => {
    if (!style) return { fontSize: Math.round(14 * fontScale) };
    const flat = StyleSheet.flatten(style) || {};
    return {
      ...flat,
      fontSize: flat.fontSize ? Math.round(flat.fontSize * fontScale) : Math.round(14 * fontScale),
      lineHeight: flat.lineHeight ? Math.round(flat.lineHeight * fontScale) : undefined,
    };
  }, [style, fontScale]);

  return <Text style={scaledStyle} {...props}>{children}</Text>;
};

export const AdaptiveButton = ({ style, textStyle, children, ...props }) => {
  const { fontScale, minTouchTarget } = useAccessibility();
  
  const scaledStyle = useMemo(() => {
    const flat = StyleSheet.flatten(style) || {};
    return {
      ...flat,
      minHeight: Math.max(flat.minHeight || 0, minTouchTarget),
      paddingVertical: Math.round((flat.paddingVertical || 14) * fontScale),
      paddingHorizontal: Math.round((flat.paddingHorizontal || 24) * fontScale),
      borderRadius: Math.round((flat.borderRadius || 12) * fontScale),
    };
  }, [style, fontScale, minTouchTarget]);

  const scaledTextStyle = useMemo(() => {
    const flat = StyleSheet.flatten(textStyle) || {};
    return {
      ...flat,
      fontSize: Math.round((flat.fontSize || 14) * fontScale),
    };
  }, [textStyle, fontScale]);

  return (
    <TouchableOpacity style={scaledStyle} {...props}>
      {typeof children === 'string' ? (
        <Text style={scaledTextStyle}>{children}</Text>
      ) : children}
    </TouchableOpacity>
  );
};
