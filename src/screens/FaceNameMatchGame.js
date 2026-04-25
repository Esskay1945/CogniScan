import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const FACES = [
  { emoji: '👨‍🦰', name: 'Robert' }, { emoji: '👩', name: 'Sarah' }, { emoji: '👴', name: 'Thomas' },
  { emoji: '👧', name: 'Emily' }, { emoji: '👨‍🦱', name: 'James' }, { emoji: '👩‍🦳', name: 'Martha' },
  { emoji: '🧑', name: 'Alex' }, { emoji: '👵', name: 'Helen' }, { emoji: '👨', name: 'David' },
  { emoji: '👩‍🦰', name: 'Claire' }, { emoji: '🧔', name: 'Michael' }, { emoji: '👱‍♀️', name: 'Lisa' },
];

const FaceNameMatchGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [pairs, setPairs] = useState([]);
  const [options, setOptions] = useState([]);
  const [currentFace, setCurrentFace] = useState(null);
  const [timer, setTimer] = useState(8);

  const setupRound = (r) => {
    const count = Math.min(3 + r, 6);
    const shuffled = [...FACES].sort(() => Math.random() - 0.5).slice(0, count);
    setPairs(shuffled);
    setPhase('learn');
    setTimer(4 + count);
  };

  useEffect(() => {
    if (phase === 'learn' && timer > 0) { const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }
    if (phase === 'learn' && timer === 0) { startRecall(); }
  }, [phase, timer]);

  const startRecall = () => {
    const all = [...FACES].sort(() => Math.random() - 0.5);
    const face = pairs[Math.floor(Math.random() * pairs.length)];
    setCurrentFace(face);
    setOptions([face.name, ...all.filter(f => f.name !== face.name).slice(0, 3).map(f => f.name)].sort(() => Math.random() - 0.5));
    setPhase('recall');
  };

  const handleAnswer = (name) => {
    const correct = name === currentFace.name;
    const newScore = correct ? score + 1 : score;
    if (round < 4) { setScore(newScore); setRound(round + 1); setupRound(round + 1); }
    else { const pct = Math.round(((newScore + (correct ? 1 : 0)) / 5) * 100); saveGameResult({ gameId: 'FaceNameMatch', category: 'memory', score: pct, duration: 0 }); setScore(newScore + (correct ? 1 : 0)); setPhase('results'); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🧑‍🤝‍🧑</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>FACE-NAME MATCH</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 32 }}>Learn face-name pairs, then match the correct name after a delay.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setupRound(0)}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>DONE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/5</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Faces correctly matched</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>FINISH</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'learn') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 60 }]}>LEARN — ROUND {round + 1}/5</Text>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, textAlign: 'center', marginTop: 12 }}>Remember these face-name pairs</Text>
      <View style={styles.grid}>{pairs.map(p => (
        <View key={p.name} style={[styles.faceCard, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 36 }}>{p.emoji}</Text>
          <Text style={{ color: colors.text, fontWeight: '800', marginTop: 6 }}>{p.name}</Text>
        </View>
      ))}</View>
      <Text style={{ color: colors.textDisabled, textAlign: 'center', marginTop: 20 }}>⏱ {timer}s</Text>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 60 }]}>RECALL — ROUND {round + 1}/5</Text>
      <Text style={{ fontSize: 64, textAlign: 'center', marginTop: 24 }}>{currentFace?.emoji}</Text>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18, textAlign: 'center', marginTop: 12 }}>What is this person's name?</Text>
      <View style={styles.optGrid}>{options.map(name => (
        <TouchableOpacity key={name} style={[styles.optBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]} onPress={() => handleAnswer(name)}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{name}</Text>
        </TouchableOpacity>
      ))}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 24 },
  faceCard: { width: 100, padding: 16, borderRadius: 16, alignItems: 'center' },
  optGrid: { gap: 12, marginTop: 32, paddingHorizontal: 16 }, optBtn: { padding: 18, borderRadius: 16, alignItems: 'center' },
});
export default FaceNameMatchGame;
