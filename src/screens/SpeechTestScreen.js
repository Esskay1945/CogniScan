import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Mic, MicOff, Activity, AlertCircle, CheckCircle, Volume2 } from 'lucide-react-native';

import { useData } from '../context/DataContext';

const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog near the river bank. She sells seashells by the seashore while the waves crash gently against the rocks. Peter Piper picked a peck of pickled peppers from the garden patch.",
  "A butterfly fluttered between the bright blue blossoms as morning dew dripped from the delicate petals. The sophisticated statistician systematically synthesized several substantial studies simultaneously.",
  "Around the rugged rocks the ragged rascal ran rapidly. The sixth sick sheikh's sixth sheep is sick. How much wood would a woodchuck chuck if a woodchuck could chuck wood efficiently.",
  "Technology transforms traditional techniques through thoughtful theoretical thinking. Particularly perplexing problems persistently perplex professional practitioners performing precise procedures.",
];

const SpeechTestScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const [phase, setPhase] = useState('intro'); // intro | reading | analyzing | result
  const [paragraph] = useState(PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [speechMetrics, setSpeechMetrics] = useState(null);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Simulate recording with pulse animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setPhase('reading');
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    setPhase('analyzing');

    // Simulate analysis (in a real app, this would use speech recognition API)
    setTimeout(() => {
      const wordCount = paragraph.split(' ').length;
      const expectedTime = wordCount / 2.5; // average reading speed ~150 wpm = 2.5 wps
      const speedRatio = expectedTime / Math.max(timer, 1);

      // Simulated speech analysis metrics
      const metrics = {
        duration: timer,
        wordCount,
        wordsPerMinute: Math.round((wordCount / Math.max(timer, 1)) * 60),
        speedScore: Math.min(100, Math.round(Math.min(speedRatio, 1 / speedRatio) * 100)),
        fluencyScore: Math.round(70 + Math.random() * 25), // Simulated
        clarityScore: Math.round(65 + Math.random() * 30), // Simulated
        rhythmScore: Math.round(60 + Math.random() * 35), // Simulated
        stutteringDetected: Math.random() > 0.7,
        slurringDetected: Math.random() > 0.8,
        pausePatterns: Math.random() > 0.6 ? 'irregular' : 'normal',
      };

      metrics.overallScore = Math.round(
        (metrics.speedScore * 0.25 + metrics.fluencyScore * 0.3 +
          metrics.clarityScore * 0.25 + metrics.rhythmScore * 0.2)
      );

      setSpeechMetrics(metrics);
      setPhase('result');
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getScoreColor = (s) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return colors.primary;
    if (s >= 40) return colors.warning;
    return colors.error;
  };

  const handleComplete = () => {
    const score = speechMetrics?.overallScore || 70;
    saveAssessmentScore('speech', score);
    // Navigate back to TestHub with ALL accumulated params plus speech score
    navigation.navigate('TestHub', {
      ...route.params,
      completedTest: 'speech',
      speechScore: score,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[Typography.h2, { color: colors.text, flex: 1, textAlign: 'center' }]}>
            Speech Rhythm Analysis
          </Text>
          <Volume2 size={20} color={colors.textSecondary} />
        </View>

        {phase === 'intro' && (
          <View style={styles.introContent}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Mic size={48} color={colors.primary} />
            </View>
            <Text style={[Typography.h2, { color: colors.text, textAlign: 'center', marginTop: 24 }]}>
              Speech Check
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 12, lineHeight: 22 }}>
              Read the following paragraph aloud at your natural pace. Our system will analyze your speech rhythm, speed, fluency, and detect any irregularities.
            </Text>

            <View style={[styles.paragraphCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[Typography.caption, { color: colors.primary, marginBottom: 12 }]}>READ THIS ALOUD</Text>
              <Text style={{ color: colors.text, fontSize: 16, lineHeight: 26, fontStyle: 'italic' }}>
                {paragraph}
              </Text>
            </View>

            <View style={[styles.infoRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AlertCircle size={16} color={colors.warning} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 10, flex: 1, lineHeight: 18 }}>
                Ensure you are in a quiet environment. Speak clearly into your device microphone.
              </Text>
            </View>

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={startRecording}>
              <Mic size={20} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1.5, marginLeft: 10 }}>
                BEGIN RECORDING
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'reading' && (
          <View style={styles.readingContent}>
            {/* Timer */}
            <View style={styles.timerContainer}>
              <Text style={{ color: colors.error, fontSize: 48, fontWeight: '900' }}>
                {formatTime(timer)}
              </Text>
              <Text style={[Typography.caption, { color: colors.error, marginTop: 4 }]}>RECORDING</Text>
            </View>

            {/* Pulse Indicator */}
            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }], backgroundColor: colors.error + '20' }]} />
              <View style={[styles.micCircle, { backgroundColor: colors.error }]}>
                <Mic size={32} color="#FFF" />
              </View>
            </View>

            {/* Wave bars */}
            <View style={styles.waveContainer}>
              {[...Array(12)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: 10 + Math.random() * 30,
                      backgroundColor: colors.error,
                      opacity: waveAnim,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Paragraph to read */}
            <View style={[styles.paragraphCard, { backgroundColor: colors.surface, borderColor: colors.error + '40' }]}>
              <Text style={{ color: colors.text, fontSize: 16, lineHeight: 26 }}>
                {paragraph}
              </Text>
            </View>

            <TouchableOpacity style={[styles.stopBtn, { backgroundColor: colors.error }]} onPress={stopRecording}>
              <MicOff size={20} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14, marginLeft: 10, letterSpacing: 1.5 }}>
                STOP RECORDING
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'analyzing' && (
          <View style={styles.analyzingContent}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Activity size={64} color={colors.primary} />
            </Animated.View>
            <Text style={[Typography.h2, { color: colors.text, marginTop: 24 }]}>Analyzing Speech...</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
              Processing rhythm, speed, and fluency patterns
            </Text>
            <View style={styles.loadingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.loadingDot, { backgroundColor: colors.primary, opacity: 0.3 + (i * 0.3) }]} />
              ))}
            </View>
          </View>
        )}

        {phase === 'result' && speechMetrics && (
          <View style={styles.resultContent}>
            {/* Overall Score */}
            <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: getScoreColor(speechMetrics.overallScore) }]}>
              <Text style={{ color: getScoreColor(speechMetrics.overallScore), fontSize: 56, fontWeight: '900' }}>
                {speechMetrics.overallScore}
              </Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginTop: 4 }}>
                SPEECH RHYTHM SCORE
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                {speechMetrics.wordsPerMinute} WPM · {speechMetrics.duration}s duration
              </Text>
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              {[
                { label: 'Speed', score: speechMetrics.speedScore, desc: `${speechMetrics.wordsPerMinute} WPM` },
                { label: 'Fluency', score: speechMetrics.fluencyScore, desc: 'Flow analysis' },
                { label: 'Clarity', score: speechMetrics.clarityScore, desc: 'Articulation' },
                { label: 'Rhythm', score: speechMetrics.rhythmScore, desc: 'Pattern analysis' },
              ].map((metric, i) => (
                <View key={i} style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={{ color: getScoreColor(metric.score), fontSize: 24, fontWeight: '900' }}>
                    {metric.score}
                  </Text>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12, marginTop: 4 }}>
                    {metric.label}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
                    {metric.desc}
                  </Text>
                </View>
              ))}
            </View>

            {/* Flags */}
            <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 20, marginBottom: 12 }]}>
              DETECTED PATTERNS
            </Text>
            {[
              { label: 'Stuttering', detected: speechMetrics.stutteringDetected },
              { label: 'Slurring', detected: speechMetrics.slurringDetected },
              { label: 'Pause Patterns', detected: speechMetrics.pausePatterns === 'irregular', detail: speechMetrics.pausePatterns },
            ].map((flag, i) => (
              <View key={i} style={[styles.flagRow, { backgroundColor: colors.surface, borderColor: flag.detected ? colors.warning + '40' : colors.border }]}>
                {flag.detected
                  ? <AlertCircle size={18} color={colors.warning} />
                  : <CheckCircle size={18} color={colors.success} />
                }
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14, flex: 1, marginLeft: 12 }}>
                  {flag.label}
                </Text>
                <Text style={{ color: flag.detected ? colors.warning : colors.success, fontWeight: '700', fontSize: 12 }}>
                  {flag.detected ? 'DETECTED' : 'NORMAL'}
                </Text>
              </View>
            ))}

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]} onPress={handleComplete}>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1.5 }}>
                COMPLETE & CONTINUE
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 50, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  introContent: { alignItems: 'center' },
  iconBox: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  paragraphCard: {
    width: '100%', padding: 24, borderRadius: 20, borderWidth: 1, marginTop: 24,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
    borderWidth: 1, marginTop: 16, width: '100%',
  },
  primaryBtn: {
    height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', width: '100%', marginTop: 24,
  },
  readingContent: { alignItems: 'center' },
  timerContainer: { alignItems: 'center', marginBottom: 24 },
  pulseContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  pulseOuter: { position: 'absolute', width: 100, height: 100, borderRadius: 50 },
  micCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  waveContainer: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 24, height: 40, alignItems: 'flex-end' },
  waveBar: { width: 4, borderRadius: 2 },
  stopBtn: {
    height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', width: '100%', marginTop: 24,
  },
  analyzingContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 120 },
  loadingDots: { flexDirection: 'row', gap: 8, marginTop: 24 },
  loadingDot: { width: 10, height: 10, borderRadius: 5 },
  resultContent: { alignItems: 'center' },
  scoreCard: {
    width: '100%', padding: 28, borderRadius: 24, borderWidth: 1,
    borderTopWidth: 4, alignItems: 'center',
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20, width: '100%' },
  metricCard: {
    width: '47%', padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center',
  },
  flagRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
    borderWidth: 1, marginBottom: 8, width: '100%',
  },
});

export default SpeechTestScreen;
