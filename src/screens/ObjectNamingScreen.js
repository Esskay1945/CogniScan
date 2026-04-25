import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { MessageSquare, Check, ChevronRight, Apple, Watch, Camera, Car, Bike, Umbrella, Key, Book } from 'lucide-react-native';

const OBJECTS = [
    { id: 1, name: 'APPLE', Icon: Apple },
    { id: 2, name: 'WATCH', Icon: Watch },
    { id: 3, name: 'CAMERA', Icon: Camera },
    { id: 4, name: 'CAR', Icon: Car },
    { id: 5, name: 'KEY', Icon: Key },
    { id: 6, name: 'BOOK', Icon: Book },
];

const ObjectNamingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const [phase, setPhase] = useState('naming'); // naming, result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);

  const handleNext = () => {
    const isCorrect = userInput.toUpperCase().trim() === OBJECTS[currentIndex].name;
    const newScore = score + (isCorrect ? 1 : 0);
    setScore(newScore);
    setUserInput('');

    if (currentIndex < OBJECTS.length - 1) {
        setCurrentIndex(currentIndex + 1);
    } else {
        saveAssessmentScore('objectNaming', Math.round((newScore / OBJECTS.length) * 100));
        setPhase('result');
    }
  };

  if (phase === 'naming') {
    const CurrentIcon = OBJECTS[currentIndex].Icon;
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
           <Text style={[Typography.caption, { color: colors.primary }]}>WHAT IS THIS OBJECT?</Text>
           <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
               <CurrentIcon size={120} color={colors.primary} />
           </View>
           
           <TextInput
             style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
             placeholder="Type the object name..."
             placeholderTextColor={colors.textDisabled}
             value={userInput}
             onChangeText={setUserInput}
             autoFocus
             onSubmitEditing={handleNext}
             autoCapitalize="characters"
           />
           
           <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
               <Text style={{ color: '#FFF', fontWeight: '900' }}>NEXT</Text>
               <ChevronRight size={20} color="#FFF" />
           </TouchableOpacity>

           <Text style={{ color: colors.textSecondary, marginTop: 24 }}>{currentIndex + 1} / {OBJECTS.length}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <MessageSquare size={64} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 20 }]}>LANGUAGE TEST DONE</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'objectNaming' })}>
          <Text style={{ color: '#FFF', fontWeight: '900' }}>CONTINUE</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 32, paddingTop: 80, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  card: { width: 240, height: 240, borderRadius: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  input: { width: '100%', height: 64, borderRadius: 20, borderWidth: 1, paddingHorizontal: 24, fontSize: 18, textAlign: 'center' },
  nextBtn: { width: '100%', height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  btn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
});

export default ObjectNamingScreen;
