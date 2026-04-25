import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Zap, Brain, History } from 'lucide-react-native';

const FlashRecallGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('tutorial');
  const [level, setLevel] = useState(1);
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const bank = ['#FF3D00', '#00E676', '#0066FF', '#FFD600', '#00F0FF', '#9B7BFF', '#FF00FF', '#FFFFFF'];
  const labels = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'ETA', 'THETA'];

  const startLevel = () => {
    const itemCount = level + 2;
    const selectedIndices = [];
    while (selectedIndices.length < itemCount) {
      const r = Math.floor(Math.random() * bank.length);
      if (!selectedIndices.includes(r)) selectedIndices.push(r);
    }

    const newItems = selectedIndices.map(i => ({ color: bank[i], label: labels[i] }));
    setItems(newItems);
    setPhase('flash');

    setTimeout(() => {
      setOptions(shuffle([...selectedIndices]).map(i => ({ color: bank[i], label: labels[i] })));
      setPhase('recall');
    }, 2000 + (level * 500));
  };

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const handleSelection = (selectedItem) => {
    if (selectedItem.label === items[correctCount].label) {
      const nextCount = correctCount + 1;
      setCorrectCount(nextCount);
      if (nextCount === items.length) {
        setScore(s => s + (level * 100));
        setCorrectCount(0);
        setLevel(l => l + 1);
        setPhase('intro');
      }
    } else {
      setPhase('result');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[Typography.h2, { color: colors.text, flex: 1, textAlign: 'center' }]}>Flash Recall Chains</Text>
        <History color={colors.textSecondary} size={20} />
      </View>

      <View style={styles.main}>
        {phase === 'tutorial' && (
          <View style={[styles.contentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>⚡</Text>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>Flash Recall Chains</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8, fontSize: 14, lineHeight: 22 }}>
              A sequence of colored spectral signals will flash briefly. Remember the exact order, then reconstruct the sequence by tapping the correct items.
            </Text>
            <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              ✦ Watch the colored sequence{'\n'}✦ Tap items in the correct order{'\n'}✦ Sequence grows each level
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => setPhase('intro')}>
              <Text style={styles.btnText}>GOT IT!</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'intro' && (
          <View style={[styles.contentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Brain size={48} color={colors.primary} />
            <Text style={[Typography.h2, { color: colors.text, marginTop: 16 }]}>Level {level}</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
              Memorize the sequence of spectral signals.
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={startLevel}>
              <Text style={styles.btnText}>START</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'flash' && (
          <View style={styles.flashContainer}>
            <Text style={[Typography.caption, { color: colors.accent, marginBottom: 20 }]}>ANALYZING SPECTRUM...</Text>
            <View style={styles.chain}>
              {items.map((item, i) => (
                <View key={i} style={[styles.flashCard, { backgroundColor: item.color, borderColor: colors.border, borderWidth: 2 }]}>
                  <Text style={{ color: '#000', fontWeight: '900', fontSize: 10 }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {phase === 'recall' && (
          <View style={styles.recallContainer}>
            <Text style={[Typography.caption, { color: colors.primary, marginBottom: 20 }]}>RECONSTRUCT SEQUENCE ({correctCount}/{items.length})</Text>
            <View style={styles.optionGrid}>
              {options.map((option, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSelection(option)}
                >
                  <View style={[styles.colorDot, { backgroundColor: option.color }]} />
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={[styles.contentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Zap size={48} color={colors.error} />
            <Text style={[Typography.h2, { color: colors.text, marginTop: 16 }]}>Link Fractured</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
              Final Depth: Level {level}{'\n'}Score: {score}
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => { setLevel(1); setScore(0); setCorrectCount(0); setPhase('intro'); }}>
              <Text style={styles.btnText}>PLAY AGAIN</Text>
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
  contentBox: { alignItems: 'center', padding: 32, borderRadius: 24, borderWidth: 1 },
  flashContainer: { alignItems: 'center' },
  chain: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  flashCard: { width: 64, height: 64, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recallContainer: { alignItems: 'center' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  optionCard: { width: 120, height: 100, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  colorDot: { width: 24, height: 24, borderRadius: 12 },
  primaryBtn: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 32, paddingHorizontal: 32 },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1.5 },
});

export default FlashRecallGame;
