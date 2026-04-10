import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const MemoryHeistGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('intro'); // intro | memorize | input | result
  const [level, setLevel] = useState(3);
  const [code, setCode] = useState([]);
  const [userCode, setUserCode] = useState([]);
  const [showIdx, setShowIdx] = useState(-1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL = 5;

  const genCode = (len) => Array.from({ length: len }, () => Math.floor(Math.random() * 10));

  const startRound = () => {
    const c = genCode(level);
    setCode(c);
    setUserCode([]);
    setShowIdx(0);
    setPhase('memorize');
  };

  useEffect(() => {
    if (phase === 'memorize' && showIdx >= 0 && showIdx < code.length) {
      const t = setTimeout(() => setShowIdx(p => p + 1), 800);
      return () => clearTimeout(t);
    }
    if (phase === 'memorize' && showIdx >= code.length) {
      setTimeout(() => { setShowIdx(-1); setPhase('input'); }, 500);
    }
  }, [phase, showIdx, code.length]);

  const tapDigit = (d) => {
    if (phase !== 'input') return;
    const next = [...userCode, d];
    setUserCode(next);
    if (next.length === code.length) {
      const correct = next.every((v, i) => v === code[i]);
      if (correct) { setScore(p => p + 1); setLevel(p => p + 1); }
      setRound(p => p + 1);
      if (round + 1 >= TOTAL) setPhase('result');
      else { setPhase('intro'); }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={Colors.dark.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phase === 'intro' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
            <Text style={[Typography.h2, { color: Colors.dark.text, textAlign: 'center' }]}>Memory Heist</Text>
            <Text style={{ color: Colors.dark.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6 }}>
              Memorize the vault code and enter it back
            </Text>
            <Text style={{ color: Colors.dark.textDisabled, fontSize: 12, marginTop: 8 }}>
              Round {round + 1}/{TOTAL} | Code length: {level}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={startRound}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{round === 0 ? 'Start Heist' : 'Next Vault'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'memorize' && (
          <View style={styles.introBox}>
            <Text style={{ color: Colors.dark.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>MEMORIZE THE CODE</Text>
            <View style={styles.codeRow}>
              {code.map((d, i) => (
                <View key={i} style={[styles.codeCell, { backgroundColor: i === showIdx ? Colors.dark.primary : Colors.dark.surface }]}>
                  <Text style={{ color: i <= showIdx ? '#FFF' : Colors.dark.text, fontSize: 28, fontWeight: '800' }}>
                    {i <= showIdx ? d : '?'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {phase === 'input' && (
          <View style={styles.introBox}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>ENTER THE CODE</Text>
            <View style={styles.codeRow}>
              {code.map((_, i) => (
                <View key={i} style={[styles.codeCell, { backgroundColor: userCode[i] != null ? colors.accent : Colors.dark.surface }]}>
                  <Text style={{ color: userCode[i] != null ? '#FFF' : Colors.dark.textDisabled, fontSize: 28, fontWeight: '800' }}>
                    {userCode[i] != null ? userCode[i] : '·'}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.numpad}>
              {[1,2,3,4,5,6,7,8,9,0].map(d => (
                <TouchableOpacity key={d} style={[styles.numKey, { backgroundColor: Colors.dark.surface }]} onPress={() => tapDigit(d)}>
                  <Text style={{ color: Colors.dark.text, fontSize: 22, fontWeight: '700' }}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 4 ? '🏆' : score >= 3 ? '👍' : '🧠'}</Text>
            <Text style={[Typography.h1, { color: Colors.dark.text }]}>{score}/{TOTAL}</Text>
            <Text style={{ color: Colors.dark.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 4 ? 'Master thief!' : score >= 3 ? 'Good heist!' : 'Keep practicing!'}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.dark.primary }]} onPress={() => navigation.goBack()}>
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
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  codeCell: { width: 56, height: 64, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 280 },
  numKey: { width: 64, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});

export default MemoryHeistGame;
