import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const TOTAL = 15;

const genTrial = () => {
  const targets = ['★', '▲', '●', '◆'];
  const distractors = ['✕', '○', '□', '◇', '~', '+'];
  const target = targets[Math.floor(Math.random() * targets.length)];
  const count = 4 + Math.floor(Math.random() * 4);
  const items = [target];
  for (let i = 0; i < count; i++) items.push(distractors[Math.floor(Math.random() * distractors.length)]);
  return { target, items: items.sort(() => Math.random() - 0.5) };
};

const DistractionFilterGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [trial, setTrial] = useState(genTrial());
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) { const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000); return () => clearTimeout(t); }
    if (phase === 'playing' && timeLeft === 0) nextRound(false);
  }, [phase, timeLeft]);

  const nextRound = (correct) => {
    const newScore = correct ? score + 1 : score;
    if (round + 1 >= TOTAL) { saveGameResult({ gameId: 'DistractionFilter', category: 'attention', score: Math.round(((newScore) / TOTAL) * 100), duration: 0 }); setScore(newScore); setPhase('results'); }
    else { setScore(newScore); setRound(r => r + 1); setTrial(genTrial()); setTimeLeft(3); }
  };

  const handleTap = (item) => nextRound(item === trial.target);

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🔍</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>DISTRACTION{'\n'}FILTER</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Find and tap the TARGET shape among distractors before time runs out.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/{TOTAL}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Targets found</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>TRIAL {round + 1}/{TOTAL}</Text>
      <View style={[styles.targetBox, { backgroundColor: colors.primary + '15' }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '800' }}>FIND:</Text>
        <Text style={{ color: colors.primary, fontSize: 36, fontWeight: '900', marginLeft: 12 }}>{trial.target}</Text>
      </View>
      <Text style={{ color: colors.textDisabled, textAlign: 'center', marginTop: 8 }}>⏱ {timeLeft}s</Text>
      <View style={styles.grid}>
        {trial.items.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.cell, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} onPress={() => handleTap(item)}>
            <Text style={{ fontSize: 28 }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  targetBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 24 },
  cell: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});
export default DistractionFilterGame;
