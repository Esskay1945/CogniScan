import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Activity, Award, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ImprovementScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { getImprovementData, data } = useData();
  const improvement = getImprovementData();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>IMPROVEMENT{'\n'}DASHBOARD</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Before vs After comparison</Text>
          </View>
          <BarChart3 size={24} color={colors.primary} />
        </View>

        {!improvement ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Activity size={40} color={colors.textDisabled} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 16 }}>Not Enough Data</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              Complete at least 2 assessment sessions to see your improvement trajectory.
            </Text>
          </View>
        ) : (
          <>
            {/* Overview Card */}
            <View style={[styles.overviewCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>TOTAL SESSIONS</Text>
                  <Text style={{ color: colors.primary, fontSize: 36, fontWeight: '900' }}>{improvement.sessions}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.textDisabled, fontSize: 10 }}>First: {new Date(improvement.firstDate).toLocaleDateString()}</Text>
                  <Text style={{ color: colors.textDisabled, fontSize: 10 }}>Latest: {new Date(improvement.latestDate).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>

            {/* Metrics Comparison */}
            <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 24, marginBottom: 16 }]}>BASELINE VS CURRENT</Text>
            {improvement.metrics.map((m, i) => {
              const isPositive = m.deltaPct > 0;
              const isNeutral = m.deltaPct === 0;
              const deltaColor = isNeutral ? colors.textSecondary : isPositive ? colors.success : colors.error;
              return (
                <View key={i} style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{m.label}</Text>
                    <View style={styles.compRow}>
                      <View style={styles.compCol}>
                        <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '700' }}>BASELINE</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '800' }}>
                          {m.baseline}{m.unit || '%'}
                        </Text>
                      </View>
                      <Text style={{ color: colors.textDisabled, fontSize: 16, marginHorizontal: 12 }}>→</Text>
                      <View style={styles.compCol}>
                        <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '700' }}>CURRENT</Text>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>
                          {m.current}{m.unit || '%'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.deltaBadge, { backgroundColor: deltaColor + '15' }]}>
                    {isNeutral ? <Minus size={14} color={deltaColor} /> : isPositive ? <TrendingUp size={14} color={deltaColor} /> : <TrendingDown size={14} color={deltaColor} />}
                    <Text style={{ color: deltaColor, fontWeight: '900', fontSize: 13, marginLeft: 4 }}>
                      {isPositive ? '+' : ''}{m.deltaPct}%
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
              <Award size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>Progress Summary</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 18 }}>
                  {improvement.metrics.filter(m => m.deltaPct > 0).length > improvement.metrics.length / 2
                    ? 'Your cognitive performance is improving across most domains. Keep up the consistent training!'
                    : improvement.metrics.filter(m => m.deltaPct < 0).length > improvement.metrics.length / 2
                    ? 'Some domains show decline. Consider adjusting your training frequency and optimizing sleep/stress factors.'
                    : 'Mixed results detected. Focus on your weakest domains for targeted improvement.'}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceElevated }]}>
          <Info size={14} color={colors.textDisabled} />
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 8, flex: 1 }}>
            Improvements are relative to your personal baseline and do not constitute clinical evaluation.
          </Text>
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
  emptyCard: { padding: 40, borderRadius: 24, alignItems: 'center' },
  overviewCard: { padding: 20, borderRadius: 24, borderWidth: 1.5, borderLeftWidth: 6 },
  metricCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  compRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  compCol: { alignItems: 'center' },
  deltaBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  summaryCard: { flexDirection: 'row', padding: 18, borderRadius: 20, borderWidth: 1, marginTop: 16 },
  disclaimer: { padding: 14, borderRadius: 12, flexDirection: 'row', marginTop: 24 },
});

export default ImprovementScreen;
