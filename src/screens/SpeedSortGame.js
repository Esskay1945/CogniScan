import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SpeedSortGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [numbers, setNumbers] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef(null);
  const TOTAL = 5;

  const generateNumbers = (count) => {
    const nums = [];
    while (nums.length < count) {
      const n = Math.floor(Math.random() * 99) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    return nums;
  };

  const startRound = () => {
    const count = 5 + round;
    const nums = generateNumbers(count);
    setNumbers(nums);
    setSorted([]);
    setTimeLeft(20);
    setStartTime(Date.now());
    setPhase('play');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          nextRound(false);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
  };

  const handleTap = (num) => {
    const expected = [...numbers].sort((a, b) => a - b);
    const nextIdx = sorted.length;
    if (num === expected[nextIdx]) {
      const newSorted = [...sorted, num];
      setSorted(newSorted);
      if (newSorted.length === numbers.length) {
        clearInterval(timerRef.current);
        nextRound(true);
      }
    }
  };

  const nextRound = (success) => {
    if (success) setScore((s) => s + 1);
    setRound((r) => r + 1);
    if (round + 1 >= TOTAL) {
      setPhase('result');
    } else {
      setPhase('intro');
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phase === 'tutorial' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚡</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Speed Sort</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              Tap the numbers in ascending order (smallest to largest) as fast as possible. Speed and accuracy both count!
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              Example: Tap 3 → 7 → 15 → 28 → 42
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('intro')}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'intro' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚡</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Speed Sort</Text>
            <Text style={{ color: colors.textDisabled, fontSize: 12, marginTop: 8 }}>
              Round {round + 1}/{TOTAL} | Numbers: {5 + round}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startRound}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{round === 0 ? 'Start' : 'Next Round'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={styles.introBox}>
            <View style={styles.statsRow}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>
                {sorted.length}/{numbers.length} sorted
              </Text>
              <Text style={{ color: timeLeft < 5 ? colors.error : colors.textSecondary, fontWeight: '800', fontSize: 14 }}>
                {Math.ceil(timeLeft)}s
              </Text>
            </View>
            <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
              <View style={[styles.timerFill, { width: `${(timeLeft / 20) * 100}%`, backgroundColor: timeLeft < 5 ? colors.error : colors.accent }]} />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 16, marginTop: 8 }}>
              TAP IN ASCENDING ORDER (SMALLEST FIRST)
            </Text>
            <View style={styles.numbersGrid}>
              {numbers.map((num) => {
                const isSorted = sorted.includes(num);
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.numBtn,
                      {
                        backgroundColor: isSorted ? colors.success + '20' : colors.surface,
                        borderColor: isSorted ? colors.success : colors.border,
                        opacity: isSorted ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => handleTap(num)}
                    disabled={isSorted}
                  >
                    <Text style={{ color: isSorted ? colors.success : colors.text, fontSize: 22, fontWeight: '800' }}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 4 ? '🏆' : score >= 3 ? '⚡' : '🧠'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{TOTAL}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 4 ? 'Lightning processor!' : score >= 3 ? 'Good processing speed!' : 'Keep training!'}
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  timerBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
  timerFill: { height: '100%' },
  numbersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: width - 48 },
  numBtn: { width: 68, height: 68, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
});

export default SpeedSortGame;
