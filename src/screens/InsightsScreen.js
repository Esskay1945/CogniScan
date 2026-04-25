import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { 
    Activity, Zap, Target, TrendingUp, AlertCircle, 
    Calendar, Clock, ShieldCheck, ChevronRight, BarChart, 
    Layers, Cpu, PieChart, ArrowRight
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const InsightsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { 
    data, 
    calculateDeepInsights, 
    calculateSignalReliability,
    generateMetaInsights,
  } = useData();
  const metaInsights = generateMetaInsights();
  
  const insights = calculateDeepInsights();
  const reliability = calculateSignalReliability();
  const bestTime = data.deepIntelligence?.bestTimeWindow || 'Morning (Baseline)';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
            <Activity size={24} color={colors.primary} />
            <Text style={[Typography.h1, { color: colors.text, marginLeft: 12 }]}>YOUR INSIGHTS</Text>
        </View>

        {/* Deep Predictive Projector */}
        <View style={[styles.deepCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={styles.cardHeader}>
                <Cpu size={20} color={colors.primary} />
                <Text style={[Typography.caption, { color: colors.primary, marginLeft: 8 }]}>WHAT WE EXPECT</Text>
            </View>
            <Text style={[Typography.h1, { color: colors.text, marginTop: 12 }]}>30-DAY FORECAST</Text>
            <View style={styles.projectionRow}>
                <View style={[styles.projBox, { backgroundColor: colors.background }]}>
                    <Text style={{ color: colors.textDisabled, fontSize: 10 }}>PROJECTED SCORE</Text>
                    <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '900' }}>88%</Text>
                </View>
                <ChevronRight size={20} color={colors.border} />
                <View style={[styles.projBox, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>IF ADHERENT</Text>
                    <Text style={{ color: colors.success, fontSize: 24, fontWeight: '900' }}>92%</Text>
                </View>
            </View>
            <View style={[styles.adviceBox, { backgroundColor: colors.background }]}>
                <AlertCircle size={14} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 12, lineHeight: 16 }}>
                    {insights.personalizedMessage}
                </Text>
            </View>
        </View>

        {/* Temporal Learning: Best Time to Test */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>BEST TIME TO PRACTICE</Text>
            <View style={[styles.timeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Clock size={24} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>Optimal Training Window</Text>
                    <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18, marginTop: 2 }}>{bestTime.toUpperCase()}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>
                        You tend to do best during this time of day.
                    </Text>
                </View>
            </View>
        </View>

        {/* Confidence Engine Depth */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>HOW RELIABLE ARE YOUR RESULTS</Text>
            <View style={styles.multiMetricRow}>
                <View style={[styles.metricBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ShieldCheck size={20} color={colors.success} />
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 8 }}>{insights.reliabilityScore}%</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 9 }}>RELIABILITY</Text>
                </View>
                <View style={[styles.metricBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Layers size={20} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 8 }}>{insights.sufficiency}%</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 9 }}>DATA AMOUNT</Text>
                </View>
            </View>
        </View>

        {/* Meta-Cognitive Bias Monitoring */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>SELF-AWARENESS CHECK</Text>
            <View style={[styles.biasCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>Awareness Profile</Text>
                        <Text style={{ color: insights.biasType === 'Stable' ? colors.success : colors.warning, fontWeight: '900', fontSize: 13 }}>{insights.biasType.toUpperCase()}</Text>
                    </View>
                    <PieChart size={32} color={colors.primary + '30'} />
                </View>
                <View style={[styles.biasGraph, { backgroundColor: colors.border + '30' }]}>
                    <View style={[styles.biasMarker, { left: '45%', backgroundColor: colors.primary }]} />
                    <View style={styles.biasCenterLine} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.textDisabled, fontSize: 8 }}>UNDER-CONFIDENT</Text>
                    <Text style={{ color: colors.textDisabled, fontSize: 8 }}>OVER-OPTIMISTIC</Text>
                </View>
            </View>
        </View>

        {/* Meta-Cognitive Behavioral Insights */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>THINGS WE NOTICED</Text>
            {metaInsights.map((insight, i) => {
              const sevColor = insight.severity === 'warning' ? colors.warning : insight.severity === 'moderate' ? colors.accent : colors.primary;
              return (
                <View key={i} style={[styles.insightCard, { backgroundColor: sevColor + '08', borderColor: sevColor + '20' }]}>
                  <Text style={{ fontSize: 20 }}>{insight.icon}</Text>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{insight.text}</Text>
                    <Text style={{ color: colors.textDisabled, fontSize: 10, marginTop: 2 }}>{insight.domain.toUpperCase()} · {insight.severity.toUpperCase()}</Text>
                  </View>
                </View>
              );
            })}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>MORE OPTIONS</Text>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Improvement')}>
              <TrendingUp size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>Improvement Dashboard</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Before vs After comparison</Text>
              </View>
              <ArrowRight size={16} color={colors.textDisabled} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('CaregiverDashboard')}>
              <Activity size={20} color={colors.success} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>Caregiver Dashboard</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Filtered view for caregivers</Text>
              </View>
              <ArrowRight size={16} color={colors.textDisabled} />
            </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  section: { marginBottom: 32 },
  deepCard: { padding: 20, borderRadius: 28, borderWidth: 1.5, borderLeftWidth: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  projectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, justifyContent: 'center' },
  projBox: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  adviceBox: { flexDirection: 'row', marginTop: 20, padding: 16, borderRadius: 16 },
  timeCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1 },
  multiMetricRow: { flexDirection: 'row', gap: 12 },
  metricBox: { flex: 1, padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
  biasCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  biasGraph: { height: 10, borderRadius: 5, marginVertical: 20, position: 'relative' },
  biasMarker: { width: 10, height: 10, borderRadius: 5, position: 'absolute', top: 0, zIndex: 2 },
  biasCenterLine: { width: 2, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', position: 'absolute', top: -3, left: '50%' },
  insightCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
});

export default InsightsScreen;
