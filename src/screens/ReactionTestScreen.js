import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Zap, ChevronLeft } from 'lucide-react-native';

const ReactionTestScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const words = route.params?.words || [];
  const [phase, setPhase] = useState('ready'); // ready | wait | tap | result
  const [results, setResults] = useState([]);
  const [round, setRound] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const timerRef = useRef(null);
  const TOTAL_ROUNDS = 5;

  const startRound = () => {
    setPhase('wait');
    const delay = 1500 + Math.random() * 3000; // 1.5-4.5 seconds
    timerRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setPhase('tap');
    }, delay);
  };

  const handleTap = () => {
    if (phase === 'wait') {
      // Too early
      clearTimeout(timerRef.current);
      setPhase('ready');
      return;
    }
    if (phase === 'tap') {
      const rt = Date.now() - startTime;
      setReactionTime(rt);
      setResults(prev => [...prev, rt]);
      setRound(prev => prev + 1);
      setPhase('result');
    }
  };

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      // All done, go back to hub
      navigation.navigate('TestHub', { words, completedTest: 'reaction' });
    } else {
      startRound();
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const avg = results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : 0;

  const getColor = () => {
    if (phase === 'wait') return '#E74C3C';
    if (phase === 'tap') return colors.success;
    return Colors.dark.background;
  };

  return (
    <View style={[styles.container, { backgroundColor: getColor() }]}>
      {phase === 'ready' && (
        <View style={styles.center}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          <View style={[styles.iconCircle, { backgroundColor: '#FF6B6B20' }]}>
            <Zap size={48} color="#FF6B6B" />
          </View>
          <Text style={[Typography.h1, { color: Colors.dark.text, textAlign: 'center' }]}>Reaction Test</Text>
          <Text style={[Typography.body, { color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 8, fontSize: 14 }]}>
            When the screen turns <Text style={{ color: colors.success, fontWeight: '700' }}>GREEN</Text>, tap as fast as you can!
          </Text>
          <Text style={[Typography.caption, { color: Colors.dark.textSecondary, marginTop: 8 }]}>
            ROUND {round + 1} OF {TOTAL_ROUNDS}
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={startRound} activeOpacity={0.85}>
            <Text style={[Typography.h3, { color: '#FFF' }]}>{round === 0 ? 'Start' : 'Next Round'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'wait' && (
        <TouchableOpacity style={styles.fullTap} onPress={handleTap} activeOpacity={1}>
          <Text style={[Typography.h1, { color: '#FFF', textAlign: 'center' }]}>Wait...</Text>
          <Text style={[Typography.body, { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8 }]}>
            Don't tap yet!
          </Text>
        </TouchableOpacity>
      )}

      {phase === 'tap' && (
        <TouchableOpacity style={styles.fullTap} onPress={handleTap} activeOpacity={1}>
          <Text style={[Typography.h1, { color: '#FFF', textAlign: 'center', fontSize: 48 }]}>TAP!</Text>
        </TouchableOpacity>
      )}

      {phase === 'result' && (
        <View style={[styles.center, { backgroundColor: Colors.dark.background }]}>
          <Text style={[Typography.caption, { color: Colors.dark.textSecondary }]}>REACTION TIME</Text>
          <Text style={[Typography.h1, { color: Colors.dark.primary, fontSize: 56, marginVertical: 12 }]}>
            {reactionTime}<Text style={{ fontSize: 20 }}>ms</Text>
          </Text>
          <Text style={{ color: Colors.dark.textSecondary, fontSize: 14, marginBottom: 4 }}>
            {reactionTime < 250 ? 'Excellent!' : reactionTime < 350 ? 'Good' : reactionTime < 500 ? 'Average' : 'Keep practicing'}
          </Text>
          <Text style={[Typography.caption, { color: Colors.dark.textDisabled, marginBottom: 32 }]}>
            AVG: {avg}ms | ROUND {round}/{TOTAL_ROUNDS}
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={nextRound} activeOpacity={0.85}>
            <Text style={[Typography.h3, { color: '#FFF' }]}>
              {round >= TOTAL_ROUNDS ? 'Finish Test' : 'Next Round'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  backBtn: { position: 'absolute', top: 50, left: 0, width: 44, height: 44, justifyContent: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 34, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, marginTop: 16 },
  fullTap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ReactionTestScreen;
