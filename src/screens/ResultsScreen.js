import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain, Zap, Eye, Clock, Activity, ArrowRight, ShieldCheck } from 'lucide-react-native';

const ResultsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveSession } = useData();
  const {
    recallScore = 0, recallTotal = 3, elapsed = 0,
    reactionAvg, patternScore, clockScore,
  } = route.params || {};

  const recallPct = Math.round((recallScore / recallTotal) * 100);
  const reactionPct = reactionAvg ? Math.max(0, Math.min(100, Math.round(100 - (reactionAvg - 200) / 5))) : 70;
  const patternPct = patternScore != null ? Math.round((patternScore / 4) * 100) : 75;
  const clockPct = clockScore || 70;

  const modules = [
    { title: 'Word Recall', score: recallPct, icon: Brain, color: Colors.dark.primary, detail: `${recallScore}/${recallTotal} words` },
    { title: 'Reaction Speed', score: reactionPct, icon: Zap, color: colors.error, detail: reactionAvg ? `${reactionAvg}ms avg` : 'Completed' },
    { title: 'Pattern Memory', score: patternPct, icon: Eye, color: colors.accent, detail: patternScore != null ? `${patternScore}/4 patterns` : 'Completed' },
    { title: 'Clock Drawing', score: clockPct, icon: Clock, color: colors.success, detail: 'Spatial analysis' },
  ];

  const overall = Math.round(modules.reduce((a, m) => a + m.score, 0) / modules.length);

  useEffect(() => {
    saveSession({
      reactionAvg: reactionAvg || 350,
      patternScore: patternScore ?? 3,
      recallScore,
      clockScore: clockScore || 70,
      elapsed,
    });
  }, []);

  const getGrade = (s) => {
    if (s >= 85) return { label: 'CRITICAL STABILITY', color: colors.success };
    if (s >= 65) return { label: 'OPTIMAL SYNC', color: Colors.dark.primary };
    if (s >= 45) return { label: 'LOW LATENCY', color: colors.warning };
    return { label: 'SYNC DISRUPTION', color: colors.error };
  };

  const grade = getGrade(overall);

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Text style={{ color: Colors.dark.textSecondary, textAlign: 'center', fontSize: 11, fontWeight: '800', marginTop: 56, letterSpacing: 2 }}>
          PROTOCOL COMPLETE
        </Text>
        <Text style={[Typography.h1, { color: Colors.dark.text, textAlign: 'center', marginTop: 8 }]}>DIAGNOSTIC REPORT</Text>

        <View style={[styles.heroCard, { backgroundColor: Colors.dark.surface, borderColor: grade.color }]}>
          <Text style={{ color: grade.color, fontWeight: '900', fontSize: 52 }}>{overall}</Text>
          <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 14, marginTop: 4 }}>NEURO-SYNC SCORE</Text>
          <View style={[styles.gradePill, { backgroundColor: grade.color + '15', borderColor: grade.color, borderWidth: 1 }]}>
            <Text style={{ color: grade.color, fontWeight: '900', fontSize: 10, letterSpacing: 1 }}>{grade.label}</Text>
          </View>
          <View style={[styles.bar, { backgroundColor: Colors.dark.border }]}>
            <View style={[styles.barFill, { width: `${overall}%`, backgroundColor: grade.color }]} />
          </View>
        </View>

        {modules.map((mod, i) => {
          const Icon = mod.icon;
          const g = getGrade(mod.score);
          return (
            <View key={i} style={[styles.modRow, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }]}>
              <View style={[styles.modIcon, { backgroundColor: mod.color + '10' }]}>
                <Icon size={20} color={mod.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 15 }}>{mod.title}</Text>
                <Text style={{ color: Colors.dark.textSecondary, fontSize: 11, marginTop: 2 }}>{mod.detail}</Text>
              </View>
              <Text style={{ color: g.color, fontWeight: '900', fontSize: 18 }}>{mod.score}%</Text>
            </View>
          );
        })}

        <View style={[styles.insightCard, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }]}>
          <ShieldCheck size={18} color={Colors.dark.primary} />
          <Text style={{ color: Colors.dark.textSecondary, fontSize: 12, marginLeft: 12, flex: 1, lineHeight: 18 }}>
            Digital Twin synchronized with current behavioral data. Protocols updated for longitudinal drift analysis.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: Colors.dark.primary }]} 
          onPress={() => navigation.replace('Main')} 
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14, marginRight: 12, letterSpacing: 1.5 }}>
            UPLOAD & RE-SYNC
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
  insightCard: { flexDirection: 'row', padding: 16, borderRadius: 16, marginVertical: 12, borderWidth: 1 },
  btn: { flexDirection: 'row', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
});

export default ResultsScreen;
