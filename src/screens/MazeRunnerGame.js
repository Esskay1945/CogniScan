import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MazeRunnerGame = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [phase, setPhase] = useState('tutorial');
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [goalPos, setGoalPos] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [level, setLevel] = useState(0);
  const mazeSize = 7;

  const generateMaze = () => {
    const grid = Array.from({ length: mazeSize }, () =>
      Array.from({ length: mazeSize }, () => Math.random() > 0.3 ? 0 : 1)
    );
    grid[0][0] = 0;
    grid[mazeSize - 1][mazeSize - 1] = 0;
    // Ensure a path exists by clearing a rough path
    for (let i = 0; i < mazeSize; i++) {
      grid[i][Math.min(i, mazeSize - 1)] = 0;
      grid[Math.min(i, mazeSize - 1)][i] = 0;
    }
    setMaze(grid);
    setPlayerPos({ r: 0, c: 0 });
    setGoalPos({ r: mazeSize - 1, c: mazeSize - 1 });
    setMoves(0);
  };

  useEffect(() => {
    if (phase === 'playing') {
      generateMaze();
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase, level]);

  const movePlayer = (dr, dc) => {
    const newR = playerPos.r + dr;
    const newC = playerPos.c + dc;
    if (newR < 0 || newR >= mazeSize || newC < 0 || newC >= mazeSize) return;
    if (maze[newR][newC] === 1) return;
    setPlayerPos({ r: newR, c: newC });
    setMoves(m => m + 1);
    if (newR === goalPos.r && newC === goalPos.c) {
      if (level < 2) {
        setLevel(l => l + 1);
      } else {
        const score = Math.max(0, 100 - moves - Math.floor(timer / 3));
        saveGameResult({ gameId: 'mazeRunner', category: 'language', score, duration: timer });
        setPhase('results');
      }
    }
  };

  const CELL_SIZE_M = (width - 80) / mazeSize;

  if (phase === 'tutorial') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🏃</Text>
          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>Maze Runner</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
            Navigate through the maze from top-left to bottom-right!{'\n'}Tests spatial planning and executive function.
          </Text>
          <View style={[styles.tutBox, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>HOW TO PLAY</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Use the D-pad buttons to move</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Blue = you, Green = goal</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Dark cells are walls — can't pass!</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('playing')}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const score = Math.max(0, 100 - moves - Math.floor(timer / 3));
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎊</Text>
          <Text style={[Typography.h1, { color: colors.text }]}>{score}%</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Maze Runner Score</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>{moves} moves · {timer}s</Text>
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
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Maze {level + 1}/3</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{moves} moves</Text>
      </View>
      <View style={styles.mazeGrid}>
        {maze.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((cell, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isGoal = goalPos.r === r && goalPos.c === c;
              return (
                <View key={c} style={[{
                  width: CELL_SIZE_M, height: CELL_SIZE_M,
                  backgroundColor: isPlayer ? colors.primary : isGoal ? colors.success : cell === 1 ? colors.surfaceElevated : colors.surface,
                  borderWidth: 0.5, borderColor: colors.border, borderRadius: 4,
                  justifyContent: 'center', alignItems: 'center',
                }]}>
                  {isPlayer && <Text style={{ fontSize: CELL_SIZE_M * 0.5 }}>🔵</Text>}
                  {isGoal && !isPlayer && <Text style={{ fontSize: CELL_SIZE_M * 0.5 }}>🟢</Text>}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      {/* D-Pad */}
      <View style={styles.dpad}>
        <TouchableOpacity style={[styles.dpadBtn, { backgroundColor: colors.surface }]} onPress={() => movePlayer(-1, 0)}>
          <Text style={{ color: colors.text, fontSize: 24 }}>↑</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.dpadBtn, { backgroundColor: colors.surface }]} onPress={() => movePlayer(0, -1)}>
            <Text style={{ color: colors.text, fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dpadBtn, { backgroundColor: colors.surface }]} onPress={() => movePlayer(0, 1)}>
            <Text style={{ color: colors.text, fontSize: 24 }}>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.dpadBtn, { backgroundColor: colors.surface }]} onPress={() => movePlayer(1, 0)}>
          <Text style={{ color: colors.text, fontSize: 24 }}>↓</Text>
        </TouchableOpacity>
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
  mazeGrid: { alignItems: 'center', marginTop: 8 },
  dpad: { alignItems: 'center', gap: 8, paddingBottom: 40, paddingTop: 16 },
  dpadBtn: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});

export default MazeRunnerGame;
