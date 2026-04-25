import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme';
import { Brain, ShieldCheck, AlertTriangle, ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MentalHealthHistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity 
        style={{ position: 'absolute', top: 60, left: 24, zIndex: 10 }}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={28} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '12' }]}>
          <Brain size={56} color={colors.primary} strokeWidth={1.2} />
        </View>

        {/* Title */}
        <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: 28 }]}>
          YOUR HEALTH{"\n"}BACKGROUND
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 22, marginTop: 12, paddingHorizontal: 20 }}>
          Before we begin, we'd like to know a little about your health history.
        </Text>

        {/* Main Question Card */}
        <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.qBadge, { backgroundColor: colors.accent + '15' }]}>
            <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>STEP 1 OF 3</Text>
          </View>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17, marginTop: 12, textAlign: 'center', lineHeight: 24 }}>
            Have you ever been told you have any memory, brain, or mental health conditions?
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
            This includes things like memory problems, ADHD, depression, anxiety, or past brain injuries.
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.optionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('ConditionSelect')}
          activeOpacity={0.85}
        >
          <AlertTriangle size={20} color="#FFF" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>YES, I DO</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>I'll pick my conditions from a list</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]}
          onPress={() => navigation.navigate('SymptomFlow')}
          activeOpacity={0.85}
        >
          <ShieldCheck size={20} color={colors.success} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 15 }}>NO, NOT THAT I KNOW</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>We'll ask you some simple questions instead</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, paddingBottom: 48 },
  iconBox: { width: 110, height: 110, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  questionCard: { width: '100%', padding: 24, borderRadius: 20, borderWidth: 1, marginTop: 28, alignItems: 'center' },
  qBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  optionBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, marginTop: 12 },
});

export default MentalHealthHistoryScreen;
