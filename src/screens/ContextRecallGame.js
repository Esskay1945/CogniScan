import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, Eye, CheckCircle2 } from 'lucide-react-native';
const { width } = Dimensions.get('window');

const SCENES = [
  { context: '🍳 Kitchen', items: ['Knife', 'Pan', 'Apple', 'Toaster', 'Mug'], distractors: ['Pillow', 'Shampoo', 'Umbrella'] },
  { context: '📚 Office', items: ['Laptop', 'Pen', 'Stapler', 'Calendar', 'Lamp'], distractors: ['Spoon', 'Towel', 'Sock'] },
  { context: '🏥 Hospital', items: ['Stethoscope', 'Syringe', 'Mask', 'Gloves', 'Bandage'], distractors: ['Guitar', 'Helmet', 'Crayon'] },
  { context: '🌳 Park', items: ['Bench', 'Fountain', 'Kite', 'Dog', 'Bicycle'], distractors: ['Printer', 'Microwave', 'Iron'] },
];

const ContextRecallGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState([]);
  const [showTimer, setShowTimer] = useState(5);

  const scene = SCENES[round % SCENES.length];
  const allOptions = [...scene.items, ...scene.distractors].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (phase === 'memorize' && showTimer > 0) {
      const t = setTimeout(() => setShowTimer(showTimer - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'memorize' && showTimer === 0) setPhase('recall');
  }, [phase, showTimer]);

  const startRound = () => { setPhase('memorize'); setShowTimer(5); setSelected([]); };
  const toggleItem = (item) => {
    if (selected.includes(item)) setSelected(selected.filter(i => i !== item));
    else if (selected.length < 5) setSelected([...selected, item]);
  };
  const submitRecall = () => {
    const correct = selected.filter(i => scene.items.includes(i)).length;
    const newScore = score + correct;
    if (round < 3) { setScore(newScore); setRound(round + 1); setPhase('memorize'); setShowTimer(5); setSelected([]); }
    else { const finalScore = Math.round(((newScore + correct) / 20) * 100); saveGameResult({ gameId: 'ContextRecall', category: 'memory', score: finalScore, duration: 0 }); setScore(newScore + correct); setPhase('results'); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🏠</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>CONTEXT RECALL</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 32 }}>Memorize items that belong in a scene, then recall them from a mixed list.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startRound}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900', marginTop: 8 }}>{score}/20</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Items correctly recalled across 4 scenes</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'memorize') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 60 }]}>ROUND {round + 1}/4</Text>
      <Text style={{ fontSize: 40, textAlign: 'center', marginTop: 20 }}>{scene.context}</Text>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18, textAlign: 'center', marginTop: 16 }}>Remember these items:</Text>
      <View style={styles.itemGrid}>{scene.items.map(item => (
        <View key={item} style={[styles.itemChip, { backgroundColor: colors.primary + '15' }]}><Text style={{ color: colors.primary, fontWeight: '800' }}>{item}</Text></View>
      ))}</View>
      <Text style={{ color: colors.textDisabled, fontSize: 14, textAlign: 'center', marginTop: 24 }}>⏱ {showTimer}s remaining</Text>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 60 }]}>RECALL — ROUND {round + 1}/4</Text>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, textAlign: 'center', marginTop: 12 }}>Which items were in the {scene.context}?</Text>
      <View style={styles.itemGrid}>{allOptions.map(item => (
        <TouchableOpacity key={item} onPress={() => toggleItem(item)} style={[styles.itemChip, { backgroundColor: selected.includes(item) ? colors.primary : colors.surface, borderColor: selected.includes(item) ? colors.primary : colors.border, borderWidth: 1.5 }]}>
          <Text style={{ color: selected.includes(item) ? '#FFF' : colors.text, fontWeight: '700' }}>{item}</Text>
        </TouchableOpacity>
      ))}</View>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, marginTop: 24 }]} onPress={submitRecall}><Text style={{ color: '#FFF', fontWeight: '900' }}>SUBMIT</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 20, paddingHorizontal: 16 },
  itemChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
});
export default ContextRecallGame;
