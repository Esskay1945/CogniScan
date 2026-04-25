import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { BookOpen, Check, ChevronRight } from 'lucide-react-native';

const STORIES = [
  { text: "Last Tuesday, a small blue bird built a nest in a tall pine tree. A young girl named Maya watched from her window. She brought some bread crumbs every morning to help the bird.", keywords: ['TUESDAY', 'BLUE', 'BIRD', 'NEST', 'PINE', 'MAYA', 'WINDOW', 'BREAD', 'CRUMBS', 'MORNING'] },
  { text: "On a rainy Saturday, old Mr. Chen walked to the library with his red umbrella. He returned three books about astronomy and borrowed two new ones about ancient Egypt. The librarian, Rosa, stamped each book carefully.", keywords: ['SATURDAY', 'CHEN', 'LIBRARY', 'RED', 'UMBRELLA', 'ASTRONOMY', 'EGYPT', 'ROSA', 'STAMPED', 'BOOKS'] },
  { text: "Every Wednesday, Dr. Patel takes the silver train from Brighton to London. She carries a leather briefcase and always sits by the window. At the station, she buys a coffee and a blueberry muffin from the bakery.", keywords: ['WEDNESDAY', 'PATEL', 'SILVER', 'TRAIN', 'BRIGHTON', 'LONDON', 'LEATHER', 'COFFEE', 'BLUEBERRY', 'MUFFIN'] },
  { text: "The golden retriever named Biscuit escaped from the garden on a cold December evening. He ran past the old church and crossed the wooden bridge over the stream. A kind farmer named George found him sleeping near the barn.", keywords: ['GOLDEN', 'BISCUIT', 'GARDEN', 'DECEMBER', 'CHURCH', 'WOODEN', 'BRIDGE', 'STREAM', 'GEORGE', 'BARN'] },
  { text: "During the summer festival in August, young Anika painted a large butterfly mural on the school wall. She used purple and orange colors. Her art teacher, Mr. Singh, displayed a photograph of it in the town newspaper.", keywords: ['SUMMER', 'AUGUST', 'ANIKA', 'BUTTERFLY', 'MURAL', 'SCHOOL', 'PURPLE', 'ORANGE', 'SINGH', 'NEWSPAPER'] },
  { text: "Last Thursday morning, Captain Reyes sailed his white boat from the harbor to the small island. He carried supplies including fresh water, canned soup, and warm blankets for the lighthouse keeper named Elsa.", keywords: ['THURSDAY', 'REYES', 'WHITE', 'BOAT', 'HARBOR', 'ISLAND', 'WATER', 'SOUP', 'BLANKETS', 'ELSA'] },
];

const StoryRecallScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveAssessmentScore } = useData();
  const [phase, setPhase] = useState('read'); // read, recall, result
  const [userText, setUserText] = useState('');
  
  // Randomly select a story once per session
  const [selectedStory] = useState(() => STORIES[Math.floor(Math.random() * STORIES.length)]);
  const STORY = selectedStory.text;
  const KEY_WORDS = selectedStory.keywords;

  const handleRecall = () => {
    // Basic keyword checking for scoring
    const upperText = userText.toUpperCase();
    let matches = 0;
    KEY_WORDS.forEach(word => {
        if (upperText.includes(word)) matches++;
    });
    
    const score = Math.round((matches / KEY_WORDS.length) * 100);
    saveAssessmentScore('storyRecall', score);
    setPhase('result');
  };

  if (phase === 'read') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.scroll}>
           <Text style={[Typography.caption, { color: colors.primary }]}>READ AND REMEMBER</Text>
           <View style={[styles.storyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
               <Text style={{ color: colors.text, fontSize: 18, lineHeight: 28 }}>{STORY}</Text>
           </View>
           <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setPhase('recall')}>
              <Text style={{ color: '#FFF', fontWeight: '900' }}>I'M READY</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'recall') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.scroll}>
           <Text style={[Typography.caption, { color: colors.accent }]}>RECALL THE STORY</Text>
           <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Type as much of the story as you can remember. Include all the details.</Text>
           <TextInput
             style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
             multiline
             placeholder="Start typing here..."
             placeholderTextColor={colors.textDisabled}
             value={userText}
             onChangeText={setUserText}
             autoFocus
           />
           <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accent }]} onPress={handleRecall}>
              <Text style={{ color: colors.background, fontWeight: '900' }}>SUBMIT RECALL</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Check size={64} color={colors.success} />
        <Text style={[Typography.h1, { color: colors.text, marginTop: 20 }]}>STORY RECALL DONE</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => navigation.navigate('TestHub', { ...route.params, completedTest: 'storyRecall' })}>
          <Text style={{ color: '#FFF', fontWeight: '900' }}>CONTINUE</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 32, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  storyCard: { padding: 24, borderRadius: 20, borderWidth: 1, marginTop: 24 },
  input: { width: '100%', height: 200, borderRadius: 20, borderWidth: 1, padding: 20, marginTop: 24, textAlignVertical: 'top', fontSize: 16 },
  btn: { width: '100%', height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
});

export default StoryRecallScreen;
