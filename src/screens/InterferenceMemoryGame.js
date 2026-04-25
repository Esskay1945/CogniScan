import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const WORD_POOLS = [
  ['Dog', 'Chair', 'River', 'Clock', 'Moon'],
  ['Tree', 'Book', 'Stone', 'Fire', 'Bird'],
  ['Rain', 'Glass', 'Star', 'Light', 'Door'],
  ['Wind', 'Ring', 'Leaf', 'Sand', 'Bell'],
  ['Crown', 'Pearl', 'Frost', 'Cabin', 'Eagle'],
  ['Maple', 'Globe', 'Arrow', 'Peach', 'Coral'],
  ['Storm', 'Lodge', 'Prism', 'Cedar', 'Ivory'],
  ['Cliff', 'Heron', 'Badge', 'Drift', 'Olive'],
  ['Quilt', 'Flame', 'Bison', 'Creek', 'Opal'],
  ['Bloom', 'Vault', 'Raven', 'Lotus', 'Spark'],
];
const DISTRACTORS = [
  ['Cat', 'Table', 'Lake', 'Watch', 'Sun'],
  ['Bush', 'Page', 'Rock', 'Flame', 'Fish'],
  ['Snow', 'Cup', 'Planet', 'Lamp', 'Gate'],
  ['Breeze', 'Chain', 'Petal', 'Dust', 'Drum'],
  ['Hammer', 'Falcon', 'Candle', 'Marble', 'Sunset'],
  ['Tunnel', 'Shield', 'Basket', 'Trophy', 'Feather'],
  ['Dragon', 'Helmet', 'Anchor', 'Beacon', 'Temple'],
  ['Velvet', 'Salmon', 'Window', 'Desert', 'Ribbon'],
  ['Magnet', 'Puzzle', 'Whisper', 'Mirror', 'Breeze'],
  ['Lantern', 'Carbon', 'Rhythm', 'Vessel', 'Shadow'],
];

const InterferenceMemoryGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(5);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if ((phase === 'listA' || phase === 'listB') && timer > 0) { const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }
    if (phase === 'listA' && timer === 0) { setPhase('listB'); setTimer(5); }
    if (phase === 'listB' && timer === 0) { setPhase('recall'); setSelected([]); }
  }, [phase, timer]);

  const words = WORD_POOLS[round % WORD_POOLS.length];
  const distWords = DISTRACTORS[round % DISTRACTORS.length];
  const allRecall = [...words, ...distWords].sort(() => Math.random() - 0.5);

  const toggle = (w) => { selected.includes(w) ? setSelected(selected.filter(x => x !== w)) : selected.length < 5 && setSelected([...selected, w]); };
  const submit = () => {
    const correct = selected.filter(w => words.includes(w)).length;
    const wrong = selected.filter(w => !words.includes(w)).length;
    const pts = Math.max(0, correct - wrong);
    const total = score + pts;
    if (round < 3) { setScore(total); setRound(round + 1); setPhase('listA'); setTimer(5); setSelected([]); }
    else { saveGameResult({ gameId: 'InterferenceMemory', category: 'memory', score: Math.round(((total + pts) / 20) * 100), duration: 0 }); setScore(total + pts); setPhase('results'); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}><TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}><Text style={{ fontSize: 48 }}>🧠</Text><Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>INTERFERENCE{'\n'}MEMORY</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Learn List A, then a distractor List B, then recall ONLY List A items.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => { setPhase('listA'); setTimer(5); }}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View></View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}><View style={styles.center}><CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text><Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/20</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View></View>
  );
  if (phase === 'listA' || phase === 'listB') {
    const list = phase === 'listA' ? words : distWords;
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[Typography.caption, { color: phase === 'listA' ? colors.primary : colors.warning, textAlign: 'center', marginTop: 60 }]}>
          {phase === 'listA' ? '📋 LIST A — REMEMBER THESE' : '🔀 LIST B — DISTRACTOR (IGNORE)'}
        </Text>
        <Text style={{ color: colors.textDisabled, textAlign: 'center', marginTop: 8 }}>Round {round + 1}/4 · ⏱ {timer}s</Text>
        <View style={styles.wordCol}>{list.map(w => (
          <View key={w} style={[styles.wordCard, { backgroundColor: phase === 'listA' ? colors.primary + '15' : colors.warning + '15' }]}>
            <Text style={{ color: phase === 'listA' ? colors.primary : colors.warning, fontWeight: '800', fontSize: 20 }}>{w}</Text>
          </View>
        ))}</View>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 60 }]}>RECALL LIST A ONLY</Text>
      <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'center', marginTop: 8 }}>Tap the words from List A, ignore List B</Text>
      <View style={styles.grid}>{allRecall.map(w => (
        <TouchableOpacity key={w} onPress={() => toggle(w)} style={[styles.recallChip, { backgroundColor: selected.includes(w) ? colors.primary : colors.surface, borderColor: selected.includes(w) ? colors.primary : colors.border, borderWidth: 1.5 }]}>
          <Text style={{ color: selected.includes(w) ? '#FFF' : colors.text, fontWeight: '700' }}>{w}</Text>
        </TouchableOpacity>
      ))}</View>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, marginTop: 24 }]} onPress={submit}><Text style={{ color: '#FFF', fontWeight: '900' }}>SUBMIT</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  wordCol: { alignItems: 'center', gap: 12, marginTop: 32 }, wordCard: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 24 }, recallChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
});
export default InterferenceMemoryGame;
