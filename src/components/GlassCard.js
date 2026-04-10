import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../theme';

export const GlassCard = ({ children, style, theme = 'dark' }) => {
  const colors = Colors[theme];
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: Colors.dark.surface,
        borderColor: Colors.dark.border,
      }, 
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    })
  }
});
