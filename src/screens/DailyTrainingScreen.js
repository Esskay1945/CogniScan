import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { Typography } from '../theme';
import { 
  Flame, 
  ChevronRight, 
  Target, 
  Award,
  CirclePlay,
  CheckCircle2,
  Zap,
  BrainCircuit,
  TrendingDown
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const DailyTrainingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, generateMicroGoals, dismissDecayAlert } = useData();
  const { prefs, adaptiveStyles } = useAdaptiveUI();

  useEffect(() => {
    if ((!data.microGoals || data.microGoals.length === 0) && data.riskAssessment) {
      generateMicroGoals();
    }
    // Clear decay alert once seen
    if (data.decayAlertPending && dismissDecayAlert) {
        dismissDecayAlert();
    }
  }, []);

  // Compute next best action dynamically from actual data
  const getNextBestAction = () => {
    const risk = data.riskAssessment?.domains || {};
    const history = data.gameHistory || [];
    const weakDomain = Object.entries(risk).find(([_, v]) => v === 'high')?.[0] 
      || Object.entries(risk).find(([_, v]) => v === 'moderate')?.[0]
      || 'memory';
    const domainLabel = weakDomain.charAt(0).toUpperCase() + weakDomain.slice(1);
    
    // Check recent performance trend
    const recentGames = history.filter(g => g.category === weakDomain).slice(-5);
    let trendText = 'Focus on your weakest cognitive domain to build resilience.';
    if (recentGames.length >= 2) {
      const avg = recentGames.reduce((a, g) => a + g.score, 0) / recentGames.length;
      if (avg < 60) trendText = `Your ${weakDomain} scores are below baseline. Targeted exercises can help.`;
      else if (avg < 80) trendText = `Your ${weakDomain} performance is improving. Keep the momentum.`;
      else trendText = `${domainLabel} is strong. Maintain with regular practice sessions.`;
    }
    
    return { domain: domainLabel, subtitle: trendText };
  };
  const nextAction = getNextBestAction();

  // Gamification state
  const xp = data.xp || 0;
  const level = data.level || 1;
  const progress = (xp % 100) / 100;
  
  const streak = data.streaks?.daily || 0;
  const missions = data.dailyMissions?.tasks || [];
  const assigned = data.assignedGames || [];

  const handleGamePress = (game) => {
    navigation.navigate('ReadinessCheck', { 
        game: { id: game.id, title: game.id.replace(/([A-Z])/g, ' $1').trim() },
        isMandatory: game.status === 'mandatory' 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { padding: adaptiveStyles.container.padding }]} showsVerticalScrollIndicator={false}>
        
        {/* Top Status Bar */}
        <View style={styles.topRow}>
          <View style={[styles.statusItem, { backgroundColor: colors.surface }]}>
            <Flame size={16} color={colors.warning} />
            <Text style={{ color: colors.text, fontWeight: '900', marginLeft: 6 }}>{streak}</Text>
          </View>
          <View style={[styles.statusItem, { backgroundColor: colors.surface }]}>
            <Zap size={16} color={colors.accent} />
            <Text style={{ color: colors.text, fontWeight: '900', marginLeft: 6 }}>{xp}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SkillTree')} style={[styles.statusItem, { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }]}>
            <BrainCircuit size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '900', marginLeft: 6 }}>LEVEL {level}</Text>
          </TouchableOpacity>
        </View>

        {/* Level Progress */}
        <View style={styles.levelProgress}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '800' }}>YOUR PROGRESS</Text>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '900' }}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={[styles.barBg, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {/* Training Reminder */}
        {data.decayAlertPending && (
          <View style={[styles.alertCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30', marginBottom: 16 }]}>
              <TrendingDown size={24} color={colors.warning} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={{ color: colors.warning, fontWeight: '900', fontSize: 13 }}>TRAINING REMINDER</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>
                      It's been a while since your last session. Resume training to maintain your cognitive progress.
                  </Text>
              </View>
          </View>
        )}

        {/* Next Best Action (Predictive) */}
        <View style={[styles.predictiveCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Zap size={20} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 13, marginLeft: 12 }}>WHAT TO DO NEXT</Text>
            </View>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: adaptiveStyles.text.fontSize, marginTop: 12 }}>Train {nextAction.domain} Domain</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                {nextAction.subtitle}
            </Text>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Main', { screen: 'GamesTab' })}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 11 }}>START NOW</Text>
            </TouchableOpacity>
        </View>

        {/* Micro Goals */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>YOUR GOALS</Text>
            <View style={[styles.goalsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {(data.microGoals || []).map(goal => (
                    <View key={goal.id} style={styles.goalRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{goal.label}</Text>
                            <View style={[styles.tinyBarBg, { backgroundColor: colors.border }]}>
                                <View style={[styles.tinyBarFill, { width: `${Math.min(100, (goal.current / Math.max(goal.target, 1)) * 100)}%`, backgroundColor: colors.accent }]} />
                            </View>
                        </View>
                        <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', marginLeft: 16 }}>
                            {goal.current}/{goal.target}
                        </Text>
                    </View>
                ))}
            </View>
        </View>

        {/* Daily Missions */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>TODAY'S TASKS</Text>
            <View style={[styles.missionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {missions.map((mission) => (
                    <View key={mission.id} style={styles.missionItem}>
                        <View style={[styles.checkCircle, { borderColor: mission.completed ? colors.success : colors.border, backgroundColor: mission.completed ? colors.success + '15' : 'transparent' }]}>
                            {mission.completed && <CheckCircle2 size={14} color={colors.success} />}
                        </View>
                        <Text style={{ flex: 1, color: mission.completed ? colors.textDisabled : colors.text, fontSize: 14, marginLeft: 12, fontWeight: '600', textDecorationLine: mission.completed ? 'line-through' : 'none' }}>
                            {mission.label}
                        </Text>
                        <Text style={{ color: colors.accent, fontWeight: '900', fontSize: 11 }}>+{mission.xp} XP</Text>
                    </View>
                ))}
            </View>
        </View>

        {/* Assigned Training Path */}
        <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[Typography.caption, { color: colors.textDisabled }]}>YOUR GAMES</Text>
                <TouchableOpacity onPress={() => navigation.navigate('GamesTab')}>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>VIEW ALL</Text>
                </TouchableOpacity>
            </View>
            
            {assigned.length > 0 ? (
                assigned.map((game, index) => {
                    const isMandatory = game.status === 'mandatory';
                    return (
                        <TouchableOpacity 
                            key={`${game.id}-${index}`} 
                            style={[styles.trainingRow, { backgroundColor: colors.surface, borderColor: isMandatory && !game.completed ? colors.error + '40' : colors.border }]}
                            onPress={() => handleGamePress(game)}
                        >
                            <View style={[styles.gameIcon, { backgroundColor: isMandatory ? colors.error + '10' : colors.primary + '10' }]}>
                                {game.completed ? <CheckCircle2 size={20} color={colors.success} /> : <CirclePlay size={20} color={isMandatory ? colors.error : colors.primary} />}
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{game.id.replace(/([A-Z])/g, ' $1').trim()}</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2, textTransform: 'uppercase' }}>{game.domain} · {game.status}</Text>
                            </View>
                            {!game.completed && isMandatory && <Award size={18} color={colors.warning} />}
                            {game.completed && <Text style={{ color: colors.success, fontSize: 10, fontWeight: '900' }}>DONE</Text>}
                        </TouchableOpacity>
                    );
                })
            ) : (
                <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Target size={32} color={colors.textDisabled} />
                    <Text style={{ color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>No assigned tasks. Complete a clinical screening to generate your path.</Text>
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
  scroll: { padding: 24, paddingTop: 60 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statusItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  levelProgress: { marginBottom: 24 },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  alertCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  section: { marginBottom: 28 },
  missionCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  missionItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  trainingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  gameIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
  predictiveCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  actionBtn: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 16 },
  goalsContainer: { padding: 16, borderRadius: 24, borderWidth: 1 },
  goalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tinyBarBg: { height: 4, borderRadius: 2, marginTop: 8, width: '100%' },
  tinyBarFill: { height: '100%', borderRadius: 2 },
});

export default DailyTrainingScreen;
