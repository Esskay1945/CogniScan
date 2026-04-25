import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
const { width } = Dimensions.get('window');

const mirrorH = (grid) => grid.map(row => [...row].reverse());
const genTrial = () => {
  const size = 4;
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random() > 0.55 ? 1 : 0));
  const correct = mirrorH(grid);
  const wrong = grid.map(row => [...row]); // slightly modify
  const ri = Math.floor(Math.random() * size);
  const ci = Math.floor(Math.random() * size);
  wrong[ri][ci] = wrong[ri][ci] ? 0 : 1;
  const options = [{ grid: correct, isCorrect: true }, { grid: wrong, isCorrect: false }].sort(() => Math.random() - 0.5);
  return { original: grid, options };
};

const Grid = ({ grid, colors, size = 20 }) => (
  <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}>
    {grid.map((row, r) => <View key={r} style={{ flexDirection: 'row' }}>
      {row.map((cell, c) => <View key={c} style={{ width: size, height: size, margin: 1, borderRadius: 3, backgroundColor: cell ? colors.primary : colors.surface }} />)}
    </View>)}
  </View>
);

const MirrorPatternGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'figureCopy';
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [trial, setTrial] = useState(genTrial());
  const TOTAL = 10;

  const handleAnswer = (correct) => {
    const newScore = correct ? score + 1 : score;
    if (round + 1 >= TOTAL) { const finalScore = Math.round((newScore / TOTAL) * 100); if (isMandatoryFlow) { saveAssessmentScore(testId, finalScore, { correct: newScore, total: TOTAL }); } else { saveGameResult({ gameId: 'MirrorPattern', category: 'visuospatial', score: finalScore, duration: 0 }); } setScore(newScore); setPhase('results'); }
    else { setScore(newScore); setRound(round + 1); setTrial(genTrial()); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🪞</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>MIRROR PATTERN</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Identify the correct horizontal mirror image of the pattern.</Text>
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
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary }]} 
          onPress={() => {
            if (isMandatoryFlow) {
              saveAssessmentScore(testId, (score / TOTAL) * 100);
              navigation.navigate('TestHub', { ...route.params, completedTest: testId });
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '900' }}>{isMandatoryFlow ? 'CONTINUE ASSESSMENT' : 'DONE'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>TRIAL {round + 1}/{TOTAL}</Text>
      <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'center', marginTop: 12 }}>Find the mirror image</Text>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>ORIGINAL</Text>
        <Grid grid={trial.original} colors={colors} size={22} />
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 30, textAlign: 'center', marginVertical: 16 }}>🪞</Text>
      <View style={styles.optRow}>
        {trial.options.map((opt, i) => (
          <TouchableOpacity key={i} style={[styles.optCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleAnswer(opt.isCorrect)}>
            <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>{String.fromCharCode(65 + i)}</Text>
            <Grid grid={opt.grid} colors={colors} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  optRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  optCard: { padding: 16, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
});
export default MirrorPatternGame;
