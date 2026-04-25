import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ShieldCheck, Check, X, ChevronRight } from 'lucide-react-native';

const WORD_POOL = [
  'MOUNTAIN', 'BICYCLE', 'PENCIL', 'GARDEN', 'LAPTOP', 'GUITAR', 'MIRROR', 'BRIDGE', 'WINTER', 'OCEAN',
  'SUNSET', 'CANDLE', 'RABBIT', 'PLANET', 'CASTLE', 'SILVER', 'TROPHY', 'BASKET', 'MARBLE', 'FEATHER',
  'DRAGON', 'TUNNEL', 'ANCHOR', 'DESERT', 'HELMET', 'WINDOW', 'SALMON', 'BEACON', 'TEMPLE', 'VELVET',
];

// Shuffle and split pool into targets and distractors each session
const shufflePool = () => {
  const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5);
  return {
    targets: shuffled.slice(0, 5),
    distractors: shuffled.slice(5, 10),
  };
};

const RecognitionMemoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const [phase, setPhase] = useState('memorize'); // memorize, test, result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testWords, setTestWords] = useState([]);
  const [score, setScore] = useState(0);

  // Generate randomized targets and distractors once per session
  const [sessionWords] = useState(() => shufflePool());
  const TARGETS = sessionWords.targets;
  const DISTRACTORS = sessionWords.distractors;

  useEffect(() => {
    if (phase === 'memorize') {
        const timeout = setTimeout(() => {
            if (currentIndex < TARGETS.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setPhase('test');
                setCurrentIndex(0);
                setTestWords([...TARGETS, ...DISTRACTORS].sort(() => Math.random() - 0.5));
            }
        }, 1500);
        return () => clearTimeout(timeout);
    }
  }, [phase, currentIndex]);

  const handleIdentify = (sawIt) => {
    const word = testWords[currentIndex];
    const shouldHaveSeen = TARGETS.includes(word);
    
    if (sawIt === shouldHaveSeen) {
        setScore(s => s + 10);
    }

    if (currentIndex < testWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
    } else {
        saveAssessmentScore('recognitionMemory', Math.round((score / 10) * 100));
        setPhase('result');
    }
  };

  if (phase === 'memorize') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
           <Text style={[Typography.caption, { color: colors.primary }]}>RECOGNITION TRAINING: MEMORIZE</Text>
           <View style={[styles.wordCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                <Text style={{ color: colors.text, fontSize: 36, fontWeight: '900' }}>{TARGETS[currentIndex]}</Text>
           </View>
           <Text style={{ color: colors.textSecondary, marginTop: 24 }}>{currentIndex + 1} / {TARGETS.length}</Text>
        </View>
      </View>
    );
  }

  if (phase === 'test') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
           <Text style={[Typography.caption, { color: colors.accent }]}>DID YOU SEE THIS WORD?</Text>
           <View style={[styles.wordCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
                <Text style={{ color: colors.text, fontSize: 36, fontWeight: '900' }}>{testWords[currentIndex]}</Text>
           </View>
           
           <View style={styles.btnRow}>
               <TouchableOpacity style={[styles.ansBtn, { backgroundColor: colors.success }]} onPress={() => handleIdentify(true)}>
                   <Check size={32} color="#FFF" />
                   <Text style={{ color: '#FFF', fontWeight: '900', marginTop: 8 }}>YES</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.ansBtn, { backgroundColor: colors.error }]} onPress={() => handleIdentify(false)}>
                   <X size={32} color="#FFF" />
                   <Text style={{ color: '#FFF', fontWeight: '900', marginTop: 8 }}>NO</Text>
               </TouchableOpacity>
           </View>
           <Text style={{ color: colors.textSecondary, marginTop: 24 }}>Testing {currentIndex + 1} / {testWords.length}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <ShieldCheck size={64} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 20 }]}>RECOGNITION DONE</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'recognitionMemory' })}>
          <Text style={{ color: '#FFF', fontWeight: '900' }}>CONTINUE</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  wordCard: { width: '100%', paddingVertical: 60, borderRadius: 32, borderWidth: 2, alignItems: 'center', marginTop: 32 },
  btnRow: { flexDirection: 'row', gap: 20, marginTop: 48, width: '100%' },
  ansBtn: { flex: 1, paddingVertical: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  btn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
});

export default RecognitionMemoryScreen;
