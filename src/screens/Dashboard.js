import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain, Zap, Eye, Clock, TrendingUp, RotateCcw, Shield, Flame } from 'lucide-react-native';

const Dashboard = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, getLatestSession, getDrift } = useData();
  const latest = getLatestSession();
  const drift = getDrift();

  const recallPct = latest?.recallScore != null ? Math.round((latest.recallScore / 3) * 100) : null;
  const reactionAvg = latest?.reactionAvg || null;
  const patternPct = latest?.patternScore != null ? Math.round((latest.patternScore / 4) * 100) : null;
  const clockPct = latest?.clockScore || null;
  const overall = [recallPct, patternPct, clockPct].filter(v => v != null);
  const overallScore = overall.length > 0 ? Math.round(overall.reduce((a, b) => a + b, 0) / overall.length) : null;

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.topRow}>
          <View>
            <Text style={{ color: Colors.dark.textSecondary, fontSize: 12, fontWeight: '600' }}>
              {data.streak > 0 ? `🔥 ${data.streak} day streak` : 'Welcome back'}
            </Text>
            <Text style={[Typography.h1, { color: Colors.dark.text }]}>
              {data.user?.name ? `Hi, ${data.user.name.split(' ')[0]}` : 'Dashboard'}
            </Text>
          </View>
        </View>

        {overallScore != null ? (
          <View style={[styles.scoreCard, { backgroundColor: Colors.dark.surface }]}>
            <View style={styles.scoreRow}>
              <View>
                <Text style={{ color: Colors.dark.textSecondary, fontSize: 11, fontWeight: '600' }}>COGNITIVE SCORE</Text>
                <Text style={{ color: Colors.dark.primary, fontWeight: '800', fontSize: 44 }}>{overallScore}</Text>
              </View>
              <View style={[styles.shieldBox, { backgroundColor: (drift.hasDrift ? colors.warning : colors.success) + '18' }]}>
                <Shield size={24} color={drift.hasDrift ? colors.warning : colors.success} />
                <Text style={{ color: drift.hasDrift ? colors.warning : colors.success, fontSize: 10, fontWeight: '700', marginTop: 2 }}>
                  {drift.hasDrift ? 'DRIFT' : 'STABLE'}
                </Text>
              </View>
            </View>
            <View style={[styles.bar, { backgroundColor: Colors.dark.border }]}>
              <View style={[styles.barFill, { width: `${overallScore}%`, backgroundColor: Colors.dark.primary }]} />
            </View>
          </View>
        ) : (
          <View style={[styles.scoreCard, { backgroundColor: Colors.dark.surface }]}>
            <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 16 }}>No assessment yet</Text>
            <Text style={{ color: Colors.dark.textSecondary, fontSize: 13, marginTop: 4 }}>Take your first cognitive test to see your score</Text>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: Colors.dark.primary }]} onPress={() => navigation.navigate('WordPresentation')} activeOpacity={0.85}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Start Assessment</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors.dark.primary }]} onPress={() => navigation.navigate('WordPresentation')} activeOpacity={0.85}>
            <RotateCcw size={20} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13, marginTop: 6 }}>Retake Tests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border, borderWidth: 1 }]} onPress={() => navigation.navigate('GamesTab')} activeOpacity={0.85}>
            <Flame size={20} color={colors.accent} />
            <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 13, marginTop: 6 }}>Brain Games</Text>
          </TouchableOpacity>
        </View>

        {latest && (
          <View>
            <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Latest Results</Text>
            {[
              { title: 'Word Recall', value: recallPct != null ? `${recallPct}%` : '—', icon: Brain, color: Colors.dark.primary },
              { title: 'Reaction Speed', value: reactionAvg ? `${reactionAvg}ms` : '—', icon: Zap, color: colors.error },
              { title: 'Pattern Memory', value: patternPct != null ? `${patternPct}%` : '—', icon: Eye, color: colors.accent },
              { title: 'Clock Test', value: clockPct != null ? `${clockPct}%` : '—', icon: Clock, color: colors.success },
            ].map((mod, i) => {
              const Icon = mod.icon;
              return (
                <View key={i} style={[styles.modRow, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border, borderWidth: 1 }]}>
                  <View style={[styles.modIcon, { backgroundColor: mod.color + '18' }]}>
                    <Icon size={20} color={mod.color} />
                  </View>
                  <Text style={{ color: Colors.dark.text, fontWeight: '600', fontSize: 14, flex: 1 }}>{mod.title}</Text>
                  <Text style={{ color: mod.color, fontWeight: '700', fontSize: 16 }}>{mod.value}</Text>
                </View>
              );
            })}
          </View>
        )}

        {data.sessions.length >= 2 && (
          <View style={[styles.driftCard, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border, borderWidth: 1 }]}>
            <TrendingUp size={18} color={drift.hasDrift ? colors.warning : colors.success} />
            <Text style={{ color: Colors.dark.text, fontWeight: '600', fontSize: 14, flex: 1, marginLeft: 12 }}>
              Drift: {drift.overall}% from baseline
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('InsightsTab')}>
              <Text style={{ color: Colors.dark.primary, fontSize: 12, fontWeight: '700' }}>Details</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  topRow: { marginBottom: 20 },
  scoreCard: { padding: 24, borderRadius: 18, marginBottom: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  shieldBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  startBtn: { height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionCard: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center' },
  modRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 8 },
  modIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  driftCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, marginTop: 12 },
});

export default Dashboard;
