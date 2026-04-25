import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const DigitSymbolGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'symbolMatch';
  const [phase, setPhase] = useState('tutorial');
  const [legend, setLegend] = useState({});
  const [currentDigit, setCurrentDigit] = useState(null);
  const [options, setOptions] = useState([]);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const totalTime = 60;
  const correctRef = useRef(0);
  const roundRef = useRef(0);

  const SYMBOLS = ['◆', '★', '●', '▲', '■', '◉', '⬟', '⬢', '♦'];

  const initGame = () => {
    const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5);
    const leg = {};
    for (let i = 1; i <= 9; i++) {
      leg[i] = shuffledSymbols[i - 1];
    }
    setLegend(leg);
    generateRound(leg);
  };

  const generateRound = (leg) => {
    const digit = Math.floor(Math.random() * 9) + 1;
    setCurrentDigit(digit);
    const correctSymbol = leg[digit];
    const opts = [correctSymbol];
    while (opts.length < 4) {
      const rand = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      if (!opts.includes(rand)) opts.push(rand);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (phase === 'playing') {
      initGame();
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            const finalCorrect = correctRef.current;
            const finalRounds = roundRef.current;
            const score = Math.min(100, Math.round((finalCorrect / 30) * 100));
            if (isMandatoryFlow) {
              saveAssessmentScore(testId, score, { correct: finalCorrect, rounds: finalRounds });
            } else {
              saveGameResult({ gameId: 'digitSymbol', category: 'speed', score, duration: totalTime });
            }
            setPhase('results');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const handleAnswer = (symbol) => {
    const isCorrect = symbol === legend[currentDigit];
    if (isCorrect) {
      setCorrect(c => c + 1);
      correctRef.current += 1;
    }
    setRound(r => r + 1);
    roundRef.current += 1;
    generateRound(legend);
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>⚡</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Digit Symbol</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Match digits to symbols using the key at the top. How many can you get in 60 seconds?
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>HOW TO PLAY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>1. See the digit-symbol key at the top</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>2. A digit appears — find its matching symbol</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>3. As many as possible in 60 seconds!</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const score = Math.min(100, Math.round((correct / 30) * 100));
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>⏱️</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Digit Symbol Score</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>{correct} correct in 60s · {round} total attempts</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => isMandatoryFlow ? navigation.navigate('TestHub', { ...route.params, completedTest: testId }) : navigation.goBack()}>
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
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Digit Symbol</Text>
        <Text style={{ color: timeLeft < 10 ? colors.error : colors.textSecondary, fontWeight: '800', fontSize: 14 }}>{timeLeft}s</Text>
      </View>
      
      {/* Legend */}
      <View style={[styles.legendRow, { backgroundColor: colors.surface }]}>
        {Object.entries(legend).map(([digit, symbol]) => (
          <View key={digit} style={styles.legendItem}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>{digit}</Text>
            <Text style={{ fontSize: 18, marginTop: 2 }}>{symbol}</Text>
          </View>
        ))}
      </View>

      {/* Current digit */}
      <View style={styles.digitArea}>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>MATCH THIS DIGIT:</Text>
        <View style={[styles.digitBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 56 }}>{currentDigit}</Text>
        </View>
      </View>

      {/* Options */}
      <View style={styles.optGrid}>
        {options.map((sym, i) => (
          <TouchableOpacity key={i} style={[styles.optBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleAnswer(sym)}>
            <Text style={{ fontSize: 32 }}>{sym}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 12, marginBottom: 24 }}>Score: {correct}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 56 },
  tutBox: { width: '100%', padding: 16, borderRadius: 14, marginTop: 24 },
  btn: { width: '100%', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, marginHorizontal: 16, borderRadius: 12 },
  legendItem: { alignItems: 'center' },
  digitArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  digitBox: { width: 100, height: 100, borderRadius: 24, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  optGrid: { flexDirection: 'row', justifyContent: 'center', gap: 12, padding: 24, paddingBottom: 16 },
  optBtn: { width: (width - 96) / 4, height: 64, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
});

export default DigitSymbolGame;
