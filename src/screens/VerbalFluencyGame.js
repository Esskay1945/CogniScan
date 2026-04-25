import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { ChevronLeft } from 'lucide-react-native';

const VerbalFluencyGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore, saveGameResult } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'verbalFluency';
  const [phase, setPhase] = useState('tutorial');
  const [letter, setLetter] = useState('');
  const [words, setWords] = useState([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const TOTAL_TIME = 60;

  const LETTERS = 'ABCDEFGHIJKLMNOPRSTW'.split('');

  const startRound = () => {
    const l = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setLetter(l);
    setWords([]);
    setInput('');
    setError('');
    setTimeLeft(TOTAL_TIME);
    setPhase('play');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          setPhase('result');
          setWords(currentWords => {
            saveResults(currentWords);
            return currentWords;
          });
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
  };

  const saveResults = (finalWords) => {
    const score = finalWords.length;
    // Normalized score: 15 words = 100%
    const normalized = Math.min(100, Math.round((score / 15) * 100));
    
    if (isMandatoryFlow) {
      saveAssessmentScore(testId, normalized, { wordCount: score, words: finalWords });
    } else {
      saveGameResult({ gameId: 'VerbalFluency', category: 'language', score: normalized, duration: TOTAL_TIME });
    }
  };

  const submitWord = () => {
    const word = input.trim().toUpperCase();
    if (!word) return;
    if (!word.startsWith(letter)) {
      setError(`Word must start with "${letter}"`);
      return;
    }
    if (word.length < 3) {
      setError('Word must be at least 3 letters');
      return;
    }
    if (words.includes(word)) {
      setError('Already used!');
      return;
    }
    setWords((w) => [...w, word]);
    setInput('');
    setError('');
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
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Verbal Fluency</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              Type as many words as possible that start with the given letter within 60 seconds. Tests your verbal fluency and lexical access speed.
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              ✦ Each word must start with the letter{'\n'}✦ Minimum 3 letters per word{'\n'}✦ No repeated words
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startRound}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={{ flex: 1 }}>
            <View style={styles.statsRow}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
                Words: {words.length}
              </Text>
              <Text style={{ color: timeLeft < 10 ? colors.error : colors.textSecondary, fontWeight: '800', fontSize: 18 }}>
                {Math.ceil(timeLeft)}s
              </Text>
            </View>
            <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
              <View style={[styles.timerFill, { width: `${(timeLeft / TOTAL_TIME) * 100}%`, backgroundColor: timeLeft < 10 ? colors.error : colors.accent }]} />
            </View>

            <View style={[styles.letterCard, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>WORDS STARTING WITH</Text>
              <Text style={{ color: colors.primary, fontSize: 72, fontWeight: '900', marginTop: 8 }}>{letter}</Text>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: error ? colors.error : colors.border }]}
                value={input}
                onChangeText={(v) => { setInput(v); setError(''); }}
                placeholder={`Type a word starting with ${letter}...`}
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="characters"
                autoFocus
                onSubmitEditing={submitWord}
              />
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={submitWord}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>+</Text>
              </TouchableOpacity>
            </View>
            {error ? <Text style={{ color: colors.error, fontSize: 11, fontWeight: '600', marginTop: 4 }}>{error}</Text> : null}

            <View style={styles.wordsGrid}>
              {words.map((w, i) => (
                <View key={i} style={[styles.wordChip, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{words.length >= 15 ? '🏆' : words.length >= 10 ? '💬' : '📝'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{words.length} Words</Text>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700', marginTop: 4 }}>
              Letter: {letter}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {words.length >= 15 ? 'Incredible fluency!' : words.length >= 10 ? 'Great verbal skills!' : 'Keep practicing!'}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => isMandatoryFlow ? navigation.navigate('TestHub', { ...route.params, completedTest: testId }) : navigation.goBack()}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{isMandatoryFlow ? 'Continue Assessment' : 'Done'}</Text>
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  timerBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 20 },
  timerFill: { height: '100%' },
  letterCard: { padding: 28, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, height: 54, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
  submitBtn: { width: 54, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  wordsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  wordChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
});

export default VerbalFluencyGame;
