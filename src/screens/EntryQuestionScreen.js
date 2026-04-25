import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { History, Thermometer, ChevronRight, UserCircle } from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const EntryQuestionScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { speak } = useSpeech();

  useEffect(() => {
    speak("Let's get started. Do you have a condition you want to check, or would you just like a general check-up?");
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <UserCircle size={40} color={colors.primary} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>LET'S GET{"\n"}STARTED</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            To give you the best experience, we need to ask you a few questions first.
        </Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity 
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('MentalHealthHistory')}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
            <History size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>I Have a Condition</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 19 }}>
                A doctor has told me about a memory, brain, or mental health condition.
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textDisabled} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('SymptomFlow')}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.accent + '10' }]}>
            <Thermometer size={24} color={colors.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Just Check Me</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 19 }}>
                I want a general check-up, or I've been having some memory or thinking problems.
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textDisabled} />
        </TouchableOpacity>
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.primary + '05' }]}>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 18 }}>
            Don't worry — both choices will guide you through a simple set of questions.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 48 },
  options: { gap: 16 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 24, borderRadius: 28, borderWidth: 1.5 },
  iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  infoBox: { marginTop: 'auto', padding: 20, borderRadius: 16, marginBottom: 20 },
});

export default EntryQuestionScreen;
