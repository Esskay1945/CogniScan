import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Target } from 'lucide-react-native';

const CCalibrationGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [actuals, setActuals] = useState([]);
  const [currentGuess, setCurrentGuess] = useState(null);
  const TOTAL = 3;

  const tasks = [
    { question: 'How many of these numbers can you memorize in 5 seconds?\n\n7 3 9 1 4 8 2 6', actual: null },
    { question: 'Rate your reaction speed today (0-100)', actual: null },
    { question: 'How well do you think you did on the memory task? (0-100)', actual: null },
  ];

  // Simulate actual scores
  const getActual = (roundIdx) => {
    if (roundIdx === 0) return 60 + Math.floor(Math.random() * 30);
    if (roundIdx === 1) return 50 + Math.floor(Math.random() * 40);
    return 40 + Math.floor(Math.random() * 50);
  };

  const submitGuess = () => {
    if (currentGuess == null) return;
    const actual = getActual(round);
    setGuesses(p => [...p, currentGuess]);
    setActuals(p => [...p, actual]);
    setCurrentGuess(null);
    setRound(p => p + 1);
    if (round + 1 >= TOTAL) setPhase('result');
    else setPhase('task');
  };

  const avgGap = guesses.length > 0
    ? Math.round(guesses.reduce((sum, g, i) => sum + Math.abs(g - actuals[i]), 0) / guesses.length)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={Colors.dark.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.center}>
        {(phase === 'intro' || phase === 'task') && (
          <View style={styles.introBox}>
            <View style={[styles.iconBox, { backgroundColor: '#22C55E18' }]}>
              <Target size={40} color="#22C55E" />
            </View>
            <Text style={[Typography.h2, { color: Colors.dark.text, textAlign: 'center' }]}>Reality Calibration</Text>
            <Text style={{ color: Colors.dark.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, marginBottom: 24 }}>
              Guess your own performance — how well do you really know yourself?
            </Text>

            <View style={[styles.taskCard, { backgroundColor: Colors.dark.surface }]}>
              <Text style={{ color: Colors.dark.text, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
                {tasks[round]?.question || 'Rate yourself'}
              </Text>
            </View>

            <Text style={{ color: Colors.dark.textSecondary, fontSize: 12, marginTop: 16, marginBottom: 8 }}>
              Your guess: {currentGuess ?? '—'}/100
            </Text>

            {/* Simple slider via buttons */}
            <View style={styles.sliderRow}>
              {[0, 20, 40, 60, 80, 100].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.sliderBtn, { backgroundColor: currentGuess === v ? Colors.dark.primary : Colors.dark.surface }]}
                  onPress={() => setCurrentGuess(v)}
                >
                  <Text style={{ color: currentGuess === v ? '#FFF' : Colors.dark.text, fontWeight: '700', fontSize: 13 }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary, opacity: currentGuess == null ? 0.5 : 1 }]} onPress={submitGuess} disabled={currentGuess == null}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Submit Guess</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{avgGap <= 15 ? '🎯' : avgGap <= 30 ? '👍' : '🤔'}</Text>
            <Text style={[Typography.h2, { color: Colors.dark.text }]}>Calibration Score</Text>
            <Text style={{ color: Colors.dark.textSecondary, fontSize: 14, marginTop: 4 }}>
              Average gap between guess and actual: <Text style={{ color: Colors.dark.primary, fontWeight: '700' }}>{avgGap} pts</Text>
            </Text>

            {guesses.map((g, i) => (
              <View key={i} style={[styles.compareRow, { backgroundColor: Colors.dark.surface }]}>
                <View>
                  <Text style={{ color: Colors.dark.textSecondary, fontSize: 11 }}>YOUR GUESS</Text>
                  <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 18 }}>{g}</Text>
                </View>
                <Text style={{ color: Colors.dark.textDisabled, fontSize: 18 }}>vs</Text>
                <View>
                  <Text style={{ color: Colors.dark.textSecondary, fontSize: 11 }}>ACTUAL</Text>
                  <Text style={{ color: Colors.dark.primary, fontWeight: '700', fontSize: 18 }}>{actuals[i]}</Text>
                </View>
                <View style={[styles.gapPill, { backgroundColor: Math.abs(g - actuals[i]) <= 15 ? colors.success + '20' : colors.warning + '20' }]}>
                  <Text style={{ color: Math.abs(g - actuals[i]) <= 15 ? colors.success : colors.warning, fontSize: 11, fontWeight: '700' }}>
                    {Math.abs(g - actuals[i]) <= 15 ? 'Close!' : 'Off'}
                  </Text>
                </View>
              </View>
            ))}

            <Text style={{ color: Colors.dark.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
              {avgGap <= 15 ? 'Excellent self-awareness! You know your brain well.' : 'Your self-perception differs from actual performance. This awareness gap is an important signal.'}
            </Text>

            <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={() => navigation.goBack()}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  back: { marginTop: 44, width: 44, height: 44, justifyContent: 'center' },
  center: { flexGrow: 1, justifyContent: 'center', paddingBottom: 40 },
  introBox: { alignItems: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  taskCard: { padding: 24, borderRadius: 16, width: '100%' },
  sliderRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  sliderBtn: { width: 48, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 20, width: '100%' },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, marginTop: 10, width: '100%' },
  gapPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});

export default CCalibrationGame;
