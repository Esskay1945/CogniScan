import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const MathBlitzGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState(null);
  const [options, setOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);
  const TOTAL_TIME = 45;

  const generateProblem = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * 50) + 5;
        b = Math.floor(Math.random() * 50) + 5;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 50) + 20;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        answer = a * b;
        break;
    }

    // Generate wrong options
    const wrongOptions = new Set();
    while (wrongOptions.size < 3) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrong = answer + offset;
      if (wrong !== answer && wrong > 0) wrongOptions.add(wrong);
    }

    const allOptions = [...wrongOptions, answer].sort(() => Math.random() - 0.5);
    setProblem({ a, b, op, answer });
    setOptions(allOptions);
    setFeedback(null);
  };

  const startGame = () => {
    setScore(0);
    setRound(0);
    setTimeLeft(TOTAL_TIME);
    setPhase('play');
    generateProblem();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          setPhase('result');
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
  };

  const handleAnswer = (selected) => {
    if (phase !== 'play') return;
    if (selected === problem.answer) {
      setScore((s) => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setRound((r) => r + 1);
    setTimeout(() => generateProblem(), 300);
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
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🧮</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Math Blitz</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              Solve as many math problems as possible before time runs out. Tests your mental arithmetic and processing speed.
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              ✦ Addition, subtraction, multiplication{'\n'}✦ Choose the correct answer{'\n'}✦ {TOTAL_TIME} seconds total
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startGame}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && problem && (
          <View style={styles.introBox}>
            <View style={styles.statsRow}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>Score: {score}</Text>
              <Text style={{ color: timeLeft < 10 ? colors.error : colors.textSecondary, fontWeight: '800', fontSize: 18 }}>
                {Math.ceil(timeLeft)}s
              </Text>
            </View>
            <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
              <View style={[styles.timerFill, { width: `${(timeLeft / TOTAL_TIME) * 100}%`, backgroundColor: timeLeft < 10 ? colors.error : colors.accent }]} />
            </View>

            <View style={[styles.problemCard, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.text, fontSize: 48, fontWeight: '900' }}>
                {problem.a} {problem.op} {problem.b}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8 }}>= ?</Text>
            </View>

            <View style={styles.optionsGrid}>
              {options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleAnswer(opt)}
                >
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {feedback && (
              <Text style={{ color: feedback === 'correct' ? colors.success : colors.error, fontWeight: '800', fontSize: 14, marginTop: 12 }}>
                {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
              </Text>
            )}
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 15 ? '🏆' : score >= 10 ? '🧮' : '🧠'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{round}</Text>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginTop: 4 }}>
              {Math.round((score / Math.max(round, 1)) * 100)}% Accuracy
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 15 ? 'Mental math genius!' : score >= 10 ? 'Great arithmetic!' : 'Keep training!'}
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  timerBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 32 },
  timerFill: { height: '100%' },
  problemCard: { width: '100%', padding: 40, borderRadius: 20, alignItems: 'center', marginBottom: 24 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', justifyContent: 'center' },
  optionBtn: { width: '46%', height: 64, borderRadius: 16, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
});

export default MathBlitzGame;
