import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { 
    Activity, Moon, Zap, Coffee, Wind, 
    ChevronRight, Info
} from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const { width } = Dimensions.get('window');

const ReadinessCheckScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { calculateReadiness } = useData();
  const game = route.params?.game || { id: 'TestHub', title: 'Assessment' };

  const [metrics, setMetrics] = useState({
    sleep: 3,
    stress: 3,
    energy: 3,
    noise: 1,
    device: 5,
  });

  const [result, setResult] = useState(null);
  const { speak } = useSpeech();

  useEffect(() => {
    speak('How are you feeling? Before we start, let us know how you are doing today.');
  }, []);

  const sliders = [
    { id: 'sleep', label: 'How did you sleep?', icon: Moon, labels: ['Badly', 'Okay', 'Very Well'] },
    { id: 'stress', label: 'How stressed are you?', icon: Zap, labels: ['Calm', 'A Bit', 'Very'] },
    { id: 'energy', label: 'How is your energy?', icon: Coffee, labels: ['Tired', 'Normal', 'Full Energy'] },
    { id: 'noise', label: 'Is it quiet around you?', icon: Wind, labels: ['Quiet', 'Some Noise', 'Very Loud'] },
  ];

  const handleCompute = () => {
    const res = calculateReadiness(metrics);
    setResult(res);
    const msg = res.consequence === 'continue' 
      ? `Your readiness score is ${res.score} percent. You seem well rested and ready!`
      : `Your readiness score is ${res.score} percent. You might be a bit tired, but we will keep that in mind.`;
    speak(msg);
  };

  const handleProceed = () => {
    if (game.id === 'TestHub') {
        navigation.navigate('TestHub', { ...route.params, readiness: result.score });
    } else {
        navigation.replace(game.id, { ...route.params, readiness: result.score });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
            <Activity size={32} color={colors.primary} />
            <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>HOW ARE YOU{'\n'}FEELING?</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 22 }}>
                Before we start, let us know how you're doing today. This helps us give you better results.
            </Text>
        </View>

        {!result ? (
            <View style={styles.section}>
                {sliders.map(s => (
                    <View key={s.id} style={styles.metricRow}>
                        <View style={styles.metricLabel}>
                            <s.icon size={18} color={colors.primary} />
                            <Text style={{ color: colors.text, marginLeft: 12, fontWeight: '700', fontSize: 15 }}>{s.label}</Text>
                        </View>
                        <View style={styles.options}>
                            {[1,2,3,4,5].map(v => (
                                <TouchableOpacity 
                                    key={v}
                                    onPress={() => setMetrics({...metrics, [s.id]: v})}
                                    style={[styles.chip, { 
                                        backgroundColor: metrics[s.id] === v ? colors.primary : colors.surface,
                                        borderColor: metrics[s.id] === v ? colors.primary : colors.border
                                    }]}
                                >
                                    <Text style={{ color: metrics[s.id] === v ? '#FFF' : colors.text, fontWeight: '800', fontSize: 16 }}>{v}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.chipLabels}>
                            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{s.labels[0]}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{s.labels[2]}</Text>
                        </View>
                    </View>
                ))}
                
                <TouchableOpacity style={[styles.computeBtn, { backgroundColor: colors.primary }]} onPress={handleCompute}>
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1 }}>I'M READY — CHECK</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <View style={styles.resultView}>
                <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: result.consequence === 'continue' ? colors.success : colors.warning }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>YOUR READINESS</Text>
                    <Text style={[Typography.h1, { color: result.consequence === 'continue' ? colors.success : colors.warning, fontSize: 40 }]}>
                        {result.score}%
                    </Text>
                    <View style={styles.feedbackBox}>
                        <Info size={16} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 12, lineHeight: 20 }}>
                            {result.consequence === 'continue' ? 
                                'You seem well rested and ready. Your test results will be very reliable today!' :
                                'You might be a bit tired or stressed. We\'ll keep that in mind when looking at your scores.'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={[styles.proceedBtn, { backgroundColor: colors.primary }]} onPress={handleProceed}>
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1 }}>
                        {result.consequence === 'retest' ? 'CONTINUE ANYWAY' : 'LET\'S BEGIN'}
                    </Text>
                    <ChevronRight size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  section: { gap: 24 },
  metricRow: { marginBottom: 8 },
  metricLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  options: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: { width: (width - 100) / 5, height: 48, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  chipLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  computeBtn: { height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  resultView: { marginTop: 20 },
  resultCard: { padding: 32, borderRadius: 32, borderWidth: 2, alignItems: 'center' },
  feedbackBox: { flexDirection: 'row', marginTop: 24, padding: 16, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 16 },
  proceedBtn: { height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 10 },
});

export default ReadinessCheckScreen;
