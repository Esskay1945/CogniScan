import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Eye, Check, ChevronRight, Square, Circle, Triangle, Star, Hexagon } from 'lucide-react-native';

const SHAPES = [
    { id: 1, Icon: Square, color: '#FF3D00' },
    { id: 2, Icon: Circle, color: '#0066FF' },
    { id: 3, Icon: Triangle, color: '#00E676' },
    { id: 4, Icon: Star, color: '#FFD600' },
    { id: 5, Icon: Hexagon, color: '#9B7BFF' },
];

const VisualMemoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const [phase, setPhase] = useState('memorize'); // memorize, recall, result
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (phase === 'memorize') {
       const t = SHAPES[Math.floor(Math.random() * SHAPES.length)];
       setTarget(t);
       const timeout = setTimeout(() => setPhase('recall'), 2000);
       return () => clearTimeout(timeout);
    }
    
    if (phase === 'recall') {
        const op = [...SHAPES].sort(() => Math.random() - 0.5);
        setOptions(op);
    }
  }, [phase]);

  const handleSelect = (shape) => {
    const isCorrect = shape.id === target.id;
    saveAssessmentScore('visualMemory', isCorrect ? 100 : 0);
    setPhase('result');
  };

  if (phase === 'memorize' && target) {
    const Icon = target.Icon;
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
           <Text style={[Typography.caption, { color: colors.primary }]}>REMEMBER THIS SHAPE</Text>
           <View style={[styles.shapeBox, { backgroundColor: colors.surface, borderColor: target.color }]}>
              <Icon size={120} color={target.color} />
           </View>
        </View>
      </View>
    );
  }

  if (phase === 'recall') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.scroll}>
           <Text style={[Typography.caption, { color: colors.accent, textAlign: 'center' }]}>WHICH ONE WAS IT?</Text>
           <View style={styles.grid}>
                {options.map((s, i) => {
                    const Icon = s.Icon;
                    return (
                        <TouchableOpacity 
                            key={i} 
                            style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => handleSelect(s)}
                        >
                            <Icon size={48} color={s.color} />
                        </TouchableOpacity>
                    );
                })}
           </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Eye size={64} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 20 }]}>VISUAL MEMORY DONE</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'visualMemory' })}>
          <Text style={{ color: '#FFF', fontWeight: '900' }}>CONTINUE</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 32, paddingTop: 80 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  shapeBox: { width: 240, height: 240, borderRadius: 40, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 48 },
  gridItem: { width: (Dimensions.get('window').width - 96) / 2, height: 140, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  btn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
});

export default VisualMemoryScreen;
