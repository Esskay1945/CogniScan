import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const SCENARIOS = [
  { title: 'Morning Routine', steps: ['Wake up alarm', 'Brush teeth', 'Shower', 'Get dressed', 'Eat breakfast', 'Leave for work'] },
  { title: 'Cook Pasta', steps: ['Boil water', 'Add salt', 'Add pasta', 'Cook 10 min', 'Drain water', 'Add sauce'] },
  { title: 'Mail a Package', steps: ['Find box', 'Pack item', 'Seal box', 'Write address', 'Go to post office', 'Pay & send'] },
  { title: 'Plant a Tree', steps: ['Choose location', 'Dig hole', 'Remove pot', 'Place tree', 'Fill with soil', 'Water tree'] },
];

const MultiStepPlannerGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'planning';
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [userOrder, setUserOrder] = useState([]);
  const [available, setAvailable] = useState([]);

  const startRound = (r) => {
    const scenario = SCENARIOS[r % SCENARIOS.length];
    setAvailable([...scenario.steps].sort(() => Math.random() - 0.5));
    setUserOrder([]);
    setPhase('playing');
  };

  const addStep = (step) => { setUserOrder([...userOrder, step]); setAvailable(available.filter(s => s !== step)); };
  const removeStep = (idx) => { const removed = userOrder[idx]; setUserOrder(userOrder.filter((_, i) => i !== idx)); setAvailable([...available, removed]); };

  const submit = () => {
    const correct = SCENARIOS[round % SCENARIOS.length].steps;
    let pts = 0;
    userOrder.forEach((step, i) => { if (step === correct[i]) pts++; });
    const newScore = score + pts;
    if (round < 3) { setScore(newScore); setRound(round + 1); startRound(round + 1); }
    else { const finalScore = Math.round(((newScore + pts) / 24) * 100); if (isMandatoryFlow) { saveAssessmentScore(testId, finalScore, { correct: newScore + pts, total: 24 }); } else { saveGameResult({ gameId: 'MultiStepPlanner', category: 'executive', score: finalScore, duration: 0 }); } setScore(newScore + pts); setPhase('results'); }
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>📋</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>MULTI-STEP{'\n'}PLANNER</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Arrange steps in logical order to complete each scenario correctly.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => startRound(0)}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>DONE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/24</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Steps correctly placed</Text>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary }]} 
          onPress={() => {
            if (isMandatoryFlow) {
              saveAssessmentScore(testId, (score / 24) * 100);
              navigation.navigate('TestHub', { ...route.params, completedTest: testId });
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '900' }}>{isMandatoryFlow ? 'CONTINUE ASSESSMENT' : 'FINISH'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={[Typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 60 }]}>SCENARIO {round + 1}/4</Text>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18, textAlign: 'center', marginTop: 8 }}>{SCENARIOS[round % SCENARIOS.length].title}</Text>

      <Text style={{ color: colors.textDisabled, fontSize: 11, fontWeight: '800', marginTop: 24 }}>YOUR ORDER:</Text>
      <View style={styles.orderBox}>
        {userOrder.length === 0 ? <Text style={{ color: colors.textDisabled, fontSize: 13 }}>Tap steps below to add them in order</Text> :
          userOrder.map((step, i) => (
            <TouchableOpacity key={step} style={[styles.orderChip, { backgroundColor: colors.primary + '15' }]} onPress={() => removeStep(i)}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>{i + 1}. {step}</Text>
            </TouchableOpacity>
          ))
        }
      </View>

      <Text style={{ color: colors.textDisabled, fontSize: 11, fontWeight: '800', marginTop: 20 }}>AVAILABLE STEPS:</Text>
      <View style={styles.avail}>
        {available.map(step => (
          <TouchableOpacity key={step} style={[styles.availChip, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]} onPress={() => addStep(step)}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{step}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {userOrder.length === SCENARIOS[round % SCENARIOS.length].steps.length && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, alignSelf: 'center', marginTop: 24 }]} onPress={submit}><Text style={{ color: '#FFF', fontWeight: '900' }}>SUBMIT ORDER</Text></TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  orderBox: { minHeight: 80, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#0066FF30', borderStyle: 'dashed', marginTop: 8, gap: 8 },
  orderChip: { padding: 12, borderRadius: 12 },
  avail: { gap: 8, marginTop: 8 }, availChip: { padding: 14, borderRadius: 14 },
});
export default MultiStepPlannerGame;
