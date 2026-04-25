import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Settings, Eye, Volume2, Layout, Sliders, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const AccessibilitySetupScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { data, persist } = useData();
  const prefs = data.adaptivePrefs || {};
  const { speak } = useSpeech();

  // Detect if opened from onboarding flow vs Profile
  const fromOnboarding = route.params?.fromOnboarding || false;

  useEffect(() => {
    speak('Choose any options below to make the app easier and more comfortable to use.');
  }, []);

  const handleFinish = () => {
    if (fromOnboarding) {
      // Continue onboarding flow: go to FontSize next
      navigation.navigate('FontSize', { fromOnboarding: true });
    } else {
      // Opened from Profile or elsewhere: just go back
      navigation.goBack();
    }
  };

  const togglePref = (key) => {
    persist({ ...data, adaptivePrefs: { ...prefs, [key]: !prefs[key] } });
  };

  const SettingItem = ({ id, title, desc, icon: Icon }) => (
    <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.surface, borderColor: prefs[id] ? colors.primary : colors.border }]}
        onPress={() => togglePref(id)}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
        <Icon size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>{desc}</Text>
      </View>
      <View style={[styles.checkbox, { backgroundColor: prefs[id] ? colors.primary : 'transparent', borderColor: colors.border }]}>
        {prefs[id] && <View style={styles.checkInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Back Button - only show when opened from Profile, not during onboarding */}
        {!fromOnboarding && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
            <ChevronLeft size={28} color={colors.text} />
          </TouchableOpacity>
        )}

        <View style={styles.header}>
            <Settings size={32} color={colors.primary} />
            <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>MAKE IT{"\n"}EASIER</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 22 }}>
                Choose any options below to make the app easier and more comfortable to use.
            </Text>
        </View>

        <View style={styles.section}>
            <SettingItem 
                id="elderMode"
                title="Bigger Text & Buttons"
                desc="Makes all text at least 40% larger and hides extra info. Easier to read and tap."
                icon={Eye}
            />
            <SettingItem 
                id="voiceGuidance"
                title="Read Aloud"
                desc="The app reads screens and instructions out loud as you navigate."
                icon={Volume2}
            />
            <SettingItem 
                id="oneTaskMode"
                title="Simple View"
                desc="Hides advanced features like Family Reports, Caregiver View, and Improvement cards."
                icon={Layout}
            />
            <SettingItem 
                id="clutterFree"
                title="Less Clutter"
                desc="Removes streaks, XP points, and extra cards from your Dashboard."
                icon={Sliders}
            />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={handleFinish}
        >
          <Text style={{ color: '#FFF', fontWeight: '900', letterSpacing: 1.5 }}>SAVE & CONTINUE</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  section: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1.5 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  footer: { padding: 24, paddingBottom: 40 },
  nextBtn: { height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
});

export default AccessibilitySetupScreen;
