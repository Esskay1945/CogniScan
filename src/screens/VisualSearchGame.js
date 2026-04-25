import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const VisualSearchGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'visualSearch';
  const [phase, setPhase] = useState('tutorial');
  const [target, setTarget] = useState(null);
  const [items, setItems] = useState([]);
  const [found, setFound] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState(0);
  const totalRounds = 8;

  const SHAPES = ['●', '■', '▲', '◆', '★', '⬟', '⬢', '◉'];
  const SHAPE_COLORS = ['#FF3D00', '#0066FF', '#00E676', '#FFD600', '#9B7BFF', '#00F0FF', '#FF6B9D', '#FF8A65'];

  const generateRound = () => {
    const targetIdx = Math.floor(Math.random() * SHAPES.length);
    const targetShape = SHAPES[targetIdx];
    const targetColor = SHAPE_COLORS[targetIdx];
    setTarget({ shape: targetShape, color: targetColor });

    const gridItems = [];
    const gridSize = 16 + round * 2;
    const targetPos = Math.floor(Math.random() * gridSize);

    for (let i = 0; i < gridSize; i++) {
      if (i === targetPos) {
        gridItems.push({ shape: targetShape, color: targetColor, isTarget: true });
      } else {
        let idx;
        do { idx = Math.floor(Math.random() * SHAPES.length); } while (idx === targetIdx);
        gridItems.push({ shape: SHAPES[idx], color: SHAPE_COLORS[idx], isTarget: false });
      }
    }
    setItems(gridItems);
  };

  useEffect(() => {
    if (phase === 'playing') {
      generateRound();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleTap = (index) => {
    if (items[index].isTarget) {
      setFound(f => f + 1);
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= totalRounds) {
        const score = Math.max(0, Math.round(((found + 1) / totalRounds) * 100 - errors * 5));
        if (isMandatoryFlow) {
          saveAssessmentScore(testId, score, { errors });
        } else {
          saveGameResult({ gameId: 'visualSearch', category: 'attention', score, duration: timer });
        }
        setPhase('results');
      } else {
        generateRound();
      }
    } else {
      setErrors(e => e + 1);
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔍</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Visual Search</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Find the target shape among distractors as quickly as possible!
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>HOW TO PLAY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>1. See the target shape at the top</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>2. Find it in the grid below</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>3. Tap it! Grid grows each round</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const score = Math.max(0, Math.round((found / totalRounds) * 100 - errors * 5));
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>👁️</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Visual Search Score</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>{found} found · {errors} errors · {timer}s</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => isMandatoryFlow ? navigation.navigate('TestHub', { ...route.params, completedTest: testId }) : navigation.goBack()}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>{isMandatoryFlow ? 'CONTINUE ASSESSMENT' : 'DONE'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Visual Search</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{round + 1}/{totalRounds}</Text>
      </View>
      {target && (
        <View style={[styles.targetCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700' }}>FIND THIS:</Text>
          <Text style={{ fontSize: 36, color: target.color, marginTop: 4 }}>{target.shape}</Text>
        </View>
      )}
      <View style={styles.searchGrid}>
        {items.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.gridItem, { backgroundColor: colors.surface }]} onPress={() => handleTap(i)}>
            <Text style={{ fontSize: 22, color: item.color }}>{item.shape}</Text>
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
  targetCard: { alignItems: 'center', padding: 16, marginHorizontal: 24, borderRadius: 14, borderLeftWidth: 4 },
  searchGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, padding: 16, marginTop: 12 },
  gridItem: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});

export default VisualSearchGame;
