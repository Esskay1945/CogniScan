import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ShieldCheck, UserPlus, Database, ChevronRight, Lock } from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const ConsentScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveConsent } = useData();
  const { speak } = useSpeech();

  useEffect(() => {
    speak("Your privacy. You are in control. Choose what you are comfortable sharing.");
  }, []);

  const [flags, setFlags] = useState({
    passiveTracking: false,
    caregiverSharing: false,
    researchData: true,
  });

  const handleFinish = () => {
    saveConsent(flags);
    navigation.navigate('AccessibilitySetup', { fromOnboarding: true });
  };

  const ConsentItem = ({ id, title, desc, icon: Icon }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
        <Icon size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 18 }}>{desc}</Text>
      </View>
      <Switch 
        value={flags[id]} 
        onValueChange={(val) => setFlags({...flags, [id]: val})}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFF"
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
            <ShieldCheck size={32} color={colors.success} />
            <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>YOUR{"\n"}PRIVACY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 22 }}>
                You're in control. Choose what you're comfortable sharing.
            </Text>
        </View>

        <View style={styles.section}>
            <ConsentItem 
                id="passiveTracking"
                title="Track How I Use the App"
                desc="Lets us notice patterns in how you use the app, so we can spot changes early."
                icon={Database}
            />
            <ConsentItem 
                id="caregiverSharing"
                title="Share With Family"
                desc="Let a trusted family member get alerts if we notice big changes in your results."
                icon={UserPlus}
            />
            <ConsentItem 
                id="researchData"
                title="Help Improve CogniScan"
                desc="Share your data (without your name) to help researchers understand brain health better."
                icon={Lock}
            />
        </View>

        <View style={[styles.disclaimer, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.textDisabled, fontSize: 10, lineHeight: 16, textAlign: 'center' }}>
                By continuing, you agree to let us use your data as described above. We will never sell your personal information.
            </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={handleFinish}
        >
          <Text style={{ color: '#FFF', fontWeight: '900', letterSpacing: 1.5 }}>AGREE & CONTINUE</Text>
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
  disclaimer: { marginTop: 40, padding: 20, borderRadius: 16 },
  footer: { padding: 24, paddingBottom: 40 },
  nextBtn: { height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
});

export default ConsentScreen;
