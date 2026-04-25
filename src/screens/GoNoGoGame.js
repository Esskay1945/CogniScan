import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const GoNoGoGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'goNoGo';
  const [phase, setPhase] = useState('tutorial');
  const [stimulus, setStimulus] = useState(null);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [misses, setMisses] = useState(0);
  const [responded, setResponded] = useState(false);
  const [timer, setTimer] = useState(0);
  const totalRounds = 20;

  const GO_COLORS = ['#00E676', '#0066FF', '#00F0FF'];
  const NOGO_COLORS = ['#FF3D00', '#FF6B9D'];

  const generateStimulus = () => {
    const isGo = Math.random() > 0.3; // 70% Go, 30% NoGo
    const colorSet = isGo ? GO_COLORS : NOGO_COLORS;
    return {
      color: colorSet[Math.floor(Math.random() * colorSet.length)],
      isGo,
      shape: isGo ? '●' : '■',
    };
  };

  const nextStimulus = () => {
    setResponded(false);
    setStimulus(generateStimulus());
  };

  useEffect(() => {
    if (phase === 'playing') {
      nextStimulus();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && stimulus && !responded) {
      const timeout = setTimeout(() => {
        if (!responded) {
          if (stimulus.isGo) {
            setMisses(m => m + 1); // Missed a Go
          } else {
            setCorrect(c => c + 1); // Correctly didn't respond to NoGo
          }
          advanceRound();
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [stimulus, responded]);

  const advanceRound = () => {
    const next = round + 1;
    setRound(next);
    if (next >= totalRounds) {
      const score = Math.round((correct / totalRounds) * 100);
      if (isMandatoryFlow) {
        saveAssessmentScore(testId, score, { misses, falseAlarms });
      } else {
        saveGameResult({ gameId: 'goNoGo', category: 'attention', score, duration: timer });
      }
      setPhase('results');
    } else {
      setTimeout(nextStimulus, 500);
    }
  };

  const handleTap = () => {
    if (responded || !stimulus) return;
    setResponded(true);
    if (stimulus.isGo) {
      setCorrect(c => c + 1);
    } else {
      setFalseAlarms(f => f + 1);
    }
    advanceRound();
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🚦</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Go / No-Go</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Tap when you see a GREEN/BLUE circle.{'\n'}DON'T tap when you see a RED square!
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>RULES</Text>
            <Text style={{ color: '#00E676', fontSize: 12, fontWeight: '700', marginTop: 4 }}>● Circle = TAP!</Text>
            <Text style={{ color: '#FF3D00', fontSize: 12, fontWeight: '700' }}>■ Square = DON'T TAP!</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>You have 1.5 seconds to respond</Text>
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
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🏆</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Go/No-Go Score</Text>
          <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
            <View style={styles.stat}><Text style={{ color: colors.success, fontWeight: '800', fontSize: 20 }}>{correct}</Text><Text style={{ color: colors.textSecondary, fontSize: 10 }}>CORRECT</Text></View>
            <View style={styles.stat}><Text style={{ color: colors.error, fontWeight: '800', fontSize: 20 }}>{falseAlarms}</Text><Text style={{ color: colors.textSecondary, fontSize: 10 }}>FALSE</Text></View>
            <View style={styles.stat}><Text style={{ color: colors.warning, fontWeight: '800', fontSize: 20 }}>{misses}</Text><Text style={{ color: colors.textSecondary, fontSize: 10 }}>MISSED</Text></View>
          </View>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary }]} 
            onPress={() => {
              saveAssessmentScore(testId, score, { misses, falseAlarms });
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
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Go / No-Go</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{round + 1}/{totalRounds}</Text>
      </View>
      <TouchableOpacity style={styles.tapArea} onPress={handleTap} activeOpacity={0.9}>
        {stimulus && (
          <View style={styles.stimCenter}>
            <Text style={{ fontSize: 100, color: stimulus.color }}>{stimulus.shape}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '700', marginTop: 16 }}>
              {stimulus.isGo ? 'TAP!' : 'WAIT...'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 56 },
  tutBox: { width: '100%', padding: 16, borderRadius: 14, marginTop: 24 },
  btn: { width: '100%', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  tapArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stimCenter: { alignItems: 'center' },
  statRow: { flexDirection: 'row', width: '100%', padding: 20, borderRadius: 16, marginTop: 24, justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
});

export default GoNoGoGame;
