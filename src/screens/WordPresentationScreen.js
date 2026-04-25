import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Colors, WordBanks } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Brain, ArrowRight, Volume2 } from 'lucide-react-native';

const WordPresentationScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('intro'); // intro | showing | done
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Pick random word set
  const [words] = useState(() => {
    const idx = Math.floor(Math.random() * WordBanks.length);
    return WordBanks[idx];
  });

  useEffect(() => {
    if (phase === 'showing') {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      
      if (currentWordIndex < words.length) {
        const timer = setTimeout(() => {
          if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
          } else {
            setPhase('done');
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, currentWordIndex]);

  const startShowing = () => setPhase('showing');

  const proceed = () => {
    navigation.navigate('TestHub', { ...route.params, words, completedTest: 'wordRecall' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.gradient} style={styles.bg}>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.center}>
          {phase === 'intro' && (
            <View style={styles.introBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
                <Brain size={48} color={colors.primary} />
              </View>
              <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginBottom: 12 }]}>
                Memory Challenge
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', lineHeight: 22, fontSize: 15 }]}>
                You will be shown <Text style={{ color: colors.primary, fontWeight: '700' }}>3 words</Text> one at a time.{'\n\n'}
                Remember them carefully.{'\n'}
                We will ask you to recall them later.
              </Text>
              <TouchableOpacity 
                style={[styles.startBtn, { backgroundColor: colors.primary }]} 
                onPress={startShowing}
                activeOpacity={0.85}
              >
                <Text style={[Typography.h3, { color: '#FFF' }]}>I'm Ready</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'showing' && (
            <View style={styles.wordDisplay}>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
                WORD {currentWordIndex + 1} OF {words.length}
              </Text>
              <Animated.View style={[styles.wordCard, { backgroundColor: colors.surface, opacity: fadeAnim }]}>
                <Volume2 size={20} color={colors.textDisabled} style={{ marginBottom: 12 }} />
                <Text style={[Typography.h1, { color: colors.primary, fontSize: 42, textAlign: 'center' }]}>
                  {words[currentWordIndex]}
                </Text>
              </Animated.View>
              <View style={styles.timerRow}>
                {words.map((_, i) => (
                  <View key={i} style={[styles.timerDot, { backgroundColor: i <= currentWordIndex ? colors.primary : colors.border }]} />
                ))}
              </View>
            </View>
          )}

          {phase === 'done' && (
            <View style={styles.introBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.success + '18' }]}>
                <Text style={{ fontSize: 48 }}>✅</Text>
              </View>
              <Text style={[Typography.h2, { color: colors.text, textAlign: 'center', marginBottom: 12 }]}>
                Words Memorized!
              </Text>
              <View style={[styles.wordsRecapCard, { backgroundColor: colors.surface }]}>
                {words.map((w, i) => (
                  <Text key={i} style={[Typography.h3, { color: colors.primary, textAlign: 'center', marginVertical: 4 }]}>{w}</Text>
                ))}
              </View>
              <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 16, fontSize: 14 }]}>
                Now complete the other brain challenges.{'\n'}We'll ask you to recall these words later.
              </Text>
              <TouchableOpacity 
                style={[styles.startBtn, { backgroundColor: colors.primary }]} 
                onPress={proceed}
                activeOpacity={0.85}
              >
                <Text style={[Typography.h3, { color: '#FFF', marginRight: 8 }]}>Continue</Text>
                <ArrowRight size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

      </LinearGradient>
    </View>
  );
}; 

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, padding: 24 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 50, marginBottom: 20 },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepLine: { width: 40, height: 2, marginHorizontal: 4 },
  center: { flex: 1, justifyContent: 'center' },
  introBox: { alignItems: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 34, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  startBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 32 },
  wordDisplay: { alignItems: 'center' },
  wordCard: { padding: 40, borderRadius: 32, alignItems: 'center', minWidth: 280 },
  timerRow: { flexDirection: 'row', marginTop: 32, gap: 10 },
  timerDot: { width: 10, height: 10, borderRadius: 5 },
  wordsRecapCard: { padding: 20, borderRadius: 20, marginTop: 12, minWidth: 200 },
});

export default WordPresentationScreen;
