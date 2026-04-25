import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react-native';

const TRIALS = [
  { task: 'Type the numbers 1-10 in order', sequence: [1,2,3,4,5,6,7,8,9,10], errors: [3, 7], errorType: 'Skipped number' },
  { task: 'Match capital to country', pairs: [['France','Paris'], ['Japan','Tokyo'], ['Brazil','Brasilia'], ['Egypt','Cairo']], errors: [1], errorType: 'Wrong capital' },
  { task: 'Sort these from smallest to largest', items: ['Ant', 'Cat', 'Dog', 'Elephant', 'Mouse'], errors: [2], errorType: 'Wrong order' },
];

const ErrorAwarenessGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [foundErrors, setFoundErrors] = useState([]);
  const [totalFound, setTotalFound] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Simulate a task with deliberate errors and ask user to find them
  const genDisplay = () => {
    if (round === 0) return ['1','2','4','5','6','8','9','10']; // Missing 3 and 7
    if (round === 1) return [['France','Paris'], ['Japan','Osaka'], ['Brazil','Brasilia'], ['Egypt','Cairo']]; // Japan wrong
    if (round === 2) return ['Ant', 'Dog', 'Cat', 'Mouse', 'Elephant']; // Dog and Cat swapped
    return [];
  };

  const handleFoundError = (idx) => {
    if (foundErrors.includes(idx)) setFoundErrors(foundErrors.filter(i => i !== idx));
    else setFoundErrors([...foundErrors, idx]);
  };

  const submitCheck = () => {
    const trial = TRIALS[round];
    const correctFinds = foundErrors.filter(i => trial.errors.includes(i)).length;
    const newTotalFound = totalFound + correctFinds;
    const newTotalErrors = totalErrors + trial.errors.length;
    if (round + 1 >= TRIALS.length) {
      saveGameResult({ gameId: 'ErrorAwareness', category: 'meta', score: Math.round((newTotalFound / Math.max(newTotalErrors, 1)) * 100), duration: 0 });
      setTotalFound(newTotalFound); setTotalErrors(newTotalErrors); setPhase('results');
    } else {
      setTotalFound(newTotalFound); setTotalErrors(newTotalErrors); setRound(round + 1); setFoundErrors([]);
    }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🔎</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>ERROR{'\n'}AWARENESS</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Review completed tasks and identify deliberate errors. Tests your ability to catch mistakes.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>AWARENESS{'\n'}SCORE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{totalFound}/{totalErrors}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Errors identified correctly</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  const display = genDisplay();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 80 }}>
      <Text style={[Typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 60 }]}>TASK {round + 1}/{TRIALS.length}</Text>
      <View style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{TRIALS[round].task}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Tap items you think are WRONG:</Text>
      </View>

      <View style={styles.itemList}>
        {display.map((item, i) => {
          const isArray = Array.isArray(item);
          const label = isArray ? `${item[0]} → ${item[1]}` : String(item);
          const flagged = foundErrors.includes(i);
          return (
            <TouchableOpacity key={i} style={[styles.itemRow, { backgroundColor: flagged ? colors.error + '15' : colors.surface, borderColor: flagged ? colors.error : colors.border, borderWidth: 1.5 }]} onPress={() => handleFoundError(i)}>
              <Text style={{ color: flagged ? colors.error : colors.text, fontWeight: '700', fontSize: 15 }}>{label}</Text>
              {flagged && <AlertTriangle size={16} color={colors.error} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, alignSelf: 'center', marginTop: 24 }]} onPress={submitCheck}>
        <Text style={{ color: '#FFF', fontWeight: '900' }}>SUBMIT FINDINGS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  taskCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginTop: 16 },
  itemList: { gap: 8, marginTop: 16 }, itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 14 },
});
export default ErrorAwarenessGame;
