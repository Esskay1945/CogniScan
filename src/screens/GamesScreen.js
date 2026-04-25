import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain, Zap, Activity, Target, Flame, ChevronRight, Eye, MessageSquare, Hash, Cpu, TrendingUp, Check, Move, Crosshair } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  {
    id: 'memory',
    title: 'MEMORY TRAINING',
    subtitle: 'Strengthen recall & retention pathways',
    color: '#0066FF',
    icon: Brain,
    games: [
      { id: 'memoryHeist', route: 'MemoryHeist', title: 'Memory Heist', desc: 'Memorize and recall vault codes of increasing length', tag: 'Short-term Memory', icon: '🔐' },
      { id: 'flashRecall', route: 'FlashRecall', title: 'Flash Recall Chains', desc: 'Reconstruct spectral color sequences from memory', tag: 'Sequential Memory', icon: '⚡' },
      { id: 'sequenceMemory', route: 'SequenceMemory', title: 'Sequence Memory', desc: 'Watch and repeat colored button patterns (Simon)', tag: 'Pattern Memory', icon: '🔲' },
      { id: 'memoryMatch', route: 'MemoryMatch', title: 'Memory Match', desc: 'Flip cards to find matching pairs', tag: 'Visual Memory', icon: '🃏' },
      { id: 'spatialRecall', route: 'SpatialRecall', title: 'Spatial Recall', desc: 'Memorize grid patterns and tap from memory', tag: 'Spatial Memory', icon: '🗺️' },
      { id: 'numberSpan', route: 'NumberSpan', title: 'Number Span', desc: 'Repeat digit sequences forward and backward', tag: 'Working Memory', icon: '🔢' },
      { id: 'chunking', route: 'Chunking', title: 'Chunking Master', desc: 'Remember long sequences using chunking strategy', tag: 'Memory Strategy', icon: '🧩' },
      { id: 'contextRecall', route: 'ContextRecall', title: 'Context Recall', desc: 'Memorize items in a scene then recall from mixed list', tag: 'Contextual Memory', icon: '🏠' },
      { id: 'faceNameMatch', route: 'FaceNameMatch', title: 'Face-Name Match', desc: 'Learn face-name pairs then match after a delay', tag: 'Associative Memory', icon: '🧑‍🤝‍🧑' },
      { id: 'interferenceMemory', route: 'InterferenceMemory', title: 'Interference Memory', desc: 'Remember List A, ignore distractor List B, recall A', tag: 'Interference Resistance', icon: '🔀' },
    ],
  },
  {
    id: 'attention',
    title: 'ATTENTION & FOCUS',
    subtitle: 'Sharpen concentration & inhibition',
    color: '#00F0FF',
    icon: Eye,
    games: [
      { id: 'colorMatch', route: 'ColorMatch', title: 'Color Match', desc: 'Stroop test — does the word match its ink color?', tag: 'Selective Attention', icon: '🎨' },
      { id: 'focusFlow', route: 'FocusFlow', title: 'Focus Flow', desc: 'Tap targets, avoid distractors under time pressure', tag: 'Inhibition Control', icon: '🎯' },
      { id: 'dualNBack', route: 'DualNBack', title: 'Dual N-Back', desc: 'Gold-standard working memory & attention exercise', tag: 'Working Memory', icon: '🧬' },
      { id: 'stroopChallenge', route: 'StroopChallenge', title: 'Stroop Challenge', desc: 'Arrow direction conflicts with word — test inhibition', tag: 'Inhibition', icon: '🔄' },
      { id: 'visualSearch', route: 'VisualSearch', title: 'Visual Search', desc: 'Find the target shape among distractors', tag: 'Visual Attention', icon: '🔍' },
      { id: 'goNoGo', route: 'GoNoGo', title: 'Go / No-Go', desc: 'React to go signals, inhibit on no-go', tag: 'Response Inhibition', icon: '🚦' },
      { id: 'trailMaking', route: 'TrailMaking', title: 'Trail Making', desc: 'Connect nodes in order — numbers then alternating', tag: 'Cognitive Flexibility', icon: '🔗' },
      { id: 'flankerTask', route: 'FlankerTask', title: 'Flanker Task', desc: 'Identify center arrow direction while ignoring flankers', tag: 'Selective Attention', icon: '➡️' },
      { id: 'oddballDetection', route: 'OddballDetection', title: 'Oddball Detection', desc: 'Tap when the rare target stimulus appears', tag: 'Vigilance', icon: '🔴' },
      { id: 'distractionFilter', route: 'DistractionFilter', title: 'Distraction Filter', desc: 'Find target shape among animated distractors', tag: 'Distraction Resistance', icon: '🔍' },
    ],
  },
  {
    id: 'speed',
    title: 'PROCESSING SPEED',
    subtitle: 'Boost reaction time & mental velocity',
    color: '#FF3D00',
    icon: Zap,
    games: [
      { id: 'reflexTap', route: 'ReflexTap', title: 'Reflex Tap Arena', desc: 'Tap moving targets as fast as possible', tag: 'Reaction Time', icon: '⚡' },
      { id: 'speedSort', route: 'SpeedSort', title: 'Speed Sort', desc: 'Sort numbers in ascending order under pressure', tag: 'Processing Speed', icon: '🔢' },
      { id: 'mathBlitz', route: 'MathBlitz', title: 'Math Blitz', desc: 'Solve rapid arithmetic problems before time runs out', tag: 'Mental Arithmetic', icon: '🧮' },
      { id: 'digitSymbol', route: 'DigitSymbol', title: 'Digit Symbol', desc: 'Match digits to symbols — how many in 60s?', tag: 'Processing Speed', icon: '⏱️' },
      { id: 'rapidNaming', route: 'RapidNaming', title: 'Rapid Naming', desc: 'Name items as fast as possible under time pressure', tag: 'Naming Speed', icon: '🏷️' },
    ],
  },
  {
    id: 'language',
    title: 'LANGUAGE & EXECUTIVE',
    subtitle: 'Enhance verbal & organizational skills',
    color: '#00E676',
    icon: MessageSquare,
    games: [
      { id: 'rapidStory', route: 'RapidStory', title: 'Rapid Story Builder', desc: 'Complete sentences with speed and accuracy', tag: 'Linguistic Speed', icon: '📖' },
      { id: 'wordScramble', route: 'WordScramble', title: 'Word Scramble', desc: 'Unscramble letters to form cognitive vocabulary', tag: 'Lexical Access', icon: '🔤' },
      { id: 'verbalFluency', route: 'VerbalFluency', title: 'Verbal Fluency', desc: 'Generate words starting with a letter in 60 seconds', tag: 'Verbal Fluency', icon: '💬' },
      { id: 'wordAssociation', route: 'WordAssociation', title: 'Word Association', desc: 'Find opposites — test verbal reasoning speed', tag: 'Verbal Reasoning', icon: '🔤' },
      { id: 'categorySort', route: 'CategorySort', title: 'Category Sort', desc: 'Sort words into correct categories', tag: 'Categorization', icon: '📂' },
      { id: 'mazeRunner', route: 'MazeRunner', title: 'Maze Runner', desc: 'Navigate mazes — spatial planning challenge', tag: 'Spatial Planning', icon: '🏃' },
      { id: 'towerSort', route: 'TowerSort', title: 'Tower Sort', desc: 'Tower of Hanoi — plan and execute', tag: 'Problem Solving', icon: '🗼' },
      { id: 'sentenceLogic', route: 'SentenceLogic', title: 'Sentence Logic', desc: 'Fix illogical sentences by choosing the corrected version', tag: 'Verbal Logic', icon: '📝' },
      { id: 'contextMeaning', route: 'ContextMeaning', title: 'Context Meaning', desc: 'Determine word meaning from sentence context', tag: 'Semantic Processing', icon: '📖' },
      { id: 'ruleSwitch', route: 'RuleSwitch', title: 'Rule Switch Arena', desc: 'Sort by color or shape — rules switch mid-game!', tag: 'Cognitive Flexibility', icon: '🔄' },
      { id: 'multiStepPlanner', route: 'MultiStepPlanner', title: 'Multi-Step Planner', desc: 'Arrange steps in logical order to complete tasks', tag: 'Sequential Planning', icon: '📋' },
      { id: 'decisionGrid', route: 'DecisionGrid', title: 'Decision Grid', desc: 'Evaluate multiple criteria to make the best decision', tag: 'Decision Making', icon: '📊' },
    ],
  },
  {
    id: 'visuospatial',
    title: 'VISUOSPATIAL',
    subtitle: 'Enhance spatial reasoning & visualization',
    color: '#9B7BFF',
    icon: Move,
    games: [
      { id: 'patternMatrix', route: 'PatternMatrix', title: 'Pattern Matrix', desc: 'Memorize grid patterns for spatial organization', tag: 'Spatial Planning', icon: '🧩' },
      { id: 'rotation3D', route: 'Rotation3D', title: '3D Rotation', desc: 'Identify which shape is a rotated version', tag: 'Mental Rotation', icon: '🔄' },
      { id: 'mirrorPattern', route: 'MirrorPattern', title: 'Mirror Pattern', desc: 'Identify the correct horizontal mirror image', tag: 'Spatial Reflection', icon: '🪞' },
      { id: 'pathPrediction', route: 'PathPrediction', title: 'Path Prediction', desc: 'Follow arrow sequences and predict final position', tag: 'Spatial Tracking', icon: '🧭' },
    ],
  },
  {
    id: 'motor',
    title: 'MOTOR CONTROL',
    subtitle: 'Test fine motor skills & coordination',
    color: '#FF6B35',
    icon: Crosshair,
    games: [
      { id: 'fingerTapping', route: 'FingerTapping', title: 'Finger Tapping', desc: 'Tap as fast as you can — measures motor speed', tag: 'Motor Speed', icon: '👆' },
      { id: 'precisionHold', route: 'PrecisionHold', title: 'Precision Hold', desc: 'Hold finger in target zone without drifting', tag: 'Motor Stability', icon: '🎯' },
      { id: 'stabilityTap', route: 'StabilityTap', title: 'Stability Tap', desc: 'Tap at a consistent rhythm — measures timing', tag: 'Rhythmic Control', icon: '🥁' },
      { id: 'motionTracking', route: 'MotionTracking', title: 'Motion Tracking', desc: 'Follow a moving target with your finger', tag: 'Pursuit Tracking', icon: '👆' },
    ],
  },
  {
    id: 'meta',
    title: 'META-COGNITION',
    subtitle: 'Evaluate self-awareness & error monitoring',
    color: '#E91E63',
    icon: Target,
    games: [
      { id: 'calibration', route: 'Calibration', title: 'Reality Calibration', desc: 'Test how well you judge your own abilities', tag: 'Self-Calibration', icon: '⚖️' },
      { id: 'confidenceMeter', route: 'ConfidenceMeter', title: 'Confidence Meter', desc: 'Rate confidence before answering — measures awareness', tag: 'Metacognitive Accuracy', icon: '🎯' },
      { id: 'errorAwareness', route: 'ErrorAwareness', title: 'Error Awareness', desc: 'Review tasks and identify deliberate errors', tag: 'Error Monitoring', icon: '🔎' },
    ],
  },
];

