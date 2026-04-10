import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const AREA_W = width - 80;
const AREA_H = 400;

const ReflexTapGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('intro');
  const [target, setTarget] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef(null);
  const TOTAL = 10;

  const spawnTarget = () => {
    const size = 50 + Math.random() * 20;
    const x = Math.random() * (AREA_W - size);
    const y = Math.random() * (AREA_H - size);
    const targetColors = ['#FF6B6B', '#4F9DFF', '#9B7BFF', '#22C55E', '#FBBF24'];
    const color = targetColors[Math.floor(Math.random() * targetColors.length)];
    setTarget({ x, y, size, color });
    setStartTime(Date.now());

    // Miss timeout
    timerRef.current = setTimeout(() => {
      setRound(p => p + 1);
      if (round + 1 >= TOTAL) setPhase('result');
      else spawnTarget();
    }, 2000);
  };

  const handleTap = () => {
    clearTimeout(timerRef.current);
    const rt = Date.now() - startTime;
    setTimes(p => [...p, rt]);
    setScore(p => p + 1);
    setRound(p => p + 1);
    if (round + 1 >= TOTAL) { setPhase('result'); return; }
    setTimeout(spawnTarget, 300);
  };

  const start = () => {
    setScore(0); setRound(0); setTimes([]);
    setPhase('play');
    setTimeout(spawnTarget, 500);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={Colors.dark.text} />
      </TouchableOpacity>

      {phase === 'intro' && (
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⚡</Text>
          <Text style={[Typography.h2, { color: Colors.dark.text, textAlign: 'center' }]}>Reflex Tap Arena</Text>
          <Text style={{ color: Colors.dark.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6 }}>
            Tap each target as fast as you can!
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={start}>
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Go!</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'play' && (
        <View style={styles.center}>
          <Text style={{ color: Colors.dark.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>
            {score}/{TOTAL} HIT | ROUND {round + 1}
          </Text>
          <View style={[styles.arena, { backgroundColor: Colors.dark.surface }]}>
            {target && (
              <TouchableOpacity
                style={[styles.target, { left: target.x, top: target.y, width: target.size, height: target.size, backgroundColor: target.color, borderRadius: target.size / 2 }]}
                onPress={handleTap}
                activeOpacity={0.7}
              />
            )}
          </View>
        </View>
      )}

      {phase === 'result' && (
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 8 ? '🏆' : score >= 6 ? '⚡' : '🧠'}</Text>
          <Text style={[Typography.h1, { color: Colors.dark.text }]}>{score}/{TOTAL}</Text>
          <Text style={{ color: Colors.dark.primary, fontSize: 18, fontWeight: '700', marginTop: 8 }}>Avg: {avg}ms</Text>
          <Text style={{ color: Colors.dark.textSecondary, fontSize: 14, marginTop: 4 }}>
            {avg < 400 ? 'Lightning fast!' : avg < 600 ? 'Good reflexes' : 'Keep training'}
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  back: { marginTop: 44, width: 44, height: 44, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 24 },
  arena: { width: AREA_W, height: AREA_H, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  target: { position: 'absolute' },
});

export default ReflexTapGame;
