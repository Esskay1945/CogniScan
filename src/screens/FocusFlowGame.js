import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const FocusFlowGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [targets, setTargets] = useState([]);
  const [distractors, setDistractors] = useState([]);
  const [tapped, setTapped] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);
  const TOTAL = 6;
  const TARGET_COLOR = colors.success;
  const DISTRACTOR_COLOR = colors.error;

  const generateField = () => {
    const targetCount = 3 + Math.floor(round / 2);
    const distractorCount = 4 + round;
    const items = [];

    for (let i = 0; i < targetCount + distractorCount; i++) {
      items.push({
        id: i,
        x: 20 + Math.random() * (width - 120),
        y: 20 + Math.random() * 280,
        size: 36 + Math.random() * 16,
        isTarget: i < targetCount,
      });
    }
    setTargets(items.filter((i) => i.isTarget));
    setDistractors(items.filter((i) => !i.isTarget));
    setTapped([]);
  };

  const startRound = () => {
    generateField();
    setTimeLeft(10);
    setPhase('play');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          endRound();
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
  };

  const handleTap = (item) => {
    if (tapped.includes(item.id)) return;
    setTapped((p) => [...p, item.id]);
    if (item.isTarget) {
      const newTapped = [...tapped, item.id];
      const allTargetsTapped = targets.every((t) => newTapped.includes(t.id));
      if (allTargetsTapped) {
        clearInterval(timerRef.current);
        setScore((s) => s + 1);
        endRound();
      }
    } else {
      // Hit distractor - penalty
      clearInterval(timerRef.current);
      endRound();
    }
  };

  const endRound = () => {
    setRound((r) => r + 1);
    if (round + 1 >= TOTAL) setPhase('result');
    else setPhase('intro');
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const allItems = [...targets, ...distractors];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phase === 'tutorial' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Focus Flow</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              Tap all the GREEN circles while avoiding the RED ones. Tests your selective attention and inhibition control.
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: TARGET_COLOR }} />
                <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700', marginTop: 6 }}>TAP ✓</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: DISTRACTOR_COLOR }} />
                <Text style={{ color: colors.error, fontSize: 11, fontWeight: '700', marginTop: 6 }}>AVOID ✗</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('intro')}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'intro' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Focus Flow</Text>
            <Text style={{ color: colors.textDisabled, fontSize: 12, marginTop: 8 }}>
              Round {round + 1}/{TOTAL}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startRound}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{round === 0 ? 'Start' : 'Next Round'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={{ flex: 1 }}>
            <View style={styles.statsRow}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>
                {tapped.filter((id) => targets.find((t) => t.id === id)).length}/{targets.length} targets
              </Text>
              <Text style={{ color: timeLeft < 3 ? colors.error : colors.textSecondary, fontWeight: '800', fontSize: 14 }}>
                {Math.ceil(timeLeft)}s
              </Text>
            </View>
            <View style={[styles.arena, { backgroundColor: colors.surface }]}>
              {allItems.map((item) => {
                const isTapped = tapped.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      position: 'absolute', left: item.x, top: item.y,
                      width: item.size, height: item.size, borderRadius: item.size / 2,
                      backgroundColor: isTapped ? colors.surfaceElevated : (item.isTarget ? TARGET_COLOR : DISTRACTOR_COLOR),
                      opacity: isTapped ? 0.3 : 1,
                    }}
                    onPress={() => handleTap(item)}
                    disabled={isTapped}
                  />
                );
              })}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 5 ? '🏆' : score >= 3 ? '🎯' : '👁️'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{TOTAL}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 5 ? 'Laser focus!' : score >= 3 ? 'Good attention!' : 'Keep practicing!'}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  back: { marginTop: 44, width: 44, height: 44, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center' },
  introBox: { alignItems: 'center' },
  btn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  arena: { flex: 1, borderRadius: 20, overflow: 'hidden', position: 'relative', minHeight: 340 },
});

export default FocusFlowGame;
