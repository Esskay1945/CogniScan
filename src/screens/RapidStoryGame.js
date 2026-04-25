import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Typography } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, MessageSquare, Timer, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const RapidStoryGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [level, setLevel] = useState(1);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);

  const scenarios = [
    { text: "The human heart is a complex ___ that pumps blood.", options: ["PUMP", "FILTER", "SENSOR"], correct: "PUMP" },
    { text: "Neurons transmit signals through the ___ system.", options: ["DIGESTIVE", "NERVOUS", "IMMUNE"], correct: "NERVOUS" },
    { text: "A healthy diet requires a balance of ___ and vitamins.", options: ["MINERALS", "PLASTIC", "SOUND"], correct: "MINERALS" },
    { text: "The primary function of lungs is to exchange ___.", options: ["WATER", "OXYGEN", "HEAT"], correct: "OXYGEN" },
    { text: "DNA is the genetic ___ of all living organisms.", options: ["CODE", "SHELL", "MOTOR"], correct: "CODE" },
  ];

  const startLevel = () => {
    setPhase('play');
    setTimeLeft(10 - (level * 0.5));
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0) {
          clearInterval(timerRef.current);
          setPhase('result');
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
  };

  const handleSelection = (choice) => {
    if (choice === scenarios[currentScenario].correct) {
      setScore(s => s + Math.round(timeLeft * 10));
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(s => s + 1);
        setTimeLeft(10 - (level * 0.5));
      } else {
        setLevel(l => l + 1);
        setPhase('intro');
        setCurrentScenario(0);
        clearInterval(timerRef.current);
      }
    } else {
      setPhase('result');
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[Typography.h2, { color: colors.text, flex: 1, textAlign: 'center' }]}>Rapid Story Builder</Text>
        <MessageSquare color={colors.textSecondary} size={20} />
      </View>

      <View style={styles.main}>
        {phase === 'tutorial' && (
          <View style={[styles.contentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📖</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Rapid Story Builder</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8, fontSize: 14, lineHeight: 22 }}>
              Complete sentences by choosing the correct missing word as fast as possible. Speed and accuracy both contribute to your score. Timer gets faster each level!
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              ✦ Read the sentence with a blank{'\n'}✦ Choose the correct word{'\n'}✦ Wrong answer ends the game
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => setPhase('intro')}>
              <Text style={styles.btnText}>GOT IT!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'intro' && (
          <View style={[styles.contentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Zap size={48} color={colors.accent} />
            <Text style={[Typography.h2, { color: colors.text, marginTop: 16 }]}>Level {level}</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
              Complete sentences with speed and precision.
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={startLevel}>
              <Text style={styles.btnText}>START</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={styles.gameContent}>
            <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
              <View style={[styles.timerFill, { width: `${(timeLeft / (10 - level * 0.5)) * 100}%`, backgroundColor: timeLeft < 3 ? colors.error : colors.accent }]} />
            </View>

            <View style={[styles.scenarioCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '600', textAlign: 'center', lineHeight: 30 }}>
                {scenarios[currentScenario].text}
              </Text>
            </View>

            <View style={styles.options}>
              {scenarios[currentScenario].options.map((opt, i) => (
                <TouchableOpacity key={i} style={[styles.optionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={() => handleSelection(opt)}>
                  <Text style={{ color: colors.text, fontWeight: '800', letterSpacing: 1 }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={[styles.contentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Timer size={48} color={colors.error} />
            <Text style={[Typography.h2, { color: colors.text, marginTop: 16 }]}>Sync Timeout</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
              Latency too high for level {level}.{'\n'}Score: {score}
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => { setLevel(1); setScore(0); setCurrentScenario(0); setPhase('intro'); }}>
              <Text style={styles.btnText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 32, marginBottom: 40 },
  main: { flex: 1, justifyContent: 'center' },
  contentBox: { alignItems: 'center', padding: 32, borderRadius: 24, borderWidth: 1 },
  gameContent: { flex: 1, justifyContent: 'center' },
  timerBar: { width: '100%', height: 4, borderRadius: 2, marginBottom: 32, overflow: 'hidden' },
  timerFill: { height: '100%' },
  scenarioCard: { padding: 32, borderRadius: 20, borderWidth: 1, marginBottom: 32 },
  options: { gap: 12 },
  optionBtn: { height: 60, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  primaryBtn: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 32, paddingHorizontal: 32 },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1.5 },
});

export default RapidStoryGame;
