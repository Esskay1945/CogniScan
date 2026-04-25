import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TowerSortGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'towerSort';
  const [phase, setPhase] = useState('tutorial');
  const [pegs, setPegs] = useState([[], [], []]);
  const [discs, setDiscs] = useState(3);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [level, setLevel] = useState(0);

  const DISC_COLORS = ['#FF3D00', '#FFD600', '#00E676', '#0066FF', '#9B7BFF'];

  const initLevel = (numDiscs) => {
    const initialPegs = [[], [], []];
    for (let i = numDiscs; i >= 1; i--) initialPegs[0].push(i);
    setPegs(initialPegs);
    setSelected(null);
    setMoves(0);
    setDiscs(numDiscs);
  };

  useEffect(() => {
    if (phase === 'playing') {
      initLevel(3 + level);
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase, level]);

  const handlePegTap = (pegIdx) => {
    if (selected === null) {
      if (pegs[pegIdx].length > 0) setSelected(pegIdx);
    } else {
      if (pegIdx === selected) { setSelected(null); return; }
      const disc = pegs[selected][pegs[selected].length - 1];
      const topDisc = pegs[pegIdx].length > 0 ? pegs[pegIdx][pegs[pegIdx].length - 1] : Infinity;
      if (disc < topDisc) {
        const newPegs = pegs.map(p => [...p]);
        newPegs[selected].pop();
        newPegs[pegIdx].push(disc);
        setPegs(newPegs);
        setMoves(m => m + 1);
        setSelected(null);

        // Check win: all discs on peg 2
        if (newPegs[2].length === discs) {
          if (level < 2) {
            setLevel(l => l + 1);
          } else {
            const complete = true;
            if (complete) {
              const finalScore = Math.max(0, 100 - (moves - 7) * 10);
              if (isMandatoryFlow) {
                saveAssessmentScore(testId, finalScore, { moves });
              } else {
                saveGameResult({ gameId: 'towerSort', category: 'executive', score: finalScore, duration: timer });
              }
              setPhase('results');
            }
          }
        }
      }
      setSelected(null);
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🗼</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Tower Sort</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Move all discs from the left peg to the right peg.{'\n'}You can't place a bigger disc on a smaller one!
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>RULES</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>1. Tap a peg to pick up top disc</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>2. Tap another peg to place it</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>3. Big disc can't go on small disc</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const optimalMoves = Math.pow(2, discs) - 1;
    const score = Math.max(0, Math.round((optimalMoves / Math.max(moves, optimalMoves)) * 100));
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🏗️</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Tower Sort Score</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>{moves} moves (optimal: {optimalMoves})</Text>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary }]} 
            onPress={() => isMandatoryFlow ? navigation.navigate('TestHub', { ...route.params, completedTest: testId }) : navigation.goBack()}
          >
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>{isMandatoryFlow ? 'CONTINUE ASSESSMENT' : 'DONE'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pegWidth = (width - 64) / 3;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Tower Sort Lvl {level + 1}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{moves} moves</Text>
      </View>
      <View style={styles.pegsRow}>
        {pegs.map((peg, pegIdx) => (
          <TouchableOpacity key={pegIdx} style={[styles.pegArea, {
            width: pegWidth,
            backgroundColor: selected === pegIdx ? colors.primary + '10' : 'transparent',
            borderColor: selected === pegIdx ? colors.primary : colors.border,
          }]} onPress={() => handlePegTap(pegIdx)}>
            <View style={[styles.pegStick, { backgroundColor: colors.border }]} />
            <View style={styles.discsStack}>
              {peg.map((disc, di) => (
                <View key={di} style={[styles.disc, {
                  width: 20 + disc * 16,
                  backgroundColor: DISC_COLORS[(disc - 1) % DISC_COLORS.length],
                }]} />
              ))}
            </View>
            <View style={[styles.pegBase, { backgroundColor: colors.border }]} />
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
  pegsRow: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 60, gap: 8 },
  pegArea: { alignItems: 'center', paddingBottom: 8, paddingTop: 40, borderRadius: 12, borderWidth: 1 },
  pegStick: { position: 'absolute', top: 20, width: 6, height: '70%', borderRadius: 3 },
  discsStack: { width: '100%', alignItems: 'center', gap: 4, justifyContent: 'flex-end', minHeight: 120 },
  disc: { height: 20, borderRadius: 10 },
  pegBase: { width: '90%', height: 6, borderRadius: 3, marginTop: 4 },
});

export default TowerSortGame;
