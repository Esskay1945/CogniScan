import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { 
    Moon, Sun, Zap, Coffee, Wind, HardDrive, 
    ChevronRight, Target, BrainCircuit, Activity
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PreTrainingCheckScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveConfounders, data } = useData();
  const game = route.params?.game || { id: 'ReflexTap', title: 'Reflex Tap' };

  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [noise, setNoise] = useState(1);
  const [expectation, setExpectation] = useState(3);

  const confounders = [
    { id: 'sleep', label: 'Sleep Quality', icon: Moon, value: sleep, setter: setSleep, labels: ['Poor', 'Fair', 'Good', 'V. Good', 'Ideal'] },
    { id: 'stress', label: 'Stress Level', icon: Zap, value: stress, setter: setStress, labels: ['Low', 'Med', 'High', 'V. High', 'Max'] },
    { id: 'energy', label: 'Energy Level', icon: Coffee, value: energy, setter: setEnergy, labels: ['Low', 'Fair', 'High', 'V. High', 'Peak'] },
    { id: 'noise', label: 'Env. Noise', icon: Wind, value: noise, setter: setNoise, labels: ['Quiet', 'Noticeable', 'Loud', 'V. Loud', 'Chaotic'] },
  ];

  const handleStart = () => {
    saveConfounders({ sleep, stress, energy, noise });
    navigation.replace(game.id, { 
        ...route.params, 
        prediction: expectation 
    });
  };

  const RatingBar = ({ item }) => (
    <View style={styles.metricItem}>
        <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                <item.icon size={16} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13, marginLeft: 12 }}>{item.label}</Text>
            <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 11, marginLeft: 'auto' }}>
                {item.labels[item.value - 1]}
            </Text>
        </View>
        <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(v => (
                <TouchableOpacity 
                    key={v}
                    onPress={() => item.setter(v)}
                    style={[styles.rateBtn, { 
                        backgroundColor: item.value === v ? colors.primary : colors.surface,
                        borderColor: item.value === v ? colors.primary : colors.border
                    }]}
                >
                    <Text style={{ color: item.value === v ? '#FFF' : colors.textDisabled, fontWeight: '900', fontSize: 12 }}>{v}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
            <BrainCircuit size={32} color={colors.primary} />
            <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>BEFORE YOU{'\n'}START</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>
                Adjusting scoring algorithms based on current cognitive confounders.
            </Text>
        </View>

        {/* Module 1: Confounders */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 16, letterSpacing: 1 }]}>HOW ARE YOU FEELING?</Text>
            {confounders.map(item => <RatingBar key={item.id} item={item} />)}
        </View>

        {/* Module 4: Meta-Cognitive Prediction */}
        <View style={styles.section}>
            <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Target size={20} color={colors.accent} />
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15, marginLeft: 12 }}>Performance Prediction</Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 10, lineHeight: 18 }}>
                    Rate your expected performance in <Text style={{ color: colors.primary, fontWeight: '800' }}>{game.title}</Text> from 1 to 5.
                </Text>
                <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map(v => (
                        <TouchableOpacity 
                            key={v}
                            onPress={() => setExpectation(v)}
                            style={[styles.rateBtn, { 
                                width: (width - 100) / 5,
                                backgroundColor: expectation === v ? colors.accent : colors.background,
                                borderColor: expectation === v ? colors.accent : colors.border
                            }]}
                        >
                            <Text style={{ color: expectation === v ? '#FFF' : colors.textDisabled, fontWeight: '900', fontSize: 12 }}>{v}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: colors.primary }]} onPress={handleStart}>
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1.5, marginRight: 8 }}>COMMENCE TASK</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  section: { marginBottom: 32 },
  metricItem: { marginBottom: 20 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  rateBtn: { width: (width - 100) / 5, height: 44, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  metaCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginTop: 8 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 36 },
  startBtn: { height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default PreTrainingCheckScreen;
