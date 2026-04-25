import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Move, Check, X, ChevronRight, Box } from 'lucide-react-native';

const SHAPES = [
    { id: 'L', points: [[0,0], [0,1], [0,2], [1,2]] },
    { id: 'T', points: [[0,0], [1,0], [2,0], [1,1]] },
    { id: 'Z', points: [[0,0], [1,0], [1,1], [2,1]] },
];

const ShapeRenderer = ({ points, rotation, size = 15 }) => {
    const rotated = useMemo(() => {
        let p = [...points];
        if (rotation === 90) p = p.map(([x, y]) => [-y, x]);
        if (rotation === 180) p = p.map(([x, y]) => [-x, -y]);
        if (rotation === 270) p = p.map(([x, y]) => [y, -x]);
        
        // Normalize
        const minX = Math.min(...p.map(i => i[0]));
        const minY = Math.min(...p.map(i => i[1]));
        return p.map(([x, y]) => [x - minX, y - minY]);
    }, [points, rotation]);

    return (
        <View style={styles.grid}>
            {rotated.map((p, i) => (
                <View key={i} style={[styles.block, { left: p[0] * size, top: p[1] * size, width: size, height: size, backgroundColor: '#0066FF' }]} />
            ))}
        </View>
    );
};

const MentalRotationScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;

  const [round, setRound] = useState(0);
  const [currentShape, setCurrentShape] = useState(null);
  const [angle, setAngle] = useState(0);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const base = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const rot = [90, 180, 270][Math.floor(Math.random() * 3)];
    
    // One correct, one wrong (different shape)
    const opt = [
        { points: base.points, rotation: rot, isTarget: true },
        { points: SHAPES.find(s => s.id !== base.id).points, rotation: rot, isTarget: false }
    ].sort(() => Math.random() - 0.5);

    setCurrentShape(base);
    setAngle(rot);
    setOptions(opt);
  }, [round]);

  const handleSelect = (isTarget) => {
    if (isTarget) setScore(s => s + 20);
    
    if (round < 4) {
        setRound(round + 1);
    } else {
        saveAssessmentScore('mentalRotation', score + (isTarget ? 20 : 0));
        setComplete(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {!complete ? (
          <>
            <Text style={[Typography.caption, { color: colors.primary }]}>ROTATION TASK</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>Which of the bottom shapes matches the top shape if rotated?</Text>

            <View style={styles.targetArea}>
                {currentShape && <ShapeRenderer points={currentShape.points} rotation={0} size={30} />}
            </View>

            <View style={styles.optionRow}>
                {options.map((opt, i) => (
                    <TouchableOpacity key={i} style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleSelect(opt.isTarget)}>
                        <ShapeRenderer points={opt.points} rotation={opt.rotation} size={20} />
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={{ color: colors.textSecondary, marginTop: 40 }}>Round {round + 1} / 5</Text>
          </>
        ) : (
          <View style={styles.center}>
            <Move size={80} color={colors.success} />
            <Text style={[Typography.h1, { color: colors.text, marginTop: 24 }]}>VISUOSPATIAL DONE</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'mentalRotation' })}>
              <Text style={{ color: '#FFF', fontWeight: '900' }}>CONTINUE</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 32, paddingTop: 80, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  targetArea: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginVertical: 40 },
  grid: { width: 100, height: 100, position: 'relative' },
  block: { position: 'absolute', borderWidth: 1, borderColor: '#FFF' },
  optionRow: { flexDirection: 'row', gap: 20 },
  optionCard: { width: 140, height: 140, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  btn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 48 },
});

export default MentalRotationScreen;
