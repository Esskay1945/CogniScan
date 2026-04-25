import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const ALL_SENTENCES = [
  { text: 'The fish climbed the tree to catch the bus.', fix: 'The fish swam the river to catch the fly.', options: ['The fish swam the river to catch the fly.', 'The fish climbed the tree to catch the fly.', 'The dog climbed the tree to catch the bus.'] },
  { text: 'She drank a glass of chairs before sleeping.', fix: 'She drank a glass of water before sleeping.', options: ['She drank a glass of water before sleeping.', 'She drank a glass of chairs before waking.', 'She ate a glass of water before sleeping.'] },
  { text: 'The sun rises in the west every morning.', fix: 'The sun rises in the east every morning.', options: ['The sun rises in the east every morning.', 'The sun sets in the west every morning.', 'The moon rises in the west every morning.'] },
  { text: 'He put on his shoes and walked on his hands.', fix: 'He put on his shoes and walked on his feet.', options: ['He put on his shoes and walked on his feet.', 'He put on his gloves and walked on his hands.', 'He put on his hat and walked on his hands.'] },
  { text: 'The doctor baked a cake to cure the patient.', fix: 'The doctor gave medicine to cure the patient.', options: ['The doctor gave medicine to cure the patient.', 'The chef baked a cake to cure the patient.', 'The doctor baked a cake to feed the patient.'] },
  { text: 'Ice melts when you put it in the freezer.', fix: 'Ice melts when you put it in the sun.', options: ['Ice melts when you put it in the sun.', 'Ice freezes when you put it in the freezer.', 'Water melts when you put it in the freezer.'] },
  { text: 'The pilot drove the airplane on the highway.', fix: 'The pilot flew the airplane in the sky.', options: ['The pilot flew the airplane in the sky.', 'The driver drove the airplane on the highway.', 'The pilot drove the car on the highway.'] },
  { text: 'She used a hammer to cut the paper in half.', fix: 'She used scissors to cut the paper in half.', options: ['She used scissors to cut the paper in half.', 'She used a hammer to nail the paper.', 'She used a knife to cut the paper in half.'] },
  { text: 'The teacher planted seeds in the classroom desk.', fix: 'The teacher planted seeds in the garden soil.', options: ['The teacher planted seeds in the garden soil.', 'The farmer planted seeds in the classroom desk.', 'The teacher wrote notes in the classroom desk.'] },
  { text: 'He read the newspaper with his ears closed.', fix: 'He read the newspaper with his eyes open.', options: ['He read the newspaper with his eyes open.', 'He listened to the newspaper with his ears closed.', 'He read the book with his ears closed.'] },
  { text: 'The firefighter used water to start the fire.', fix: 'The firefighter used water to put out the fire.', options: ['The firefighter used water to put out the fire.', 'The arsonist used water to start the fire.', 'The firefighter used gasoline to start the fire.'] },
  { text: 'Birds swim through the sky using their fins.', fix: 'Birds fly through the sky using their wings.', options: ['Birds fly through the sky using their wings.', 'Fish swim through the sky using their fins.', 'Birds swim through the water using their fins.'] },
  { text: 'The baker fixed the car engine with flour.', fix: 'The mechanic fixed the car engine with tools.', options: ['The mechanic fixed the car engine with tools.', 'The baker fixed the oven with flour.', 'The baker fixed the car engine with sugar.'] },
  { text: 'She watered the flowers with a telephone.', fix: 'She watered the flowers with a watering can.', options: ['She watered the flowers with a watering can.', 'She called the flowers with a telephone.', 'She watered the garden with a telephone.'] },
];

const SentenceLogicGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  // Randomly select 6 sentences from the pool each session
  const [SENTENCES] = useState(() => [...ALL_SENTENCES].sort(() => Math.random() - 0.5).slice(0, 6));

  const handleAnswer = (answer) => {
    const correct = answer === SENTENCES[round].fix;
    const newScore = correct ? score + 1 : score;
    if (round + 1 >= SENTENCES.length) {
      saveGameResult({ gameId: 'SentenceLogic', category: 'language', score: Math.round((newScore / SENTENCES.length) * 100), duration: 0 });
      setScore(newScore); setPhase('results');
    } else { setScore(newScore); setRound(round + 1); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>📝</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>SENTENCE LOGIC</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Each sentence contains a logical error. Choose the corrected version.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/{SENTENCES.length}</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>SENTENCE {round + 1}/{SENTENCES.length}</Text>
      <View style={[styles.errorCard, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
        <Text style={{ color: colors.error, fontSize: 9, fontWeight: '900' }}>❌ ILLOGICAL SENTENCE</Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 8, lineHeight: 24 }}>{SENTENCES[round].text}</Text>
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 20 }}>Choose the corrected version:</Text>
      <View style={styles.optList}>
        {SENTENCES[round].options.sort(() => Math.random() - 0.5).map((opt, i) => (
          <TouchableOpacity key={i} style={[styles.opt, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]} onPress={() => handleAnswer(opt)}>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  errorCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginTop: 20 },
  optList: { gap: 10, marginTop: 16 }, opt: { padding: 16, borderRadius: 16 },
});
export default SentenceLogicGame;
