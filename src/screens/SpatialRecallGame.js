import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GRID_SIZE = 5;
const CELL_SIZE = (width - 80) / GRID_SIZE;

const SpatialRecallGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('tutorial');
  const [pattern, setPattern] = useState([]);
  const [userTaps, setUserTaps] = useState([]);
  const [showPattern, setShowPattern] = useState(true);
  const [level, setLevel] = useState(3);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [timer, setTimer] = useState(0);

  const generatePattern = (count) => {
    const cells = [];
    while (cells.length < count) {
      const idx = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
      if (!cells.includes(idx)) cells.push(idx);
    }
    return cells;
  };

  const startRound = () => {
    const p = generatePattern(level);
    setPattern(p);
    setUserTaps([]);
    setShowPattern(true);
    setTimeout(() => setShowPattern(false), 1500 + (level * 200));
  };

  useEffect(() => {
    if (phase === 'playing') {
      startRound();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleCellTap = (idx) => {
    if (showPattern) return;
    if (userTaps.includes(idx)) return;
    const newTaps = [...userTaps, idx];
    setUserTaps(newTaps);

    if (newTaps.length === pattern.length) {
      const correct = pattern.filter(p => newTaps.includes(p)).length;
      const roundScore = Math.round((correct / pattern.length) * 100);
      const newScore = score + roundScore;
      setScore(newScore);
      const newRounds = rounds + 1;
      setRounds(newRounds);

      if (newRounds >= 5) {
        const finalScore = Math.round(newScore / 5);
        saveGameResult({ gameId: 'spatialRecall', category: 'memory', score: finalScore, duration: timer });
        setPhase('results');
      } else {
        setLevel(l => l + 1);
        setTimeout(startRound, 800);
      }
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🗺️</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Spatial Recall</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Memorize the highlighted cells on the grid, then tap them from memory!
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>HOW TO PLAY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>1. Watch the pattern light up</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>2. Pattern disappears</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>3. Tap the cells from memory</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const finalScore = Math.round(score / 5);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎯</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{finalScore}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Spatial Recall Score</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Spatial Recall</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Round {rounds + 1}/5</Text>
      </View>
      <Text style={{ color: showPattern ? colors.accent : colors.primary, textAlign: 'center', fontWeight: '800', fontSize: 14, marginBottom: 16 }}>
        {showPattern ? 'MEMORIZE THE PATTERN' : 'TAP THE CELLS'}
      </Text>
      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const isPattern = pattern.includes(i);
          const isTapped = userTaps.includes(i);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.cell, {
                width: CELL_SIZE, height: CELL_SIZE,
                backgroundColor: (showPattern && isPattern) ? colors.primary :
                  isTapped ? (isPattern ? colors.success + '40' : colors.error + '40') : colors.surface,
                borderColor: (showPattern && isPattern) ? colors.primary :
                  isTapped ? (isPattern ? colors.success : colors.error) : colors.border,
              }]}
              onPress={() => handleCellTap(i)}
              disabled={showPattern}
            />
          );
        })}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingHorizontal: 16 },
  cell: { borderRadius: 10, borderWidth: 1.5 },
});

export default SpatialRecallGame;
