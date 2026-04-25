import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const ITEMS = [
  { emoji: '🍎', name: 'Apple' }, { emoji: '🐕', name: 'Dog' }, { emoji: '🚗', name: 'Car' },
  { emoji: '☀️', name: 'Sun' }, { emoji: '📚', name: 'Book' }, { emoji: '🏠', name: 'House' },
  { emoji: '✈️', name: 'Plane' }, { emoji: '🎸', name: 'Guitar' }, { emoji: '⚽', name: 'Ball' },
  { emoji: '🌺', name: 'Flower' }, { emoji: '🐱', name: 'Cat' }, { emoji: '🔑', name: 'Key' },
  { emoji: '🎂', name: 'Cake' }, { emoji: '🌙', name: 'Moon' }, { emoji: '🐟', name: 'Fish' },
  { emoji: '🌲', name: 'Tree' }, { emoji: '🎹', name: 'Piano' }, { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🍕', name: 'Pizza' }, { emoji: '⭐', name: 'Star' }, { emoji: '🐘', name: 'Elephant' },
  { emoji: '🏔️', name: 'Mountain' }, { emoji: '🚲', name: 'Bicycle' }, { emoji: '🎈', name: 'Balloon' },
  { emoji: '🦁', name: 'Lion' }, { emoji: '🍌', name: 'Banana' }, { emoji: '⚡', name: 'Lightning' },
  { emoji: '🌈', name: 'Rainbow' }, { emoji: '🎪', name: 'Circus' }, { emoji: '🦅', name: 'Eagle' },
];

const RapidNamingGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const startTime = useRef(null);

  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) { const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000); return () => clearTimeout(t); }
    if (phase === 'playing' && timeLeft === 0) finish();
  }, [phase, timeLeft]);

  const start = () => {
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setCurrent(0);
    setScore(0);
    setTimeLeft(60);
    startTime.current = Date.now();
    setPhase('playing');
  };

  const handleAnswer = (name) => {
    const correct = name === items[current].name;
    if (correct) setScore(s => s + 1);
    if (current + 1 < items.length) setCurrent(c => c + 1);
    else finish();
  };

  const finish = () => {
    const pct = Math.round((score / items.length) * 100);
    saveGameResult({ gameId: 'RapidNaming', category: 'speed', score: pct, duration: Math.round((Date.now() - startTime.current) / 1000) });
    setPhase('results');
  };

  const getOptions = () => {
    if (!items[current]) return [];
    const correct = items[current].name;
    const others = ITEMS.filter(i => i.name !== correct).sort(() => Math.random() - 0.5).slice(0, 3).map(i => i.name);
    return [correct, ...others].sort(() => Math.random() - 0.5);
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>⚡</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>RAPID NAMING</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Name items as fast as possible! Tap the correct name for each object before time runs out.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={start}><Text style={{ color: '#FFF', fontWeight: '900' }}>START (60s)</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/{items.length}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Items named correctly</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Text style={{ color: colors.textDisabled, fontSize: 12, fontWeight: '800' }}>{current + 1}/{items.length}</Text>
        <Text style={{ color: timeLeft < 10 ? colors.error : colors.primary, fontSize: 16, fontWeight: '900' }}>⏱ {timeLeft}s</Text>
      </View>
      <View style={styles.center}>
        <Text style={{ fontSize: 80 }}>{items[current]?.emoji}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 16 }}>What is this?</Text>
        <View style={styles.optGrid}>
          {getOptions().map(name => (
            <TouchableOpacity key={name} style={[styles.opt, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]} onPress={() => handleAnswer(name)}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 60 },
  optGrid: { width: '100%', gap: 10, marginTop: 32 }, opt: { padding: 18, borderRadius: 16, alignItems: 'center' },
});
export default RapidNamingGame;
