import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
const { width } = Dimensions.get('window');

const SHAPES = ['🔵', '🔵', '🔵', '🔴', '🔵', '🔵', '🔴', '🔵', '🔵', '🔵', '🔴', '🔵', '🔵', '🔵', '🔴', '🔵', '🔵', '🔴', '🔵', '🔵', '🔵', '🔵', '🔴', '🔵', '🔵'];
const TARGET = '🔴';

const OddballDetectionGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('intro');
  const [index, setIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [tapped, setTapped] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === 'playing' && index < SHAPES.length) {
      setTapped(false);
      timerRef.current = setTimeout(() => {
        if (!tapped && SHAPES[index] === TARGET) setMisses(m => m + 1);
        setIndex(i => i + 1);
      }, 1200);
      return () => clearTimeout(timerRef.current);
    }
    if (phase === 'playing' && index >= SHAPES.length) {
      const totalTargets = SHAPES.filter(s => s === TARGET).length;
      const pct = Math.round((hits / Math.max(totalTargets, 1)) * 100);
      saveGameResult({ gameId: 'OddballDetection', category: 'attention', score: pct, duration: 0 });
      setPhase('results');
    }
  }, [phase, index]);

  const handleTap = () => {
    if (tapped) return;
    setTapped(true);
    clearTimeout(timerRef.current);
    if (SHAPES[index] === TARGET) setHits(h => h + 1);
    else setFalseAlarms(f => f + 1);
    setTimeout(() => setIndex(i => i + 1), 300);
  };

  const totalTargets = SHAPES.filter(s => s === TARGET).length;

  if (phase === 'intro') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🔴</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>ODDBALL{'\n'}DETECTION</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }}>Tap when you see the RED circle (🔴). Do NOT tap for blue circles (🔵).</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}><Text style={{ color: '#FFF', fontWeight: '900' }}>START</Text></TouchableOpacity>
      </View>
    </View>
  );
  if (phase === 'results') return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <CheckCircle2 size={48} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>RESULTS</Text>
        <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900' }}>{hits}/{totalTargets}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Targets detected</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}><Text style={{ color: colors.error, fontWeight: '900', fontSize: 20 }}>{misses}</Text><Text style={{ color: colors.textDisabled, fontSize: 10 }}>MISSED</Text></View>
          <View style={styles.stat}><Text style={{ color: colors.warning, fontWeight: '900', fontSize: 20 }}>{falseAlarms}</Text><Text style={{ color: colors.textDisabled, fontSize: 10 }}>FALSE ALARMS</Text></View>
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '900' }}>DONE</Text></TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 60 }]}>STIMULUS {index + 1}/{SHAPES.length}</Text>
      <TouchableOpacity style={styles.center} onPress={handleTap} activeOpacity={0.7}>
        <Text style={{ fontSize: 100 }}>{SHAPES[index]}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 24 }}>TAP if you see 🔴</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }, back: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, btn: { height: 56, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  statRow: { flexDirection: 'row', gap: 32, marginTop: 20 }, stat: { alignItems: 'center' },
});
export default OddballDetectionGame;
