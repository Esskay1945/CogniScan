import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { User, BookOpen, Globe, Laptop, Eye, ChevronRight } from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, saveOnboarding } = useData();
  const onb = data.onboarding || {};

  const [step, setStep] = useState(1);
  const { speak } = useSpeech();

  const stepMessages = {
    1: 'Step 1. Tell us your age group and education level.',
    2: 'Step 2. How comfortable are you with phones or tablets?',
    3: 'Step 3. You are all set! We will adjust the app to work best for you.',
  };

  useEffect(() => {
    speak(stepMessages[step]);
  }, [step]);
  const [profile, setProfile] = useState({
    ageBand: onb.ageBand || null,
    education: onb.education || null,
    language: onb.language || 'English',
    deviceFamiliarity: onb.deviceFamiliarity || 3,
    visionIssues: onb.visionIssues || false,
    hearingIssues: onb.hearingIssues || false,
  });

  const ageBands = ['18-35', '36-55', '55-70', '70+'];
  const eduLevels = ['Primary', 'Secondary', 'Higher', 'Specialized'];

  const canProceed = () => {
    if (step === 1) return profile.ageBand && profile.education;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;

    if (step < 3) setStep(step + 1);
    else {
      saveOnboarding(profile);
      navigation.navigate('Consent');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[Typography.caption, { color: colors.primary, letterSpacing: 2 }]}>STEP {step} OF 3</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 8 }]}>ABOUT{"\n"}YOU</Text>

        {step === 1 && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Your Age Group</Text>
            <View style={styles.grid}>
              {ageBands.map(a => (
                <TouchableOpacity 
                  key={a}
                  onPress={() => setProfile({...profile, ageBand: a})}
                  style={[styles.chip, { 
                    backgroundColor: profile.ageBand === a ? colors.primary : colors.surface,
                    borderColor: profile.ageBand === a ? colors.primary : colors.border
                  }]}
                >
                  <Text style={{ color: profile.ageBand === a ? '#FFF' : colors.text, fontWeight: '700' }}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 32 }]}>Education Level</Text>
            {eduLevels.map(e => (
               <TouchableOpacity 
               key={e}
               onPress={() => setProfile({...profile, education: e})}
               style={[styles.rowBtn, { 
                 backgroundColor: colors.surface,
                 borderColor: profile.education === e ? colors.primary : colors.border
               }]}
             >
               <BookOpen size={18} color={profile.education === e ? colors.primary : colors.textDisabled} />
               <Text style={{ color: colors.text, marginLeft: 16, fontWeight: '600' }}>{e}</Text>
             </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>How comfortable are you with phones or tablets?</Text>
            <View style={styles.slider}>
              {[1,2,3,4,5].map(v => (
                <TouchableOpacity 
                  key={v}
                  onPress={() => setProfile({...profile, deviceFamiliarity: v})}
                  style={[styles.rateCircle, { 
                    backgroundColor: profile.deviceFamiliarity === v ? colors.primary : colors.surface,
                    borderColor: colors.border
                  }]}
                >
                  <Text style={{ color: profile.deviceFamiliarity === v ? '#FFF' : colors.text }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sliderLabels}>
              <Text style={{ color: colors.textDisabled, fontSize: 10 }}>NOT AT ALL</Text>
              <Text style={{ color: colors.textDisabled, fontSize: 10 }}>VERY COMFORTABLE</Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 40 }]}>Do you need any help seeing?</Text>
            <TouchableOpacity 
               onPress={() => setProfile({...profile, visionIssues: !profile.visionIssues})}
               style={[styles.rowBtn, { backgroundColor: profile.visionIssues ? colors.primary + '10' : colors.surface }]}
             >
               <Eye size={18} color={profile.visionIssues ? colors.primary : colors.textDisabled} />
               <Text style={{ color: colors.text, marginLeft: 16, fontWeight: '600' }}>I need larger text or buttons</Text>
               <View style={[styles.toggle, { backgroundColor: profile.visionIssues ? colors.primary : colors.border }]} />
             </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
            <View style={styles.section}>
                <View style={styles.summaryCard}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                        Great! We'll set things up to work best for you. The app will adjust text size and layout based on your choices.
                    </Text>
                    <View style={[styles.preview, { backgroundColor: colors.surface }]}>
                        <Laptop size={40} color={colors.primary} />
                        <Text style={{ color: colors.text, fontWeight: '900', marginTop: 12 }}>YOU'RE ALL SET</Text>
                        <Text style={{ color: colors.success, fontSize: 11, fontWeight: '800' }}>READY TO GO</Text>
                    </View>
                </View>
            </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: canProceed() ? colors.primary : colors.surfaceElevated, opacity: canProceed() ? 1 : 0.6 }]}
          onPress={handleNext}
          activeOpacity={canProceed() ? 0.7 : 1}
        >
          <Text style={{ color: canProceed() ? '#FFF' : colors.textDisabled, fontWeight: '900', letterSpacing: 1.5 }}>
            {!canProceed() ? 'PLEASE ANSWER ABOVE' : step === 3 ? 'SAVE & CONTINUE' : 'NEXT'}
          </Text>
          {canProceed() && <ChevronRight size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  section: { marginTop: 32 },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  rowBtn: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 1.5, marginBottom: 12 },
  slider: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  rateCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  toggle: { width: 12, height: 12, borderRadius: 6, marginLeft: 'auto' },
  summaryCard: { alignItems: 'center', marginTop: 40 },
  preview: { width: '100%', padding: 40, borderRadius: 32, alignItems: 'center', marginTop: 32 },
  footer: { padding: 24, paddingBottom: 40 },
  nextBtn: { height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
});

export default OnboardingScreen;
