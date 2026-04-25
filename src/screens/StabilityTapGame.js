import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const TOTAL_TAPS = 20;
const TARGET_INTERVAL = 600; // ms between taps

const StabilityTapGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [taps, setTaps] = useState([]);
  const [intervals, setIntervals] = useState([]);
  const lastTapRef = useRef(null);

  const handleTap = () => {
    const now = Date.now();
    if (lastTapRef.current) {
      const interval = now - lastTapRef.current;
      setIntervals(prev => [...prev, interval]);
    }
    lastTapRef.current = now;
    setTaps(prev => [...prev, now]);
    if (taps.length + 1 >= TOTAL_TAPS) {
      setTimeout(() => finish(), 100);
    }
  };

  const finish = () => {
    if (intervals.length < 2) { setPhase('results'); return; }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
    const std = Math.sqrt(variance);
    const consistency = Math.max(0, Math.round(100 - (std / TARGET_INTERVAL) * 100));
    saveGameResult({ gameId: 'StabilityTap', category: 'motor', score: consistency, duration: 0 });
    setPhase('results');
  };

  const getStats = () => {
    if (intervals.length < 2) return { avg: 0, std: 0, consistency: 0 };
    const avg = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
    const std = Math.round(Math.sqrt(variance));
    const consistency = Math.max(0, Math.round(100 - (std / TARGET_INTERVAL) * 100));
    return { avg, std, consistency };
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🥁</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>STABILITY TAP</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>
          Tap the button {TOTAL_TAPS} times at a consistent rhythm. Target: ~{TARGET_INTERVAL}ms between taps.
        </Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') {
    const stats = getStats();
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <CheckCircle2 size={48} color={colors.success} />
          <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>RHYTHM ANALYSIS</Text>
          <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{stats.consistency}%</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Tapping consistency</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}><Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>{stats.avg}ms</Text><Text style={{ color: colors.textDisabled, fontSize: 10 }}>AVG INTERVAL</Text></View>
            <View style={styles.stat}><Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>±{stats.std}ms</Text><Text style={{ color: colors.textDisabled, fontSize: 10 }}>VARIABILITY</Text></View>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>TAP {taps.length}/{TOTAL_TAPS}</Text>
      <View style={styles.center}>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 24 }}>Tap at a steady rhythm (~{TARGET_INTERVAL}ms)</Text>
        <TouchableOpacity style={[styles.tapZone, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleTap} activeOpacity={0.7}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 20 }}>TAP</Text>
          <Text style={{ color: '#FFFFFF90', fontSize: 12, marginTop: 4 }}>{taps.length}/{TOTAL_TAPS}</Text>
        </TouchableOpacity>
        {intervals.length > 0 && (
          <Text style={{ color: colors.textDisabled, fontSize: 12, marginTop: 24 }}>Last interval: {intervals[intervals.length - 1]}ms</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  tapZone: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  statRow: { flexDirection: 'row', gap: 32, marginTop: 20 }, stat: { alignItems: 'center' },
});
export default StabilityTapGame;
