import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain, Zap, Activity, Target, Flame, ChevronRight, Microscope } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const games = [
  { id: 'memoryHeist', title: 'Memory Heist', desc: 'Vault codes retrieval diagnostic', icon: Brain, color: '#0066FF', tag: 'Memory' },
  { id: 'reflexTap', title: 'Reflex Tap Arena', desc: 'Targeting latency calibration', icon: Zap, color: '#FF3D00', tag: 'Reaction' },
  { id: 'flashRecall', title: 'Flash Recall Chains', desc: 'Spectral link reconstruction', icon: Activity, color: '#00F0FF', tag: 'Stability' },
  { id: 'rapidStory', title: 'Rapid Story Builder', desc: 'Linguistic synchronization', icon: Microscope, color: '#00E676', tag: 'Linguistic' },
  { id: 'calibration', title: 'Reality Calibration', desc: 'Self-awareness estimation', icon: Target, color: '#9B7BFF', tag: 'Awareness' },
];

const GamesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data } = useData();

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Target size={24} color={Colors.dark.primary} />
          <Text style={[Typography.h1, { color: Colors.dark.text, marginLeft: 12 }]}>NEURO-LAB</Text>
        </View>

        {/* Analytics Card */}
        <View style={[styles.analyticsCard, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }]}>
          <View style={styles.streakInfo}>
            <Flame size={24} color={colors.error} />
            <Text style={{ color: Colors.dark.text, fontWeight: '800', fontSize: 24, marginLeft: 10 }}>{data.streak || 0}</Text>
            <Text style={[Typography.caption, { color: Colors.dark.textSecondary, marginLeft: 6 }]}>DAY STREAK</Text>
          </View>
          <View style={[styles.onlineBadge, { backgroundColor: Colors.dark.success + '15' }]}>
            <View style={[styles.dot, { backgroundColor: Colors.dark.success }]} />
            <Text style={{ color: colors.success, fontSize: 9, fontWeight: '900', marginLeft: 6 }}>SYSTEM CALIBRATED</Text>
          </View>
        </View>

        {/* Training Modules */}
        <Text style={[Typography.caption, { color: Colors.dark.textDisabled, marginBottom: 16, marginTop: 24 }]}>DIAGNOSTIC EXERCISES</Text>
        <View style={styles.grid}>
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }]}
                onPress={() => {
                  if (game.id === 'memoryHeist') navigation.navigate('MemoryHeist');
                  else if (game.id === 'reflexTap') navigation.navigate('ReflexTap');
                  else if (game.id === 'flashRecall') navigation.navigate('FlashRecall');
                  else if (game.id === 'rapidStory') navigation.navigate('RapidStory');
                  else if (game.id === 'calibration') navigation.navigate('Calibration');
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: game.color + '10' }]}>
                  <Icon size={22} color={game.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 16 }}>{game.title}</Text>
                  <Text style={{ color: Colors.dark.textSecondary, fontSize: 11, marginTop: 2 }}>{game.desc}</Text>
                </View>
                <ChevronRight size={18} color={Colors.dark.textDisabled} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  analyticsCard: { padding: 20, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakInfo: { flexDirection: 'row', alignItems: 'center' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  grid: { gap: 12 },
  gameCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});

export default GamesScreen;
