import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
const { width } = Dimensions.get('window');

const DIRS = ['↑', '→', '↓', '←'];
const GRID_SIZE = 5;
const genPath = () => {
  const steps = 3 + Math.floor(Math.random() * 3);
  const path = [];
  let pos = { r: 2, c: 2 };
  for (let i = 0; i < steps; i++) {
    const dir = Math.floor(Math.random() * 4);
    const dr = [- 1, 0, 1, 0][dir];
    const dc = [0, 1, 0, -1][dir];
    const nr = pos.r + dr;
    const nc = pos.c + dc;
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      path.push(DIRS[dir]);
      pos = { r: nr, c: nc };
    }
  }
  return { path, finalPos: pos, startPos: { r: 2, c: 2 } };
};

const PathPredictionGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [trial, setTrial] = useState(genPath());
  const [showPath, setShowPath] = useState(true);
  const TOTAL = 8;

  useEffect(() => {
    if (phase === 'playing' && showPath) {
      const t = setTimeout(() => setShowPath(false), 3000);
      return () => clearTimeout(t);
    }
  }, [phase, showPath]);

  const handleTap = (r, c) => {
    const correct = r === trial.finalPos.r && c === trial.finalPos.c;
    const newScore = correct ? score + 1 : score;
    if (round + 1 >= TOTAL) { saveGameResult({ gameId: 'PathPrediction', category: 'visuospatial', score: Math.round((newScore / TOTAL) * 100), duration: 0 }); setScore(newScore); setPhase('results'); }
    else { setScore(newScore); setRound(round + 1); const t = genPath(); setTrial(t); setShowPath(true); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🧭</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>PATH PREDICTION</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Follow the arrow sequence mentally and tap where the object ends up on the grid.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => { setPhase('playing'); setShowPath(true); }}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
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
  const cellSize = (width - 80) / GRID_SIZE;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>TRIAL {round + 1}/{TOTAL}</Text>
      {showPath ? (
        <View style={styles.center}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Follow this path from center:</Text>
          <View style={styles.pathRow}>{trial.path.map((d, i) => (
            <View key={i} style={[styles.arrowBox, { backgroundColor: colors.primary + '15' }]}>
              <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '900' }}>{d}</Text>
            </View>
          ))}</View>
          <Text style={{ color: colors.textDisabled, marginTop: 16 }}>Memorize the path...</Text>
        </View>
      ) : (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={{ color: colors.text, fontWeight: '800', marginBottom: 16 }}>Where does the object end up?</Text>
          <View>
            {Array.from({ length: GRID_SIZE }).map((_, r) => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {Array.from({ length: GRID_SIZE }).map((_, c) => (
                  <TouchableOpacity key={c} onPress={() => handleTap(r, c)}
                    style={[styles.gridCell, { width: cellSize, height: cellSize, backgroundColor: (r === 2 && c === 2) ? colors.primary + '20' : colors.surface, borderColor: colors.border }]}>
                    {r === 2 && c === 2 && <Text style={{ fontSize: 16 }}>📍</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  pathRow: { flexDirection: 'row', gap: 8, marginTop: 24 }, arrowBox: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  gridCell: { borderWidth: 1, borderRadius: 4, margin: 1, justifyContent: 'center', alignItems: 'center' },
});
export default PathPredictionGame;
