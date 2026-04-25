import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

const TOTAL = 20;
const COLORS = ['Red', 'Blue', 'Green', 'Yellow'];
const SHAPES = ['Circle', 'Square', 'Triangle', 'Star'];

const genTrial = (rule) => {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const options = rule === 'color' ? [...COLORS].sort(() => Math.random() - 0.5) : [...SHAPES].sort(() => Math.random() - 0.5);
  return { color, shape, answer: rule === 'color' ? color : shape, options, rule };
};

const colorEmoji = { Red: '🔴', Blue: '🔵', Green: '🟢', Yellow: '🟡' };
const shapeMap = { Circle: '●', Square: '■', Triangle: '▲', Star: '★' };

const RuleSwitchGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveGameResult, saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  const testId = route.params?.testId || 'taskSwitch';
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentRule, setCurrentRule] = useState('color');
  const [trial, setTrial] = useState(genTrial('color'));
  const [feedback, setFeedback] = useState(null);

  const handleAnswer = (answer) => {
    const correct = answer === trial.answer;
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? '✓' : '✗');
    setTimeout(() => {
      setFeedback(null);
      const nextRound = round + 1;
      if (nextRound >= TOTAL) {
        const finalScore = Math.round(((score + (correct ? 1 : 0)) / TOTAL) * 100);
        if (isMandatoryFlow) {
          saveAssessmentScore(testId, finalScore, { correct: score + (correct ? 1 : 0), total: TOTAL });
        } else {
          saveGameResult({ gameId: 'RuleSwitch', category: 'executive', score: finalScore, duration: 0 });
        }
        setPhase('results');
      } else {
        // Switch rule every 5 rounds
        const nextRule = nextRound % 5 === 0 ? (currentRule === 'color' ? 'shape' : 'color') : currentRule;
        setCurrentRule(nextRule);
        setTrial(genTrial(nextRule));
        setRound(nextRound);
      }
    }, 400);
  };

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🔄</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>RULE SWITCH</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Sort by COLOR or SHAPE — the rule switches mid-game! Pay attention to the current rule.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>COMPLETE</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{score}/{TOTAL}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Correct responses</Text>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary }]} 
          onPress={() => {
            if (isMandatoryFlow) {
              saveAssessmentScore(testId, (score / TOTAL) * 100);
              navigation.navigate('TestHub', { ...route.params, completedTest: testId });
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '900' }}>{isMandatoryFlow ? 'CONTINUE ASSESSMENT' : 'DONE'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Text style={{ color: colors.textDisabled, fontSize: 12 }}>{round + 1}/{TOTAL}</Text>
        <View style={[styles.ruleBadge, { backgroundColor: currentRule === 'color' ? colors.primary + '15' : colors.warning + '15' }]}>
          <Text style={{ color: currentRule === 'color' ? colors.primary : colors.warning, fontWeight: '900', fontSize: 12 }}>SORT BY: {currentRule.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.center}>
        <Text style={{ fontSize: 64 }}>{colorEmoji[trial.color]}</Text>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 8 }}>{shapeMap[trial.shape]} {trial.shape}</Text>
        {feedback && <Text style={{ color: feedback === '✓' ? colors.success : colors.error, fontSize: 32, fontWeight: '900', marginTop: 8 }}>{feedback}</Text>}
        <View style={styles.optGrid}>
          {trial.options.map(opt => (
            <TouchableOpacity key={opt} style={[styles.opt, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 }]} onPress={() => handleAnswer(opt)}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60 },
  ruleBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  optGrid: { width: '100%', gap: 10, marginTop: 32 }, opt: { padding: 16, borderRadius: 14, alignItems: 'center' },
});
export default RuleSwitchGame;
