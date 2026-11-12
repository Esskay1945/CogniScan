import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Typography } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { ChevronLeft, Zap, Target as TargetIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const AREA_W = width - 48;
const AREA_H = 450;

const ReflexTapGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { data, saveGameResult, updateDifficulty, logMetaCognitive, logTypingRhythm } = useData();
  const isMandatory = route.params?.isMandatory;
  const gameId = 'ReflexTap';
  
  // Adaptation state
  const currentDiff = data.difficulties?.[gameId] || 1;
  const spawnDelay = Math.max(800, 2000 - (currentDiff * 120)); // Decreases with difficulty
  const baseSize = Math.max(30, 60 - (currentDiff * 3)); // Smaller targets with difficulty

  const [phase, setPhase] = useState('tutorial');
  const [target, setTarget] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const timerRef = useRef(null);
  const run = useRef(null);
  const TOTAL = 12;

  const advance = (latency = null) => {
    const game = run.current;
    if (!game?.active) return;
    game.active = false;
    clearTimeout(timerRef.current);
    setTarget(null);
    if (latency !== null) {
      const now = Date.now();
      if (game.lastTap) logTypingRhythm(now - game.lastTap);
      game.lastTap = now;
      game.times.push(latency);
    }
    game.round++;
    setRound(game.round);
    setScore(game.times.length);
    setTimes([...game.times]);

    if (game.round === TOTAL) {
      const accuracy = game.times.length / TOTAL;
      const average = game.times.reduce((sum, value) => sum + value, 0) / Math.max(1, game.times.length);
      saveGameResult({ gameId, category: 'motor', score: accuracy * 100, duration: (Date.now() - game.start) / 1000 });
      updateDifficulty(gameId, accuracy);
      if (game.times.length) logMetaCognitive({ hesitation: average, span: 30 });
      setPhase('result');
    } else {
      timerRef.current = setTimeout(spawnTarget, 200);
    }
  };

  const spawnTarget = () => {
    const game = run.current;
    const size = baseSize + Math.random() * 15;
    const targetColors = [colors.primary, colors.accent, colors.success, colors.warning, colors.error];
    game.targetStart = Date.now();
    game.active = true;
    setTarget({ size, x: Math.random() * (AREA_W - size), y: Math.random() * (AREA_H - size),
      color: targetColors[game.round % targetColors.length] });
    timerRef.current = setTimeout(advance, spawnDelay);
  };

  const handleTap = () => {
    if (run.current?.active) advance(Date.now() - run.current.targetStart);
  };

  const start = () => {
    clearTimeout(timerRef.current);
    run.current = { start: Date.now(), round: 0, times: [], active: false, lastTap: 0 };
    setScore(0);
    setRound(0);
    setTimes([]);
    setPhase('play');
    timerRef.current = setTimeout(spawnTarget, 500);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '800' }}>LEVEL {currentDiff} Arena</Text>
      </View>

      <View style={styles.center}>
        {phase === 'tutorial' && (
          <View style={styles.introBox}>
            <View style={[styles.glowBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <TargetIcon size={44} color={colors.primary} />
            </View>
            <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: 24 }]}>Reflex Tap Arena</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 13, marginTop: 12, lineHeight: 22 }}>
              Tap the targets as fast as possible. The arena adapts to your speed—improving performance increases difficulty.
            </Text>
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Zap size={16} color={colors.warning} />
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>{spawnDelay}ms WINDOW</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{Math.round(baseSize)}px SIZE</Text>
                </View>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={start}>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>START</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'play' && (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <View style={styles.hud}>
                <View style={styles.scorePill}>
                    <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>{score}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '800', marginLeft: 4 }}>/{TOTAL}</Text>
                </View>
                <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 14 }}>ROUND {round + 1}</Text>
            </View>
            <View style={[styles.arena, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {target && (
                <TouchableOpacity
                  style={[styles.target, { left: target.x, top: target.y, width: target.size, height: target.size, backgroundColor: target.color, borderRadius: target.size / 2, shadowColor: target.color, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 }]}
                  onPress={handleTap}
                  activeOpacity={0.7}
                />
              )}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.introBox}>
            <Text style={{ fontSize: 64, marginBottom: 12 }}>{score >= 10 ? '⚡' : '🧠'}</Text>
            <Text style={[Typography.h1, { color: colors.text }]}>{score}/{TOTAL}</Text>
            <Text style={{ color: colors.animateColor || colors.primary, fontSize: 24, fontWeight: '900', marginTop: 12 }}>Avg: {avg}ms</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8, paddingHorizontal: 30, textAlign: 'center' }}>
                Your reaction latency helps refine your cognitive process profile.
            </Text>
            <TouchableOpacity 
                style={[styles.btn, { backgroundColor: colors.primary, width: 220 }]} 
                onPress={() => navigation.goBack()}
            >
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>DONE</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  introBox: { alignItems: 'center', width: '100%' },
  glowBox: { width: 100, height: 100, borderRadius: 30, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 24 },
  stat: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' },
  btn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 32 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: AREA_W, marginBottom: 20 },
  scorePill: { flexDirection: 'row', alignItems: 'baseline' },
  arena: { width: AREA_W, height: AREA_H, borderRadius: 32, overflow: 'hidden', position: 'relative', borderWidth: 1.5 },
  target: { position: 'absolute' },
});

export default ReflexTapGame;

