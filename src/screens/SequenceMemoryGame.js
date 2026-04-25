import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const SequenceMemoryGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showIdx, setShowIdx] = useState(-1);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(3);
  const [highlightedBtn, setHighlightedBtn] = useState(null);

  const BUTTONS = [
    { id: 0, color: '#FF3D00', label: '■' },
    { id: 1, color: '#0066FF', label: '■' },
    { id: 2, color: '#00E676', label: '■' },
    { id: 3, color: '#FFD600', label: '■' },
  ];

  const generateSequence = () => {
    return Array.from({ length: level }, () => Math.floor(Math.random() * 4));
  };

  const startRound = () => {
    const seq = generateSequence();
    setSequence(seq);
    setUserSequence([]);
    setShowIdx(0);
    setPhase('showing');
  };

  useEffect(() => {
    if (phase === 'showing' && showIdx >= 0 && showIdx < sequence.length) {
      setHighlightedBtn(sequence[showIdx]);
      const t1 = setTimeout(() => setHighlightedBtn(null), 500);
      const t2 = setTimeout(() => setShowIdx((p) => p + 1), 700);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (phase === 'showing' && showIdx >= sequence.length) {
      setHighlightedBtn(null);
      setPhase('input');
    }
  }, [phase, showIdx, sequence.length]);

  const handlePress = (btnId) => {
    if (phase !== 'input') return;

    setHighlightedBtn(btnId);
    setTimeout(() => setHighlightedBtn(null), 200);

    const next = [...userSequence, btnId];
    setUserSequence(next);

    // Check if wrong
    if (btnId !== sequence[next.length - 1]) {
      setPhase('result');
      return;
    }

    // Check if complete
    if (next.length === sequence.length) {
      setScore((s) => s + 1);
      setLevel((l) => l + 1);
      setPhase('intro');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phase === 'tutorial' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔲</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Sequence Memory</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              Watch the colored buttons light up in sequence. Then repeat the exact sequence by tapping the buttons in the same order.
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              ✦ Watch carefully{'\n'}✦ Repeat the order{'\n'}✦ Sequence grows each round!
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('intro')}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'intro' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔲</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Sequence Memory</Text>
            <Text style={{ color: colors.textDisabled, fontSize: 12, marginTop: 8 }}>
              Streak: {score} | Sequence Length: {level}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startRound}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{score === 0 ? 'Start' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {(phase === 'showing' || phase === 'input') && (
          <View style={styles.introBox}>
            <Text style={{ color: phase === 'showing' ? colors.warning : colors.accent, fontSize: 12, fontWeight: '700', marginBottom: 24 }}>
              {phase === 'showing' ? 'WATCH THE SEQUENCE' : 'REPEAT THE SEQUENCE'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 16 }}>
              Length: {sequence.length} | Progress: {userSequence.length}/{sequence.length}
            </Text>
            <View style={styles.buttonsGrid}>
              {BUTTONS.map((btn) => {
                const isHighlighted = highlightedBtn === btn.id;
                return (
                  <TouchableOpacity
                    key={btn.id}
                    style={[
                      styles.simonBtn,
                      {
                        backgroundColor: isHighlighted ? btn.color : btn.color + '30',
                        borderColor: btn.color,
                        transform: [{ scale: isHighlighted ? 1.1 : 1 }],
                      },
                    ]}
                    onPress={() => handlePress(btn.id)}
                    disabled={phase !== 'input'}
                    activeOpacity={0.7}
                  />
                );
              })}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 8 ? '🏆' : score >= 5 ? '🔲' : '🧠'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>Score: {score}</Text>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700', marginTop: 4 }}>
              Max Sequence: {level - 1}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 8 ? 'Incredible memory!' : score >= 5 ? 'Great recall!' : 'Keep training!'}
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
  buttonsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', width: 240 },
  simonBtn: { width: 100, height: 100, borderRadius: 20, borderWidth: 2 },
});

export default SequenceMemoryGame;
