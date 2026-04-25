import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Type, Minus, Plus, Check, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const FONT_OPTIONS = [
  { scale: 0.8, label: 'Small', description: 'Compact text, more content visible' },
  { scale: 0.9, label: 'Medium-Small', description: 'Slightly reduced size' },
  { scale: 1.0, label: 'Default', description: 'Standard text size' },
  { scale: 1.1, label: 'Medium-Large', description: 'Slightly larger for comfort' },
  { scale: 1.2, label: 'Large', description: 'Bigger text, easier to read' },
  { scale: 1.3, label: 'Extra Large', description: 'Maximum readability' },
];

const FontSizeScreen = ({ navigation, route }) => {
  const { colors, fontScale, updateFontScale, scaledFont } = useTheme();
  const { data, persist } = useData();
  const [selected, setSelected] = useState(fontScale);

  // Detect if opened from onboarding flow vs Profile
  const fromOnboarding = route.params?.fromOnboarding || false;

  const handleContinue = async () => {
    await updateFontScale(selected);
    // Also save to DataContext so useAdaptiveUI picks it up
    persist({ ...data, adaptivePrefs: { ...data.adaptivePrefs, fontSizeScale: selected } });
    if (fromOnboarding) {
      // Continue to Splash which will route to EntryQuestion
      navigation.replace('Splash');
    } else {
      // Opened from Profile: go back
      navigation.goBack();
    }
  };

  const sampleSize = (base) => Math.round(base * selected);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
            <Type size={48} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: 24, fontSize: sampleSize(24) }]}>
            CHOOSE TEXT SIZE
          </Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: sampleSize(14), marginTop: 8, lineHeight: sampleSize(22), paddingHorizontal: 20 }}>
            Choose a text size that's comfortable for you. You can change this later in your profile settings.
          </Text>
        </View>

        {/* Preview Card */}
        <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[Typography.caption, { color: colors.primary, marginBottom: 12 }]}>LIVE PREVIEW</Text>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: sampleSize(24), marginBottom: 8 }}>
            CogniScan Dashboard
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: sampleSize(14), lineHeight: sampleSize(22) }}>
            Your brain health check shows a score of 85%. All areas are looking good.
          </Text>
          <View style={[styles.previewBadge, { backgroundColor: colors.success + '15' }]}>
            <Text style={{ color: colors.success, fontSize: sampleSize(11), fontWeight: '800' }}>
              ✓ LOOKING GREAT
            </Text>
          </View>
        </View>

        {/* Size Options */}
        <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 24, marginBottom: 12 }]}>
          SELECT TEXT SIZE
        </Text>

        {FONT_OPTIONS.map((option) => {
          const isSelected = Math.abs(selected - option.scale) < 0.01;
          return (
            <TouchableOpacity
              key={option.scale}
              style={[styles.optionCard, {
                backgroundColor: isSelected ? colors.primary + '12' : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              }]}
              onPress={() => setSelected(option.scale)}
              activeOpacity={0.8}
            >
              <View style={[styles.radio, {
                borderColor: isSelected ? colors.primary : colors.textDisabled,
                backgroundColor: isSelected ? colors.primary : 'transparent',
              }]}>
                {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
                  {option.label}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {option.description}
                </Text>
              </View>
              <Text style={{ color: colors.textDisabled, fontSize: Math.round(14 * option.scale), fontWeight: '800' }}>
                Aa
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Quick Adjust */}
        <View style={[styles.quickAdjust, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.adjustBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => {
              const idx = FONT_OPTIONS.findIndex(o => Math.abs(o.scale - selected) < 0.01);
              if (idx > 0) setSelected(FONT_OPTIONS[idx - 1].scale);
            }}
          >
            <Minus size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18, flex: 1, textAlign: 'center' }}>
            {Math.round(selected * 100)}%
          </Text>
          <TouchableOpacity 
            style={[styles.adjustBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => {
              const idx = FONT_OPTIONS.findIndex(o => Math.abs(o.scale - selected) < 0.01);
              if (idx < FONT_OPTIONS.length - 1) setSelected(FONT_OPTIONS[idx + 1].scale);
            }}
          >
            <Plus size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: sampleSize(15), letterSpacing: 1.5, marginRight: 8 }}>
            CONTINUE
          </Text>
          <ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconCircle: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  previewCard: { padding: 24, borderRadius: 20, borderWidth: 1 },
  previewBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, marginBottom: 8 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  quickAdjust: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 16 },
  adjustBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 36 },
  continueBtn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default FontSizeScreen;
