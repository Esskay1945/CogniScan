import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronRight, Brain, Zap, Activity, Eye, MessageSquare, Move, Lock, Unlock, ZapOff, CheckCircle2 } from 'lucide-react-native';
import { useSpeech } from '../hooks/useSpeech';

const { width } = Dimensions.get('window');

const DOMAIN_DATA = {
    memory: { icon: Brain, color: '#0066FF', label: 'MEMORY' },
    attention: { icon: Eye, color: '#FF3D00', label: 'ATTENTION' },
    executive: { icon: Zap, color: '#FFD600', label: 'EXECUTIVE' },
    language: { icon: MessageSquare, color: '#9B7BFF', label: 'LANGUAGE' },
    visuospatial: { icon: Move, color: '#00F0FF', label: 'SPATIAL' },
    motor: { icon: Activity, color: '#00E676', label: 'MOTOR' },
};

const GameAssignmentScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, assignGamesFromResults } = useData();
  const [assigned, setAssigned] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    assignGamesFromResults();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const { speak } = useSpeech();

  useEffect(() => {
    if (data.assessmentCompleted) {
      speak('Your plan is ready! Based on your results, we picked some brain games to help strengthen your weaker areas.');
    }
  }, [data.assessmentCompleted]);

  useEffect(() => {
    if (data.assignedGames) {
      setAssigned(data.assignedGames);
    }
  }, [data.assignedGames]);

  const handleStartTraining = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  if (!data.assessmentCompleted) {
    return (
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
            <Lock size={64} color={colors.textDisabled} />
            <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: 24 }]}>CHECK-UP{"\n"}NEEDED</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
                Please complete your brain check-up first. After that, we'll pick the best games for you.
            </Text>
            <TouchableOpacity 
                style={[styles.btn, { backgroundColor: colors.primary, width: '100%', marginTop: 32 }]} 
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Splash' }] })}
            >
                <Text style={{ color: '#FFF', fontWeight: '900' }}>START CHECK-UP</Text>
            </TouchableOpacity>
        </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: colors.accent + '15' }]}>
              <Zap size={14} color={colors.accent} />
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginLeft: 6 }}>YOUR PLAN IS READY</Text>
            </View>
            <Text style={[Typography.h1, { color: colors.text, marginTop: 12 }]}>YOUR BRAIN{"\n"}TRAINING PLAN</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8, lineHeight: 20 }}>
              Based on your results, we picked some brain games to help strengthen your weaker areas.
            </Text>
          </View>

          {/* Mandatory Assignments */}
          <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.error, marginBottom: 12, fontWeight: '900' }]}>RECOMMENDED FOR YOU</Text>
            {assigned.filter(g => g.status === 'mandatory').map((game, index) => {
              const domain = DOMAIN_DATA[game.domain] || DOMAIN_DATA.memory;
              const Icon = domain.icon;
              return (
                <View key={`${game.id}-${index}`} style={[styles.gameCard, { backgroundColor: colors.surface, borderColor: domain.color + '40' }]}>
                    <View style={[styles.domainTag, { backgroundColor: domain.color + '15' }]}>
                        <Icon size={14} color={domain.color} />
                        <Text style={{ color: domain.color, fontSize: 10, fontWeight: '900', marginLeft: 6 }}>{domain.label}</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{game.id.replace(/([A-Z])/g, ' $1').trim()}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Helps improve your {game.domain}.</Text>
                        </View>
                        <Lock size={18} color={colors.textDisabled} />
                    </View>
                </View>
              );
            })}
          </View>

          {/* Optional Assignments */}
          <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>MORE GAMES TO TRY</Text>
            {assigned.filter(g => g.status === 'optional').map((game, index) => {
              const domain = DOMAIN_DATA[game.domain] || DOMAIN_DATA.memory;
              const Icon = domain.icon;
              return (
                <View key={`${game.id}-${index}`} style={[styles.gameCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.7 }]}>
                    <View style={[styles.domainTag, { backgroundColor: colors.border }]}>
                        <Icon size={14} color={colors.textDisabled} />
                        <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '900', marginLeft: 6 }}>{domain.label}</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 15 }}>{game.id.replace(/([A-Z])/g, ' $1').trim()}</Text>
                        </View>
                        <Unlock size={18} color={colors.success} />
                    </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Action */}
        <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={handleStartTraining}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1.5 }}>LET'S GO</Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  section: { marginBottom: 28 },
  gameCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  domainTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 36 },
  startBtn: { height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default GameAssignmentScreen;
