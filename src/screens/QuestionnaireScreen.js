import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronRight, Check, X, AlertTriangle, Shield, ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ─── All disease-specific question sets from the spec ───
const QUESTION_SETS = {
  alzheimers: {
    title: 'Memory / Alzheimer\'s',
    color: '#0066FF',
    domains: ['memory', 'language', 'visuospatial'],
    questions: [
      { id: 'a1', text: 'Do you forget recent conversations?' },
      { id: 'a2', text: 'Do you misplace items frequently?' },
      { id: 'a3', text: 'Do you repeat the same questions?' },
      { id: 'a4', text: 'Do you struggle recalling names or words?' },
      { id: 'a5', text: 'Do you get lost in familiar places?' },
      { id: 'a6', text: 'Do you forget appointments?' },
    ],
  },
  adhd: {
    title: 'ADHD / Attention',
    color: '#FF3D00',
    domains: ['attention', 'executive'],
    questions: [
      { id: 'h1', text: 'Do you get distracted easily?' },
      { id: 'h2', text: 'Do you struggle to complete tasks?' },
      { id: 'h3', text: 'Do you forget instructions?' },
      { id: 'h4', text: 'Do you find it hard to stay focused?' },
      { id: 'h5', text: 'Do you procrastinate often?' },
      { id: 'h6', text: 'Do you feel restless?' },
    ],
  },
  depression: {
    title: 'Depression',
    color: '#9B7BFF',
    domains: ['memory', 'attention', 'executive'],
    questions: [
      { id: 'd1', text: 'Do you feel low most days?' },
      { id: 'd2', text: 'Have you lost interest in activities?' },
      { id: 'd3', text: 'Do you feel fatigued often?' },
      { id: 'd4', text: 'Do you have difficulty concentrating?' },
      { id: 'd5', text: 'Do you have sleep issues?' },
      { id: 'd6', text: 'Do you feel hopeless?' },
    ],
  },
  anxiety: {
    title: 'Anxiety',
    color: '#FFD600',
    domains: ['attention', 'executive'],
    questions: [
      { id: 'x1', text: 'Do you feel nervous frequently?' },
      { id: 'x2', text: 'Do you overthink excessively?' },
      { id: 'x3', text: 'Do you struggle to relax?' },
      { id: 'x4', text: 'Do you feel mentally overwhelmed?' },
      { id: 'x5', text: 'Do you have trouble focusing due to worry?' },
    ],
  },
  parkinsons: {
    title: 'Parkinson\'s / Motor',
    color: '#00E676',
    domains: ['motor', 'executive', 'visuospatial'],
    questions: [
      { id: 'p1', text: 'Do you experience slow movements?' },
      { id: 'p2', text: 'Do you have tremors?' },
      { id: 'p3', text: 'Do you feel stiffness in your body?' },
      { id: 'p4', text: 'Do you struggle with balance?' },
      { id: 'p5', text: 'Do you notice reduced hand coordination?' },
    ],
  },
  stroke: {
    title: 'Stroke / Brain Injury',
    color: '#FF6B9D',
    domains: ['memory', 'language', 'motor', 'attention'],
    questions: [
      { id: 's1', text: 'Do you have difficulty speaking clearly?' },
      { id: 's2', text: 'Do you struggle understanding instructions?' },
      { id: 's3', text: 'Do you experience memory gaps?' },
      { id: 's4', text: 'Do you have coordination issues?' },
      { id: 's5', text: 'Do you feel mentally slower?' },
    ],
  },
  memory_issues: {
    title: 'Memory Issues',
    color: '#00F0FF',
    domains: ['memory'],
    questions: [
      { id: 'm1', text: 'Do you forget recent conversations?' },
      { id: 'm2', text: 'Do you misplace items frequently?' },
      { id: 'm3', text: 'Do you struggle recalling names or words?' },
      { id: 'm4', text: 'Do you forget appointments?' },
      { id: 'm5', text: 'Do you have trouble learning new things?' },
    ],
  },
  learning: {
    title: 'Learning Disability',
    color: '#FF8A65',
    domains: ['language', 'attention', 'executive'],
    questions: [
      { id: 'l1', text: 'Do you struggle understanding written content?' },
      { id: 'l2', text: 'Do you find it hard to remember instructions?' },
      { id: 'l3', text: 'Do you confuse similar concepts?' },
      { id: 'l4', text: 'Do you take longer to process information?' },
      { id: 'l5', text: 'Do you struggle with problem-solving?' },
    ],
  },
};

