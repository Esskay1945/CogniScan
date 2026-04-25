import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const WordScrambleGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);
  const TOTAL = 8;

  const words = [
    'MEMORY', 'BRAIN', 'NEURON', 'FOCUS', 'THINK', 'RECALL',
    'LOGIC', 'PATTERN', 'SIGNAL', 'CORTEX', 'SENSE', 'REFLEX',
    'SYNAPSE', 'IMPULSE', 'COGNITION', 'AWARENESS', 'ATTENTION', 'PERCEPTION',
    'BALANCE', 'TEMPLE', 'BRIDGE', 'GARDEN', 'FOREST', 'PLANET',
    'CASTLE', 'PRISM', 'SILVER', 'FALCON', 'ANCHOR', 'HORIZON',
    'CRYSTAL', 'VELVET', 'MARBLE', 'SUMMIT', 'HARVEST', 'JUNGLE',
    'RIDDLE', 'VOYAGE', 'PUZZLE', 'CANVAS', 'BEACON', 'LANTERN',
    'SHADOW', 'MIRROR', 'WHISPER', 'CURRENT', 'MOTION', 'THUNDER',
    'MAGNET', 'SHIELD', 'ROCKET', 'CARBON', 'MUSCLE', 'VESSEL',
    'RHYTHM', 'MELODY', 'SPIRIT', 'WANDER', 'BREEZE', 'GLACIER',
    'WISDOM', 'VISION', 'HARBOR', 'LEGEND', 'VOYAGE', 'ZENITH',
  ];

  const scramble = (word) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const result = arr.join('');
    return result === word ? scramble(word) : result;
  };

  const startRound = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setScrambled(scramble(word));
    setUserInput('');
    setFeedback(null);
    setTimeLeft(15);
    setPhase('play');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
  };

  const handleTimeout = () => {
    setFeedback('timeout');
    setRound((r) => r + 1);
    setTimeout(() => {
      if (round + 1 >= TOTAL) setPhase('result');
      else startRound();
    }, 1500);
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    if (userInput.toUpperCase() === currentWord) {
      setScore((s) => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setRound((r) => r + 1);
    setTimeout(() => {
      if (round + 1 >= TOTAL) setPhase('result');
      else startRound();
    }, 1200);
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
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔤</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Word Scramble</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              Unscramble the letters to form the correct word. Type your answer and submit before time runs out.
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              Example: RNABI → BRAIN
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startRound}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={styles.introBox}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
              ROUND {round + 1}/{TOTAL}
            </Text>
            <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
              <View style={[styles.timerFill, { width: `${(timeLeft / 15) * 100}%`, backgroundColor: timeLeft < 4 ? colors.error : colors.accent }]} />
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 16 }}>UNSCRAMBLE</Text>
            <View style={styles.scrambledRow}>
              {scrambled.split('').map((letter, i) => (
                <View key={i} style={[styles.letterBox, { backgroundColor: colors.surface }]}>
                  <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '900' }}>{letter}</Text>
                </View>
              ))}
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: feedback === 'correct' ? colors.success : feedback === 'wrong' ? colors.error : colors.border }]}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type the word..."
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="characters"
              autoFocus
              onSubmitEditing={handleSubmit}
            />

            {feedback && (
              <Text style={{ color: feedback === 'correct' ? colors.success : colors.error, fontWeight: '800', fontSize: 14, marginTop: 8 }}>
                {feedback === 'correct' ? '✓ Correct!' : feedback === 'wrong' ? `✗ It was ${currentWord}` : `⏰ Time's up! It was ${currentWord}`}
              </Text>
            )}

            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 7 ? '🏆' : score >= 5 ? '🔤' : '📝'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{TOTAL}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 7 ? 'Linguistic genius!' : score >= 5 ? 'Great word skills!' : 'Keep training!'}
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
  timerBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
  timerFill: { height: '100%' },
  scrambledRow: { flexDirection: 'row', gap: 8, marginVertical: 24, flexWrap: 'wrap', justifyContent: 'center' },
  letterBox: { width: 48, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  input: { width: '100%', height: 56, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 20, fontSize: 20, fontWeight: '700', textAlign: 'center' },
});

export default WordScrambleGame;
