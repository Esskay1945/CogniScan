import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const SHAPES = ['L', 'T', 'Z', 'F'];
const rotateGrid = (grid, deg) => {
  const size = grid.length;
  if (deg === 90) return grid[0].map((_, c) => grid.map(row => row[c]).reverse());
  if (deg === 180) return grid.map(row => [...row].reverse()).reverse();
  if (deg === 270) return grid[0].map((_, c) => grid.map(row => row[c])).reverse();
  return grid;
};
const shapeGrids = {
  L: [[1,0],[1,0],[1,1]],
  T: [[1,1,1],[0,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,0],[0,1,1]],
  F: [[1,1,0],[1,0,0],[1,0,0]],
};
const genTrial = () => {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const original = shapeGrids[shape];
  const rotations = [90, 180, 270];
  const correctRot = rotations[Math.floor(Math.random() * rotations.length)];
  const rotated = rotateGrid(original, correctRot);
  const wrongShapes = SHAPES.filter(s => s !== shape);
  const wrongShape = wrongShapes[Math.floor(Math.random() * wrongShapes.length)];
  const wrongGrid = rotateGrid(shapeGrids[wrongShape], rotations[Math.floor(Math.random() * rotations.length)]);
  const options = [{ grid: rotated, correct: true }, { grid: wrongGrid, correct: false }].sort(() => Math.random() - 0.5);
  return { original, options, shape };
};

const Mini = ({ grid, colors, highlight }) => (
  <View style={[styles.miniGrid, { borderColor: highlight ? colors.primary : colors.border }]}>
    {grid.map((row, r) => <View key={r} style={styles.miniRow}>
      {row.map((cell, c) => <View key={c} style={[styles.miniCell, { backgroundColor: cell ? (highlight ? colors.primary : colors.text) : 'transparent' }]} />)}
    </View>)}
  </View>
);

const Rotation3DGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [trial, setTrial] = useState(genTrial());
  const TOTAL = 10;

  const handleAnswer = (correct) => {
    const newScore = correct ? score + 1 : score;
    if (round + 1 >= TOTAL) { saveGameResult({ gameId: 'Rotation3D', category: 'visuospatial', score: Math.round((newScore / TOTAL) * 100), duration: 0 }); setScore(newScore); setPhase('results'); }
    else { setScore(newScore); setRound(round + 1); setTrial(genTrial()); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🔄</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>3D ROTATION</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Identify which shape is a rotated version of the original.</Text>
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
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>TRIAL {round + 1}/{TOTAL}</Text>
      <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'center', marginTop: 12 }}>Which is a rotation of this shape?</Text>
      <View style={{ alignItems: 'center', marginTop: 24 }}><Mini grid={trial.original} colors={colors} highlight={true} /></View>
      <View style={styles.optRow}>
        {trial.options.map((opt, i) => (
          <TouchableOpacity key={i} style={[styles.optCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleAnswer(opt.correct)}>
            <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>OPTION {i + 1}</Text>
            <Mini grid={opt.grid} colors={colors} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  miniGrid: { borderWidth: 2, borderRadius: 8, padding: 4 },
  miniRow: { flexDirection: 'row' }, miniCell: { width: 24, height: 24, margin: 2, borderRadius: 4 },
  optRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 40 },
  optCard: { padding: 20, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
});
export default Rotation3DGame;