// Test mapping by domain
const DOMAIN_TESTS = {
  memory: [
    { id: 'wordRecall', label: 'Word Recall', route: 'WordPresentation' },
    { id: 'pairedAssociate', label: 'Paired Associate Learning', route: 'PairedAssociate' },
    { id: 'storyRecall', label: 'Story Recall', route: 'StoryRecall' },
    { id: 'visualMemory', label: 'Visual Memory', route: 'VisualMemory' },
    { id: 'recognitionMemory', label: 'Recognition Memory', route: 'RecognitionMemory' },
  ],
  attention: [
    { id: 'digitSpan', label: 'Digit Span', route: 'NumberSpan' },
    { id: 'goNoGo', label: 'Continuous Attention', route: 'GoNoGo' },
    { id: 'visualSearch', label: 'Visual Search', route: 'VisualSearch' },
    { id: 'symbolMatch', label: 'Symbol Matching', route: 'DigitSymbol' },
    { id: 'trailA', label: 'Trail Making A', route: 'TrailMaking' },
  ],
  executive: [
    { id: 'stroop', label: 'Stroop Test', route: 'StroopChallenge' },
    { id: 'taskSwitch', label: 'Task Switching', route: 'RuleSwitch' },
    { id: 'planning', label: 'Planning Test', route: 'MultiStepPlanner' },
    { id: 'towerSort', label: 'Problem Solving', route: 'TowerSort' },
    { id: 'verbalFluency', label: 'Verbal Fluency', route: 'VerbalFluency' },
  ],
  language: [
    { id: 'objectNaming', label: 'Object Naming', route: 'ObjectNaming' },
    { id: 'sentenceRep', label: 'Sentence Repetition', route: 'SentenceRepetition' },
    { id: 'comprehension', label: 'Comprehension', route: 'Comprehension' },
  ],
  visuospatial: [
    { id: 'mentalRotation', label: 'Mental Rotation', route: 'MentalRotation' },
    { id: 'figureCopy', label: 'Figure Copy', route: 'MirrorPattern' },
    { id: 'clockDraw', label: 'Clock Drawing', route: 'ClockTest' },
  ],
  motor: [
    { id: 'fingerTap', label: 'Finger Tapping', route: 'FingerTapping' },
    { id: 'dragPrecision', label: 'Drag Precision', route: 'PrecisionHold' },
    { id: 'reactionSpeed', label: 'Reaction Speed', route: 'ReactionTest' },
  ],
};

const QuestionnaireScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveQuestionnaireAnswers, saveRiskAssessment } = useData();
  const conditions = route.params?.conditions || [];

  // Build flat question list from selected conditions
  const allQuestionGroups = useMemo(() => {
    return conditions
      .map(c => QUESTION_SETS[c.id])
      .filter(Boolean);
  }, [conditions]);

  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { conditionId: { questionId: boolean } }

  useEffect(() => {
    if (allQuestionGroups.length === 0) {
      console.warn('Questionnaire reached without conditions, redirecting to MentalHealthHistory');
      navigation.navigate('MentalHealthHistory');
    }
  }, [allQuestionGroups]);

  const group = allQuestionGroups[currentGroup];
  const question = group?.questions[currentQ];
  const totalQuestions = allQuestionGroups.reduce((a, g) => a + g.questions.length, 0);
  const answeredCount = Object.values(answers).reduce((a, g) => a + Object.keys(g).length, 0);

  const handleAnswer = (isYes) => {
    const condId = conditions[currentGroup]?.id;
    const newAnswers = { ...answers };
    if (!newAnswers[condId]) newAnswers[condId] = {};
    newAnswers[condId][question.id] = isYes;
    setAnswers(newAnswers);

    // Advance to next question
    if (currentQ < group.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else if (currentGroup < allQuestionGroups.length - 1) {
      setCurrentGroup(currentGroup + 1);
      setCurrentQ(0);
    } else {
      // All questions done — calculate risk
      finishQuestionnaire(newAnswers);
    }
  };

  const finishQuestionnaire = (finalAnswers) => {
    saveQuestionnaireAnswers(finalAnswers);

    // Calculate risk per domain
    const domainYesCounts = { memory: 0, attention: 0, executive: 0, language: 0, visuospatial: 0, motor: 0 };
    const domainTotalCounts = { memory: 0, attention: 0, executive: 0, language: 0, visuospatial: 0, motor: 0 };

    conditions.forEach(cond => {
      const qSet = QUESTION_SETS[cond.id];
      if (!qSet) return;
      const condAnswers = finalAnswers[cond.id] || {};
      const yesCount = Object.values(condAnswers).filter(Boolean).length;

      // Map condition's domains
      qSet.domains.forEach(domain => {
        domainYesCounts[domain] += yesCount;
        domainTotalCounts[domain] += qSet.questions.length;
      });
    });

    // Classify risk levels
    const domains = {};
    const mandatoryTests = [];

    Object.keys(domainYesCounts).forEach(domain => {
      const yes = domainYesCounts[domain];
      let risk = 'low';
      if (yes >= 3) risk = 'high';
      else if (yes >= 1) risk = 'moderate';
      domains[domain] = risk;

      // Assign tests based on risk
      const allTests = DOMAIN_TESTS[domain] || [];
      if (risk === 'high') {
        // Take 3 tests for high risk
        allTests.slice(0, 3).forEach(t => {
          if (!mandatoryTests.find(m => m.id === t.id)) mandatoryTests.push({ ...t, domain, risk });
        });
      } else if (risk === 'moderate') {
        // Take 1-2 tests for moderate
        allTests.slice(0, 2).forEach(t => {
          if (!mandatoryTests.find(m => m.id === t.id)) mandatoryTests.push({ ...t, domain, risk });
        });
      }
    });

    const assessment = { domains, mandatoryTests, domainYesCounts, domainTotalCounts };
    saveRiskAssessment(assessment);
    navigation.navigate('RiskAssessment', { assessment });
  };

  if (!group || !question) return null;

  // Progress calculation
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.stepBadge, { backgroundColor: colors.accent + '15' }]}>
            <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>STEP 3 OF 3</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>{answeredCount}/{totalQuestions} QUESTIONS</Text>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>{progressPct}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {/* Condition Tag */}
        <View style={[styles.condTag, { backgroundColor: group.color + '12', borderColor: group.color + '30' }]}>
          <View style={[styles.condDot, { backgroundColor: group.color }]} />
          <Text style={{ color: group.color, fontWeight: '800', fontSize: 12, marginLeft: 8 }}>{group.title.toUpperCase()}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 10, marginLeft: 'auto' }}>
            Q{currentQ + 1}/{group.questions.length}
          </Text>
        </View>

        {/* Question Card */}
        <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20, lineHeight: 30, textAlign: 'center' }}>
            {question.text}
          </Text>
        </View>

        {/* YES / NO Buttons */}
        <View style={styles.answerRow}>
          <TouchableOpacity
            style={[styles.ansBtn, { backgroundColor: colors.success + '12', borderColor: colors.success }]}
            onPress={() => handleAnswer(true)}
            activeOpacity={0.8}
          >
            <Check size={28} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: '900', fontSize: 16, marginTop: 8 }}>YES</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ansBtn, { backgroundColor: colors.error + '12', borderColor: colors.error }]}
            onPress={() => handleAnswer(false)}
            activeOpacity={0.8}
          >
            <X size={28} color={colors.error} />
            <Text style={{ color: colors.error, fontWeight: '900', fontSize: 16, marginTop: 8 }}>NO</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', lineHeight: 17 }}>
            Answer honestly for the most accurate risk assessment.{'\n'}Your responses determine which cognitive tests are assigned.
          </Text>
        </View>

        {/* Condition progress dots */}
        <View style={styles.condDots}>
          {allQuestionGroups.map((g, i) => (
            <View key={i} style={[styles.condProgressDot, {
              backgroundColor: i < currentGroup ? colors.success : i === currentGroup ? g.color : colors.border,
              width: i === currentGroup ? 28 : 10,
            }]} />
          ))}
        </View>

      </ScrollView>
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
  condTag: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 24 },
  condDot: { width: 10, height: 10, borderRadius: 5 },
  questionCard: { padding: 32, borderRadius: 24, borderWidth: 1, marginTop: 28, alignItems: 'center', minHeight: 160, justifyContent: 'center' },
  answerRow: { flexDirection: 'row', gap: 16, marginTop: 32 },
  ansBtn: { flex: 1, height: 110, borderRadius: 20, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  infoBox: { padding: 14, borderRadius: 12, marginTop: 24 },
  condDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 24 },
  condProgressDot: { height: 10, borderRadius: 5 },
});

export default QuestionnaireScreen;
