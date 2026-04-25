import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
const { width } = Dimensions.get('window');

const ZONE_SIZE = 80;
const DURATION = 10; // seconds per round
const TOTAL_ROUNDS = 5;

const PrecisionHoldGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'dragPrecision';
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState([]);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [holding, setHolding] = useState(false);
  const [inZone, setInZone] = useState(0);
  const [targetPos] = useState({ x: width / 2 - ZONE_SIZE / 2, y: 300 });
  const touchRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'playing' && timeLeft === 0) {
      const pct = Math.round((inZone / DURATION) * 100);
      const newScores = [...scores, pct];
      if (round + 1 >= TOTAL_ROUNDS) {
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
        if (isMandatoryFlow) {
          saveAssessmentScore(testId, avg, { rounds: newScores });
        } else {
          saveGameResult({ gameId: 'PrecisionHold', category: 'motor', score: avg, duration: DURATION * TOTAL_ROUNDS });
        }
        setScores(newScores);
        setPhase('results');
      } else {
        setScores(newScores);
        setRound(r => r + 1);
        setTimeLeft(DURATION);
        setInZone(0);
        setHolding(false);
      }
    }
  }, [phase, timeLeft]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      setHolding(true);
      checkZone(e.nativeEvent);
    },
    onPanResponderMove: (e) => checkZone(e.nativeEvent),
    onPanResponderRelease: () => setHolding(false),
  });

  const checkZone = (evt) => {
    const dx = evt.pageX - (targetPos.x + ZONE_SIZE / 2);
    const dy = evt.pageY - (targetPos.y + ZONE_SIZE / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= ZONE_SIZE / 2) setInZone(z => z + 0.1);
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🎯</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>PRECISION HOLD</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Press and hold your finger in the target zone as steadily as possible for {DURATION} seconds.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Average stability score</Text>
        <View style={styles.roundScores}>{scores.map((s, i) => (
          <View key={i} style={[styles.roundBadge, { backgroundColor: s > 70 ? colors.success + '15' : colors.warning + '15' }]}>
            <Text style={{ color: s > 70 ? colors.success : colors.warning, fontWeight: '800', fontSize: 12 }}>R{i + 1}: {s}%</Text>
          </View>
        ))}</View>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary }]} 
          onPress={() => {
            if (isMandatoryFlow) {
              const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              saveAssessmentScore(testId, avgScore);
              navigation.navigate('TestHub', { ...route.params, completedTest: testId });
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '900' }}>{isMandatoryFlow ? 'CONTINUE ASSESSMENT' : 'DONE'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} {...panResponder.panHandlers}>
      <View style={styles.topBar}>
        <Text style={{ color: colors.textDisabled, fontSize: 12, fontWeight: '800' }}>ROUND {round + 1}/{TOTAL_ROUNDS}</Text>
        <Text style={{ color: timeLeft <= 3 ? colors.error : colors.primary, fontSize: 18, fontWeight: '900' }}>⏱ {timeLeft}s</Text>
      </View>
      <View style={[styles.target, { left: targetPos.x, top: targetPos.y, width: ZONE_SIZE, height: ZONE_SIZE, backgroundColor: holding ? colors.primary + '30' : colors.primary + '10', borderColor: colors.primary }]}>
        <Text style={{ fontSize: 24 }}>🎯</Text>
      </View>
      <View style={styles.statusBar}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{holding ? '✋ Holding...' : '☝️ Press the target zone'}</Text>
        <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 16 }}>Stability: {Math.round((inZone / Math.max(DURATION - timeLeft, 0.1)) * 100)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 60 },
  target: { position: 'absolute', borderRadius: 40, borderWidth: 3, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  statusBar: { position: 'absolute', bottom: 60, left: 24, right: 24, alignItems: 'center' },
  roundScores: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
  roundBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
});
export default PrecisionHoldGame;
