import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Check, ChevronRight, Brain, Zap, CloudRain, Wind, Activity, AlertCircle, BookOpen, HelpCircle } from 'lucide-react-native';

const CONDITIONS = [
  { id: 'alzheimers', label: "Alzheimer's / Dementia", icon: Brain, color: '#0066FF', domains: ['memory', 'language', 'visuospatial'] },
  { id: 'adhd', label: 'ADHD', icon: Zap, color: '#FF3D00', domains: ['attention', 'executive'] },
  { id: 'depression', label: 'Depression', icon: CloudRain, color: '#9B7BFF', domains: ['memory', 'attention', 'executive'] },
  { id: 'anxiety', label: 'Anxiety', icon: Wind, color: '#FFD600', domains: ['attention', 'executive'] },
  { id: 'parkinsons', label: "Parkinson's Disease", icon: Activity, color: '#00E676', domains: ['motor', 'executive', 'visuospatial'] },
  { id: 'stroke', label: 'Stroke / Brain Injury', icon: AlertCircle, color: '#FF6B9D', domains: ['memory', 'language', 'motor', 'attention'] },
  { id: 'memory_issues', label: 'Memory Issues', icon: HelpCircle, color: '#00F0FF', domains: ['memory'] },
  { id: 'learning', label: 'Learning Disability', icon: BookOpen, color: '#FF8A65', domains: ['language', 'attention', 'executive'] },
];

const ConditionSelectScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveSelectedConditions } = useData();
  const [selected, setSelected] = useState([]);

  const toggleCondition = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    const selectedConditions = CONDITIONS.filter(c => selected.includes(c.id));
    saveSelectedConditions(selectedConditions);
    navigation.navigate('Questionnaire', { conditions: selectedConditions });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={[styles.stepBadge, { backgroundColor: colors.accent + '15' }]}>
          <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>STEP 2 OF 3 · HISTORY FLOW</Text>
        </View>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>SELECT{'\n'}CONDITIONS</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 24 }}>
          Select all conditions that apply to you. This will customize your cognitive evaluation with targeted questions.
        </Text>

        {/* Condition Cards */}
        {CONDITIONS.map((cond) => {
          const isSelected = selected.includes(cond.id);
          const Icon = cond.icon;
          return (
            <TouchableOpacity
              key={cond.id}
              style={[styles.condCard, {
                backgroundColor: isSelected ? cond.color + '10' : colors.surface,
                borderColor: isSelected ? cond.color : colors.border,
                borderWidth: isSelected ? 2 : 1,
              }]}
              onPress={() => toggleCondition(cond.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.condIcon, { backgroundColor: cond.color + '18' }]}>
                <Icon size={22} color={cond.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{cond.label}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
                  Domains: {cond.domains.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                </Text>
              </View>
              <View style={[styles.checkbox, {
                backgroundColor: isSelected ? cond.color : 'transparent',
                borderColor: isSelected ? cond.color : colors.textDisabled,
              }]}>
                {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: selected.length > 0 ? colors.primary : colors.surfaceElevated }]}
          onPress={handleContinue}
          disabled={selected.length === 0}
          activeOpacity={0.85}
        >
          <Text style={{ color: selected.length > 0 ? '#FFF' : colors.textDisabled, fontWeight: '900', fontSize: 15, letterSpacing: 1.5, marginRight: 8 }}>
            {selected.length > 0 ? `CONTINUE (${selected.length} SELECTED)` : 'SELECT AT LEAST 1'}
          </Text>
          {selected.length > 0 && <ChevronRight size={18} color="#FFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  stepBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  condCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10 },
  condIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 36 },
  continueBtn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default ConditionSelectScreen;
