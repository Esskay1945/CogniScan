import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const CATEGORIES_LIST = ['Animals', 'Fruits', 'Countries', 'Colors', 'Sports'];
const WORDS_DB = {
  Animals: ['cat', 'dog', 'lion', 'tiger', 'bear', 'eagle', 'snake', 'fish', 'horse', 'rabbit', 'elephant', 'whale', 'wolf', 'fox', 'deer'],
  Fruits: ['apple', 'banana', 'orange', 'grape', 'mango', 'kiwi', 'peach', 'pear', 'plum', 'lemon', 'cherry', 'melon', 'fig', 'lime', 'date'],
  Countries: ['india', 'china', 'japan', 'brazil', 'france', 'italy', 'spain', 'germany', 'canada', 'russia', 'egypt', 'mexico', 'peru', 'chile', 'nepal'],
  Colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'brown', 'gray', 'gold', 'silver', 'cyan', 'teal'],
  Sports: ['soccer', 'tennis', 'golf', 'cricket', 'hockey', 'rugby', 'boxing', 'fencing', 'rowing', 'skiing', 'surfing', 'diving', 'cycling', 'running', 'swimming'],
};

const CategorySortGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('tutorial');
  const [categories, setCategories] = useState([]);
  const [words, setWords] = useState([]);
  const [sorted, setSorted] = useState({});
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [timer, setTimer] = useState(0);

  const initGame = () => {
    const cats = [...CATEGORIES_LIST].sort(() => Math.random() - 0.5).slice(0, 3);
    setCategories(cats);
    const allWords = [];
    cats.forEach(cat => {
      const catWords = [...WORDS_DB[cat]].sort(() => Math.random() - 0.5).slice(0, 4);
      catWords.forEach(w => allWords.push({ word: w, category: cat }));
    });
    setWords(allWords.sort(() => Math.random() - 0.5));
    setSorted({});
    setCurrent(0);
    setCorrect(0);
    setTotal(allWords.length);
  };

  useEffect(() => {
    if (phase === 'playing') {
      initGame();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleSort = (category) => {
    if (current >= words.length) return;
    const word = words[current];
    const isCorrect = word.category === category;
    if (isCorrect) setCorrect(c => c + 1);
    
    const next = current + 1;
    setCurrent(next);

    if (next >= words.length) {
      const score = Math.round(((correct + (isCorrect ? 1 : 0)) / total) * 100);
      saveGameResult({ gameId: 'categorySort', category: 'language', score, duration: timer });
      setPhase('results');
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📂</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Category Sort</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Sort words into their correct categories as fast as possible!
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>HOW TO PLAY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>1. A word appears on screen</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>2. Tap the correct category</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>3. Speed + accuracy = score</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const score = Math.round((correct / total) * 100);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📊</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Category Sort Score</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>{correct}/{total} correct · {timer}s</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentWord = words[current];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Category Sort</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{current}/{total}</Text>
      </View>
      <View style={styles.wordArea}>
        <View style={[styles.wordCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={{ color: colors.text, fontWeight: '900', fontSize: 32, textTransform: 'capitalize' }}>{currentWord?.word}</Text>
        </View>
      </View>
      <View style={styles.catRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleSort(cat)}
          >
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 56 },
  tutBox: { width: '100%', padding: 16, borderRadius: 14, marginTop: 24 },
  btn: { width: '100%', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  wordArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  wordCard: { padding: 40, borderRadius: 24, borderLeftWidth: 4, alignItems: 'center' },
  catRow: { padding: 24, paddingBottom: 48, gap: 12 },
  catBtn: { padding: 18, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
});

export default CategorySortGame;
