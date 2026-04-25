import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain, Zap, Eye, Clock, Activity, ArrowRight, ShieldCheck, Mic } from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const ResultsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { 
    saveSession, 
    data, 
    assignGamesFromResults,
    markAssessmentCompleted
  } = useData();
  const {
    recallScore = 0, recallTotal = 3, elapsed = 0,
    reactionAvg, patternScore, clockScore, speechScore,
  } = route.params || {};

  const recallPct = Math.round((recallScore / recallTotal) * 100);
  const reactionPct = reactionAvg ? Math.max(0, Math.min(100, Math.round(100 - (reactionAvg - 200) / 5))) : 70;
  const patternPct = patternScore != null ? Math.round((patternScore / 4) * 100) : 75;
  const clockPct = clockScore || 70;
  const speechPct = speechScore || 70;

  const modules = [
    { title: 'Word Recall', score: recallPct, icon: Brain, color: colors.primary, detail: `${recallScore}/${recallTotal} words`, weight: 20 },
    { title: 'Reaction Speed', score: reactionPct, icon: Zap, color: colors.error, detail: reactionAvg ? `${reactionAvg}ms avg` : 'Completed', weight: 20 },
    { title: 'Pattern Memory', score: patternPct, icon: Eye, color: colors.accent, detail: patternScore != null ? `${patternScore}/4 patterns` : 'Completed', weight: 20 },
    { title: 'Clock Drawing', score: clockPct, icon: Clock, color: colors.success, detail: 'Spatial analysis', weight: 20 },
    { title: 'Speech Rhythm', score: speechPct, icon: Mic, color: '#9B7BFF', detail: 'Fluency & rhythm', weight: 20 },
  ];

  // Summary-based scoring: weighted sum of individual scores instead of simple average
  const totalWeight = modules.reduce((a, m) => a + m.weight, 0);
  const overall = Math.round(modules.reduce((a, m) => a + (m.score * m.weight), 0) / totalWeight);
  const sessionSaved = React.useRef(false);

  useEffect(() => {
    if (sessionSaved.current) return;
    sessionSaved.current = true;
    
    const session = {
      reactionAvg: reactionAvg || 350,
      patternScore: patternScore ?? 3,
      recallScore,
      clockScore: clockScore || 70,
      speechScore: speechScore || 70,
      elapsed,
    };

    // Build ALL state mutations at once, then persist exactly once
    // This avoids the race condition from nested setTimeout chains
    // where each persist() call would overwrite the previous one
    const newSessions = [...data.sessions, { ...session, date: new Date().toISOString() }];
    
    let newBaseline = { ...data.baseline };
    let baselineSet = data.baselineSet;
    if (!data.baselineSet) {
      newBaseline = {
        reactionAvg: session.reactionAvg,
        patternScore: session.patternScore,
        recallScore: session.recallScore,
        clockScore: session.clockScore,
        speechScore: session.speechScore,
      };
      baselineSet = true;
    }

    // Build risk assessment if none exists (default flow)
    let riskAssessment = data.riskAssessment;
    if (!riskAssessment) {
      riskAssessment = {
        domains: {
          memory: recallPct < 70 ? 'moderate' : 'low',
          attention: patternPct < 70 ? 'moderate' : 'low',
          executive: reactionPct < 70 ? 'moderate' : 'low',
          language: speechPct < 70 ? 'moderate' : 'low',
          visuospatial: clockPct < 70 ? 'moderate' : 'low',
          motor: 'low'
        },
        mandatoryTests: [],
      };
    }

    // Single atomic persist — no race conditions
    saveSession({
      ...session,
      _batchOverrides: {
        riskAssessment,
        assessmentCompleted: true,
        lastSessionDate: new Date().toDateString(),
        baseline: newBaseline,
        baselineSet,
      },
    });
    // NOTE: markAssessmentCompleted() was previously called here in a setTimeout,
    // but it caused a race condition that overwrote the session data with stale state.
    // The _batchOverrides above already sets assessmentCompleted: true atomically.
  }, []);

  // Watch for riskAssessment to be populated, then assign games
  useEffect(() => {
    if (data.riskAssessment && (!data.assignedGames || data.assignedGames.length === 0)) {
      assignGamesFromResults();
    }
  }, [data.riskAssessment]);

  const getGrade = (s) => {
    if (s >= 85) return { label: 'EXCELLENT', color: colors.success };
    if (s >= 65) return { label: 'GOOD', color: colors.primary };
    if (s >= 45) return { label: 'FAIR', color: colors.warning };
    return { label: 'NEEDS ATTENTION', color: colors.error };
  };

  const grade = getGrade(overall);

  const { speak } = useSpeech();
  useEffect(() => {
    speak(`All done! Your brain score is ${overall} out of 100. That is ${grade.label.toLowerCase()}. Your results have been saved.`);
  }, [overall]);

  // Determine priority areas for game recommendations
  const weakAreas = modules
    .filter(m => m.score < 65)
    .sort((a, b) => a.score - b.score);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 11, fontWeight: '800', marginTop: 56, letterSpacing: 2 }}>
          ALL DONE!
        </Text>
        <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: 8 }]}>YOUR RESULTS</Text>

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: grade.color }]}>
          <Text style={{ color: grade.color, fontWeight: '900', fontSize: 52 }}>{overall}</Text>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginTop: 4 }}>YOUR BRAIN SCORE</Text>
          <View style={[styles.gradePill, { backgroundColor: grade.color + '15', borderColor: grade.color, borderWidth: 1 }]}>
            <Text style={{ color: grade.color, fontWeight: '900', fontSize: 10, letterSpacing: 1 }}>{grade.label}</Text>
          </View>
          <View style={[styles.bar, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: `${overall}%`, backgroundColor: grade.color }]} />
          </View>
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginTop: 12 }}>
            Each area is worth {modules[0].weight}% of your total score
          </Text>
        </View>

        {modules.map((mod, i) => {
          const Icon = mod.icon;
          const g = getGrade(mod.score);
          return (
            <View key={i} style={[styles.modRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.modIcon, { backgroundColor: mod.color + '10' }]}>
                <Icon size={20} color={mod.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{mod.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{mod.detail}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: g.color, fontWeight: '900', fontSize: 18 }}>{mod.score}%</Text>
                <Text style={{ color: colors.textDisabled, fontSize: 8, fontWeight: '600' }}>×{mod.weight}%</Text>
              </View>
            </View>
          );
        })}

        {/* Priority Areas */}
        {weakAreas.length > 0 && (
          <View style={[styles.priorityCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}>
            <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>
              ⚠ AREAS TO WORK ON
            </Text>
            {weakAreas.map((area, i) => (
              <Text key={i} style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 20 }}>
                • {area.title}: {area.score}% — needs focused training
              </Text>
            ))}
          </View>
        )}

        <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ShieldCheck size={18} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 12, flex: 1, lineHeight: 18 }}>
            Your results have been saved. We'll use these to track your progress over time and recommend the best brain exercises for you.
          </Text>
        </View>

        <View style={[styles.priorityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10, lineHeight: 16, textAlign: 'center', fontStyle: 'italic' }}>
            ⚕️ CogniScan is a wellness screening tool, not a medical diagnostic device. These results do not constitute a clinical diagnosis. Please consult a healthcare professional for medical advice.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary }]} 
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'GameAssignment' }] })} 
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14, marginRight: 12, letterSpacing: 1.5 }}>
            SEE MY PLAN
          </Text>
          <ArrowRight size={18} color="#FFF" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  heroCard: { alignItems: 'center', padding: 32, borderRadius: 24, marginVertical: 24, borderWidth: 1, borderTopWidth: 4 },
  gradePill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  bar: { height: 4, borderRadius: 2, overflow: 'hidden', width: '100%', marginTop: 24 },
  barFill: { height: '100%' },
  modRow: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  modIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  priorityCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginVertical: 12 },
  insightCard: { flexDirection: 'row', padding: 16, borderRadius: 16, marginVertical: 12, borderWidth: 1 },
  btn: { flexDirection: 'row', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
});

export default ResultsScreen;
