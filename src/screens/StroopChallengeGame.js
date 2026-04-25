import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const DIRECTIONS = ['LEFT', 'RIGHT', 'UP', 'DOWN'];
const ARROWS = { LEFT: '←', RIGHT: '→', UP: '↑', DOWN: '↓' };

const StroopChallengeGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'stroop';
  const [phase, setPhase] = useState('tutorial');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [timer, setTimer] = useState(0);
  const totalRounds = 20;

  const generateStimulus = () => {
    const direction = DIRECTIONS[Math.floor(Math.random() * 4)];
    const displayDirection = DIRECTIONS[Math.floor(Math.random() * 4)];
    const isCongruent = direction === displayDirection;
    return { direction, displayDirection, isCongruent };
  };

  useEffect(() => {
    if (phase === 'playing') {
      setCurrentStimulus(generateStimulus());
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleResponse = (dir) => {
    if (!currentStimulus) return;
    const isCorrect = dir === currentStimulus.direction;
    if (isCorrect) setCorrect(c => c + 1);

    const nextRound = round + 1;
    setRound(nextRound);

    if (nextRound >= totalRounds) {
      const score = Math.round(((correct + (isCorrect ? 1 : 0)) / totalRounds) * 100);
      if (isMandatoryFlow) {
        saveAssessmentScore(testId, score);
      } else {
        saveGameResult({ gameId: 'stroop', category: 'executive', score, duration: timer });
      }
      setPhase('results');
    } else {
      setCurrentStimulus(generateStimulus());
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔄</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Stroop Challenge</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            An arrow points in a direction, but the WORD says something different!{'\n'}Tap the direction the ARROW points to, ignore the word.
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>EXAMPLE</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Arrow: → (pointing RIGHT)</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Word says: "LEFT"</Text>
            <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>✓ Tap RIGHT</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const score = Math.round((correct / totalRounds) * 100);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🧪</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Stroop Score</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>{correct}/{totalRounds} correct</Text>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary }]} 
            onPress={() => {
              saveAssessmentScore(testId, score, { correct, incorrect });
              isMandatoryFlow ? navigation.navigate('TestHub', { ...route.params, completedTest: testId }) : navigation.goBack();
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>{isMandatoryFlow ? 'CONTINUE ASSESSMENT' : 'DONE'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Stroop Challenge</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{round}/{totalRounds}</Text>
      </View>
      {currentStimulus && (
        <View style={styles.stimulusArea}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 12 }}>
            WHICH DIRECTION DOES THE ARROW POINT?
          </Text>
          <Text style={{ fontSize: 80 }}>{ARROWS[currentStimulus.direction]}</Text>
          <Text style={{ color: colors.error, fontSize: 24, fontWeight: '900', marginTop: 8 }}>
            {currentStimulus.displayDirection}
          </Text>
        </View>
      )}
      <View style={styles.dirGrid}>
        {DIRECTIONS.map(dir => (
          <TouchableOpacity
            key={dir}
            style={[styles.dirBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleResponse(dir)}
          >
            <Text style={{ fontSize: 28 }}>{ARROWS[dir]}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 4 }}>{dir}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 56 },
  tutBox: { width: '100%', padding: 16, borderRadius: 14, marginTop: 24 },
  btn: { width: '100%', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  stimulusArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dirGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, padding: 24, paddingBottom: 48 },
  dirBtn: { width: (width - 72) / 2, padding: 20, borderRadius: 16, borderWidth: 1.5, alignItems: 'center' },
});

export default StroopChallengeGame;
