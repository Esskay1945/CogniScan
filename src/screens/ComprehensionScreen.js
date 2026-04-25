import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Check, ChevronRight, Square, Circle, Triangle } from 'lucide-react-native';

const STEPS = [
    { instruction: "Tap the Blue Circle", target: 'blue_circle' },
    { instruction: "Then tap the Red Square", target: 'red_square' },
    { instruction: "Finally, tap the Green Triangle", target: 'green_triangle' },
];

const ComprehensionScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;

  const [currentStep, setCurrentStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const handlePress = (id) => {
    if (id === STEPS[currentStep].target) {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            const score = Math.max(0, 100 - (mistakes * 20));
            saveAssessmentScore('comprehension', score);
            setComplete(true);
        }
    } else {
        setMistakes(m => m + 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {!complete ? (
          <>
            <View style={[styles.instructionBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
                    {STEPS[currentStep].instruction}
                </Text>
            </View>

            <View style={styles.shapeRow}>
                <TouchableOpacity onPress={() => handlePress('red_square')} style={styles.shape}>
                    <Square size={64} color="#FF3D00" fill="#FF3D00" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePress('blue_circle')} style={styles.shape}>
                    <Circle size={64} color="#0066FF" fill="#0066FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePress('green_triangle')} style={styles.shape}>
                    <Triangle size={64} color="#00E676" fill="#00E676" />
                </TouchableOpacity>
            </View>

            <Text style={{ color: colors.textSecondary, marginTop: 40 }}>Step {currentStep + 1} of {STEPS.length}</Text>
          </>
        ) : (
          <View style={styles.center}>
            <Check size={80} color={colors.success} />
            <Text style={[Typography.h1, { color: colors.text, marginTop: 24 }]}>COMPREHENSION DONE</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'comprehension' })}>
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
  content: { flex: 1, padding: 32, paddingTop: 100, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructionBox: { width: '100%', padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 60 },
  shapeRow: { flexDirection: 'row', gap: 32, flexWrap: 'wrap', justifyContent: 'center' },
  shape: { padding: 10 },
  btn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 48 },
});

export default ComprehensionScreen;
