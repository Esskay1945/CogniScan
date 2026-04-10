import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { Line, Circle as SvgCircle } from 'react-native-svg';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Clock, Shield } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CLOCK_SIZE = Math.min(width * 0.75, 300);
const CENTER = CLOCK_SIZE / 2;
const SLOT_RADIUS = (CLOCK_SIZE / 2) - 30;
const INPUT_SIZE = 42;

// Standard MoCA clock-drawing time
const TARGET_TIME = { hour: 11, minute: 10 };

// Returns x,y for clock position (1–12)
const getPos = (num) => {
  const angle = ((num * 30) - 90) * (Math.PI / 180);
  return {
    x: CENTER + SLOT_RADIUS * Math.cos(angle),
    y: CENTER + SLOT_RADIUS * Math.sin(angle),
  };
};

const ClockTestScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const words = route.params?.words || [];

  // Phases: placement → time → results
  const [phase, setPhase] = useState('placement');
  const [inputs, setInputs] = useState(Array(12).fill(''));
  const [hourHand, setHourHand] = useState(null);
  const [minuteHand, setMinuteHand] = useState(null);
  const inputRefs = useRef([]);

  /* ──────── Number Placement ──────── */
  const handleInput = (idx, val) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned);
    if (cleaned === '' || (num >= 1 && num <= 12)) {
      const next = [...inputs];
      next[idx] = cleaned;
      setInputs(next);
      // auto-advance to next empty slot
      if (cleaned !== '' && idx < 11) {
        const nextEmpty = next.findIndex((v, i) => i > idx && v === '');
        if (nextEmpty !== -1 && inputRefs.current[nextEmpty]) {
          inputRefs.current[nextEmpty].focus();
        }
      }
    }
  };

  const filledCount = inputs.filter(v => v !== '').length;
  const allFilled = filledCount === 12;

  // Expected clock number for slot index (0 = 12 o'clock, 1 = 1 o'clock …)
  const expected = (idx) => (idx === 0 ? 12 : idx);

  const placementCorrect = () =>
    inputs.reduce((c, val, idx) => c + (parseInt(val) === expected(idx) ? 1 : 0), 0);

  /* ──────── Time-Setting Scoring ──────── */
  const hourCorrect = hourHand === TARGET_TIME.hour;
  // 10 minutes → minute hand points at position 2
  const minuteCorrect = minuteHand === 2;

  const totalScore = () => {
    const pScore = Math.round((placementCorrect() / 12) * 50);
    const hScore = hourCorrect ? 25 : (hourHand != null && Math.abs(hourHand - TARGET_TIME.hour) <= 1 ? 12 : 0);
    const mScore = minuteCorrect ? 25 : ((minuteHand === 1 || minuteHand === 3) ? 12 : 0);
    return pScore + hScore + mScore;
  };

  /* ──────── Clock Face Renderer ──────── */
  const renderClockFace = () => {
    const showHands = phase !== 'placement';
    return (
      <View style={styles.clockWrap}>
        <View style={[styles.clockFace, { borderColor: colors.border, backgroundColor: colors.surface }]}>

          {/* SVG hands overlay */}
          {showHands && (hourHand != null || minuteHand != null) && (
            <Svg width={CLOCK_SIZE} height={CLOCK_SIZE} style={StyleSheet.absoluteFill}>
              {hourHand != null && (() => {
                const a = ((hourHand * 30) - 90) * (Math.PI / 180);
                const len = SLOT_RADIUS * 0.5;
                return (
                  <Line
                    x1={CENTER} y1={CENTER}
                    x2={CENTER + len * Math.cos(a)} y2={CENTER + len * Math.sin(a)}
                    stroke={colors.primary} strokeWidth={5} strokeLinecap="round"
                  />
                );
              })()}
              {minuteHand != null && (() => {
                const a = ((minuteHand * 30) - 90) * (Math.PI / 180);
                const len = SLOT_RADIUS * 0.82;
                return (
                  <Line
                    x1={CENTER} y1={CENTER}
                    x2={CENTER + len * Math.cos(a)} y2={CENTER + len * Math.sin(a)}
                    stroke={colors.accent} strokeWidth={3} strokeLinecap="round"
                  />
                );
              })()}
              <SvgCircle cx={CENTER} cy={CENTER} r={5} fill={colors.text} />
            </Svg>
          )}

          {/* Fallback center dot when no hands shown */}
          {!showHands && (
            <View style={[styles.dot, { left: CENTER - 4, top: CENTER - 4, backgroundColor: colors.border }]} />
          )}

          {/* 12 slots around the face */}
          {Array.from({ length: 12 }, (_, i) => {
            const num = i === 0 ? 12 : i;
            const pos = getPos(num);

            if (phase === 'placement') {
              return (
                <TextInput
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  style={[styles.slotInput, {
                    left: pos.x - INPUT_SIZE / 2,
                    top: pos.y - INPUT_SIZE / 2,
                    backgroundColor: inputs[i] ? colors.surfaceElevated : colors.background,
                    borderColor: inputs[i] ? colors.primary : colors.border,
                    color: colors.text,
                  }]}
                  value={inputs[i]}
                  onChangeText={(v) => handleInput(i, v)}
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                  placeholder="?"
                  placeholderTextColor={colors.textDisabled}
                />
              );
            }

            // time / results → show placed numbers
            const isRight = parseInt(inputs[i]) === expected(i);
            return (
              <View
                key={i}
                style={[styles.placedSlot, {
                  left: pos.x - INPUT_SIZE / 2,
                  top: pos.y - INPUT_SIZE / 2,
                  backgroundColor: phase === 'results'
                    ? (isRight ? colors.success + '20' : colors.error + '20')
                    : colors.surfaceElevated,
                  borderColor: phase === 'results'
                    ? (isRight ? colors.success : colors.error)
                    : colors.primary,
                }]}
              >
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{inputs[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  /* ──────── UI ──────── */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft color={colors.text} size={28} />
          </TouchableOpacity>
          <Text style={[Typography.h2, { color: colors.text, flex: 1, textAlign: 'center' }]}>
            Spatial Diagnostic
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Instruction Card */}
        <View style={[styles.instCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[Typography.caption, { color: colors.primary }]}>
            {phase === 'placement'
              ? 'STEP 1 — NUMBER PLACEMENT'
              : phase === 'time'
              ? 'STEP 2 — SET THE TIME'
              : 'ANALYSIS COMPLETE'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            {phase === 'placement'
              ? 'Type the correct number (1–12) at each clock position.'
              : phase === 'time'
              ? `Place the clock hands to show ${TARGET_TIME.hour}:${TARGET_TIME.minute.toString().padStart(2, '0')}.`
              : 'Review your spatial-cognition results below.'}
          </Text>
        </View>

        {/* Clock */}
        {renderClockFace()}

        {/* ─── Phase: Placement ─── */}
        {phase === 'placement' && (
          <View style={styles.section}>
            <Text style={[Typography.caption, { color: Colors.dark.textDisabled, textAlign: 'center' }]}>
              {filledCount}/12 POSITIONS FILLED
            </Text>
            {allFilled && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => setPhase('time')}
              >
                <Text style={styles.btnText}>CONTINUE → SET TIME</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── Phase: Time Setting ─── */}
        {phase === 'time' && (
          <View style={styles.section}>
            {/* Target time card */}
            <View style={[styles.timeCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <Clock size={24} color={colors.primary} />
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 28, marginLeft: 12 }}>
                {TARGET_TIME.hour}:{TARGET_TIME.minute.toString().padStart(2, '0')}
              </Text>
            </View>

            {/* Hour selector */}
            <Text style={[Typography.caption, { color: Colors.dark.textDisabled, textAlign: 'center', marginTop: 24, marginBottom: 10 }]}>
              HOUR HAND POSITION (shorter hand)
            </Text>
            <View style={styles.selGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <TouchableOpacity
                  key={`h${n}`}
                  style={[styles.selBtn, {
                    backgroundColor: hourHand === n ? colors.primary : colors.surface,
                    borderColor: hourHand === n ? colors.primary : colors.border,
                  }]}
                  onPress={() => setHourHand(n)}
                >
                  <Text style={{ color: hourHand === n ? '#FFF' : colors.text, fontWeight: '700', fontSize: 15 }}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Minute selector */}
            <Text style={[Typography.caption, { color: Colors.dark.textDisabled, textAlign: 'center', marginTop: 24, marginBottom: 10 }]}>
              MINUTE HAND POSITION (longer hand)
            </Text>
            <View style={styles.selGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <TouchableOpacity
                  key={`m${n}`}
                  style={[styles.selBtn, {
                    backgroundColor: minuteHand === n ? colors.accent : colors.surface,
                    borderColor: minuteHand === n ? colors.accent : colors.border,
                  }]}
                  onPress={() => setMinuteHand(n)}
                >
                  <Text style={{ color: minuteHand === n ? '#FFF' : colors.text, fontWeight: '700', fontSize: 15 }}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {hourHand != null && minuteHand != null && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
                onPress={() => setPhase('results')}
              >
                <Text style={styles.btnText}>ANALYZE CLOCK</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── Phase: Results ─── */}
        {phase === 'results' && (
          <View style={styles.section}>
            <View style={styles.resCenter}>
              <Shield color={colors.success} size={48} />
              <Text style={[Typography.h1, { color: colors.text, marginTop: 12 }]}>
                {totalScore()}%
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
                Spatial Cognition Score
              </Text>
            </View>

            <View style={[styles.breakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.breakRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Number Placement</Text>
                <Text style={{ color: placementCorrect() >= 10 ? colors.success : colors.error, fontWeight: '700' }}>
                  {placementCorrect()}/12 correct
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.breakRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Hour Hand</Text>
                <Text style={{ color: hourCorrect ? colors.success : colors.error, fontWeight: '700' }}>
                  {hourCorrect ? '✓ Correct' : '✗ Incorrect'}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.breakRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Minute Hand</Text>
                <Text style={{ color: minuteCorrect ? colors.success : colors.error, fontWeight: '700' }}>
                  {minuteCorrect ? '✓ Correct' : '✗ Incorrect'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
              onPress={() => navigation.navigate('TestHub', {
                words,
                clockScore: totalScore(),
                completedTest: 'clock',
              })}
            >
              <Text style={styles.btnText}>UPLOAD DATA</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ──────── Styles ──────── */
const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 0 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  instCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },

  clockWrap: { alignItems: 'center' },
  clockFace: {
    width: CLOCK_SIZE, height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2, borderWidth: 2,
    position: 'relative',
  },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },

  slotInput: {
    position: 'absolute', width: INPUT_SIZE, height: INPUT_SIZE,
    borderRadius: INPUT_SIZE / 2, borderWidth: 1.5,
    fontWeight: '800', fontSize: 15, padding: 0,
  },
  placedSlot: {
    position: 'absolute', width: INPUT_SIZE, height: INPUT_SIZE,
    borderRadius: INPUT_SIZE / 2, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },

  section: { marginTop: 24 },
  actionBtn: {
    height: 56, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
  },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1.5, fontSize: 14 },

  timeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 20, borderRadius: 16, borderLeftWidth: 4,
  },

  selGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  selBtn: {
    width: 44, height: 44, borderRadius: 12, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },

  resCenter: { alignItems: 'center', marginBottom: 24 },
  breakCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  breakRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
  },
  divider: { height: 1 },
});

export default ClockTestScreen;
