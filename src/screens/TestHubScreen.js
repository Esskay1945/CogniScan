import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Zap, Brain, Eye, Clock, Mic, ChevronRight, Check, Shield, Activity, MessageSquare, Move } from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const TEST_METADATA = {
  reaction: { icon: Zap, color: '#FF3D00', route: 'ReactionTest', title: 'Reaction Speed', desc: 'Tap targets as fast as possible', tutorial: 'Tap targets as they appear. Measures processing speed.' },
  pattern: { icon: Eye, color: '#00F0FF', route: 'PatternTest', title: 'Pattern Memory', desc: 'Reproduce grid patterns', tutorial: 'Remember and tap the cells that were highlighted.' },
  clock: { icon: Clock, color: '#00E676', route: 'ClockTest', title: 'Clock Drawing', desc: 'Spatial & time setting', tutorial: 'Place numbers and set hands on a clock face.' },
  speech: { icon: Mic, color: '#9B7BFF', route: 'SpeechTest', title: 'Speech Rhythm', desc: 'Vocal analysis', tutorial: 'Read phrases aloud to analyze speech patterns.' },
  recall: { icon: Brain, color: '#0066FF', route: 'DelayedRecall', title: 'Delayed Recall', desc: 'Memory retention', tutorial: 'Recall the 3 words from the beginning.' },
  
  // Mandatory tests from domain mapping
  wordRecall: { icon: Brain, color: '#0066FF', route: 'WordPresentation', title: 'Word Recall', desc: 'Immediate memory', tutorial: 'Memorize and recall 5 words immediately.' },
  pairedAssociate: { icon: Brain, color: '#0066FF', route: 'PairedAssociate', title: 'Paired Learning', desc: 'Associative memory', tutorial: 'Memorize pairs of related words and recall the match.' },
  storyRecall: { icon: Brain, color: '#0066FF', route: 'StoryRecall', title: 'Story Recall', desc: 'Narrative memory', tutorial: 'Listen to a short story and answer recall questions.' },
  visualMemory: { icon: Eye, color: '#00F0FF', route: 'VisualMemory', title: 'Visual Memory', desc: 'Iconic memory', tutorial: 'Identify previously shown shapes among distractors.' },
  recognitionMemory: { icon: Brain, color: '#0066FF', route: 'RecognitionMemory', title: 'Recognition', desc: 'Memory validation', tutorial: 'Distinguish targets from new interference items.' },
  
  digitSpan: { icon: Activity, color: '#FF3D00', route: 'NumberSpan', title: 'Digit Span', desc: 'Working memory', tutorial: 'Repeat numbers forward and backward.' },
  goNoGo: { icon: Zap, color: '#FF3D00', route: 'GoNoGo', title: 'Go / No-Go', desc: 'Attention inhibition', tutorial: 'Only tap on "GO" signals, ignore "No-Go".' },
  visualSearch: { icon: Eye, color: '#00F0FF', route: 'VisualSearch', title: 'Visual Search', desc: 'Visual attention', tutorial: 'Find the target item among distractors.' },
  trailA: { icon: Activity, color: '#00E676', route: 'TrailMaking', title: 'Trail Making', desc: 'Attention sequence', tutorial: 'Connect numbers in ascending order.' },
  
  stroop: { icon: Eye, color: '#FFD600', route: 'StroopChallenge', title: 'Stroop Test', desc: 'Executive function', tutorial: 'Identify the ink color, not the word text.' },
  towerSort: { icon: Activity, color: '#00E676', route: 'TowerSort', title: 'Problem Solving', desc: 'Spatial planning', tutorial: 'Move the tower of discs with planning rules.' },
  verbalFluency: { icon: MessageSquare, color: '#9B7BFF', route: 'VerbalFluency', title: 'Verbal Fluency', desc: 'Executive language', tutorial: 'Generate as many words as possible starting with a letter.' },
  
  objectNaming: { icon: MessageSquare, color: '#9B7BFF', route: 'ObjectNaming', title: 'Object Naming', desc: 'Language access', tutorial: 'Identify and name the objects shown.' },
  sentenceRep: { icon: MessageSquare, color: '#9B7BFF', route: 'SentenceRepetition', title: 'Sentence Rep', desc: 'Phone-loop memory', tutorial: 'Repeat complex sentences exactly as heard.' },
  
  mentalRotation: { icon: Move, color: '#00F0FF', route: 'MentalRotation', title: 'Mental Rotation', desc: 'Spatial reasoning', tutorial: 'Determine if rotated shapes are identical or mirrored.' },
  fingerTap: { icon: Activity, color: '#00E676', route: 'FingerTapping', title: 'Finger Tapping', desc: 'Motor speed', tutorial: 'Tap a target as many times as possible in 10s.' },
  symbolMatch: { icon: Zap, color: '#FFD600', route: 'DigitSymbol', title: 'Symbol Matching', desc: 'Processing speed', tutorial: 'Match symbols to digits quickly.' },
};

const TestHubScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { data, getAssessmentProgress, markAssessmentCompleted } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow || false;
  
  // Get assessment details if in mandatory flow
  const assessment = getAssessmentProgress();
  
  const testSequence = useMemo(() => {
    if (isMandatoryFlow && assessment.tests.length > 0) {
      return assessment.tests.map(t => ({
        ...TEST_METADATA[t.id] || { id: t.id, title: t.label, desc: t.domain, icon: Activity, color: colors.primary, route: t.route, tutorial: 'Complete the assigned brain activity.' },
        id: t.id,
      }));
    }
    
    // Default sequence — includes Word Recall as first step
    return [
      { id: 'wordRecall', icon: Brain, color: '#0066FF', route: 'WordPresentation', title: 'Word Memorization', desc: 'Remember 3 words', tutorial: 'You will be shown 3 words. Memorize them for later recall.' },
      { id: 'reaction', ...TEST_METADATA.reaction },
      { id: 'pattern', ...TEST_METADATA.pattern },
      { id: 'clock', ...TEST_METADATA.clock },
      { id: 'speech', ...TEST_METADATA.speech },
      { id: 'recall', ...TEST_METADATA.recall },
    ];
  }, [isMandatoryFlow, assessment.tests, colors.primary]);

  const completed = useMemo(() => {
    const set = new Set();
    const scores = isMandatoryFlow ? assessment.scores : {};
    
    const params = route.params || {};
    
    // Accumulate from params
    if (params.reactionAvg != null) set.add('reaction');
    if (params.patternScore != null) set.add('pattern');
    if (params.clockScore != null) set.add('clock');
    if (params.speechScore != null) set.add('speech');
    if (params.recallScore != null) set.add('recall');
    if (params.completedTest) set.add(params.completedTest);
    
    if (params._completedTests) {
      params._completedTests.forEach(id => set.add(id));
    }

    // Accumulate from store (mandatory flow)
    Object.keys(scores).forEach(id => set.add(id));
    
    return set;
  }, [route.params, assessment.scores, isMandatoryFlow]);

  const nextTest = testSequence.find(t => !completed.has(t.id));
  const allDone = !nextTest;
  const completedList = Array.from(completed);

  const handleContinue = () => {
    if (allDone) {
      if (isMandatoryFlow) {
        navigation.navigate('AssessmentResults');
      } else {
        navigation.navigate('Results', { ...route.params, _completedTests: completedList });
      }
      return;
    }

    navigation.navigate(nextTest.route, {
      ...route.params,
      _completedTests: completedList,
      testId: nextTest.id,
      isMandatoryFlow
    });
  };

  const { speak } = useSpeech();

  useEffect(() => {
    const msg = isMandatoryFlow 
      ? 'These activities were chosen for you based on your answers.'
      : 'Complete each activity one by one. Take your time, there is no rush.';
    speak(msg);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={28} color={colors.primary} />
          <Text style={[Typography.h1, { color: colors.text, marginLeft: 12 }]}>
            {isMandatoryFlow ? 'MANDATORY TESTS' : 'ASSESSMENT'}
          </Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 24 }}>
          {isMandatoryFlow 
            ? 'These activities were chosen for you based on your answers.' 
            : 'Complete each activity one by one. Take your time — there is no rush.'}
        </Text>

        {testSequence.map((test, index) => {
          const Icon = test.icon;
          const isDone = completed.has(test.id);
          const isCurrent = nextTest?.id === test.id;
          const isLocked = !isDone && !isCurrent;

          return (
            <View key={test.id} style={{ marginBottom: 12 }}>
              {index > 0 && (
                <View style={{ alignItems: 'center', marginBottom: -4, marginTop: -4 }}>
                  <View style={{ width: 2, height: 16, backgroundColor: isDone || isCurrent ? colors.primary + '30' : colors.border }} />
                </View>
              )}

              <View style={[styles.testCard, {
                backgroundColor: isCurrent ? colors.primary + '08' : colors.surface,
                borderColor: isDone ? colors.success : isCurrent ? colors.primary : colors.border,
                borderWidth: isCurrent ? 2 : 1,
              }]}>
                <View style={[styles.stepCircle, {
                  backgroundColor: isDone ? colors.success : isCurrent ? colors.primary : colors.surfaceElevated,
                }]}>
                  {isDone ? <Check size={16} color="#FFF" strokeWidth={3} /> : <Text style={{ color: isCurrent ? '#FFF' : colors.textDisabled, fontWeight: '900', fontSize: 13 }}>{index + 1}</Text>}
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: isDone ? colors.success : isLocked ? colors.textDisabled : colors.text, fontWeight: '800', fontSize: 15 }}>{test.title}</Text>
                    <Icon size={18} color={isDone ? colors.success : isLocked ? colors.textDisabled : test.color} />
                  </View>
                  <Text style={{ color: isLocked ? colors.textDisabled : colors.textSecondary, fontSize: 12, marginTop: 4 }}>{test.desc}</Text>
                  
                  {isCurrent && (
                    <View style={[styles.tutorialBox, { backgroundColor: colors.surfaceElevated }]}>
                      <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800', marginBottom: 4 }}>💡 INSTRUCTIONS</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 11, lineHeight: 17 }}>{test.tutorial}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.continueBtn, { backgroundColor: allDone ? colors.success : colors.primary }]} onPress={handleContinue}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1.5, marginRight: 8 }}>
            {allDone ? 'FINISH' : `START: ${nextTest?.title.toUpperCase()}`}
          </Text>
          <ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  testCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderRadius: 16 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  tutorialBox: { padding: 12, borderRadius: 10, marginTop: 10 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 36 },
  continueBtn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default TestHubScreen;