const totalGameCount = CATEGORIES.reduce((a, c) => a + c.games.length, 0);

const GamesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, getTodayStreakProgress, getGameRecommendations } = useData();
  const [selectedGame, setSelectedGame] = useState(null);
  const streakProgress = getTodayStreakProgress();
  const recommendations = getGameRecommendations();

  const handleGamePress = (game) => {
    setSelectedGame(game);
  };

  const startGame = () => {
    if (selectedGame) {
      navigation.navigate(selectedGame.route);
      setSelectedGame(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
            <View>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>BRAIN GAMES</Text>
                <Text style={[Typography.h1, { color: colors.text }]}>THE ARCADE</Text>
            </View>
            <View style={[styles.lvlBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 12 }}>LVL {data.level}</Text>
            </View>
        </View>

        {/* Assignments Section */}
        {data.assignedGames?.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={[Typography.caption, { color: colors.error, marginBottom: 12, fontWeight: '900' }]}>YOUR ASSIGNED GAMES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {data.assignedGames.filter(g => !g.completed).map((game, i) => (
                    <TouchableOpacity 
                        key={`${game.id}-${i}`} 
                        style={[styles.assignCard, { backgroundColor: colors.surface, borderColor: game.status === 'mandatory' ? colors.error : colors.primary }]}
                        onPress={() => navigation.navigate(game.id)}
                    >
                        <Text style={{ color: game.status === 'mandatory' ? colors.error : colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>{game.status.toUpperCase()}</Text>
                        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14, marginTop: 4 }}>{game.id.replace(/([A-Z])/g, ' $1').trim()}</Text>
                        <View style={[styles.tinyTag, { backgroundColor: colors.border }]}>
                            <Text style={{ color: colors.textSecondary, fontSize: 8, fontWeight: '700' }}>{game.domain.toUpperCase()}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Streak Progress Card */}
        <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.streakHeader}>
            <View style={styles.streakInfo}>
              <Flame size={24} color={colors.error} />
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 24, marginLeft: 10 }}>{data.streak || 0}</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 6 }]}>DAY STREAK</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={{ color: colors.primary, fontSize: 9, fontWeight: '900' }}>{totalGameCount} GAMES</Text>
            </View>
          </View>
          
          {/* Streak Progress Bar */}
          <View style={styles.streakProgressSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700' }}>
                TODAY'S PROGRESS
              </Text>
              <Text style={{ color: streakProgress.isComplete ? colors.success : colors.textSecondary, fontSize: 10, fontWeight: '800' }}>
                {streakProgress.isComplete ? '✓ STREAK SECURED' : `${streakProgress.gamesPlayed}/6 games or all categories`}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { 
                width: `${Math.min(100, (streakProgress.gamesPlayed / 6) * 100)}%`, 
                backgroundColor: streakProgress.isComplete ? colors.success : colors.primary 
              }]} />
            </View>
            
            {/* Category Dots */}
            <View style={styles.categoryDots}>
              {(streakProgress.categoryDetails || []).map(cat => (
                <View key={cat.id} style={styles.categoryDot}>
                  {cat.completed ? (
                    <View style={[styles.dotFilled, { backgroundColor: colors.success }]}>
                      <Check size={10} color="#FFF" />
                    </View>
                  ) : (
                    <View style={[styles.dotEmpty, { borderColor: colors.border }]} />
                  )}
                  <Text style={{ color: cat.completed ? colors.success : colors.textDisabled, fontSize: 8, fontWeight: '700', marginTop: 4 }}>
                    {cat.label.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <View style={[styles.recoCard, { backgroundColor: colors.warning + '08', borderColor: colors.warning + '30' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TrendingUp size={16} color={colors.warning} />
              <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 11, marginLeft: 8, letterSpacing: 1 }}>
                🎯 RECOMMENDED FOR YOU
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
              Based on your test results, focus on these areas:
            </Text>
            {recommendations.map((rec, i) => {
              const catGames = CATEGORIES.find(c => c.id === rec.area);
              return (
                <View key={i} style={[styles.recoItem, { backgroundColor: colors.surface }]}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                    {rec.label}: {rec.score}%
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Play {catGames?.title || rec.area} games to improve
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Categories */}
        {CATEGORIES.map((category) => {
          const CatIcon = category.icon;
          return (
            <View key={category.id} style={styles.categorySection}>
              {/* Category Header */}
              <View style={[styles.categoryCard, { borderLeftColor: category.color, backgroundColor: colors.surface }]}>
                <View style={[styles.catIconBox, { backgroundColor: category.color + '15' }]}>
                  <CatIcon size={20} color={category.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14, letterSpacing: 1 }}>{category.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{category.subtitle}</Text>
                </View>
                <View style={[styles.gameBadge, { backgroundColor: category.color + '15' }]}>
                  <Text style={{ color: category.color, fontSize: 10, fontWeight: '800' }}>{category.games.length}</Text>
                </View>
              </View>

              {/* Games in Category */}
              {category.games.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.gameCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleGamePress(game)}
                >
                  <Text style={{ fontSize: 28, marginRight: 14 }}>{game.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{game.title}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{game.desc}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: category.color + '10' }]}>
                      <Text style={{ color: category.color, fontSize: 9, fontWeight: '800' }}>{game.tag}</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textDisabled} />
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Game Detail Modal */}
      <Modal visible={selectedGame !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {selectedGame && (
              <>
                <Text style={{ fontSize: 56, marginBottom: 16 }}>{selectedGame.icon}</Text>
                <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>{selectedGame.title}</Text>
                <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 8, lineHeight: 22 }}>
                  {selectedGame.desc}
                </Text>
                
                <View style={[styles.tagBadgeLarge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
                    🏷️ {selectedGame.tag}
                  </Text>
                </View>

                <View style={[styles.trialInfo, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800', marginBottom: 6 }}>💡 HOW TO PLAY</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18 }}>
                    The game includes a tutorial when you start. Follow the on-screen instructions. Each game adapts to your skill level and saves results to your cognitive profile.
                  </Text>
                </View>

                <TouchableOpacity style={[styles.playBtn, { backgroundColor: colors.primary }]} onPress={startGame}>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1.5 }}>PLAY NOW</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedGame(null)}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  
  // Streak card
  streakCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  streakHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakInfo: { flexDirection: 'row', alignItems: 'center' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  streakProgressSection: { marginTop: 16 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  categoryDots: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  categoryDot: { alignItems: 'center' },
  dotFilled: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  dotEmpty: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },

  // Recommendations
  recoCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  recoItem: { padding: 10, borderRadius: 10, marginBottom: 6 },

  // Categories
  categorySection: { marginBottom: 20 },
  categoryCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    borderLeftWidth: 4, marginBottom: 10,
  },
  catIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  lvlBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  assignCard: { width: 160, padding: 16, borderRadius: 20, borderWidth: 1.5 },
  tinyTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8 },
  gameBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  gameCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    borderWidth: 1, marginBottom: 8, marginLeft: 12,
  },
  tagBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, paddingBottom: 48, alignItems: 'center' },
  tagBadgeLarge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 16 },
  trialInfo: { width: '100%', padding: 16, borderRadius: 14, marginTop: 20 },
  playBtn: { width: '100%', height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  cancelBtn: { width: '100%', height: 44, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
});

export default GamesScreen;
