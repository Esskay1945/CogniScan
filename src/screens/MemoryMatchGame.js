import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, RotateCcw } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 72) / 4;
const ICONS = ['🧠', '⚡', '🎯', '🔮', '💎', '🌟', '🎭', '🔥'];

const MemoryMatchGame = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { data, saveGameResult, completeAssignedGame, addXP, updateDifficulty, logMetaCognitive } = useData();
  const isMandatory = route.params?.isMandatory;
  const gameId = 'MemoryMatch';
  const difficulty = data.difficulties?.[gameId] || 1;
  const [phase, setPhase] = useState('tutorial');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [level, setLevel] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const pairCount = Math.min(4 + level, 8);

  const initGame = () => {
    const selected = ICONS.slice(0, pairCount);
    const deck = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((icon, i) => ({ id: i, icon, key: icon }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    if (phase === 'playing') {
      initGame();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase, level]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [phase]);

  const handleCardPress = (index) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    setMoves(m => m + 1);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      if (cards[a].key === cards[b].key) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length) {
          const score = Math.max(0, 100 - (moves * 2) - Math.floor(timer / 5));
          saveGameResult({ gameId: 'memoryMatch', category: 'memory', score, duration: timer });
          if (isMandatory) completeAssignedGame(gameId);
          addXP(30, 'memory');

          // adaptation
          updateDifficulty(gameId, score / 100);
          logMetaCognitive({ hesitation: (timer / (moves || 1)) * 1000 });

          setTimeout(() => setPhase('results'), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.tutorialContent}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🃏</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Memory Match</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Flip cards to find matching pairs.{'\n'}Remember what's underneath!{'\n\n'}
            Fewer moves = higher score.
          </Text>
          <View style={[styles.tutStep, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>HOW TO PLAY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>1. Tap a card to flip it</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>2. Tap another card to find its match</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>3. Match all pairs to win</Text>
          </View>
          <TouchableOpacity style={[styles.playBtn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1 }}>START GAME</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const score = Math.max(0, 100 - (moves * 2) - Math.floor(timer / 5));
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.tutorialContent}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>Memory Match Score</Text>
          <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
            <View style={styles.statItem}><Text style={{ color: colors.primary, fontWeight: '800', fontSize: 20 }}>{moves}</Text><Text style={{ color: colors.textSecondary, fontSize: 10 }}>MOVES</Text></View>
            <View style={styles.statItem}><Text style={{ color: colors.accent, fontWeight: '800', fontSize: 20 }}>{timer}s</Text><Text style={{ color: colors.textSecondary, fontSize: 10 }}>TIME</Text></View>
            <View style={styles.statItem}><Text style={{ color: colors.success, fontWeight: '800', fontSize: 20 }}>{matched.length / 2}</Text><Text style={{ color: colors.textSecondary, fontSize: 10 }}>PAIRS</Text></View>
          </View>
          <TouchableOpacity style={[styles.playBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1 }}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Memory Match</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{timer}s</Text>
      </View>
      <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 12 }}>Moves: {moves} · Pairs: {matched.length / 2}/{pairCount}</Text>
      <View style={styles.grid}>
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          const isMatched = matched.includes(i);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.card, {
                backgroundColor: isMatched ? colors.success + '20' : isFlipped ? colors.primary + '20' : colors.surface,
                borderColor: isMatched ? colors.success : isFlipped ? colors.primary : colors.border,
              }]}
              onPress={() => handleCardPress(i)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 24 }}>{isFlipped ? card.icon : '❓'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tutorialContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  tutStep: { width: '100%', padding: 16, borderRadius: 14, marginTop: 24 },
  playBtn: { width: '100%', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 56 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 8, justifyContent: 'center' },
  card: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  statRow: { flexDirection: 'row', width: '100%', padding: 20, borderRadius: 16, marginTop: 24, justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
});

export default MemoryMatchGame;
