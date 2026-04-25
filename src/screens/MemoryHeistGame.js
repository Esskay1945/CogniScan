import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MemoryHeistGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial'); // tutorial | intro | memorize | input | result
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

  // Calculate responsive cell size based on code length
  const maxCellWidth = Math.min(56, (width - 80 - (code.length - 1) * 8) / code.length);
  const cellHeight = Math.min(64, maxCellWidth * 1.15);
  const fontSize = Math.min(28, maxCellWidth * 0.5);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phase === 'tutorial' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Memory Heist</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6, lineHeight: 22 }}>
              A vault code will be revealed one digit at a time. Memorize the entire code, then enter it back using the keypad.
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              ✦ Watch digits appear one by one{'\n'}✦ Enter the full code from memory{'\n'}✦ Code length increases with success!
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('intro')}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Got It!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'intro' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Memory Heist</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 6 }}>
              Memorize the vault code and enter it back
            </Text>
            <Text style={{ color: colors.textDisabled, fontSize: 12, marginTop: 8 }}>
              Round {round + 1}/{TOTAL} | Code length: {level}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={startRound}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{round === 0 ? 'Start Heist' : 'Next Vault'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'memorize' && (
          <View style={styles.introBox}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>MEMORIZE THE CODE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.codeScrollContent}>
              <View style={styles.codeRow}>
                {code.map((d, i) => (
                  <View key={i} style={[
                    styles.codeCell,
                    {
                      width: maxCellWidth,
                      height: cellHeight,
                      backgroundColor: i === showIdx ? colors.primary : colors.surface,
                    }
                  ]}>
                    <Text style={{ color: i <= showIdx ? '#FFF' : colors.text, fontSize, fontWeight: '800' }}>
                      {i <= showIdx ? d : '?'}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {phase === 'input' && (
          <View style={styles.introBox}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>ENTER THE CODE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.codeScrollContent}>
              <View style={styles.codeRow}>
                {code.map((_, i) => (
                  <View key={i} style={[
                    styles.codeCell,
                    {
                      width: maxCellWidth,
                      height: cellHeight,
                      backgroundColor: userCode[i] != null ? colors.accent : colors.surface,
                    }
                  ]}>
                    <Text style={{ color: userCode[i] != null ? '#FFF' : colors.textDisabled, fontSize, fontWeight: '800' }}>
                      {userCode[i] != null ? userCode[i] : '·'}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.numpad}>
              {[1,2,3,4,5,6,7,8,9,0].map(d => (
                <TouchableOpacity key={d} style={[styles.numKey, { backgroundColor: colors.surface }]} onPress={() => tapDigit(d)}>
                  <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 4 ? '🏆' : score >= 3 ? '👍' : '🧠'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{TOTAL}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 6 }}>
              {score >= 4 ? 'Master thief!' : score >= 3 ? 'Good heist!' : 'Keep practicing!'}
            </Text>
            <Text style={{ color: colors.textDisabled, fontSize: 12, marginTop: 4 }}>
              Max code length reached: {level - (score >=4 ? 0 : 1)}
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
  codeScrollContent: { justifyContent: 'center', flexGrow: 1 },
  codeRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center', maxWidth: width - 48 },
  codeCell: { borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 36 },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 280 },
  numKey: { width: 64, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});

export default MemoryHeistGame;
