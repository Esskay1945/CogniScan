import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, Hash, Timer } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const NumberSpanGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore, data, updateDifficulty, completeAssignedGame, logMetaCognitive } = useData();
  
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const isTraining = route.params?.isMandatory; // From DailyTrainingScreen
  const testId = route.params?.testId || 'numberSpan';
  const gameId = 'NumberSpan';

  // Adaptation Engine
  const currentDiff = data.difficulties?.[gameId] || 1;
  const initialSpan = Math.max(3, Math.min(7, 2 + Math.floor(currentDiff / 2)));

  const [phase, setPhase] = useState('tutorial');
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showingSeq, setShowingSeq] = useState(true);
  const [currentShow, setCurrentShow] = useState(-1);
  const [spanLength, setSpanLength] = useState(initialSpan);
  const [maxSpan, setMaxSpan] = useState(initialSpan);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [isReverse, setIsReverse] = useState(false);
  const [timer, setTimer] = useState(0);
  const [entryTimes, setEntryTimes] = useState([]);
  const [lastDigitTime, setLastDigitTime] = useState(0);

  const generateSequence = (len) => {
    return Array.from({ length: len }, () => Math.floor(Math.random() * 10));
  };

  const startRound = () => {
    const seq = generateSequence(spanLength);
    setSequence(seq);
    setUserInput([]);
    setShowingSeq(true);
    setCurrentShow(-1);
    
    let i = 0;
    const intervalTime = Math.max(500, 1000 - (currentDiff * 50));
    const showInterval = setInterval(() => {
      setCurrentShow(i);
      i++;
      if (i >= seq.length) {
        clearInterval(showInterval);
        setTimeout(() => {
          setShowingSeq(false);
          setCurrentShow(-1);
          setLastDigitTime(Date.now());
        }, intervalTime);
      }
    }, intervalTime);
  };

  useEffect(() => {
    if (phase === 'playing') {
      startRound();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleDigitTap = (digit) => {
    if (showingSeq) return;
    const now = Date.now();
    setEntryTimes(prev => [...prev, now - lastDigitTime]);
    setLastDigitTime(now);

    const newInput = [...userInput, digit];
    setUserInput(newInput);

    const target = isReverse ? [...sequence].reverse() : sequence;

    if (newInput.length === target.length) {
      const isCorrect = newInput.every((d, i) => d === target[i]);
      const newRounds = rounds + 1;
      setRounds(newRounds);

      if (isCorrect) {
        setScore(s => s + 1);
        setSpanLength(l => l + 1);
        setMaxSpan(Math.max(maxSpan, spanLength));
      }

      const nextRnd = newRounds;
      if (nextRnd >= 8) {
        const finalScore = Math.round((maxSpan / 10) * 100);
        
        // Feed the Engines
        updateDifficulty(gameId, score / 8);
        const avgLatency = entryTimes.reduce((a, b) => a + b, 0) / (entryTimes.length || 1);
        logMetaCognitive({ hesitation: avgLatency });
        
        if (isMandatoryFlow) {
          saveAssessmentScore(testId, finalScore, { maxSpan });
        } else {
          saveGameResult({ gameId: 'numberSpan', category: 'memory', score: finalScore, duration: timer });
          if (isTraining) completeAssignedGame(gameId);
        }
        setPhase('results');
      } else {
        if (newRounds === 4 && !isReverse) {
          setIsReverse(true);
          setSpanLength(initialSpan);
        }
        setTimeout(startRound, 1000);
      }
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <View style={[styles.iconGlow, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
             <Hash size={48} color={colors.primary} />
          </View>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: 24 }]}>Number Span</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 13, marginTop: 12, lineHeight: 22, paddingHorizontal: 20 }}>
            Watch numerical sequences flash and repeat them. Adaptation Active: Start span set to {initialSpan} digits based on level.
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.accent, fontWeight: '900', fontSize: 10, letterSpacing: 1 }}>PROTOCOL</Text>
            <View style={styles.tutRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>1. Observe Forward Sequences</Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>2. Execute REVERSE Retrieval at Round 5</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>COMMENCE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const finalScore = Math.round(score / 8 * 100);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <View style={[styles.resultCircle, { borderColor: colors.primary }]}>
             <Text style={[Typography.h1, { color: colors.text }]}>{finalScore}%</Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 24 }}>Cognitive retrieval efficiency</Text>
          <View style={[styles.statBadge, { backgroundColor: colors.surface }]}>
              <Timer size={14} color={colors.accent} />
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12, marginLeft: 8 }}>Peak Span: {maxSpan} units</Text>
          </View>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary, width: 240 }]} 
            onPress={() => isMandatoryFlow ? navigation.navigate('TestHub', { ...route.params, completedTest: testId }) : (isTraining ? navigation.navigate('DailyTraining') : navigation.goBack())}
          >
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>{isMandatoryFlow || isTraining ? 'CONTINUE PROTOCOL' : 'DONE'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, letterSpacing: 0.5 }}>NEURO-RETENTION</Text>
        <View style={[styles.roundBadge, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '900' }}>{rounds + 1}/8</Text>
        </View>
      </View>
      
      <View style={{ alignItems: 'center', marginVertical: 8 }}>
        <View style={[styles.modeBadge, { backgroundColor: isReverse ? colors.warning + '15' : colors.primary + '15', borderColor: isReverse ? colors.warning + '40' : colors.primary + '40' }]}>
          <Text style={{ color: isReverse ? colors.warning : colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>
            {isReverse ? '⟵ REVERSE RETRIVAL' : '⟶ FORWARD ENCODING'}
          </Text>
        </View>
      </View>

      <View style={styles.displayArea}>
        {showingSeq ? (
          <View style={[styles.digitDisplay, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 64 }}>
              {currentShow >= 0 ? sequence[currentShow] : '...'}
            </Text>
          </View>
        ) : (
          <View style={styles.inputDisplay}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '800', marginBottom: 20, letterSpacing: 1 }}>
              {isReverse ? 'ENTER IN REVERSE ORDER' : 'ENTER SEQUENCE'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              {sequence.map((_, i) => (
                <View key={i} style={[styles.inputSlot, {
                  backgroundColor: userInput[i] != null ? colors.primary + '12' : colors.surface,
                  borderColor: userInput[i] != null ? colors.primary : colors.border,
                  borderWidth: userInput[i] != null ? 2 : 1.5,
                }]}>
                  <Text style={{ color: colors.text, fontWeight: '900', fontSize: 24 }}>
                    {userInput[i] != null ? userInput[i] : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {!showingSeq && (
        <View style={styles.numPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.numBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleDigitTap(d)}
            >
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 22 }}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconGlow: { width: 100, height: 100, borderRadius: 32, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  tutBox: { width: '100%', padding: 20, borderRadius: 20, borderWidth: 1, marginTop: 32, gap: 12 },
  tutRow: { flexDirection: 'row', alignItems: 'center' },
  btn: { width: '100%', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  resultCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  statBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 12 },
  roundBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modeBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  displayArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  digitDisplay: { width: 130, height: 130, borderRadius: 40, borderWidth: 3.5, justifyContent: 'center', alignItems: 'center' },
  inputDisplay: { alignItems: 'center', width: '100%' },
  inputSlot: { width: 50, height: 60, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  numPad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, padding: 20, paddingBottom: 48 },
  numBtn: { width: (width - 80) / 5, height: 60, borderRadius: 16, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
});

export default NumberSpanGame;
