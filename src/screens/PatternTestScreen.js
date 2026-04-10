import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Eye, ChevronLeft, RotateCcw } from 'lucide-react-native';

const GRID_SIZE = 9; // 3x3

const PatternTestScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const words = route.params?.words || [];
  const [phase, setPhase] = useState('ready'); // ready | show | input | result
  const [level, setLevel] = useState(3); // starting pattern length
  const [pattern, setPattern] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showIndex, setShowIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL_ROUNDS = 4;

  const generatePattern = (len) => {
    const p = [];
    while (p.length < len) {
      const n = Math.floor(Math.random() * GRID_SIZE);
      if (p[p.length - 1] !== n) p.push(n);
    }
    return p;
  };

  const startRound = () => {
    const p = generatePattern(level);
    setPattern(p);
    setUserInput([]);
    setShowIndex(0);
    setPhase('show');
  };

  // Animate pattern display
  useEffect(() => {
    if (phase === 'show' && showIndex >= 0 && showIndex < pattern.length) {
      const timer = setTimeout(() => {
        setShowIndex(prev => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    }
    if (phase === 'show' && showIndex >= pattern.length) {
      setTimeout(() => {
        setShowIndex(-1);
        setPhase('input');
      }, 400);
    }
  }, [phase, showIndex, pattern.length]);

  const handleCellPress = (idx) => {
    if (phase !== 'input') return;
    const newInput = [...userInput, idx];
    setUserInput(newInput);

    if (newInput.length === pattern.length) {
      const correct = newInput.every((v, i) => v === pattern[i]);
      if (correct) setScore(prev => prev + 1);
      setRound(prev => prev + 1);
      if (correct) setLevel(prev => prev + 1);
      
      if (round + 1 >= TOTAL_ROUNDS) {
        setPhase('result');
      } else {
        setPhase('ready');
      }
    }
  };

  const finish = () => {
    navigation.navigate('TestHub', { words, completedTest: 'pattern' });
  };

  const getCellColor = (idx) => {
    if (phase === 'show' && idx === pattern[showIndex]) return Colors.dark.primary;
    if (phase === 'input' && userInput.includes(idx)) return colors.accent;
    return Colors.dark.surface;
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={Colors.dark.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phase === 'ready' && (
          <View style={styles.introBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#4F9DFF20' }]}>
              <Eye size={44} color="#4F9DFF" />
            </View>
            <Text style={[Typography.h2, { color: Colors.dark.text, textAlign: 'center' }]}>Pattern Memory</Text>
            <Text style={[Typography.body, { color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 8, fontSize: 14 }]}>
              Watch the sequence, then tap the same cells in order
            </Text>
            <Text style={[Typography.caption, { color: Colors.dark.textDisabled, marginTop: 8 }]}>
              ROUND {round + 1}/{TOTAL_ROUNDS} | SEQUENCE: {level}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={startRound} activeOpacity={0.85}>
              <Text style={[Typography.h3, { color: '#FFF' }]}>Go</Text>
            </TouchableOpacity>
          </View>
        )}

        {(phase === 'show' || phase === 'input') && (
          <View style={styles.gameZone}>
            <Text style={[Typography.caption, { color: Colors.dark.textSecondary, marginBottom: 20, textAlign: 'center' }]}>
              {phase === 'show' ? 'MEMORIZE THE PATTERN' : 'YOUR TURN — TAP IN ORDER'}
            </Text>
            <View style={styles.grid}>
              {Array.from({ length: GRID_SIZE }).map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.cell, { backgroundColor: getCellColor(idx) }]}
                  onPress={() => handleCellPress(idx)}
                  activeOpacity={0.7}
                  disabled={phase !== 'input'}
                />
              ))}
            </View>
            <Text style={[Typography.caption, { color: Colors.dark.textDisabled, marginTop: 20, textAlign: 'center' }]}>
              {phase === 'input' ? `${userInput.length}/${pattern.length} tapped` : `${showIndex + 1}/${pattern.length}`}
            </Text>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>{score >= 3 ? '🎉' : score >= 2 ? '👍' : '🧠'}</Text>
            <Text style={[Typography.h1, { color: Colors.dark.text, textAlign: 'center' }]}>
              {score}/{TOTAL_ROUNDS}
            </Text>
            <Text style={[Typography.body, { color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              {score >= 3 ? 'Excellent memory!' : score >= 2 ? 'Good job!' : 'Keep training!'}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={finish} activeOpacity={0.85}>
              <Text style={[Typography.h3, { color: '#FFF' }]}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  backBtn: { marginTop: 44, width: 44, height: 44, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center' },
  introBox: { alignItems: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 34, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, marginTop: 24 },
  gameZone: { alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 270, justifyContent: 'center', gap: 10 },
  cell: { width: 80, height: 80, borderRadius: 20 },
});

export default PatternTestScreen;
