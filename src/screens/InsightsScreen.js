import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  BrainCircuit, 
  AlertCircle, 
  Cpu,
  Microscope
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const InsightsScreen = () => {
  const { colors } = useTheme();
  const { data, getDrift, getRecovery, getLatestSession } = useData();
  const drift = getDrift();
  const recovery = getRecovery();
  const latest = getLatestSession();
  const baseline = data.baseline;

  const MetricComparison = ({ label, current, baseline, unit = '%', inverse = false }) => {
    const diff = current - baseline;
    const isDecline = inverse ? diff > 0 : diff < 0;
    
    return (
      <View style={[styles.metricRow, { backgroundColor: Colors.dark.surfaceElevated }]}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.caption, { color: Colors.dark.textSecondary, fontSize: 10 }]}>{label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
            <Text style={{ color: Colors.dark.text, fontWeight: '800', fontSize: 18 }}>{current}{unit}</Text>
            <Text style={{ color: Colors.dark.textDisabled, fontSize: 12, marginLeft: 8 }}>VS. {baseline}{unit} BASELINE</Text>
          </View>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: isDecline ? colors.error + '20' : colors.success + '20' }]}>
          {isDecline ? <TrendingDown size={14} color={colors.error} /> : <TrendingUp size={14} color={colors.success} />}
          <Text style={{ color: isDecline ? colors.error : colors.success, fontWeight: '800', fontSize: 10, marginLeft: 4 }}>
            {Math.abs(diff).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Microscope size={24} color={Colors.dark.primary} />
          <Text style={[Typography.h1, { color: Colors.dark.text, marginLeft: 12 }]}>NEURO-ANALYSIS</Text>
        </View>

        {/* Digital Twin Profile */}
        <View style={[styles.twinCard, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.primary }]}>
          <View style={styles.cardHeader}>
            <Cpu size={20} color={Colors.dark.primary} />
            <Text style={[Typography.caption, { color: Colors.dark.primary, marginLeft: 8 }]}>Cognitive Digital Twin Active</Text>
          </View>
          <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 20, marginTop: 12 }}>BASELINE SYNCED</Text>
          <Text style={{ color: Colors.dark.textSecondary, fontSize: 13, marginTop: 4 }}>
            Performance delta calculated against n=1 longitudinal behavior.
          </Text>
          <View style={styles.twinDots}>
            <View style={[styles.twinDot, { backgroundColor: Colors.dark.success }]} />
            <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800', marginLeft: 6 }}>BIOMETRIC STABLE</Text>
          </View>
        </View>

        {/* Drift Engine */}
        <Text style={[Typography.caption, { color: Colors.dark.textDisabled, marginTop: 24, marginBottom: 12 }]}>DEVIATION SCAN (DRIFT ENGINE)</Text>
        {data.baselineSet ? (
          <View style={styles.driftSection}>
            <MetricComparison 
              label="Working Memory (Recall)" 
              current={latest ? Math.round((latest.recallScore / 3) * 100) : 0} 
              baseline={Math.round((baseline.recallScore / 3) * 100)} 
            />
            <MetricComparison 
              label="Spatial Organization (Clock)" 
              current={latest?.clockScore || 0} 
              baseline={baseline.clockScore || 0} 
            />
            <MetricComparison 
              label="Reaction Latency (Reflex)" 
              current={latest?.reactionAvg || 0} 
              baseline={baseline.reactionAvg || 0} 
              unit="ms"
              inverse={true}
            />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <AlertCircle size={24} color={Colors.dark.textDisabled} />
            <Text style={{ color: Colors.dark.textSecondary, marginTop: 8 }}>Initialize baseline assessment to enable drift analysis.</Text>
          </View>
        )}

        {/* AI Interpretation */}
        <Text style={[Typography.caption, { color: Colors.dark.textDisabled, marginTop: 24, marginBottom: 12 }]}>EXPLAINABLE AI INSIGHTS</Text>
        <View style={[styles.card, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }]}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Activity size={20} color={drift.hasDrift ? colors.warning : colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 16 }}>
                {drift.hasDrift ? 'Significant Drift Detected' : 'Longitudinal Stability'}
              </Text>
              <Text style={{ color: Colors.dark.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 20 }}>
                {drift.hasDrift 
                  ? `Anomalous pattern identified in ${drift.details.recall > 10 ? 'memory retrieval' : 'processing speed'}. Deviation of ${drift.overall}% from twin baseline.`
                  : "All cognitive signals currently align with historical behavior. No intervention protocol required."
                }
              </Text>
            </View>
          </View>
          
          {drift.hasDrift && (
            <View style={[styles.protocolBox, { backgroundColor: Colors.dark.warning + '10' }]}>
              <ShieldCheck size={16} color={colors.warning} />
              <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 11, marginLeft: 8 }}>
                RECOVERY PROTOCOL: TIER 2
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  twinCard: { padding: 20, borderRadius: 16, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  twinDots: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  twinDot: { width: 8, height: 8, borderRadius: 4 },
  driftSection: { gap: 12 },
  metricRow: { padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  emptyCard: { padding: 32, borderRadius: 16, backgroundColor: Colors.dark.surface, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.dark.border },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  protocolBox: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12, borderRadius: 8 },
});

export default InsightsScreen;
