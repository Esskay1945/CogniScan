import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronRight, Check, X, Shield, ChevronLeft } from 'lucide-react-native';

const SYMPTOMS = [
  { id: 'memory', text: 'Do you forget things often?', domain: 'memory' },
  { id: 'attention', text: 'Do you lose focus easily?', domain: 'attention' },
  { id: 'visuospatial', text: 'Do you misjudge directions or distances?', domain: 'visuospatial' },
  { id: 'executive', text: 'Do you struggle with planning?', domain: 'executive' },
  { id: 'language', text: 'Do you struggle understanding instructions?', domain: 'language' },
  { id: 'mood_anxiety', text: 'Do you feel anxious frequently?', domain: 'mood' },
  { id: 'mood_depression', text: 'Do you feel low or unmotivated?', domain: 'mood' },
  { id: 'processing', text: 'Do you feel mentally slow?', domain: 'executive' },
];

const DOMAIN_TESTS = {
  memory: [
    { id: 'wordRecall', label: 'Word Recall', route: 'WordPresentation' },
    { id: 'pairedAssociate', label: 'Paired Associate Learning', route: 'PairedAssociate' },
  ],
  attention: [
    { id: 'digitSpan', label: 'Digit Span', route: 'NumberSpan' },
    { id: 'goNoGo', label: 'Continuous Attention', route: 'GoNoGo' },
  ],
  executive: [
    { id: 'stroop', label: 'Stroop Test', route: 'StroopChallenge' },
    { id: 'towerSort', label: 'Problem Solving', route: 'TowerSort' },
  ],
  language: [
    { id: 'objectNaming', label: 'Object Naming', route: 'ObjectNaming' },
  ],
  visuospatial: [
    { id: 'clockDraw', label: 'Clock Drawing', route: 'ClockTest' },
  ],
  mood: [
    // Mood symptoms map to memory/attention tests usually as they affect those
    { id: 'wordRecall', label: 'Word Recall', route: 'WordPresentation' },
    { id: 'goNoGo', label: 'Continuous Attention', route: 'GoNoGo' },
  ],
};

const SymptomFlowScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveRiskAssessment } = useData();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { symptomId: boolean }

  const question = SYMPTOMS[currentQ];
  const totalQuestions = SYMPTOMS.length;

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
    const domainYesCounts = { memory: 0, attention: 0, executive: 0, language: 0, visuospatial: 0, motor: 0, mood: 0 };
    
    SYMPTOMS.forEach(s => {
      if (finalAnswers[s.id]) {
        domainYesCounts[s.domain]++;
      }
    });

    const domains = {};
    const mandatoryTests = [];

    // Map YES answers to risk
    Object.keys(domainYesCounts).forEach(domain => {
       const yes = domainYesCounts[domain];
       let risk = 'low';
       // For simple symptom flow, even 1 YES makes it moderate
       if (yes >= 2) risk = 'high';
       else if (yes === 1) risk = 'moderate';
       
       domains[domain === 'mood' ? 'memory' : domain] = risk; // Mood impacts memory/attention

       if (risk !== 'low') {
         const tests = DOMAIN_TESTS[domain] || [];
         tests.forEach(t => {
           const existing = mandatoryTests.find(m => m.id === t.id);
           if (!existing) {
             mandatoryTests.push({ ...t, domain, risk });
           } else if (risk === 'high' && existing.risk !== 'high') {
             existing.risk = 'high';
           }
         });
       }
    });

    // Ensure at least some tests are assigned if everything was "No" (Baseline)
    if (mandatoryTests.length === 0) {
      mandatoryTests.push({ id: 'wordRecall', label: 'Word Recall', route: 'WordPresentation', domain: 'memory', risk: 'low' });
      mandatoryTests.push({ id: 'reactionSpeed', label: 'Reaction Speed', route: 'ReactionTest', domain: 'motor', risk: 'low' });
    }

    const assessment = { domains, mandatoryTests, domainYesCounts };
    saveRiskAssessment(assessment);
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
            <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>STEP 2 OF 3 · SYMPTOM FLOW</Text>
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
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12, marginLeft: 8 }}>GENERAL SCREENING</Text>
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
