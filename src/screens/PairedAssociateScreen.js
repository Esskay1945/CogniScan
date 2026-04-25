import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Brain, ChevronRight, HelpCircle } from 'lucide-react-native';

const ALL_PAIRS = [
  { p1: 'SUN', p2: 'FLOWER' },
  { p1: 'CHAIR', p2: 'DESK' },
  { p1: 'COFFEE', p2: 'CUP' },
  { p1: 'RAIN', p2: 'UMBRELLA' },
  { p1: 'BOOK', p2: 'LIBRARY' },
  { p1: 'KEY', p2: 'LOCK' },
  { p1: 'BREAD', p2: 'BUTTER' },
  { p1: 'PEN', p2: 'PAPER' },
  { p1: 'MOON', p2: 'STAR' },
  { p1: 'SHOE', p2: 'SOCK' },
  { p1: 'KING', p2: 'QUEEN' },
  { p1: 'SALT', p2: 'PEPPER' },
  { p1: 'NEEDLE', p2: 'THREAD' },
  { p1: 'PILLOW', p2: 'BED' },
  { p1: 'BRUSH', p2: 'PAINT' },
  { p1: 'HAMMER', p2: 'NAIL' },
  { p1: 'TREE', p2: 'LEAF' },
  { p1: 'FISH', p2: 'WATER' },
  { p1: 'BIRD', p2: 'NEST' },
  { p1: 'CLOCK', p2: 'TIME' },
];

const PairedAssociateScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const [phase, setPhase] = useState('memorize'); // memorize, distract, recall, result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timer, setTimer] = useState(0);

  // Randomly select 5 pairs from the full pool each session
  const [PAIRS] = useState(() => [...ALL_PAIRS].sort(() => Math.random() - 0.5).slice(0, 5));

  useEffect(() => {
    if (phase === 'memorize') {
       const timeout = setTimeout(() => {
           if (currentIndex < PAIRS.length - 1) {
               setCurrentIndex(currentIndex + 1);
           } else {
               setPhase('distract');
               setCurrentIndex(0);
           }
       }, 3000);
       return () => clearTimeout(timeout);
    }
    
    if (phase === 'distract') {
        const timeout = setTimeout(() => {
            setPhase('recall');
        }, 5000);
        return () => clearTimeout(timeout);
    }
  }, [phase, currentIndex]);

  const handleNextRecall = (text) => {
    const newAnswers = { ...userAnswers, [currentIndex]: text.toUpperCase().trim() };
    setUserAnswers(newAnswers);
    
    if (currentIndex < PAIRS.length - 1) {
        setCurrentIndex(currentIndex + 1);
    } else {
        // Calculate score
        let score = 0;
        PAIRS.forEach((p, i) => {
            if (newAnswers[i] === p.p2) score += 20;
        });
        saveAssessmentScore('pairedAssociate', score);
        setPhase('result');
    }
  };

  const currentPair = PAIRS[currentIndex];

  if (phase === 'memorize') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
           <Text style={[Typography.caption, { color: colors.primary }]}>MEMORIZE THE PAIRS</Text>
           <View style={[styles.pairBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900' }}>{currentPair.p1}</Text>
              <Text style={{ color: colors.primary, fontSize: 24, marginVertical: 10 }}>—</Text>
              <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900' }}>{currentPair.p2}</Text>
           </View>
           <Text style={{ color: colors.textSecondary, marginTop: 20 }}>{currentIndex + 1} / {PAIRS.length}</Text>
        </View>
      </View>
    );
  }

  if (phase === 'distract') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
           <Text style={[Typography.h2, { color: colors.text }]}>PAUSE...</Text>
           <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>Hold these pairs in your mind. The recall phase begins in a few seconds.</Text>
        </View>
      </View>
    );
  }

  if (phase === 'recall') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
           <Text style={[Typography.caption, { color: colors.accent }]}>WHAT WAS THE PAIR?</Text>
           <View style={[styles.pairBox, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
              <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900' }}>{currentPair.p1}</Text>
              <Text style={{ color: colors.accent, fontSize: 24, marginVertical: 10 }}>—</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderBottomColor: colors.accent }]}
                placeholder="???"
                placeholderTextColor={colors.textDisabled}
                autoFocus
                onSubmitEditing={(e) => handleNextRecall(e.nativeEvent.text)}
                autoCapitalize="characters"
              />
           </View>
           <Text style={{ color: colors.textSecondary, marginTop: 20 }}>Recall Item {currentIndex + 1} / {PAIRS.length}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Brain size={64} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 20 }]}>TEST COMPLETE</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'pairedAssociate' })}>
          <Text style={{ color: '#FFF', fontWeight: '900' }}>CONTINUE</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  pairBox: { width: '100%', padding: 40, borderRadius: 24, borderWidth: 2, alignItems: 'center', marginTop: 24 },
  input: { width: '100%', fontSize: 32, fontWeight: '900', textAlign: 'center', borderBottomWidth: 2, paddingBottom: 8 },
  btn: { width: '100%', height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
});

export default PairedAssociateScreen;
