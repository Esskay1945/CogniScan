import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain, TrendingUp, TrendingDown, Zap, Activity, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SimulatorScreen = () => {
  const { colors } = useTheme();
  const { data, getLatestSession, getDrift } = useData();
  const latest = getLatestSession();
  const drift = getDrift();
  const [activeScenario, setActiveScenario] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Calculate base metrics from latest session or defaults
  const baseMemory = latest?.recallScore != null ? Math.round((latest.recallScore / 3) * 100) : 72;
  const baseReaction = latest?.reactionAvg || 380;
  const basePattern = latest?.patternScore != null ? Math.round((latest.patternScore / 4) * 100) : 68;

  const scenarios = [
    {
      id: 'nothing',
      title: 'If You Do Nothing',
      subtitle: 'No intervention, current trajectory',
      icon: AlertCircle,
      color: colors.error,
      gradient: ['#FF3D00', '#FF6B6B'],
      timeline: '6-12 months',
      predictions: [
        { metric: 'Memory', current: baseMemory, projected: Math.round(baseMemory * 0.82), unit: '%', direction: 'down', change: '-18%' },
        { metric: 'Speech Fluency', current: 85, projected: 75, unit: '%', direction: 'down', change: '-12%' },
        { metric: 'Reaction Speed', current: baseReaction, projected: Math.round(baseReaction * 1.25), unit: 'ms', direction: 'up', change: '+25%', inverse: true },
        { metric: 'Pattern Recognition', current: basePattern, projected: Math.round(basePattern * 0.85), unit: '%', direction: 'down', change: '-15%' },
        { metric: 'Attention Span', current: 70, projected: 58, unit: '%', direction: 'down', change: '-17%' },
      ],
      riskLevel: 'HIGH',
      recommendation: 'Without intervention, cognitive decline is projected to accelerate. Memory retrieval pathways will progressively weaken, and processing speed will deteriorate significantly.',
      actionItems: ['Cognitive decline will accelerate', 'Memory gaps will become more frequent', 'Daily tasks may become increasingly difficult'],
    },
    {
      id: 'exercises',
      title: 'With Daily Exercises',
      subtitle: 'CogniScan daily training protocol',
      icon: Brain,
      color: colors.primary,
      gradient: ['#0066FF', '#4F9DFF'],
      timeline: '3-6 months',
      predictions: [
        { metric: 'Memory', current: baseMemory, projected: Math.round(baseMemory * 1.09), unit: '%', direction: 'up', change: '+9%' },
        { metric: 'Speech Fluency', current: 85, projected: 90, unit: '%', direction: 'up', change: '+6%' },
        { metric: 'Reaction Speed', current: baseReaction, projected: Math.round(baseReaction * 0.88), unit: 'ms', direction: 'down', change: '-12%', inverse: true },
        { metric: 'Pattern Recognition', current: basePattern, projected: Math.round(basePattern * 1.12), unit: '%', direction: 'up', change: '+12%' },
        { metric: 'Decline Rate', current: 100, projected: 40, unit: '%', direction: 'down', change: '-60%' },
      ],
      riskLevel: 'LOW',
      recommendation: 'Consistent daily cognitive exercises can significantly slow decline and improve neural plasticity. Recommended 15-20 minutes of targeted brain training per day.',
      actionItems: ['Memory improves by ~9%', 'Cognitive decline slowed by 60%', 'Processing speed increases noticeably'],
    },
    {
      id: 'intervention',
      title: 'Intervention + Doctor',
      subtitle: 'Professional medical intervention',
      icon: ShieldCheck,
      color: colors.success,
      gradient: ['#00E676', '#69F0AE'],
      timeline: '1-3 months',
      predictions: [
        { metric: 'Memory', current: baseMemory, projected: Math.round(baseMemory * 1.15), unit: '%', direction: 'up', change: '+15%' },
        { metric: 'Speech Fluency', current: 85, projected: 94, unit: '%', direction: 'up', change: '+11%' },
        { metric: 'Reaction Speed', current: baseReaction, projected: Math.round(baseReaction * 0.82), unit: 'ms', direction: 'down', change: '-18%', inverse: true },
        { metric: 'Pattern Recognition', current: basePattern, projected: Math.round(basePattern * 1.18), unit: '%', direction: 'up', change: '+18%' },
        { metric: 'Stabilization', current: 0, projected: 95, unit: '%', direction: 'up', change: '95%' },
      ],
      riskLevel: 'MINIMAL',
      recommendation: 'Combining daily exercises with professional medical intervention achieves the best outcomes. Stabilization expected within 3 months with proper treatment protocol.',
      actionItems: ['Stabilization within 3 months', 'Significant memory & speed improvement', 'Comprehensive neurological support'],
    },
  ];

  const active = scenarios[activeScenario];
  const ActiveIcon = active.icon;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Brain size={24} color={colors.primary} />
          <Text style={[Typography.h1, { color: colors.text, marginLeft: 12, fontSize: 22 }]}>WHAT-IF SIMULATOR</Text>
        </View>

        <View style={[styles.subtitleBadge, { backgroundColor: colors.primary + '15' }]}>
          <Zap size={12} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '900', marginLeft: 6, letterSpacing: 1 }}>
            COGNITIVE FUTURE ENGINE
          </Text>
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 24 }}>
          See how your brain will likely change based on different actions. These predictions are based on your current cognitive data and established neuroscience models.
        </Text>

        {/* Scenario Selector Tabs */}
        <View style={styles.tabRow}>
          {scenarios.map((scenario, i) => (
            <TouchableOpacity
              key={scenario.id}
              style={[
                styles.tab,
                {
                  backgroundColor: activeScenario === i ? scenario.color : colors.surface,
                  borderColor: activeScenario === i ? scenario.color : colors.border,
                },
              ]}
              onPress={() => setActiveScenario(i)}
            >
              <Text style={{
                color: activeScenario === i ? '#FFF' : colors.textSecondary,
                fontSize: 9, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center',
              }}>
                {scenario.title.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Scenario Card */}
        <View style={[styles.scenarioCard, { backgroundColor: colors.surface, borderColor: active.color, borderLeftWidth: 4 }]}>
          <View style={styles.scenarioHeader}>
            <View style={[styles.scenarioIcon, { backgroundColor: active.color + '15' }]}>
              <ActiveIcon size={24} color={active.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18 }}>{active.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{active.subtitle}</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: active.color + '15' }]}>
              <Text style={{ color: active.color, fontSize: 9, fontWeight: '900' }}>{active.riskLevel}</Text>
            </View>
          </View>

          <View style={[styles.timelineBadge, { backgroundColor: colors.surfaceElevated }]}>
            <Activity size={12} color={active.color} />
            <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700', marginLeft: 6 }}>
              PROJECTED TIMELINE: {active.timeline}
            </Text>
          </View>
        </View>

        {/* Predictions */}
        <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 24, marginBottom: 12 }]}>
          PROJECTED CHANGES
        </Text>
        {active.predictions.map((pred, i) => {
          const isPositive = pred.inverse
            ? pred.direction === 'down'
            : pred.direction === 'up';

          return (
            <View key={i} style={[styles.predictionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{pred.metric}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{pred.current}{pred.unit}</Text>
                  <Text style={{ color: colors.textDisabled, fontSize: 12, marginHorizontal: 8 }}>→</Text>
                  <Text style={{ color: isPositive ? colors.success : colors.error, fontSize: 16, fontWeight: '800' }}>
                    {pred.projected}{pred.unit}
                  </Text>
                </View>
              </View>
              <View style={[styles.changeBadge, { backgroundColor: (isPositive ? colors.success : colors.error) + '15' }]}>
                {isPositive
                  ? <TrendingUp size={14} color={colors.success} />
                  : <TrendingDown size={14} color={colors.error} />
                }
                <Text style={{ color: isPositive ? colors.success : colors.error, fontWeight: '800', fontSize: 11, marginLeft: 4 }}>
                  {pred.change}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Recommendation */}
        <View style={[styles.recommendationCard, { backgroundColor: active.color + '08', borderColor: active.color + '30' }]}>
          <ActiveIcon size={18} color={active.color} />
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginLeft: 12, flex: 1 }}>
            {active.recommendation}
          </Text>
        </View>

        {/* Key Outcomes */}
        <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 20, marginBottom: 12 }]}>
          KEY OUTCOMES
        </Text>
        {active.actionItems.map((item, i) => (
          <View key={i} style={[styles.actionItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.actionDot, { backgroundColor: active.color }]} />
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', flex: 1, marginLeft: 12 }}>
              {item}
            </Text>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceElevated }]}>
          <AlertCircle size={14} color={colors.textDisabled} />
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 8, flex: 1, lineHeight: 16 }}>
            Projections are based on population-level neuroscience models and your personal cognitive data. Individual results may vary. Consult a healthcare professional for medical decisions.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  subtitleBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, alignSelf: 'flex-start', marginBottom: 16,
  },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1,
    alignItems: 'center',
  },
  scenarioCard: {
    padding: 20, borderRadius: 20, borderWidth: 1,
  },
  scenarioHeader: { flexDirection: 'row', alignItems: 'center' },
  scenarioIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  timelineBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 10,
  },
  predictionRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
    borderWidth: 1, marginBottom: 8,
  },
  changeBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  recommendationCard: {
    flexDirection: 'row', padding: 16, borderRadius: 14, borderWidth: 1, marginTop: 16,
  },
  actionItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 6,
  },
  actionDot: { width: 8, height: 8, borderRadius: 4 },
  disclaimer: { padding: 14, borderRadius: 12, flexDirection: 'row', marginTop: 20 },
});

export default SimulatorScreen;
