import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Zap, Eye, Clock, CheckCircle, Lock, Activity, ShieldCheck, Microscope } from 'lucide-react-native';

const tests = [
  { id: 'reaction', title: 'Reaction Latency', desc: 'Spectral response speed diagnostic', icon: Zap, color: '#FF3D00', time: '~2 min' },
  { id: 'pattern', title: 'Pattern Stability', desc: 'Visual cognitive sequence tracking', icon: Eye, color: '#0066FF', time: '~3 min' },
  { id: 'clock', title: 'Spatial Mapping', desc: 'Anatomical organization assessment', icon: Clock, color: '#00F0FF', time: '~3 min' },
];

const TestHubScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const words = route.params?.words || [];
  const [completed, setCompleted] = useState({});
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const allDone = Object.keys(completed).length >= tests.length;
  const canRecall = allDone;

  const handleTestPress = (id) => {
    if (completed[id]) return;
    if (id === 'reaction') navigation.navigate('ReactionTest', { words });
    if (id === 'pattern') navigation.navigate('PatternTest', { words });
    if (id === 'clock') navigation.navigate('ClockTest', { words });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const from = route.params?.completedTest;
      if (from) {
        setCompleted(prev => ({ ...prev, [from]: true }));
        navigation.setParams({ completedTest: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Microscope size={24} color={Colors.dark.primary} />
          <Text style={[Typography.h1, { color: Colors.dark.text, marginLeft: 12 }]}>INTERFERENCE PHASE</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { borderColor: Colors.dark.border, backgroundColor: Colors.dark.surface }]}>
            <Activity size={14} color={colors.success} />
            <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800', marginLeft: 6 }}>BASELINE MONITORING</Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: Colors.dark.border, backgroundColor: Colors.dark.surface }]}>
            <Clock size={14} color={Colors.dark.textSecondary} />
            <Text style={{ color: Colors.dark.text, fontSize: 10, fontWeight: '800', marginLeft: 6 }}>{formatTime(timer)}</Text>
          </View>
        </View>

        <Text style={{ color: Colors.dark.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 28 }}>
          Complete the following cognitive interference protocols to allow for temporal decay of memory clusters.
        </Text>

        {/* Test Cards */}
        {tests.map((test) => {
          const done = completed[test.id];
          const Icon = test.icon;
          return (
            <TouchableOpacity
              key={test.id}
              style={[styles.testCard, { backgroundColor: Colors.dark.surface, borderColor: done ? colors.success + '40' : Colors.dark.border }]}
              onPress={() => handleTestPress(test.id)}
              disabled={done}
            >
              <View style={[styles.testIcon, { backgroundColor: test.color + '10' }]}>
                {done ? <CheckCircle size={22} color={colors.success} /> : <Icon size={22} color={test.color} />}
              </View>
              <View style={styles.testInfo}>
                <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 15 }}>{test.title}</Text>
                <Text style={{ color: Colors.dark.textSecondary, fontSize: 11, marginTop: 2 }}>{test.desc}</Text>
              </View>
              {done ? (
                <View style={[styles.doneBadge, { backgroundColor: Colors.dark.success + '15' }]}>
                  <Text style={{ color: colors.success, fontSize: 9, fontWeight: '900' }}>VALIDATED</Text>
                </View>
              ) : (
                <Text style={{ color: Colors.dark.textDisabled, fontSize: 10, fontWeight: '600' }}>{test.time}</Text>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={[styles.recallLock, { opacity: canRecall ? 1 : 0.5, backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }]}>
          <View style={styles.lockRow}>
            {canRecall ? <ShieldCheck size={20} color={Colors.dark.primary} /> : <Lock size={20} color={Colors.dark.textDisabled} />}
            <Text style={{ color: canRecall ? Colors.dark.text : Colors.dark.textDisabled, fontWeight: '800', fontSize: 14, marginLeft: 12 }}>
              FINAL RECALL SEQUENCE
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.recallBtn, { backgroundColor: canRecall ? Colors.dark.primary : Colors.dark.surfaceElevated }]}
            onPress={() => canRecall && navigation.navigate('DelayedRecall', { words, elapsed: timer })}
            disabled={!canRecall}
          >
            <Text style={[styles.btnText, { color: canRecall ? '#FFF' : Colors.dark.textDisabled }]}>
              {canRecall ? 'COMMENCE RECALL' : 'LOCKED: COMPLETE PROTOCOLS'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  testCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  testIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  testInfo: { flex: 1 },
  doneBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  recallLock: { marginTop: 32, padding: 24, borderRadius: 20, borderWidth: 1 },
  lockRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  recallBtn: { height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },
});

export default TestHubScreen;
