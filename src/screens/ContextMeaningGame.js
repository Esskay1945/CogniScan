import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const ALL_ITEMS = [
  { sentence: 'The bank was too steep for the boat to navigate.', word: 'bank', options: ['Financial institution', 'River edge', 'Storage vault', 'Bench'], answer: 'River edge' },
  { sentence: 'She could not bear the weight on her injured leg.', word: 'bear', options: ['Animal', 'Support/carry', 'Naked', 'Direction'], answer: 'Support/carry' },
  { sentence: 'The match was cancelled due to heavy rain.', word: 'match', options: ['Fire starter', 'Sports game', 'Equal pair', 'Color'], answer: 'Sports game' },
  { sentence: 'He decided to pitch his old tent by the creek.', word: 'pitch', options: ['Musical tone', 'Throw', 'Set up', 'Black substance'], answer: 'Set up' },
  { sentence: 'The leaves began to fall as autumn arrived.', word: 'fall', options: ['Trip over', 'Autumn season', 'Descend', 'Waterfall'], answer: 'Descend' },
  { sentence: 'She had to address the crowd at the ceremony.', word: 'address', options: ['Location', 'Speak to', 'Fix', 'Label'], answer: 'Speak to' },
  { sentence: 'The doctor checked the patient\'s current condition.', word: 'current', options: ['Water flow', 'Electrical', 'Present/now', 'Berry'], answer: 'Present/now' },
  { sentence: 'He made a note of the key points during the lecture.', word: 'note', options: ['Musical sound', 'Written record', 'Observe', 'Currency'], answer: 'Written record' },
  { sentence: 'The bat flew out of the cave at dusk.', word: 'bat', options: ['Sports equipment', 'Flying mammal', 'Eyelid movement', 'Hit'], answer: 'Flying mammal' },
  { sentence: 'Please file these documents in the cabinet.', word: 'file', options: ['Tool for smoothing', 'Organize/store', 'Line of people', 'Computer data'], answer: 'Organize/store' },
  { sentence: 'The crane lifted the heavy steel beam.', word: 'crane', options: ['Bird', 'Lifting machine', 'Stretch neck', 'Paper fold'], answer: 'Lifting machine' },
  { sentence: 'She decided to book a flight to Paris.', word: 'book', options: ['Reading material', 'Reserve/schedule', 'Record', 'Bible'], answer: 'Reserve/schedule' },
  { sentence: 'The spring in the mattress was broken.', word: 'spring', options: ['Season', 'Water source', 'Metal coil', 'Jump'], answer: 'Metal coil' },
  { sentence: 'He gave a brief report on the project.', word: 'brief', options: ['Short/concise', 'Underwear', 'Legal document', 'Suitcase'], answer: 'Short/concise' },
  { sentence: 'The seal on the envelope was already broken.', word: 'seal', options: ['Marine animal', 'Stamp/closure', 'Approve', 'Waterproof'], answer: 'Stamp/closure' },
  { sentence: 'They decided to plant the rose bush near the fence.', word: 'plant', options: ['Factory', 'Put in soil', 'Spy/agent', 'Equipment'], answer: 'Put in soil' },
];

const ContextMeaningGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  // Randomly select 8 items from the pool each session
  const [ITEMS] = useState(() => [...ALL_ITEMS].sort(() => Math.random() - 0.5).slice(0, 8));

  const handleAnswer = (answer) => {
    const correct = answer === ITEMS[round].answer;
    const newScore = correct ? score + 1 : score;
    if (round + 1 >= ITEMS.length) {
      saveGameResult({ gameId: 'ContextMeaning', category: 'language', score: Math.round((newScore / ITEMS.length) * 100), duration: 0 });
      setScore(newScore); setPhase('results');
    } else { setScore(newScore); setRound(round + 1); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>📖</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>CONTEXT{'\n'}MEANING</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Determine the meaning of the highlighted word based on its context in the sentence.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/{ITEMS.length}</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  const item = ITEMS[round];
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>WORD {round + 1}/{ITEMS.length}</Text>
      <View style={[styles.sentenceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center' }}>
          "{item.sentence}"
        </Text>
        <View style={[styles.wordBadge, { backgroundColor: colors.primary + '15' }]}>
          <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 16 }}>"{item.word}"</Text>
        </View>
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 16 }}>What does "{item.word}" mean here?</Text>
      <View style={styles.optList}>
        {item.options.map(opt => (
          <TouchableOpacity key={opt} style={[styles.opt, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]} onPress={() => handleAnswer(opt)}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  sentenceCard: { padding: 24, borderRadius: 20, borderWidth: 1, marginTop: 20, alignItems: 'center' },
  wordBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, marginTop: 16 },
  optList: { gap: 10, marginTop: 16 }, opt: { padding: 16, borderRadius: 16 },
});
export default ContextMeaningGame;
