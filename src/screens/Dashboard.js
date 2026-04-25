import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, Alert } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import ReConsentModal from '../components/ReConsentModal';
import { Brain, Zap, Eye, Clock, TrendingUp, TrendingDown, RotateCcw, Shield, Flame, UserCircle2, Mic, Activity, ChevronRight, Users, Check, BarChart3, Heart, Pill, HelpCircle } from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const Dashboard = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, getLatestSession, getDrift, getTodayStreakProgress, isReConsentNeeded } = useData();
  const { prefs, adaptiveStyles, clutterFree, oneTaskMode } = useAdaptiveUI();
  const [showReConsent, setShowReConsent] = useState(false);
  const { speak } = useSpeech();
  const latest = getLatestSession();
  const drift = getDrift();
  const streakProgress = getTodayStreakProgress();

  const recallPct = latest?.recallScore != null ? Math.round((latest.recallScore / 3) * 100) : null;
  const reactionAvg = latest?.reactionAvg || null;
  const patternPct = latest?.patternScore != null ? Math.round((latest.patternScore / 4) * 100) : null;
  const clockPct = latest?.clockScore || null;
  const speechPct = latest?.speechScore || null;
  
  // Reaction score (lower ms = better, convert to 0-100 scale)
  const reactionPct = reactionAvg ? Math.max(0, Math.min(100, Math.round(100 - ((reactionAvg - 200) / 6)))) : null;
  
  const allScores = [recallPct, patternPct, clockPct, speechPct, reactionPct].filter(v => v != null);
  const overallScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  useEffect(() => {
    if (isReConsentNeeded()) setShowReConsent(true);
    // Welcome announcement with TTS
    const name = data.user?.name?.split(' ')[0] || '';
    if (overallScore != null) {
      speak(`Welcome back${name ? ', ' + name : ''}. Your brain score is ${overallScore} out of 100.`);
    } else {
      speak(`Welcome${name ? ', ' + name : ''}. Take a quick brain check to see your score.`);
    }
  }, []);

  // Prevent hardware back button from going back to testing screens
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Exit App?', 'Do you want to close CogniScan?', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', onPress: () => BackHandler.exitApp() },
      ]);
      return true; // Prevent default back behavior
    });
    return () => backHandler.remove();
  }, []);

  const getScoreColor = (s) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return colors.primary;
    if (s >= 40) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (s) => {
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 55) return 'Fair';
    if (s >= 40) return 'Below Average';
    return 'Needs Attention';
  };

  const modules = [
    { title: 'Word Recall', value: recallPct, detail: recallPct != null ? `${latest.recallScore}/3 words` : null, icon: Brain, color: '#0066FF' },
    { title: 'Reaction Speed', value: reactionPct, detail: reactionAvg ? `${reactionAvg}ms avg` : null, icon: Zap, color: '#FF3D00' },
    { title: 'Pattern Memory', value: patternPct, detail: patternPct != null ? `${latest.patternScore}/4 patterns` : null, icon: Eye, color: '#00F0FF' },
    { title: 'Clock Drawing', value: clockPct, detail: clockPct != null ? `${clockPct}% accuracy` : null, icon: Clock, color: '#00E676' },
    { title: 'Speech Rhythm', value: speechPct, detail: speechPct != null ? `${speechPct}% fluency` : null, icon: Mic, color: '#9B7BFF' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ReConsentModal visible={showReConsent} onDismiss={() => setShowReConsent(false)} />
      <ScrollView contentContainerStyle={[styles.scroll, { padding: adaptiveStyles.container.padding }]} showsVerticalScrollIndicator={false}>

        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                {data.streak > 0 ? `🔥 ${data.streak} day streak` : 'Welcome back'}
              </Text>
              {!clutterFree && (
                <View style={[styles.xpBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Zap size={10} color={colors.accent} />
                  <Text style={{ color: colors.accent, fontSize: 9, fontWeight: '900', marginLeft: 4 }}>{data.xp || 0} XP</Text>
                </View>
              )}
            </View>
            <Text style={[Typography.h1, { color: colors.text, marginTop: 4, fontSize: adaptiveStyles.h1.fontSize }]}>
              {data.user?.name ? `Hi, ${data.user.name.split(' ')[0]}` : 'Dashboard'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.profileBtn, { backgroundColor: colors.surface }]} 
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <View style={[styles.levelCorner, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '900' }}>{data.level || 1}</Text>
            </View>
            <UserCircle2 size={32} color={colors.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {overallScore != null ? (
          <View style={[styles.scoreCard, { backgroundColor: colors.surface }]}>
            <View style={styles.scoreRow}>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>YOUR BRAIN SCORE</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                  <Text style={{ color: getScoreColor(overallScore), fontWeight: '900', fontSize: 52 }}>{overallScore}</Text>
                  <Text style={{ color: colors.textDisabled, fontSize: 16, fontWeight: '600', marginLeft: 4 }}>/100</Text>
                </View>
                <View style={[styles.labelBadge, { backgroundColor: getScoreColor(overallScore) + '18' }]}>
                  <Text style={{ color: getScoreColor(overallScore), fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
                    {getScoreLabel(overallScore)}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.shieldBox, { backgroundColor: (drift.hasDrift ? colors.warning : colors.success) + '18' }]}>
                  <Shield size={24} color={drift.hasDrift ? colors.warning : colors.success} />
                </View>
                <Text style={{ color: drift.hasDrift ? colors.warning : colors.success, fontSize: 9, fontWeight: '800', marginTop: 4 }}>
                  {drift.hasDrift ? 'DRIFT' : 'STABLE'}
                </Text>
              </View>
            </View>
            <View style={[styles.bar, { backgroundColor: colors.border }]}>
              <View style={[styles.barFill, { width: `${overallScore}%`, backgroundColor: getScoreColor(overallScore) }]} />
            </View>
            <Text style={{ color: colors.textDisabled, fontSize: 10, marginTop: 8 }}>
              Based on {allScores.length} areas tested · {data.sessions.length} session{data.sessions.length !== 1 ? 's' : ''} total
            </Text>
          </View>
        ) : (
          <View style={[styles.scoreCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
              <Brain size={32} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginTop: 16 }}>Ready to Begin?</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              Take a quick brain check to see how your memory, attention, and thinking are doing.
            </Text>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('ReadinessCheck', { game: { id: 'TestHub' } })} activeOpacity={0.85}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 1 }}>START CHECK-UP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Streak Progress — hidden in clutter-free mode */}
        {!clutterFree && (
        <View style={[styles.streakSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Flame size={18} color={colors.error} />
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14, marginLeft: 8 }}>Daily Streak</Text>
            </View>
            <Text style={{ color: streakProgress.isComplete ? colors.success : colors.textSecondary, fontSize: 10, fontWeight: '800' }}>
              {streakProgress.isComplete ? '✓ COMPLETE' : `${streakProgress.gamesPlayed}/6 games`}
            </Text>
          </View>
          <View style={[styles.bar, { backgroundColor: colors.border, marginTop: 10 }]}>
            <View style={[styles.barFill, { width: `${Math.min(100, (streakProgress.gamesPlayed / 6) * 100)}%`, backgroundColor: streakProgress.isComplete ? colors.success : colors.primary }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            {(streakProgress.categoryDetails || []).map(cat => (
              <View key={cat.id} style={{ alignItems: 'center' }}>
                {cat.completed ? (
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' }}>
                    <Check size={10} color="#FFF" />
                  </View>
                ) : (
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border }} />
                )}
                <Text style={{ color: cat.completed ? colors.success : colors.textDisabled, fontSize: 8, fontWeight: '700', marginTop: 3 }}>{cat.label.slice(0, 3).toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('ReadinessCheck', { game: { id: 'TestHub' } })} activeOpacity={0.85}>
            <RotateCcw size={20} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13, marginTop: 6 }}>Retake Tests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} onPress={() => navigation.navigate('Main', { screen: 'GamesTab' })} activeOpacity={0.85}>
            <Flame size={20} color={colors.accent} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13, marginTop: 6 }}>Brain Games</Text>
          </TouchableOpacity>
        </View>

        {/* Family Reports Link — hidden in clutter-free/simple mode */}
        {!clutterFree && (
        <TouchableOpacity
          style={[styles.familyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('FamilyReports')}
          activeOpacity={0.85}
        >
          <View style={[styles.modIcon, { backgroundColor: '#9B7BFF18' }]}>
            <Users size={20} color="#9B7BFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>Family Reports</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Share weekly progress with family</Text>
          </View>
          <ChevronRight size={16} color={colors.textDisabled} />
        </TouchableOpacity>
        )}

        {/* Caregiver & Improvement Links — hidden in clutter-free/simple mode */}
        {!clutterFree && (
        <View style={[styles.actionsRow, { marginBottom: 12 }]}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} onPress={() => navigation.navigate('CaregiverDashboard')} activeOpacity={0.85}>
            <Users size={20} color="#9B7BFF" />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: adaptiveStyles.text.fontSize * 0.8, marginTop: 6 }}>Caregiver View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} onPress={() => navigation.navigate('Improvement')} activeOpacity={0.85}>
            <BarChart3 size={20} color={colors.success} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: adaptiveStyles.text.fontSize * 0.8, marginTop: 6 }}>Improvement</Text>
          </TouchableOpacity>
        </View>
        )}

        {/* Care & Safety Quick Access */}
        <View style={styles.careRow}>
          <TouchableOpacity style={[styles.careCard, { backgroundColor: colors.error + '08', borderColor: colors.error + '20' }]} onPress={() => navigation.navigate('DailyCheckIn')} activeOpacity={0.85}>
            <Heart size={18} color={colors.error} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 11, marginTop: 4 }}>Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.careCard, { backgroundColor: '#FF6B35' + '08', borderColor: '#FF6B35' + '20' }]} onPress={() => navigation.navigate('Medication')} activeOpacity={0.85}>
            <Pill size={18} color="#FF6B35" />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 11, marginTop: 4 }}>Medication</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.careCard, { backgroundColor: colors.warning + '08', borderColor: colors.warning + '20' }]} onPress={() => navigation.navigate('SafetyCenter')} activeOpacity={0.85}>
            <Shield size={18} color={colors.warning} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 11, marginTop: 4 }}>Safety</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.careCard, { backgroundColor: '#9B7BFF08', borderColor: '#9B7BFF20' }]} onPress={() => navigation.navigate('HelpSupport')} activeOpacity={0.85}>
            <HelpCircle size={18} color="#9B7BFF" />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 11, marginTop: 4 }}>Help</Text>
          </TouchableOpacity>
        </View>

        {latest && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Your Scores</Text>
              <TouchableOpacity onPress={() => navigation.navigate('InsightsTab')}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>See Insights →</Text>
              </TouchableOpacity>
            </View>
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              const score = mod.value;
              return (
                <View key={i} style={[styles.modRow, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                  <View style={[styles.modIcon, { backgroundColor: mod.color + '18' }]}>
                    <Icon size={20} color={mod.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{mod.title}</Text>
                      <Text style={{ color: score != null ? getScoreColor(score) : colors.textDisabled, fontWeight: '800', fontSize: 18 }}>
                        {score != null ? score : '—'}
                      </Text>
                    </View>
                    {score != null && (
                      <View style={{ marginTop: 6 }}>
                        <View style={[styles.modBar, { backgroundColor: colors.border }]}>
                          <View style={[styles.modBarFill, { width: `${score}%`, backgroundColor: mod.color }]} />
                        </View>
                        <Text style={{ color: colors.textDisabled, fontSize: 10, marginTop: 3 }}>{mod.detail}</Text>
                      </View>
                    )}
                    {score == null && (
                      <Text style={{ color: colors.textDisabled, fontSize: 10, marginTop: 2 }}>Not assessed yet</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {data.sessions.length >= 2 && (
          <TouchableOpacity 
            style={[styles.driftCard, { backgroundColor: drift.hasDrift ? colors.warning + '10' : colors.success + '10', borderColor: drift.hasDrift ? colors.warning + '40' : colors.success + '40', borderWidth: 1 }]}
            onPress={() => navigation.navigate('InsightsTab')}
          >
            {drift.hasDrift 
              ? <TrendingDown size={18} color={colors.warning} />
              : <TrendingUp size={18} color={colors.success} />
            }
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                {drift.hasDrift ? 'Your Scores Have Changed' : 'Your Scores Are Steady'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                {drift.overall}% change from your first results · {data.sessions.length} sessions tracked
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textDisabled} />
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  scoreCard: { padding: 24, borderRadius: 20, marginBottom: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  shieldBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  labelBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
  startBtn: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 18, width: '100%' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionCard: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center' },
  modRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 8 },
  modIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  modBarFill: { height: '100%', borderRadius: 2 },
  driftCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, marginTop: 16 },
  streakSection: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  familyCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 12 },
  levelCorner: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', zIndex: 10, borderWidth: 2, borderColor: '#FFF' },
  careRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  careCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
});

export default Dashboard;
