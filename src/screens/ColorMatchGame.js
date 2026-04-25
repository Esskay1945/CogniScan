import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ColorMatchGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState({ text: '', color: '', match: false });
  const timerRef = useRef(null);
  const TOTAL_TIME = 30;

  const colorNames = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
  const colorValues = { RED: '#FF3D00', BLUE: '#0066FF', GREEN: '#00E676', YELLOW: '#FFD600', PURPLE: '#9B7BFF', ORANGE: '#FF8A65' };

  const generateWord = () => {
    const textIdx = Math.floor(Math.random() * colorNames.length);
    const isMatch = Math.random() > 0.5;
    const colorIdx = isMatch ? textIdx : (textIdx + 1 + Math.floor(Math.random() * (colorNames.length - 1))) % colorNames.length;
    setCurrentWord({
      text: colorNames[textIdx],
      color: colorValues[colorNames[colorIdx]],
      match: isMatch,
    });
  };

  const startGame = () => {
    setScore(0);
    setRound(0);
    setTimeLeft(TOTAL_TIME);
    setPhase('play');
    generateWord();
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

  const handleAnswer = (answer) => {
    if (phase !== 'play') return;
    if (answer === currentWord.match) setScore((s) => s + 1);
    setRound((r) => r + 1);
    generateWord();
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
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎨</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Color Match</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              A color name will appear in a colored text. Decide if the word matches the ink color.
            </Text>
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: '#FF3D00', fontSize: 28, fontWeight: '900' }}>BLUE</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                ↑ The word says "BLUE" but ink is RED → MISMATCH
              </Text>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('intro')}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'intro' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎨</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Color Match</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6 }}>
              Does the word match its ink color? Answer as fast as you can!
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startGame}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Start</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={styles.introBox}>
            <View style={styles.statsRow}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>Score: {score}</Text>
              <Text style={{ color: timeLeft < 5 ? colors.error : colors.textSecondary, fontWeight: '800', fontSize: 18 }}>
                {Math.ceil(timeLeft)}s
              </Text>
            </View>
            <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
              <View style={[styles.timerFill, { width: `${(timeLeft / TOTAL_TIME) * 100}%`, backgroundColor: timeLeft < 5 ? colors.error : colors.accent }]} />
            </View>

            <View style={[styles.wordCard, { backgroundColor: colors.surface }]}>
              <Text style={{ color: currentWord.color, fontSize: 42, fontWeight: '900', letterSpacing: 4 }}>
                {currentWord.text}
              </Text>
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 16 }}>
              Does the word match its ink color?
            </Text>

            <View style={styles.answerRow}>
              <TouchableOpacity style={[styles.answerBtn, { backgroundColor: colors.success }]} onPress={() => handleAnswer(true)}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 18 }}>MATCH ✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.answerBtn, { backgroundColor: colors.error }]} onPress={() => handleAnswer(false)}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 18 }}>MISMATCH ✗</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 20 ? '🏆' : score >= 12 ? '⚡' : '🎨'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{round}</Text>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginTop: 4 }}>
              {Math.round((score / Math.max(round, 1)) * 100)}% Accuracy
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 20 ? 'Exceptional focus!' : score >= 12 ? 'Good attention!' : 'Keep practicing!'}
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
  wordCard: { width: '100%', padding: 40, borderRadius: 20, alignItems: 'center', marginBottom: 24 },
  answerRow: { flexDirection: 'row', gap: 16, width: '100%' },
  answerBtn: { flex: 1, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});

export default ColorMatchGame;
