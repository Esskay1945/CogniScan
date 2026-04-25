import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
const { width, height: screenH } = Dimensions.get('window');

const TOTAL_ROUNDS = 5;
const ROUND_DURATION = 8;

const MotionTrackingGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [targetPos, setTargetPos] = useState({ x: width / 2 - 25, y: 300 });
  const [fingerPos, setFingerPos] = useState(null);
  const [trackScore, setTrackScore] = useState(0);
  const [samples, setSamples] = useState(0);
  const moveRef = useRef(null);

  useEffect(() => {
    if (phase === 'playing') {
      moveRef.current = setInterval(() => {
        setTargetPos(prev => ({
          x: Math.max(30, Math.min(width - 80, prev.x + (Math.random() - 0.5) * 40)),
          y: Math.max(150, Math.min(500, prev.y + (Math.random() - 0.5) * 40)),
        }));
      }, 500);
      return () => clearInterval(moveRef.current);
    }
  }, [phase, round]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'playing' && timeLeft === 0) {
      clearInterval(moveRef.current);
      const pct = samples > 0 ? Math.round((trackScore / samples) * 100) : 0;
      const newScores = [...scores, pct];
      if (round + 1 >= TOTAL_ROUNDS) {
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
        saveGameResult({ gameId: 'MotionTracking', category: 'motor', score: avg, duration: ROUND_DURATION * TOTAL_ROUNDS });
        setScores(newScores); setPhase('results');
      } else {
        setScores(newScores); setRound(r => r + 1); setTimeLeft(ROUND_DURATION); setTrackScore(0); setSamples(0); setFingerPos(null);
      }
    }
  }, [phase, timeLeft]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e) => {
      const { pageX, pageY } = e.nativeEvent;
      setFingerPos({ x: pageX, y: pageY });
      const dx = pageX - (targetPos.x + 25);
      const dy = pageY - (targetPos.y + 25);
      const dist = Math.sqrt(dx * dx + dy * dy);
      setSamples(s => s + 1);
      if (dist < 60) setTrackScore(ts => ts + 1);
    },
    onPanResponderRelease: () => setFingerPos(null),
  });

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>👆</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>MOTION{'\n'}TRACKING</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Follow the moving target with your finger. Stay as close to it as possible.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <CheckCircle2 size={48} color={colors.success} />
          <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>TRACKING{'\n'}ANALYSIS</Text>
          <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{avg}%</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Average tracking accuracy</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} {...panResponder.panHandlers}>
      <View style={styles.topBar}>
        <Text style={{ color: colors.textDisabled, fontSize: 12, fontWeight: '800' }}>ROUND {round + 1}/{TOTAL_ROUNDS}</Text>
        <Text style={{ color: timeLeft <= 3 ? colors.error : colors.primary, fontSize: 18, fontWeight: '900' }}>⏱ {timeLeft}s</Text>
      </View>
      <View style={[styles.target, { left: targetPos.x, top: targetPos.y, backgroundColor: colors.primary + '30', borderColor: colors.primary }]}>
        <Text style={{ fontSize: 20 }}>🎯</Text>
      </View>
      <View style={styles.statusBar}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>☝️ Drag finger to follow the target</Text>
        <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 14 }}>
          Accuracy: {samples > 0 ? Math.round((trackScore / samples) * 100) : 0}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 60, zIndex: 10 },
  target: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  statusBar: { position: 'absolute', bottom: 60, left: 24, right: 24, alignItems: 'center' },
});
export default MotionTrackingGame;
