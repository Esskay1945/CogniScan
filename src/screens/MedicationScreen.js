import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, Pill, Plus, Check, Clock, AlertTriangle, TrendingUp, Info } from 'lucide-react-native';

const MedicationScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, addMedication, logMedicationTaken, logMedicationMissed } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('08:00');

  const meds = data.medication?.schedules || [];
  const adherence = data.medication?.adherenceScore ?? 100;
  const history = data.medication?.history || [];

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMedication({ name: newName.trim(), time: newTime, dosage: '1 tablet' });
    setNewName(''); setShowAdd(false);
  };

  const getAdherenceColor = () => adherence >= 80 ? colors.success : adherence >= 60 ? colors.warning : colors.error;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>MEDICATION{'\n'}TRACKER</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Stay on track with your routine</Text>
          </View>
          <Pill size={24} color={colors.primary} />
        </View>

        {/* Adherence Score */}
        <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: getAdherenceColor() }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>ADHERENCE SCORE</Text>
              <Text style={{ color: getAdherenceColor(), fontSize: 42, fontWeight: '900' }}>{adherence}%</Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: getAdherenceColor() + '15' }]}>
              <TrendingUp size={16} color={getAdherenceColor()} />
              <Text style={{ color: getAdherenceColor(), fontWeight: '800', fontSize: 11, marginLeft: 6 }}>
                {data.medication?.missedCount || 0} missed
              </Text>
            </View>
          </View>
          <View style={[styles.bar, { backgroundColor: colors.border, marginTop: 16 }]}>
            <View style={[styles.barFill, { width: `${adherence}%`, backgroundColor: getAdherenceColor() }]} />
          </View>
        </View>

        {/* Medications List */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={[Typography.caption, { color: colors.textDisabled }]}>YOUR MEDICATIONS</Text>
            <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {showAdd && (
            <View style={[styles.addCard, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Medication name" placeholderTextColor={colors.textDisabled}
                value={newName} onChangeText={setNewName}
              />
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
                <Text style={{ color: '#FFF', fontWeight: '900' }}>ADD</Text>
              </TouchableOpacity>
            </View>
          )}

          {meds.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
              <Pill size={32} color={colors.textDisabled} />
              <Text style={{ color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>No medications added. Tap + to add your daily medications.</Text>
            </View>
          ) : meds.map(med => (
            <View key={med.id} style={[styles.medCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.medIcon, { backgroundColor: colors.primary + '15' }]}>
                <Pill size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{med.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Clock size={12} color={colors.textDisabled} />
                  <Text style={{ color: colors.textDisabled, fontSize: 11, marginLeft: 4 }}>{med.time} · {med.dosage}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]} onPress={() => logMedicationTaken(med.id)}>
                  <Check size={16} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error + '15' }]} onPress={() => logMedicationMissed(med.id)}>
                  <AlertTriangle size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Correlation Insight */}
        <View style={[styles.insightCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
          <Info size={16} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 12, flex: 1, lineHeight: 18 }}>
            Medication adherence is tracked alongside cognitive performance to identify correlations. Consistent routines support better cognitive outcomes.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  scoreCard: { padding: 20, borderRadius: 24, borderWidth: 1.5, borderLeftWidth: 6, marginBottom: 24 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  bar: { height: 8, borderRadius: 4, overflow: 'hidden' }, barFill: { height: '100%', borderRadius: 4 },
  section: { marginBottom: 24 },
  addCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, borderStyle: 'dashed' },
  input: { height: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, marginBottom: 10 },
  addBtn: { height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyCard: { padding: 40, borderRadius: 20, alignItems: 'center' },
  medCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  medIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  insightCard: { flexDirection: 'row', padding: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
});
export default MedicationScreen;
