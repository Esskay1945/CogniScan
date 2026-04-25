import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react-native';

const TOTAL = 20;
const genTrial = () => {
  const dir = Math.random() > 0.5 ? 'RIGHT' : 'LEFT';
  const congruent = Math.random() > 0.4;
  const flank = congruent ? dir : (dir === 'LEFT' ? 'RIGHT' : 'LEFT');
  const arrows = dir === 'LEFT' ? '←' : '→';
  const flanks = flank === 'LEFT' ? '←' : '→';
  return { dir, display: `${flanks} ${flanks} ${arrows} ${flanks} ${flanks}`, congruent };
};

const FlankerTaskGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [trial, setTrial] = useState(genTrial());
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const handleAnswer = (answer) => {
    const correct = answer === trial.dir;
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= TOTAL) {
        const pct = Math.round(((score + (correct ? 1 : 0)) / TOTAL) * 100);
        saveGameResult({ gameId: 'FlankerTask', category: 'attention', score: pct, duration: 0 });
        setPhase('results');
      } else { setRound(r => r + 1); setTrial(genTrial()); }
    }, 400);
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🎯</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>FLANKER TASK</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Identify the direction of the CENTER arrow. Ignore the surrounding flanker arrows.</Text>
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
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Correct identifications</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>TRIAL {round + 1}/{TOTAL}</Text>
      <View style={styles.center}>
        <Text style={{ color: feedback === 'correct' ? colors.success : feedback === 'wrong' ? colors.error : colors.text, fontSize: 48, fontWeight: '900', letterSpacing: 8 }}>{trial.display}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 16 }}>Tap the direction of the CENTER arrow</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.dirBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleAnswer('LEFT')}>
            <ChevronLeft size={32} color={colors.primary} /><Text style={{ color: colors.text, fontWeight: '800' }}>LEFT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dirBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleAnswer('RIGHT')}>
            <ChevronRight size={32} color={colors.primary} /><Text style={{ color: colors.text, fontWeight: '800' }}>RIGHT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  btnRow: { flexDirection: 'row', gap: 20, marginTop: 40 }, dirBtn: { width: 120, height: 100, borderRadius: 20, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
});
export default FlankerTaskGame;
