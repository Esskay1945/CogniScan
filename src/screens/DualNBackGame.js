import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const DualNBackGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nBack] = useState(2);
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showingItem, setShowingItem] = useState(null);
  const TOTAL_ITEMS = 15;

  const POSITIONS = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
  ];

  const generateSequence = () => {
    const seq = [];
    for (let i = 0; i < TOTAL_ITEMS; i++) {
      // ~30% chance of matching n-back
      if (i >= nBack && Math.random() < 0.3) {
        seq.push(seq[i - nBack]);
      } else {
        seq.push(Math.floor(Math.random() * 9));
      }
    }
    return seq;
  };

  const startGame = () => {
    const seq = generateSequence();
    setSequence(seq);
    setCurrentIdx(0);
    setResponses([]);
    setScore(0);
    setRound(0);
    setPhase('play');
    setShowingItem(seq[0]);
  };

  useEffect(() => {
    if (phase === 'play' && currentIdx < sequence.length) {
      setShowingItem(sequence[currentIdx]);
      const t = setTimeout(() => {
        setShowingItem(null);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [phase, currentIdx]);

  const handleResponse = (isMatch) => {
    const actualMatch = currentIdx >= nBack && sequence[currentIdx] === sequence[currentIdx - nBack];
    const correct = isMatch === actualMatch;

    if (correct) setScore((s) => s + 1);
    setFeedback(correct ? 'correct' : 'wrong');
    setRound((r) => r + 1);

    setTimeout(() => {
      setFeedback(null);
      if (currentIdx + 1 >= sequence.length) {
        setPhase('result');
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 600);
  };

  const cellSize = 60;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phase === 'tutorial' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🧬</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Dual N-Back</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              A position will highlight on the grid. Determine if the current position matches the one from {nBack} steps ago.
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              ✦ Watch the highlighted position{'\n'}✦ Does it match {nBack} steps back?{'\n'}✦ This is a gold-standard cognitive exercise!
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startGame}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={styles.introBox}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
              ITEM {currentIdx + 1}/{TOTAL_ITEMS} | SCORE: {score}
            </Text>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800', marginBottom: 20 }}>
              {nBack}-BACK PROTOCOL
            </Text>

            {/* Grid */}
            <View style={styles.grid}>
              {POSITIONS.map((pos, idx) => {
                const isHighlighted = showingItem === idx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.gridCell,
                      {
                        width: cellSize, height: cellSize,
                        backgroundColor: isHighlighted ? colors.primary : colors.surface,
                        borderColor: isHighlighted ? colors.primary : colors.border,
                      },
                    ]}
                  />
                );
              })}
            </View>

            {feedback && (
              <Text style={{ color: feedback === 'correct' ? colors.success : colors.error, fontWeight: '800', fontSize: 16, marginTop: 16 }}>
                {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
              </Text>
            )}

            <View style={styles.responseRow}>
              <TouchableOpacity
                style={[styles.responseBtn, { backgroundColor: colors.success }]}
                onPress={() => handleResponse(true)}
                disabled={feedback !== null}
              >
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>MATCH</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.responseBtn, { backgroundColor: colors.error }]}
                onPress={() => handleResponse(false)}
                disabled={feedback !== null}
              >
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>NO MATCH</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 12 ? '🏆' : score >= 9 ? '🧬' : '🧠'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{TOTAL_ITEMS}</Text>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginTop: 4 }}>
              {Math.round((score / TOTAL_ITEMS) * 100)}% Accuracy
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 12 ? 'Working memory elite!' : score >= 9 ? 'Strong performance!' : 'Keep training!'}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 200, gap: 8, justifyContent: 'center' },
  gridCell: { borderRadius: 12, borderWidth: 1.5 },
  responseRow: { flexDirection: 'row', gap: 16, marginTop: 32, width: '100%' },
  responseBtn: { flex: 1, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});

export default DualNBackGame;
