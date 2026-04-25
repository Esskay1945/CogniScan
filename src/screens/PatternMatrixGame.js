import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GRID_SIZE_START = 3;

const PatternMatrixGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial'); // tutorial | intro | show | input | result
  const [gridSize, setGridSize] = useState(GRID_SIZE_START);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL = 6;

  const generatePattern = (size) => {
    const count = Math.min(size, Math.floor((gridSize * gridSize) / 2));
    const cells = [];
    while (cells.length < count) {
      const cell = Math.floor(Math.random() * gridSize * gridSize);
      if (!cells.includes(cell)) cells.push(cell);
    }
    return cells;
  };

  const startRound = () => {
    const p = generatePattern(gridSize);
    setPattern(p);
    setUserPattern([]);
    setPhase('show');
    setTimeout(() => setPhase('input'), 1500 + gridSize * 300);
  };

  const toggleCell = (idx) => {
    if (phase !== 'input') return;
    setUserPattern((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const submitAnswer = () => {
    const correct = pattern.every((p) => userPattern.includes(p)) && userPattern.length === pattern.length;
    if (correct) {
      setScore((s) => s + 1);
      setGridSize((g) => Math.min(g + 1, 6));
    }
    setRound((r) => r + 1);
    if (round + 1 >= TOTAL) setPhase('result');
    else setPhase('intro');
  };

  const cellSize = Math.min(60, (width - 80) / gridSize - 8);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phase === 'tutorial' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🧩</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Pattern Matrix</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              A grid will light up certain cells briefly. Remember which cells were highlighted and tap them in the input phase.
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              ✦ Watch the highlighted cells{'\n'}✦ Tap to recreate the pattern{'\n'}✦ Grid grows as you succeed
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('intro')}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'intro' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🧩</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Pattern Matrix</Text>
            <Text style={{ color: colors.textDisabled, fontSize: 12, marginTop: 8 }}>
              Round {round + 1}/{TOTAL} | Grid: {gridSize}x{gridSize}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startRound}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{round === 0 ? 'Start' : 'Next Round'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {(phase === 'show' || phase === 'input') && (
          <View style={styles.introBox}>
            <Text style={{ color: phase === 'show' ? colors.warning : colors.accent, fontSize: 12, fontWeight: '700', marginBottom: 16 }}>
              {phase === 'show' ? 'MEMORIZE THE PATTERN' : 'RECREATE THE PATTERN'}
            </Text>
            <View style={[styles.grid, { width: gridSize * (cellSize + 8) }]}>
              {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                const isPattern = pattern.includes(idx);
                const isSelected = userPattern.includes(idx);
                const showHighlight = phase === 'show' && isPattern;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.cell,
                      {
                        width: cellSize, height: cellSize,
                        backgroundColor: showHighlight ? colors.primary : isSelected ? colors.accent : colors.surface,
                        borderColor: showHighlight ? colors.primary : isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => toggleCell(idx)}
                    disabled={phase !== 'input'}
                  />
                );
              })}
            </View>
            {phase === 'input' && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={submitAnswer}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 5 ? '🏆' : score >= 3 ? '👍' : '🧩'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{TOTAL}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 5 ? 'Pattern master!' : score >= 3 ? 'Good spatial memory!' : 'Keep training!'}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  back: { marginTop: 44, width: 44, height: 44, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center' },
  introBox: { alignItems: 'center' },
  btn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  cell: { borderRadius: 10, borderWidth: 1.5 },
});

export default PatternMatrixGame;
