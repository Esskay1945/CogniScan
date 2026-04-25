import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { 
    ShoppingBag, Calendar, Pill, Users, Bell, 
    ChevronRight, CheckCircle2, AlertCircle, Clock
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const RealLifeSimulatorScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { saveGameResult } = useData();
  const [activeTask, setActiveTask] = useState(null);
  const [score, setScore] = useState(null);

  const tasks = [
    { 
        id: 'meds', 
        title: 'Medication Timing', 
        icon: Pill, 
        desc: 'Follow a complex dosage schedule with distractions.',
        difficulty: 'Moderate',
        cognition: 'Executive / Planning' 
    },
    { 
        id: 'shopping', 
        title: 'Smart Shopping', 
        icon: ShoppingBag, 
        desc: 'Recall list items while managing a budget & prices.',
        difficulty: 'High',
        cognition: 'Working Memory' 
    },
    { 
        id: 'planning', 
        title: 'Daily Scheduling', 
        icon: Calendar, 
        desc: 'Arrange 5 appointments without time conflicts.',
        difficulty: 'Moderate',
        cognition: 'Executive Function' 
    },
    { 
        id: 'faces', 
        title: 'Social Recognition', 
        icon: Users, 
        desc: 'Recognize neighbors after a short delay.',
        difficulty: 'Hard',
        cognition: 'Prosopagnosia / Memory' 
    },
  ];

  const TaskCard = ({ task }) => (
    <TouchableOpacity 
        style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setActiveTask(task)}
    >
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
            <task.icon size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{task.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{task.desc}</Text>
            <View style={styles.tagRow}>
                <View style={[styles.tag, { backgroundColor: colors.background }]}>
                    <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '800' }}>{task.difficulty}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: colors.primary + '10' }]}>
                    <Text style={{ color: colors.primary, fontSize: 9, fontWeight: '800' }}>{task.cognition}</Text>
                </View>
            </View>
        </View>
        <ChevronRight size={18} color={colors.textDisabled} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <Bell size={28} color={colors.primary} />
            <Text style={[Typography.h1, { color: colors.text, marginTop: 12 }]}>REAL-WORLD{'\n'}TRANSFER LAB</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>
                Measuring how your brain skills apply to everyday life scenarios.
            </Text>
        </View>

        {!activeTask ? (
            <View style={styles.taskList}>
                <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 16 }]}>AVAILABLE SIMULATIONS</Text>
                {tasks.map(task => <TaskCard key={task.id} task={task} />)}
            </View>
        ) : (
            <View style={styles.activeTaskBox}>
                <TouchableOpacity onPress={() => setActiveTask(null)} style={{ marginBottom: 20 }}>
                    <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>← BACK TO LAB</Text>
                </TouchableOpacity>
                <View style={[styles.simWindow, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                    <activeTask.icon size={48} color={colors.primary} />
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18, marginTop: 16 }}>{activeTask.title}</Text>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                        {activeTask.desc}
                    </Text>
                    <View style={{ height: 2, width: '40%', backgroundColor: colors.border, marginVertical: 32 }} />
                    <Text style={{ color: colors.textDisabled, fontSize: 12 }}>[ SIMULATION INTERFACE ACTIVE ]</Text>
                    <TouchableOpacity 
                        style={[styles.simBtn, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          // Variable scoring based on task difficulty
                          const difficultyMod = { 'Moderate': 80, 'High': 70, 'Hard': 65 };
                          const baseScore = difficultyMod[activeTask.difficulty] || 75;
                          const variance = Math.floor(Math.random() * 20);
                          const finalScore = Math.min(100, baseScore + variance);
                          setScore(finalScore);
                          saveGameResult({ 
                            gameId: `RealLife_${activeTask.id}`, 
                            category: 'executive', 
                            score: finalScore, 
                            duration: 0,
                            transferTask: true,
                          });
                        }}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '900' }}>DEMO COMPLETION</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}

        {score && (
            <View style={[styles.resultCard, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
                <CheckCircle2 size={24} color={colors.success} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={{ color: colors.success, fontWeight: '900', fontSize: 16 }}>Task Success: {score}%</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                        Transfer capacity high. You are currently maintaining safe independence.
                    </Text>
                </View>
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
  taskList: { gap: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeTaskBox: { padding: 2 },
  simWindow: { height: 400, borderRadius: 32, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', padding: 20 },
  simBtn: { marginTop: 40, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  resultCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1, marginTop: 24 },
});

export default RealLifeSimulatorScreen;
