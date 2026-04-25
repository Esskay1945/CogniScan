import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { MessageSquare, Check, ChevronRight, Mic } from 'lucide-react-native';

const SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "A small blue bird built its nest in the pine tree.",
    "She sells seashells by the seashore in the morning.",
    "The library is located next to the town hall garden.",
];

const SentenceRepetitionScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const isMandatoryFlow = route.params?.isMandatoryFlow;
  
  const [phase, setPhase] = useState('read'); // read, repeat, result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);

  const handleNext = () => {
    // Scoring by exact words match (very basic)
    const target = SENTENCES[currentIndex].toUpperCase().replace(/[.,]/g, '');
    const user = userInput.toUpperCase().replace(/[.,]/g, '').trim();
    
    // Calculate Jaccard similarity or simple word count
    const targetWords = target.split(' ');
    const userWords = user.split(' ');
    let matches = 0;
    targetWords.forEach(w => { if (userWords.includes(w)) matches++; });
    
    const roundScore = (matches / targetWords.length) * 100;
    const totalScore = score + roundScore;
    setScore(totalScore);
    setUserInput('');

    if (currentIndex < SENTENCES.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setPhase('read');
    } else {
        const finalScore = Math.round(totalScore / SENTENCES.length);
        saveAssessmentScore('sentenceRep', finalScore);
        setPhase('result');
    }
  };

  if (phase === 'read') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
           <Text style={[Typography.caption, { color: colors.primary }]}>READ AND LISTEN</Text>
           <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
               <Text style={{ color: colors.text, fontSize: 20, lineHeight: 30, textAlign: 'center' }}>"{SENTENCES[currentIndex]}"</Text>
           </View>
           <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('repeat')}>
              <Text style={{ color: '#FFF', fontWeight: '900' }}>I'M READY TO REPEAT</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'repeat') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
           <Text style={[Typography.caption, { color: colors.accent }]}>REPEAT THE SENTENCE</Text>
           <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>Type the sentence exactly as you read it.</Text>
           
           <TextInput
             style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
             multiline
             placeholder="Type here..."
             placeholderTextColor={colors.textDisabled}
             value={userInput}
             onChangeText={setUserInput}
             autoFocus
           />
           
           <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accent }]} onPress={handleNext}>
               <Text style={{ color: colors.background, fontWeight: '900' }}>SUBMIT</Text>
               <ChevronRight size={20} color={colors.background} />
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Mic size={64} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 20 }]}>TEST COMPLETE</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'sentenceRep' })}>
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
  card: { padding: 32, borderRadius: 24, borderWidth: 1, marginBottom: 40, width: '100%', minHeight: 180, justifyContent: 'center' },
  input: { width: '100%', minHeight: 120, borderRadius: 20, borderWidth: 1, padding: 20, marginTop: 24, fontSize: 16, textAlignVertical: 'top' },
  btn: { width: '100%', height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
});

export default SentenceRepetitionScreen;
