import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AdaptiveText as Text, AccessibleTouchable as TouchableOpacity } from '../components/AccessibilityProvider';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronRight, Check, X, Shield, ChevronLeft } from 'lucide-react-native';

const SYMPTOMS = [
  { id: 'memory', text: 'Do you currently forget things often?', domain: 'memory' },
  { id: 'attention', text: 'Do you currently lose focus easily?', domain: 'attention' },
  { id: 'visuospatial', text: 'Do you currently misjudge directions or distances?', domain: 'visuospatial' },
  { id: 'executive', text: 'Do you currently struggle with planning?', domain: 'executive' },
  { id: 'language', text: 'Do you currently struggle understanding instructions?', domain: 'language' },
  { id: 'mood_anxiety', text: 'Do you currently feel anxious frequently?', domain: 'mood' },
  { id: 'mood_depression', text: 'Do you currently feel low or unmotivated?', domain: 'mood' },
  { id: 'motor', text: 'Are hand movements or coordination harder for you right now?', domain: 'motor' },
  { id: 'processing', text: 'Do you currently feel mentally slow?', domain: 'executive' },
];

const BACKGROUND = [
  { id: 'routine', text: 'Have changes in your routine recently affected your concentration?' },
  { id: 'rest', text: 'Has poor sleep recently affected your day?' },
  { id: 'tasks', text: 'Have everyday tasks recently needed more effort?' },
];

const SymptomFlowScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { startAssessment } = useData();
  const backgroundStage = route.params?.stage === 'background';
  const questions = backgroundStage ? BACKGROUND : SYMPTOMS;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { symptomId: boolean }

  const question = questions[currentQ];
  const totalQuestions = questions.length;

  const handleAnswer = (isYes) => {
    const newAnswers = { ...answers, [question.id]: isYes };
    setAnswers(newAnswers);

    if (currentQ < totalQuestions - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finishSymptomFlow(newAnswers);
    }
  };

  const finishSymptomFlow = (finalAnswers) => {
    if (backgroundStage) {
      navigation.push('SymptomFlow', { historyAnswers: finalAnswers, hasHistory: !!route.params?.hasHistory });
      return;
    }
    const current = {};
    SYMPTOMS.forEach(({ id, domain }) => {
      if (finalAnswers[id] && domain !== 'mood') current[domain] = (current[domain] || 0) + 1;
    });
    if (finalAnswers.mood_anxiety || finalAnswers.mood_depression) current.attention = (current.attention || 0) + 1;
    const assessment = startAssessment({
      hasHistory: route.params?.hasHistory,
      background: route.params?.background,
      current,
      answers: { background: route.params?.historyAnswers || {}, current: finalAnswers },
    });
    navigation.navigate('RiskAssessment', { assessment });
  };

  const progressPct = Math.round((currentQ / totalQuestions) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scroll}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.stepBadge, { backgroundColor: colors.accent + '15' }]}>
            <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>{backgroundStage ? 'BACKGROUND QUESTIONNAIRE' : 'CURRENT CONDITION'}</Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>{currentQ + 1}/{totalQuestions} QUESTIONS</Text>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>{progressPct}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        <View style={[styles.tag, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
            <Shield size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12, marginLeft: 8 }}>{backgroundStage ? 'RECENT BACKGROUND' : 'HOW YOU FEEL NOW'}</Text>
        </View>

        <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20, lineHeight: 30, textAlign: 'center' }}>
            {question.text}
          </Text>
        </View>

        <View style={styles.answerRow}>
          <TouchableOpacity
            style={[styles.ansBtn, { backgroundColor: colors.success + '12', borderColor: colors.success }]}
            onPress={() => handleAnswer(true)}
          >
            <Check size={28} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: '900', fontSize: 16, marginTop: 8 }}>YES</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ansBtn, { backgroundColor: colors.error + '12', borderColor: colors.error }]}
            onPress={() => handleAnswer(false)}
          >
            <X size={28} color={colors.error} />
            <Text style={{ color: colors.error, fontWeight: '900', fontSize: 16, marginTop: 8 }}>NO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  tag: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 24 },
  questionCard: { padding: 32, borderRadius: 24, borderWidth: 1, marginTop: 28, alignItems: 'center', minHeight: 160, justifyContent: 'center' },
  answerRow: { flexDirection: 'row', gap: 16, marginTop: 32 },
  ansBtn: { flex: 1, height: 110, borderRadius: 20, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
});

export default SymptomFlowScreen;
