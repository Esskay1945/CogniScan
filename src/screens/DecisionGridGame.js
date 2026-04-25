import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const PROBLEMS = [
  { scenario: 'A hotel has 3 rooms. Each room fits 2 guests. Room A costs $50, B costs $70, C costs $90. You have $200 for 5 guests.', options: ['A+A+C', 'A+B+C', 'B+B+A', 'C+C'], answer: 'A+B+C', criteria: 'Capacity ≥ 5, Cost ≤ $200' },
  { scenario: 'You need a laptop: Budget ≤ $800, RAM ≥ 16GB, Weight ≤ 2kg.', options: ['$750, 16GB, 1.8kg', '$600, 8GB, 1.5kg', '$900, 32GB, 1.9kg', '$800, 16GB, 2.5kg'], answer: '$750, 16GB, 1.8kg', criteria: 'All 3 constraints met' },
  { scenario: 'Choose the fastest route: A=30min+traffic, B=45min no traffic, C=20min+toll $5. Budget: $0 extra.', options: ['Route A', 'Route B', 'Route C'], answer: 'Route B', criteria: 'Most reliable, no cost' },
  { scenario: 'Hire an employee: need coding + design. Alice: code 9/design 3. Bob: code 6/design 7. Carol: code 7/design 8.', options: ['Alice', 'Bob', 'Carol'], answer: 'Carol', criteria: 'Best combined score' },
];

const DecisionGridGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (answer) => {
    const correct = answer === PROBLEMS[round].answer;
    const newScore = correct ? score + 1 : score;
    if (round + 1 >= PROBLEMS.length) {
      saveGameResult({ gameId: 'DecisionGrid', category: 'executive', score: Math.round((newScore / PROBLEMS.length) * 100), duration: 0 });
      setScore(newScore); setPhase('results');
    } else { setScore(newScore); setRound(round + 1); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>📊</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>DECISION GRID</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Evaluate multiple criteria to make the best decision in each scenario.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/{PROBLEMS.length}</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  const p = PROBLEMS[round];
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={[Typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 60 }]}>PROBLEM {round + 1}/{PROBLEMS.length}</Text>
      <View style={[styles.scenarioCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22 }}>{p.scenario}</Text>
        <View style={[styles.criteriaTag, { backgroundColor: colors.primary + '10' }]}>
          <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>CRITERIA: {p.criteria}</Text>
        </View>
      </View>
      <View style={styles.optList}>
        {p.options.map(opt => (
          <TouchableOpacity key={opt} style={[styles.optBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]} onPress={() => handleAnswer(opt)}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  scenarioCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginTop: 20 },
  criteriaTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 12 },
  optList: { gap: 10, marginTop: 20 }, optBtn: { padding: 18, borderRadius: 16 },
});
export default DecisionGridGame;
