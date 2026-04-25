import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const WORD_PAIRS = [
  { word: 'HOT', correct: 'COLD', options: ['COLD', 'WARM', 'FIRE', 'ICE'] },
  { word: 'BIG', correct: 'SMALL', options: ['SMALL', 'LARGE', 'TINY', 'HUGE'] },
  { word: 'FAST', correct: 'SLOW', options: ['SLOW', 'QUICK', 'RAPID', 'SPEED'] },
  { word: 'HAPPY', correct: 'SAD', options: ['SAD', 'GLAD', 'JOY', 'ANGRY'] },
  { word: 'LIGHT', correct: 'DARK', options: ['DARK', 'BRIGHT', 'DIM', 'GLOW'] },
  { word: 'UP', correct: 'DOWN', options: ['DOWN', 'OVER', 'HIGH', 'LOW'] },
  { word: 'OLD', correct: 'NEW', options: ['NEW', 'YOUNG', 'AGED', 'FRESH'] },
  { word: 'OPEN', correct: 'CLOSE', options: ['CLOSE', 'SHUT', 'WIDE', 'LOCK'] },
  { word: 'SOFT', correct: 'HARD', options: ['HARD', 'GENTLE', 'ROUGH', 'TOUGH'] },
  { word: 'EARLY', correct: 'LATE', options: ['LATE', 'SOON', 'AFTER', 'BEHIND'] },
  { word: 'EMPTY', correct: 'FULL', options: ['FULL', 'VOID', 'BLANK', 'CLEAR'] },
  { word: 'STRONG', correct: 'WEAK', options: ['WEAK', 'POWER', 'FIRM', 'BOLD'] },
  { word: 'WET', correct: 'DRY', options: ['DRY', 'DAMP', 'MOIST', 'RAIN'] },
  { word: 'RICH', correct: 'POOR', options: ['POOR', 'WEALTH', 'BROKE', 'GOLD'] },
  { word: 'LOUD', correct: 'QUIET', options: ['QUIET', 'NOISE', 'SOUND', 'CALM'] },
  { word: 'THICK', correct: 'THIN', options: ['THIN', 'WIDE', 'SLIM', 'DENSE'] },
  { word: 'SWEET', correct: 'BITTER', options: ['BITTER', 'SOUR', 'SUGAR', 'SALTY'] },
  { word: 'DEEP', correct: 'SHALLOW', options: ['SHALLOW', 'ABYSS', 'LOW', 'SURFACE'] },
  { word: 'SHARP', correct: 'DULL', options: ['DULL', 'KEEN', 'BLUNT', 'EDGE'] },
  { word: 'BRAVE', correct: 'COWARD', options: ['COWARD', 'BOLD', 'FEAR', 'HERO'] },
  { word: 'CLEAN', correct: 'DIRTY', options: ['DIRTY', 'PURE', 'MESSY', 'NEAT'] },
  { word: 'NARROW', correct: 'WIDE', options: ['WIDE', 'SLIM', 'BROAD', 'TIGHT'] },
  { word: 'ROUGH', correct: 'SMOOTH', options: ['SMOOTH', 'COARSE', 'FINE', 'BUMPY'] },
  { word: 'ANCIENT', correct: 'MODERN', options: ['MODERN', 'CLASSIC', 'RECENT', 'PAST'] },
  { word: 'SIMPLE', correct: 'COMPLEX', options: ['COMPLEX', 'BASIC', 'EASY', 'PLAIN'] },
  { word: 'WILD', correct: 'TAME', options: ['TAME', 'FREE', 'FIERCE', 'CALM'] },
  { word: 'GUILTY', correct: 'INNOCENT', options: ['INNOCENT', 'BLAME', 'PURE', 'FAULT'] },
  { word: 'SAFE', correct: 'DANGEROUS', options: ['DANGEROUS', 'SECURE', 'RISKY', 'GUARD'] },
  { word: 'GIANT', correct: 'TINY', options: ['TINY', 'MASSIVE', 'LARGE', 'SMALL'] },
  { word: 'AWAKE', correct: 'ASLEEP', options: ['ASLEEP', 'ALERT', 'TIRED', 'REST'] },
  { word: 'TIGHT', correct: 'LOOSE', options: ['LOOSE', 'SNUG', 'FIRM', 'SLACK'] },
  { word: 'NOISY', correct: 'SILENT', options: ['SILENT', 'LOUD', 'STILL', 'MUTE'] },
  { word: 'FRIEND', correct: 'ENEMY', options: ['ENEMY', 'ALLY', 'RIVAL', 'PEER'] },
  { word: 'HONEST', correct: 'DECEITFUL', options: ['DECEITFUL', 'TRUTHFUL', 'FAKE', 'LOYAL'] },
  { word: 'BRIGHT', correct: 'DIM', options: ['DIM', 'VIVID', 'FAINT', 'SHINE'] },
];

const WordAssociationGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('tutorial');
  const [pairs, setPairs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timer, setTimer] = useState(0);
  const totalRounds = 10;

  useEffect(() => {
    if (phase === 'playing') {
      const shuffled = [...WORD_PAIRS].sort(() => Math.random() - 0.5).slice(0, totalRounds);
      shuffled.forEach(p => p.options.sort(() => Math.random() - 0.5));
      setPairs(shuffled);
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleAnswer = (answer) => {
    const isCorrect = answer === pairs[current].correct;
    if (isCorrect) setCorrect(c => c + 1);
    
    const next = current + 1;
    setCurrent(next);

    if (next >= pairs.length) {
      const score = Math.round(((correct + (isCorrect ? 1 : 0)) / totalRounds) * 100);
      saveGameResult({ gameId: 'wordAssociation', category: 'language', score, duration: timer });
      setPhase('results');
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔤</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Word Association</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Find the OPPOSITE of each word! Test your verbal reasoning speed.
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>EXAMPLE</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Word: "HOT"</Text>
            <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>Answer: "COLD" ✓</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const score = Math.round((correct / totalRounds) * 100);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📝</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Word Association Score</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>{correct}/{totalRounds} correct · {timer}s</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pair = pairs[current];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Word Association</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{current + 1}/{totalRounds}</Text>
      </View>
      <View style={styles.wordArea}>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>OPPOSITE OF:</Text>
        <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 42, marginTop: 8 }}>{pair?.word}</Text>
      </View>
      <View style={styles.optGrid}>
        {pair?.options.map(opt => (
          <TouchableOpacity key={opt} style={[styles.optBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleAnswer(opt)}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 56 },
  tutBox: { width: '100%', padding: 16, borderRadius: 14, marginTop: 24 },
  btn: { width: '100%', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  wordArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  optGrid: { padding: 24, paddingBottom: 48, gap: 12 },
  optBtn: { padding: 18, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
});

export default WordAssociationGame;
