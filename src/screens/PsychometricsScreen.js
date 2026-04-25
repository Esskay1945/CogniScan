import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, Shield, TrendingUp, TrendingDown, Minus, BarChart3, Check, AlertTriangle, Eye, Layers, Activity, Info, FileText } from 'lucide-react-native';

const PsychometricsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { calculatePsychometrics, calculateFairness, calculateTrajectory, getGovernanceTags, data } = useData();

  const psycho = calculatePsychometrics();
  const fairness = calculateFairness();
  const trajectory = calculateTrajectory();
  const governance = getGovernanceTags();

  const getTagColor = (tag) => tag === 'Production' ? colors.success : tag === 'Pilot' ? colors.warning : colors.accent;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>SYSTEM{'\n'}INTELLIGENCE</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Psychometrics · Fairness · Governance</Text>
          </View>
          <Shield size={24} color={colors.primary} />
        </View>

        {/* Trajectory */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={styles.cardHead}>
            <TrendingUp size={18} color={colors.primary} />
            <Text style={[Typography.caption, { color: colors.primary, marginLeft: 8 }]}>PREDICTIVE TRAJECTORY</Text>
          </View>
          <View style={styles.trajRow}>
            <View style={[styles.trajBox, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '800' }}>30-DAY</Text>
              <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '900' }}>{trajectory.projected30d ?? '—'}</Text>
            </View>
            <View style={[styles.trajBox, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '800' }}>90-DAY</Text>
              <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '900' }}>{trajectory.projected90d ?? '—'}</Text>
            </View>
            <View style={[styles.trajBox, { backgroundColor: trajectory.classification === 'Improving' ? colors.success + '15' : trajectory.classification === 'Declining' ? colors.error + '15' : colors.primary + '15' }]}>
              <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '800' }}>STATUS</Text>
              <Text style={{ color: trajectory.classification === 'Improving' ? colors.success : trajectory.classification === 'Declining' ? colors.error : colors.primary, fontSize: 12, fontWeight: '900' }}>{trajectory.classification}</Text>
            </View>
          </View>
          <View style={[styles.pathBox, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '800' }}>CRITICAL PATH</Text>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 4 }}>{trajectory.recommendation || 'Not enough data yet'}</Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '800', marginBottom: 6 }}>TOP INTERVENTIONS</Text>
            {(trajectory.interventions || []).map((t, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: 8 }} />
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Psychometrics */}
        <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 24, marginBottom: 12 }]}>PSYCHOMETRIC VALIDATION</Text>
        <View style={styles.metricsRow}>
          {[
            { label: 'TEST-RETEST\nRELIABILITY', value: `${psycho.reliability}%`, color: psycho.reliability > 70 ? colors.success : colors.warning },
            { label: 'PRACTICE\nEFFECT', value: `${psycho.practiceEffect > 0 ? '+' : ''}${psycho.practiceEffect}%`, color: psycho.practiceEffect > 10 ? colors.warning : colors.success },
            { label: 'SCORE\nCONSISTENCY', value: `${psycho.consistency}%`, color: psycho.consistency > 70 ? colors.success : colors.warning },
          ].map((m, i) => (
            <View key={i} style={[styles.metricBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: m.color, fontSize: 22, fontWeight: '900' }}>{m.value}</Text>
              <Text style={{ color: colors.textDisabled, fontSize: 8, fontWeight: '700', textAlign: 'center', marginTop: 4 }}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Calibration */}
        {Object.keys(psycho.calibration || {}).length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>CALIBRATION ADJUSTMENTS</Text>
            {Object.entries(psycho.calibration).map(([key, val]) => (
              <View key={key} style={[styles.calRow, { backgroundColor: colors.surface }]}>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>{key}</Text>
                <Text style={{ color: val > 1.0 ? colors.warning : colors.success, fontWeight: '900', fontSize: 14 }}>×{val}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Fairness */}
        <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 16, marginBottom: 12 }]}>FAIRNESS & BIAS</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: fairness.biasRisk === 'high' ? colors.error : fairness.biasRisk === 'moderate' ? colors.warning : colors.success }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800' }}>ADJUSTMENT FACTOR</Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>×{fairness.adjustmentFactor}</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: (fairness.biasRisk === 'high' ? colors.error : fairness.biasRisk === 'moderate' ? colors.warning : colors.success) + '15' }]}>
              <Text style={{ color: fairness.biasRisk === 'high' ? colors.error : fairness.biasRisk === 'moderate' ? colors.warning : colors.success, fontWeight: '900', fontSize: 10 }}>
                BIAS RISK: {fairness.biasRisk.toUpperCase()}
              </Text>
            </View>
          </View>
          {fairness.risks.length > 0 && (
            <View style={{ marginTop: 12 }}>
              {fairness.risks.map((r, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <AlertTriangle size={10} color={colors.warning} />
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 6 }}>{r}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Governance Tags */}
        <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 24, marginBottom: 12 }]}>SYSTEM GOVERNANCE</Text>
        <View style={[styles.govCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {Object.entries(governance).map(([key, val]) => (
            <View key={key} style={styles.govRow}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, flex: 1 }}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
              <View style={[styles.govTag, { backgroundColor: getTagColor(val.tag) + '15' }]}>
                <Text style={{ color: getTagColor(val.tag), fontWeight: '900', fontSize: 9 }}>{val.tag}</Text>
              </View>
              {val.validated ? <Check size={14} color={colors.success} style={{ marginLeft: 8 }} /> : <Eye size={14} color={colors.textDisabled} style={{ marginLeft: 8 }} />}
            </View>
          ))}
        </View>

        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceElevated || colors.surface }]}>
          <Info size={14} color={colors.textDisabled} />
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 8, flex: 1, lineHeight: 16 }}>
            Features tagged as Experimental or Pilot have not been clinically validated. Do not over-interpret these results.
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
  card: { padding: 20, borderRadius: 24, borderWidth: 1.5, borderLeftWidth: 6 },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  trajRow: { flexDirection: 'row', gap: 10 }, trajBox: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center' },
  pathBox: { padding: 14, borderRadius: 14, marginTop: 14 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  metricBox: { flex: 1, padding: 18, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  section: { marginBottom: 16 },
  calRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 6 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  govCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  govRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: 'rgba(128,128,128,0.1)' },
  govTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  disclaimer: { padding: 14, borderRadius: 12, flexDirection: 'row', marginTop: 24 },
});
export default PsychometricsScreen;
