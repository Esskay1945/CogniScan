import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ChunkingGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('tutorial');
  const [sequence, setSequence] = useState('');
  const [chunks, setChunks] = useState([]);
  const [userChunks, setUserChunks] = useState([]);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [showSeq, setShowSeq] = useState(true);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(0);

  const generateRound = () => {
    const len = 6 + round * 2;
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
    const chunkSize = 3 + Math.floor(round / 2);
    const ch = [];
    for (let i = 0; i < seq.length; i += chunkSize) {
      ch.push(seq.slice(i, i + chunkSize));
    }
    setSequence(seq);
    setChunks(ch);
    setUserChunks([]);
    setCurrentChunk(0);
    setShowSeq(true);
    setTimeout(() => setShowSeq(false), 3000 + round * 500);
  };

  useEffect(() => {
    if (phase === 'playing') {
      generateRound();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleDigit = (d) => {
    if (showSeq) return;
    const newUserChunks = [...userChunks];
    if (!newUserChunks[currentChunk]) newUserChunks[currentChunk] = '';
    newUserChunks[currentChunk] += d.toString();
    setUserChunks(newUserChunks);

    if (newUserChunks[currentChunk].length >= (chunks[currentChunk]?.length || 3)) {
      if (currentChunk < chunks.length - 1) {
        setCurrentChunk(currentChunk + 1);
      } else {
        // Check accuracy
        const correct = chunks.filter((ch, i) => newUserChunks[i] === ch).length;
        const roundScore = Math.round((correct / chunks.length) * 100);
        setScore(s => s + roundScore);
        const nextRound = round + 1;
        setRound(nextRound);
        if (nextRound >= 4) {
          const finalScore = Math.round((score + roundScore) / 4);
          saveGameResult({ gameId: 'chunking', category: 'memory', score: finalScore, duration: timer });
          setPhase('results');
        } else {
          setTimeout(generateRound, 800);
        }
      }
    }
  };

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🧩</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Chunking Master</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Remember long number sequences by breaking them into chunks!
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>HOW TO PLAY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>1. See the number sequence</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>2. It's shown in chunks to help</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>3. Enter each chunk from memory</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const finalScore = Math.round(score / 4);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎯</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{finalScore}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Chunking Score</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Chunking Master</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Round {round + 1}/4</Text>
      </View>
      
      <View style={styles.seqArea}>
        {showSeq ? (
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>MEMORIZE:</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'center' }}>
              {chunks.map((ch, i) => (
                <View key={i} style={[styles.chunkBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                  <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 22 }}>{ch}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
              ENTER CHUNK {currentChunk + 1}/{chunks.length}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'center' }}>
              {chunks.map((ch, i) => (
                <View key={i} style={[styles.chunkBox, {
                  backgroundColor: i < currentChunk ? colors.success + '15' : i === currentChunk ? colors.primary + '15' : colors.surface,
                  borderColor: i < currentChunk ? colors.success : i === currentChunk ? colors.primary : colors.border,
                }]}>
                  <Text style={{ color: i <= currentChunk ? colors.text : colors.textDisabled, fontWeight: '800', fontSize: 18 }}>
                    {userChunks[i] || '___'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {!showSeq && (
        <View style={styles.numPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => (
            <TouchableOpacity key={d} style={[styles.numBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleDigit(d)}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20 }}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 56 },
  tutBox: { width: '100%', padding: 16, borderRadius: 14, marginTop: 24 },
  btn: { width: '100%', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  seqArea: { flex: 1, justifyContent: 'center', padding: 24 },
  chunkBox: { padding: 14, borderRadius: 12, borderWidth: 2, minWidth: 60, alignItems: 'center' },
  numPad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, padding: 16, paddingBottom: 40 },
  numBtn: { width: (width - 80) / 5, height: 50, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ChunkingGame;
