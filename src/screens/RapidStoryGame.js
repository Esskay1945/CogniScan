import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, MessageSquare, Timer, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const RapidStoryGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('intro'); // intro | play | result
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
    setTimeLeft(10 - (level * 0.5)); // Gets faster
    startTimer();
  };

  const startTimer = () => {
    if(timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if(t <= 0) {
          clearInterval(timerRef.current);
          setPhase('result');
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
  };

  const handleSelection = (choice) => {
    if(choice === scenarios[currentScenario].correct) {
      setScore(s => s + Math.round(timeLeft * 10));
      if(currentScenario < scenarios.length - 1) {
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
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.dark.text} size={28} />
        </TouchableOpacity>
        <Text style={[Typography.h2, { color: Colors.dark.text, flex: 1, textAlign: 'center' }]}>Rapid Story Builder</Text>
        <MessageSquare color={Colors.dark.textSecondary} size={20} />
      </View>

      <View style={styles.main}>
        {phase === 'intro' && (
          <View style={styles.contentBox}>
            <Zap size={48} color={colors.accent} />
            <Text style={[Typography.h2, { color: Colors.dark.text, marginTop: 16 }]}>Speech Rhythm Latency: Level {level}</Text>
            <Text style={{ color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 12 }}>
              Execute linguistic completion protocols with minimal latency. Speed is critical.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={startLevel}>
              <Text style={styles.btnText}>START NEURO-SYNC</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={styles.gameContent}>
            <View style={styles.timerBar}>
              <View style={[styles.timerFill, { width: `${(timeLeft / (10 - level * 0.5)) * 100}%`, backgroundColor: timeLeft < 3 ? colors.error : colors.accent }]} />
            </View>
            
            <View style={[styles.scenarioCard, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }]}>
              <Text style={{ color: Colors.dark.text, fontSize: 20, fontWeight: '600', textAlign: 'center', lineHeight: 30 }}>
                {scenarios[currentScenario].text}
              </Text>
            </View>

            <View style={styles.options}>
              {scenarios[currentScenario].options.map((opt, i) => (
                <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => handleSelection(opt)}>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.contentBox}>
            <Timer size={48} color={colors.error} />
            <Text style={[Typography.h2, { color: Colors.dark.text, marginTop: 16 }]}>Sync Timeout</Text>
            <Text style={{ color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 12 }}>
              Latency too high for level {level}.{'\n'}Linguistic Score: {score}
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => { setLevel(1); setScore(0); setCurrentScenario(0); setPhase('intro'); }}>
              <Text style={styles.btnText}>RE-INITIALIZE SYNC</Text>
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
  contentBox: { alignItems: 'center', backgroundColor: Colors.dark.surface, padding: 32, borderRadius: 24, borderWidth: 1, borderColor: Colors.dark.border },
  gameContent: { flex: 1, justifyContent: 'center' },
  timerBar: { width: '100%', height: 4, backgroundColor: Colors.dark.border, borderRadius: 2, marginBottom: 32, overflow: 'hidden' },
  timerFill: { height: '100%' },
  scenarioCard: { padding: 32, borderRadius: 20, borderWidth: 1, marginBottom: 32 },
  options: { gap: 12 },
  optionBtn: { height: 60, borderRadius: 16, backgroundColor: Colors.dark.surfaceElevated, borderWidth: 1, borderColor: Colors.dark.border, justifyContent: 'center', alignItems: 'center' },
  optionText: { color: Colors.dark.text, fontWeight: '800', letterSpacing: 1 },
  primaryBtn: { height: 56, borderRadius: 12, backgroundColor: Colors.dark.primary, justifyContent: 'center', alignItems: 'center', marginTop: 32, paddingHorizontal: 32 },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1.5 },
});

export default RapidStoryGame;
