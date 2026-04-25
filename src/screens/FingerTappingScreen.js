import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Activity, Check, ChevronRight } from 'lucide-react-native';

const FingerTappingScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;

  const [phase, setPhase] = useState('ready'); // ready, tapping, result
  const [timeLeft, setTimeLeft] = useState(10);
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    let interval;
    if (phase === 'tapping' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && phase === 'tapping') {
        const score = Math.min(100, Math.round((taps / 50) * 100)); // Target 50 taps in 10s
        saveAssessmentScore('fingerTap', score);
        setPhase('result');
    }
    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  const handleStart = () => {
    setPhase('tapping');
    setTaps(0);
    setTimeLeft(10);
  };

  if (phase === 'ready') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
           <Activity size={64} color={colors.primary} />
           <Text style={[Typography.h1, { color: colors.text, marginTop: 24, textAlign: 'center' }]}>FINGER TAPPING</Text>
           <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
             Tap the target as many times as you can in 10 seconds using your index finger.
           </Text>
           <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%', marginTop: 40 }]} onPress={handleStart}>
              <Text style={{ color: '#FFF', fontWeight: '900' }}>START TIMER</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'tapping') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
            <Text style={{ color: colors.error, fontSize: 32, fontWeight: '900' }}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</Text>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>TAPS: {taps}</Text>
        </View>
        <TouchableOpacity style={[styles.tapTarget, { backgroundColor: colors.primary }]} onPress={() => setTaps(t => t + 1)} activeOpacity={0.7}>
            <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '900' }}>TAP!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Check size={80} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 24 }]}>MOTOR TEST DONE</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>You achieved {taps} taps in 10 seconds.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%', marginTop: 40 }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'fingerTap' })}>
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
  header: { padding: 40, paddingTop: 80, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  tapTarget: { flex: 1, margin: 40, marginBottom: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  btn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default FingerTappingScreen;
