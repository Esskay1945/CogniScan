import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain } from 'lucide-react-native';

const DelayedRecallScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const words = route.params?.words || [];
  const elapsed = route.params?.elapsed || 0;
  const speechScore = route.params?.speechScore || 70;
  const reactionAvg = route.params?.reactionAvg || null;
  const patternScore = route.params?.patternScore != null ? route.params.patternScore : null;
  const clockScore = route.params?.clockScore || null;
  const [inputs, setInputs] = useState(['', '', '']);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const updateInput = (idx, val) => {
    const newInputs = [...inputs];
    newInputs[idx] = val;
    setInputs(newInputs);
  };

  const normalize = (s) => s.trim().toLowerCase().replace(/[^a-z]/g, '');

  const checkAnswers = () => {
    const normalizedWords = words.map(w => normalize(w));
    const normalizedInputs = inputs.map(i => normalize(i));
    const used = new Set();

    // For each input slot, find the best match from the word list
    const res = normalizedInputs.map((userWord) => {
      if (!userWord) return 'empty';
      
      // Check exact match first
      for (let j = 0; j < normalizedWords.length; j++) {
        if (!used.has(j) && userWord === normalizedWords[j]) {
          used.add(j);
          return 'correct';
        }
      }
      
      // Check typo tolerance (Levenshtein distance <= 1)
      for (let j = 0; j < normalizedWords.length; j++) {
        if (!used.has(j) && levenshtein(userWord, normalizedWords[j]) <= 1) {
          used.add(j);
          return 'correct';
        }
      }
      
      // Check close match (distance <= 2)
      for (let j = 0; j < normalizedWords.length; j++) {
        if (!used.has(j) && levenshtein(userWord, normalizedWords[j]) <= 2) {
          used.add(j);
          return 'close';
        }
      }
      
      return 'wrong';
    });
    
    setResults(res);
    setSubmitted(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  // Levenshtein distance
  const levenshtein = (a, b) => {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
        );
      }
    }
    return dp[m][n];
  };

  const correctCount = results.filter(r => r === 'correct').length;
  const closeCount = results.filter(r => r === 'close').length;

  const proceed = () => {
    saveAssessmentScore('recall', correctCount);
    navigation.navigate('Results', {
      ...route.params,
      recallScore: correctCount,
      recallClose: closeCount,
      recallTotal: words.length,
      recallResults: results,
      words,
      elapsed,
    });
  };

  const getColor = (r) => {
    if (r === 'correct') return colors.success;
    if (r === 'close') return colors.warning;
    return colors.error;
  };

  const getLabel = (r) => {
    if (r === 'correct') return 'Correct';
    if (r === 'close') return 'Close (typo)';
    if (r === 'wrong') return 'Incorrect';
    return 'Empty';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={10}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Step dots */}
          <View style={styles.stepRow}>
            {[colors.success, colors.success, colors.primary].map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={[styles.stepLine, { backgroundColor: i === 2 ? colors.primary : colors.success }]} />}
                <View style={[styles.stepDot, { backgroundColor: c }]} />
              </React.Fragment>
            ))}
          </View>

          <View style={[styles.iconCircle, { backgroundColor: colors.accent + '18' }]}>
            <Brain size={40} color={colors.accent} />
          </View>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Word Recall</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 6, fontSize: 14, marginBottom: 28 }}>
            Type the 3 words you were shown earlier
          </Text>

          {!submitted ? (
            <View>
              {[0, 1, 2].map(i => (
                <View key={i} style={{ marginBottom: 14 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>WORD {i + 1}</Text>
                  <TextInput
                    style={[styles.wordInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder={`Type word ${i + 1}...`}
                    placeholderTextColor={colors.textDisabled}
                    value={inputs[i]}
                    onChangeText={(v) => updateInput(i, v)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              ))}
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={checkAnswers} activeOpacity={0.85}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Check My Memory</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={[styles.scoreBox, { backgroundColor: colors.surface }]}>
                <Text style={[Typography.h1, { color: correctCount >= 2 ? colors.success : colors.warning, fontSize: 44 }]}>
                  {correctCount}/{words.length}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
                  {correctCount === 3 ? 'Perfect recall!' : correctCount === 2 ? 'Good memory' : 'Some words forgotten'}
                </Text>
              </View>

              {words.map((word, i) => (
                <View key={i} style={[styles.resultCard, { backgroundColor: colors.surface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>EXPECTED</Text>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{word}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>YOU SAID</Text>
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{inputs[i] || '—'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getColor(results[i]) + '20' }]}>
                    <Text style={{ color: getColor(results[i]), fontSize: 11, fontWeight: '700' }}>{getLabel(results[i])}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={proceed} activeOpacity={0.85}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>See Full Results</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Extra padding for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepLine: { width: 36, height: 2, marginHorizontal: 4 },
  iconCircle: { alignSelf: 'center', width: 80, height: 80, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  wordInput: { height: 54, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 17, fontWeight: '600' },
  btn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  scoreBox: { alignItems: 'center', padding: 24, borderRadius: 20, marginBottom: 16 },
  resultCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
});

export default DelayedRecallScreen;
