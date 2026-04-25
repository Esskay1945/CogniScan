import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { Line, Circle as SvgCircle } from 'react-native-svg';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Clock, Shield, RotateCcw, Check } from 'lucide-react-native';

import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');
const CLOCK_SIZE = Math.min(width * 0.75, 300);
const CENTER = CLOCK_SIZE / 2;
const SLOT_RADIUS = (CLOCK_SIZE / 2) - 30;
const TAP_SIZE = 46;

// Generate a completely random time for the test
const generateRandomTime = () => {
  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  return { hour, minute };
};

// Shuffle an array using Fisher-Yates
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Returns x,y for clock position (1-12)
const getPos = (num) => {
  const angle = ((num * 30) - 90) * (Math.PI / 180);
  return {
    x: CENTER + SLOT_RADIUS * Math.cos(angle),
    y: CENTER + SLOT_RADIUS * Math.sin(angle),
  };
};

// Convert minutes to clock position (0=12, 5=1, 10=2, etc.)
const minuteToPosition = (minute) => {
  const pos = minute / 5;
  return pos === 0 ? 12 : pos;
};

const ClockTestScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const words = route.params?.words || [];

  // Random target time - memoized so it doesn't change on re-render
  const TARGET_TIME = useMemo(() => generateRandomTime(), []);

  // Randomized number order — numbers appear in shuffled order instead of 1-12
  const numberOrder = useMemo(() => shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), []);

  // Phases: placement → time → results
  const [phase, setPhase] = useState('placement');
  
  // Placement: user taps clock positions to place numbers in random order
  const [placedNumbers, setPlacedNumbers] = useState({}); // { slotIndex: number }
  const [placementIndex, setPlacementIndex] = useState(0); // Index into numberOrder
  
  // Time setting: user taps clock numbers for hour and minute hand
  const [hourHand, setHourHand] = useState(null);
  const [minuteHand, setMinuteHand] = useState(null);
  const [settingHand, setSettingHand] = useState('hour'); // 'hour' or 'minute'

  // The current number to place (from the shuffled order)
  const currentNumber = placementIndex < 12 ? numberOrder[placementIndex] : null;

  /* ──── Number Placement (Tap-on-Clock) ──── */
  const handleSlotTap = (slotIndex) => {
    if (currentNumber == null) return;
    if (placedNumbers[slotIndex] != null) return; // Already filled

    const newPlaced = { ...placedNumbers, [slotIndex]: currentNumber };
    setPlacedNumbers(newPlaced);
    setPlacementIndex(placementIndex + 1);
  };

  const resetPlacement = () => {
    setPlacedNumbers({});
    setPlacementIndex(0);
  };

  const filledCount = Object.keys(placedNumbers).length;
  const allFilled = filledCount === 12;

  // Expected clock number for slot index (0 = 12 o'clock, 1 = 1 o'clock ...)
  const expected = (idx) => (idx === 0 ? 12 : idx);

  const placementCorrect = () => {
    let correct = 0;
    for (let i = 0; i < 12; i++) {
      if (placedNumbers[i] === expected(i)) correct++;
    }
    return correct;
  };

  /* ──── Time-Setting (Tap on clock numbers) ──── */
  const handleTimeSlotTap = (slotIndex) => {
    const numberAtSlot = placedNumbers[slotIndex];
    if (numberAtSlot == null) return;

    if (settingHand === 'hour') {
      setHourHand(numberAtSlot);
      setSettingHand('minute');
    } else {
      setMinuteHand(numberAtSlot);
    }
  };

  const hourCorrect = hourHand === TARGET_TIME.hour;
  const minutePosition = minuteToPosition(TARGET_TIME.minute);
  const minuteCorrect = minuteHand === minutePosition;

  const totalScore = () => {
    const pScore = Math.round((placementCorrect() / 12) * 50);
    const hScore = hourCorrect ? 25 : (hourHand != null && Math.abs(hourHand - TARGET_TIME.hour) <= 1 ? 12 : 0);
    const mScore = minuteCorrect ? 25 : (minuteHand != null && Math.abs(minuteHand - minutePosition) <= 1 ? 12 : 0);
    return pScore + hScore + mScore;
  };

  /* ──── Clock Face Renderer ──── */
  const renderClockFace = () => {
    const showHands = phase === 'time' || phase === 'results';
    const isTimeSetting = phase === 'time';

    return (
      <View style={styles.clockWrap}>
        <View style={[styles.clockFace, { borderColor: colors.border, backgroundColor: colors.surface }]}>

          {/* SVG hands overlay */}
          {showHands && (hourHand != null || minuteHand != null) && (
            <Svg width={CLOCK_SIZE} height={CLOCK_SIZE} style={StyleSheet.absoluteFill}>
              {hourHand != null && (() => {
                // Find the slot where this number was placed
                const slotIdx = Object.keys(placedNumbers).find(k => placedNumbers[k] === hourHand);
                if (slotIdx == null) return null;
                const pos = getPos(slotIdx === '0' ? 12 : parseInt(slotIdx));
                const a = Math.atan2(pos.y - CENTER, pos.x - CENTER);
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
                const slotIdx = Object.keys(placedNumbers).find(k => placedNumbers[k] === minuteHand);
                if (slotIdx == null) return null;
                const pos = getPos(slotIdx === '0' ? 12 : parseInt(slotIdx));
                const a = Math.atan2(pos.y - CENTER, pos.x - CENTER);
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

          {/* Center dot when no hands */}
          {!showHands && (
            <View style={[styles.dot, { left: CENTER - 4, top: CENTER - 4, backgroundColor: colors.border }]} />
          )}

          {/* 12 tappable slots */}
          {Array.from({ length: 12 }, (_, i) => {
            const num = i === 0 ? 12 : i;
            const pos = getPos(num);
            const placedNum = placedNumbers[i];
            const isFilled = placedNum != null;

            if (phase === 'placement') {
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.tapSlot, {
                    left: pos.x - TAP_SIZE / 2,
                    top: pos.y - TAP_SIZE / 2,
                    backgroundColor: isFilled ? colors.surfaceElevated : colors.background,
                    borderColor: isFilled ? colors.primary : colors.border,
                  }]}
                  onPress={() => handleSlotTap(i)}
                  disabled={isFilled}
                  activeOpacity={0.7}
                >
                  {isFilled ? (
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{placedNum}</Text>
                  ) : (
                    <Text style={{ color: colors.textDisabled, fontWeight: '600', fontSize: 12 }}>?</Text>
                  )}
                </TouchableOpacity>
              );
            }

            if (phase === 'time') {
              // Tappable numbers for setting hands
              const isHourSelected = hourHand === placedNum;
              const isMinuteSelected = minuteHand === placedNum;
              const isSelected = isHourSelected || isMinuteSelected;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.tapSlot, {
                    left: pos.x - TAP_SIZE / 2,
                    top: pos.y - TAP_SIZE / 2,
                    backgroundColor: isHourSelected ? colors.primary + '30' :
                      isMinuteSelected ? colors.accent + '30' : colors.surfaceElevated,
                    borderColor: isHourSelected ? colors.primary :
                      isMinuteSelected ? colors.accent : colors.border,
                    borderWidth: isSelected ? 2.5 : 1.5,
                  }]}
                  onPress={() => handleTimeSlotTap(i)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{placedNum}</Text>
                </TouchableOpacity>
              );
            }

            // Results phase
            const isRight = placedNum === expected(i);
            return (
              <View
                key={i}
                style={[styles.tapSlot, {
                  left: pos.x - TAP_SIZE / 2,
                  top: pos.y - TAP_SIZE / 2,
                  backgroundColor: isRight ? colors.success + '20' : colors.error + '20',
                  borderColor: isRight ? colors.success : colors.error,
                }]}
              >
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{placedNum}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  /* ──── UI ──── */
  const onFinish = () => {
    const score = totalScore();
    saveAssessmentScore('clock', score);
    navigation.navigate('TestHub', {
      ...route.params,
      clockScore: score,
      completedTest: 'clock',
    });
  };
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
            Clock Drawing
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Instruction Card */}
        <View style={[styles.instCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[Typography.caption, { color: colors.primary }]}>
            {phase === 'placement'
              ? 'STEP 1 — TAP TO PLACE NUMBERS'
              : phase === 'time'
              ? 'STEP 2 — TAP TO SET THE TIME'
              : 'ANALYSIS COMPLETE'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            {phase === 'placement'
              ? `Tap where each number belongs on the clock. Currently placing: ${currentNumber != null ? currentNumber : 'Done!'}`
              : phase === 'time'
              ? `Tap a number on the clock for the ${settingHand} hand to set ${TARGET_TIME.hour}:${TARGET_TIME.minute.toString().padStart(2, '0')}.`
              : 'Review your spatial-cognition results below.'}
          </Text>
        </View>

        {/* Clock */}
        {renderClockFace()}

        {/* ─── Phase: Placement ─── */}
        {phase === 'placement' && (
          <View style={styles.section}>
            {/* Next number indicator */}
            {currentNumber != null && (
              <View style={[styles.nextNumCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 24, marginRight: 12 }}>{currentNumber}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>
                  Tap the position where this number belongs on the clock
                </Text>
              </View>
            )}

            <Text style={[Typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: 8 }]}>
              {filledCount}/12 POSITIONS FILLED
            </Text>

            {/* Reset button */}
            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: colors.border }]}
              onPress={resetPlacement}
            >
              <RotateCcw size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 12, marginLeft: 8 }}>RESET</Text>
            </TouchableOpacity>

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

            {/* Instructions */}
            <View style={[styles.handIndicator, { backgroundColor: colors.surfaceElevated }]}>
              <View style={[styles.handDot, { backgroundColor: settingHand === 'hour' ? colors.primary : colors.accent }]} />
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginLeft: 10, flex: 1 }}>
                {settingHand === 'hour' ? 'Tap the hour position' : 'Tap the minute position'}
              </Text>
              <Text style={{ color: settingHand === 'hour' ? colors.primary : colors.accent, fontWeight: '800', fontSize: 12 }}>
                {settingHand === 'hour' ? 'HOUR HAND (SHORT)' : 'MINUTE HAND (LONG)'}
              </Text>
            </View>

            {/* Status */}
            <View style={styles.handStatus}>
              <View style={[styles.handStatusItem, { backgroundColor: colors.surface, borderColor: hourHand != null ? colors.success : colors.border }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700' }}>HOUR</Text>
                <Text style={{ color: hourHand != null ? colors.success : colors.textDisabled, fontWeight: '800', fontSize: 18, marginTop: 4 }}>
                  {hourHand != null ? hourHand : '—'}
                </Text>
              </View>
              <View style={[styles.handStatusItem, { backgroundColor: colors.surface, borderColor: minuteHand != null ? colors.success : colors.border }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700' }}>MINUTE</Text>
                <Text style={{ color: minuteHand != null ? colors.success : colors.textDisabled, fontWeight: '800', fontSize: 18, marginTop: 4 }}>
                  {minuteHand != null ? minuteHand : '—'}
                </Text>
              </View>
            </View>

            {/* Reset hands */}
            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: colors.border }]}
              onPress={() => { setHourHand(null); setMinuteHand(null); setSettingHand('hour'); }}
            >
              <RotateCcw size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 12, marginLeft: 8 }}>RESET HANDS</Text>
            </TouchableOpacity>

            {hourHand != null && minuteHand != null && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
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
              <Shield color={totalScore() >= 60 ? colors.success : colors.warning} size={48} />
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
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Hour Hand (Target: {TARGET_TIME.hour})
                </Text>
                <Text style={{ color: hourCorrect ? colors.success : colors.error, fontWeight: '700' }}>
                  {hourCorrect ? '✓ Correct' : `✗ You chose ${hourHand}`}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.breakRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Minute Hand (Target: {TARGET_TIME.minute})
                </Text>
                <Text style={{ color: minuteCorrect ? colors.success : colors.error, fontWeight: '700' }}>
                  {minuteCorrect ? '✓ Correct' : `✗ You chose ${minuteHand}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
              onPress={onFinish}
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

/* ──── Styles ──── */
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

  tapSlot: {
    position: 'absolute', width: TAP_SIZE, height: TAP_SIZE,
    borderRadius: TAP_SIZE / 2, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },

  section: { marginTop: 24 },
  nextNumCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 14, borderLeftWidth: 4, marginBottom: 12,
  },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 12,
  },
  actionBtn: {
    height: 56, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
  },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1.5, fontSize: 14 },

  timeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 20, borderRadius: 16, borderLeftWidth: 4,
  },
  handIndicator: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginTop: 16,
  },
  handDot: { width: 12, height: 12, borderRadius: 6 },
  handStatus: { flexDirection: 'row', gap: 12, marginTop: 16 },
  handStatusItem: {
    flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center',
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