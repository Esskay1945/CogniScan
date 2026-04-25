import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, BarChart3, Smile, Frown, Meh, Activity, CheckCircle2, Info } from 'lucide-react-native';

const OutcomeTrackingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, submitDailyOutcome } = useData();
  const outcomes = data.outcomes || {};
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (dayEasier, tasksCompleted) => {
    submitDailyOutcome({ dayEasier, tasksCompleted });
    setSubmitted(true);
  };

  const trendColor = outcomes.functionalTrend === 'improving' ? colors.success : outcomes.functionalTrend === 'declining' ? colors.error : colors.primary;
  const TrendIcon = outcomes.functionalTrend === 'improving' ? TrendingUp : outcomes.functionalTrend === 'declining' ? TrendingDown : Minus;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>LIFE IMPACT{'\n'}TRACKING</Text>
          </View>
          <Activity size={24} color={colors.primary} />
        </View>

        {/* Impact Score */}
        <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: trendColor }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>LIFE IMPACT SCORE</Text>
              <Text style={{ color: trendColor, fontSize: 42, fontWeight: '900' }}>{outcomes.lifeImpactScore || 0}%</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <TrendIcon size={28} color={trendColor} />
              <Text style={{ color: trendColor, fontSize: 10, fontWeight: '800', marginTop: 4 }}>{(outcomes.functionalTrend || 'STABLE').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Daily Report */}
        {!submitted ? (
          <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 16 }]}>TODAY'S REAL-WORLD CHECK</Text>

            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 16 }}>Did your day feel easier?</Text>
            <View style={styles.optRow}>
              <TouchableOpacity style={[styles.optCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]} onPress={() => handleSubmit(true, true)}>
                <Smile size={32} color={colors.success} />
                <Text style={{ color: colors.success, fontWeight: '800', marginTop: 8 }}>Yes!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]} onPress={() => handleSubmit(false, true)}>
                <Meh size={32} color={colors.warning} />
                <Text style={{ color: colors.warning, fontWeight: '800', marginTop: 8 }}>Same</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optCard, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]} onPress={() => handleSubmit(false, false)}>
                <Frown size={32} color={colors.error} />
                <Text style={{ color: colors.error, fontWeight: '800', marginTop: 8 }}>Harder</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.doneCard, { backgroundColor: colors.success + '10' }]}>
            <CheckCircle2 size={28} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: '800', fontSize: 15, marginTop: 10 }}>Today's report submitted!</Text>
          </View>
        )}

        {/* History */}
        <View style={styles.section}>
          <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>RECENT REPORTS ({(outcomes.dailyReports || []).length})</Text>
          {(outcomes.dailyReports || []).slice(-7).reverse().map((r, i) => (
            <View key={i} style={[styles.reportRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ fontSize: 20 }}>{r.dayEasier ? '😊' : r.tasksCompleted ? '😐' : '😟'}</Text>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>
                  {r.dayEasier ? 'Day felt easier' : r.tasksCompleted ? 'About the same' : 'Day was harder'}
                </Text>
                <Text style={{ color: colors.textDisabled, fontSize: 10 }}>{new Date(r.date).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Caregiver Observations */}
        {(outcomes.caregiverObservations || []).length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>CAREGIVER OBSERVATIONS</Text>
            {outcomes.caregiverObservations.slice(-3).reverse().map((obs, i) => (
              <View key={i} style={[styles.obsCard, { backgroundColor: colors.surface }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' }}>"{obs.text}"</Text>
                <Text style={{ color: colors.textDisabled, fontSize: 9, marginTop: 4 }}>{new Date(obs.date).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceElevated || colors.surface }]}>
          <Info size={14} color={colors.textDisabled} />
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 8, flex: 1, lineHeight: 16 }}>
            Cognitive improvement is validated ONLY when real-world outcomes also improve. This tracking ensures meaningful progress.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  scoreCard: { padding: 20, borderRadius: 24, borderWidth: 1.5, borderLeftWidth: 6, marginBottom: 24 },
  section: { marginBottom: 24 },
  optRow: { flexDirection: 'row', gap: 12 },
  optCard: { flex: 1, padding: 20, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
  doneCard: { padding: 32, borderRadius: 24, alignItems: 'center', marginBottom: 24 },
  reportRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  obsCard: { padding: 14, borderRadius: 14, marginBottom: 8 },
  disclaimer: { padding: 14, borderRadius: 12, flexDirection: 'row' },
});
export default OutcomeTrackingScreen;
