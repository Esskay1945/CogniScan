import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react-native';

const QUESTIONS = [
  { q: 'Memorize: 7, 3, 9, 1, 5. Now recall them in reverse order.', options: ['5, 1, 9, 3, 7', '7, 3, 9, 1, 5', '5, 9, 1, 3, 7', '1, 3, 5, 7, 9'], answer: '5, 1, 9, 3, 7', domain: 'memory' },
  { q: 'What is 17 × 3?', options: ['51', '48', '54', '45'], answer: '51', domain: 'speed' },
  { q: 'Which word does NOT belong: Oak, Maple, Rose, Elm?', options: ['Oak', 'Rose', 'Maple', 'Elm'], answer: 'Rose', domain: 'language' },
  { q: 'If a train leaves at 2:15 PM and the trip takes 1h45m, when does it arrive?', options: ['3:45 PM', '4:00 PM', '3:30 PM', '4:15 PM'], answer: '4:00 PM', domain: 'executive' },
  { q: 'Count backward from 100 by 7. What is the 4th number?', options: ['79', '72', '86', '75'], answer: '79', domain: 'attention' },
  { q: 'If you fold a square paper in half diagonally, what shape do you get?', options: ['Rectangle', 'Triangle', 'Pentagon', 'Circle'], answer: 'Triangle', domain: 'visuospatial' },
];

const ConfidenceMeterGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult, logMetaCognitive } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [results, setResults] = useState([]);
  const [confidence, setConfidence] = useState(3);
  const [showConfidence, setShowConfidence] = useState(true);

  const handleConfidence = () => setShowConfidence(false);

  const handleAnswer = (answer) => {
    const correct = answer === QUESTIONS[round].answer;
    const result = { question: round + 1, domain: QUESTIONS[round].domain, confidence, correct, calibrated: correct ? confidence >= 3 : confidence <= 2 };
    const newResults = [...results, result];
    logMetaCognitive({ gameId: 'ConfidenceMeter', prediction: confidence * 20, actual: correct ? 100 : 0 });
    if (round + 1 >= QUESTIONS.length) {
      const calibrationScore = Math.round((newResults.filter(r => r.calibrated).length / newResults.length) * 100);
      saveGameResult({ gameId: 'ConfidenceMeter', category: 'meta', score: calibrationScore, duration: 0 });
      setResults(newResults); setPhase('results');
    } else { setResults(newResults); setRound(round + 1); setShowConfidence(true); setConfidence(3); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🎯</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>CONFIDENCE{'\n'}METER</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Rate your confidence BEFORE answering. Measures self-awareness calibration.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') {
    const calibrated = results.filter(r => r.calibrated).length;
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 60, paddingBottom: 80 }}>
          <CheckCircle2 size={48} color={colors.success} />
          <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>CALIBRATION{'\n'}REPORT</Text>
          <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900', marginTop: 8 }}>{Math.round((calibrated / results.length) * 100)}%</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Self-awareness accuracy</Text>
          <View style={styles.breakdown}>{results.map((r, i) => (
            <View key={i} style={[styles.breakdownRow, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>Q{r.question}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Conf: {r.confidence}/5</Text>
              <Text style={{ color: r.correct ? colors.success : colors.error, fontWeight: '800', fontSize: 12 }}>{r.correct ? '✓' : '✗'}</Text>
              {r.calibrated ? <TrendingUp size={14} color={colors.success} /> : <TrendingDown size={14} color={colors.error} />}
            </View>
          ))}</View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
  if (showConfidence) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>Q{round + 1}/{QUESTIONS.length}</Text>
      <View style={styles.center}>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, textAlign: 'center', paddingHorizontal: 16 }}>{QUESTIONS[round].q}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 24 }}>How confident are you?</Text>
        <View style={styles.confRow}>{[1,2,3,4,5].map(v => (
          <TouchableOpacity key={v} onPress={() => setConfidence(v)} style={[styles.confChip, { backgroundColor: confidence === v ? colors.primary : colors.surface, borderColor: colors.border, borderWidth: 1.5 }]}>
            <Text style={{ color: confidence === v ? '#FFF' : colors.text, fontWeight: '800' }}>{v}</Text>
          </TouchableOpacity>
        ))}</View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '70%', marginTop: 8 }}>
          <Text style={{ color: colors.textDisabled, fontSize: 9 }}>GUESSING</Text>
          <Text style={{ color: colors.textDisabled, fontSize: 9 }}>CERTAIN</Text>
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleConfidence}><Text style={{ color: '#FFF', fontWeight: '900' }}>LOCK CONFIDENCE</Text></TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>ANSWER — Q{round + 1}/{QUESTIONS.length}</Text>
      <View style={styles.center}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, textAlign: 'center', paddingHorizontal: 16 }}>{QUESTIONS[round].q}</Text>
        <View style={styles.optList}>{QUESTIONS[round].options.map(opt => (
          <TouchableOpacity key={opt} style={[styles.opt, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]} onPress={() => handleAnswer(opt)}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{opt}</Text>
          </TouchableOpacity>
        ))}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  confRow: { flexDirection: 'row', gap: 12, marginTop: 16 }, confChip: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  optList: { width: '100%', gap: 10, marginTop: 24 }, opt: { padding: 16, borderRadius: 14 },
  breakdown: { width: '100%', gap: 8, marginTop: 24 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12 },
});
export default ConfidenceMeterGame;
