import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TRAILS = [
  { type: 'number', sequence: [1, 2, 3, 4, 5, 6, 7, 8] },
  { type: 'alternate', sequence: ['1', 'A', '2', 'B', '3', 'C', '4', 'D'] },
];

const TrailMakingGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'trailA';
  const [phase, setPhase] = useState('tutorial');
  const [trailType, setTrailType] = useState(0);
  const [nodes, setNodes] = useState([]);
  const [tapped, setTapped] = useState([]);
  const [errors, setErrors] = useState(0);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const generateNodes = () => {
    const trail = TRAILS[trailType];
    const padding = 60;
    const nodeSize = 50;
    const area = { w: width - padding * 2, h: 400 };
    const positions = [];

    trail.sequence.forEach((label, i) => {
      let pos;
      let attempts = 0;
      do {
        pos = {
          x: Math.random() * (area.w - nodeSize),
          y: Math.random() * (area.h - nodeSize),
        };
        attempts++;
      } while (
        positions.some(p => Math.hypot(p.x - pos.x, p.y - pos.y) < nodeSize + 10) &&
        attempts < 50
      );
      positions.push({ ...pos, label, index: i });
    });

    setNodes(positions);
    setTapped([]);
    setErrors(0);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (phase === 'playing') {
      generateNodes();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase, trailType]);

  const handleNodeTap = (index) => {
    if (index === tapped.length) {
      const newTapped = [...tapped, index];
      setTapped(newTapped);
      if (newTapped.length === nodes.length) {
        const elapsed = (Date.now() - startTime) / 1000;
        if (trailType === 0) {
          setTrailType(1);
          setPhase('playing');
        } else {
          const score = Math.max(0, Math.round(100 - (elapsed / 2) - (errors * 10)));
          if (isMandatoryFlow) {
            saveAssessmentScore(testId, score, { errors, elapsed: Math.round(elapsed) });
          } else {
            saveGameResult({ gameId: 'trailMaking', category: 'attention', score, duration: Math.round(elapsed) });
          }
          setPhase('results');
        }
      }
    } else {
      setErrors(e => e + 1);
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔗</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Trail Making</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Connect the nodes in order! First numbers only, then alternating numbers and letters.
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>HOW TO PLAY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Part A: Tap 1→2→3→4...</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Part B: Tap 1→A→2→B→3→C...</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Speed + accuracy = your score</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const elapsed = (Date.now() - startTime) / 1000;
    const score = Math.max(0, Math.round(100 - (elapsed / 2) - (errors * 10)));
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Trail Making Score</Text>
          <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
            <View style={styles.stat}><Text style={{ color: colors.primary, fontWeight: '800', fontSize: 20 }}>{Math.round(elapsed)}s</Text><Text style={{ color: colors.textSecondary, fontSize: 10 }}>TIME</Text></View>
            <View style={styles.stat}><Text style={{ color: colors.error, fontWeight: '800', fontSize: 20 }}>{errors}</Text><Text style={{ color: colors.textSecondary, fontSize: 10 }}>ERRORS</Text></View>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => {
            saveAssessmentScore(testId, score, { elapsed, errors });
            isMandatoryFlow ? navigation.navigate('TestHub', { ...route.params, completedTest: testId }) : navigation.goBack();
          }}>
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
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Part {trailType === 0 ? 'A' : 'B'}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{timer}s</Text>
      </View>
      <View style={{ position: 'relative', height: 400, marginHorizontal: 30 }}>
        {nodes.map((node, i) => {
          const isDone = tapped.includes(node.index);
          const isNext = node.index === tapped.length;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.node, {
                left: node.x, top: node.y,
                backgroundColor: isDone ? colors.success + '30' : isNext ? colors.primary + '20' : colors.surface,
                borderColor: isDone ? colors.success : isNext ? colors.primary : colors.border,
              }]}
              onPress={() => handleNodeTap(node.index)}
            >
              <Text style={{ color: isDone ? colors.success : colors.text, fontWeight: '800', fontSize: 16 }}>{node.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 12, marginTop: 8 }}>
        {tapped.length}/{nodes.length} connected · {errors} errors
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 56 },
  tutBox: { width: '100%', padding: 16, borderRadius: 14, marginTop: 24 },
  btn: { width: '100%', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  node: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  statRow: { flexDirection: 'row', width: '100%', padding: 20, borderRadius: 16, marginTop: 24, justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
});

export default TrailMakingGame;
