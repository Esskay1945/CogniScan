import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { 
    Brain, 
    Eye, 
    Zap, 
    MessageSquare, 
    Move, 
    Activity, 
    ChevronLeft, 
    Star, 
    Trophy,
    Info,
    BrainCircuit
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const NODES = [
    { id: 'memory', label: 'MEMORY', icon: Brain, color: '#0066FF', x: 0, y: 0 },
    { id: 'attention', label: 'ATTENTION', icon: Eye, color: '#FF3D00', x: -90, y: 120 },
    { id: 'executive', label: 'EXECUTIVE', icon: Zap, color: '#FFD600', x: 90, y: 120 },
    { id: 'language', label: 'LANGUAGE', icon: MessageSquare, color: '#9B7BFF', x: 0, y: 240 },
    { id: 'visuospatial', label: 'SPATIAL', icon: Move, color: '#00F0FF', x: -90, y: 360 },
    { id: 'motor', label: 'MOTOR', icon: Activity, color: '#00E676', x: 90, y: 360 },
];

const SkillTreeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data } = useData();
  const trees = data.skillTrees || {};

  const Node = ({ node }) => {
    const tree = trees[node.id] || { level: 1, xp: 0 };
    const Icon = node.icon;
    const isLocked = tree.level === 0;

    return (
        <View style={[styles.nodeContainer, { left: (width/2 - 35) + node.x, top: node.y }]}>
            <TouchableOpacity 
                style={[styles.nodeCircle, { 
                    backgroundColor: colors.surface, 
                    borderColor: isLocked ? colors.border : node.color, 
                    shadowColor: isLocked ? 'transparent' : node.color,
                }]}
                activeOpacity={0.8}
            >
                <Icon size={30} color={isLocked ? colors.textDisabled : node.color} />
            </TouchableOpacity>
            <View style={styles.nodeInfo}>
                <Text style={{ color: colors.text, fontWeight: '900', fontSize: 9, letterSpacing: 1.2 }}>{node.label}</Text>
                <View style={[styles.lvlBadge, { backgroundColor: isLocked ? colors.border : node.color + '15' }]}>
                    <Text style={{ color: isLocked ? colors.textDisabled : node.color, fontSize: 8, fontWeight: '900' }}>LVL {tree.level}</Text>
                </View>
            </View>
        </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[Typography.h1, { color: colors.text }]}>THE SKILL TREE</Text>
        <BrainCircuit size={28} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.treeOverview}>
            <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Trophy size={18} color={colors.warning} />
                    <Text style={{ color: colors.text, fontWeight: '900', fontSize: 20, marginTop: 4 }}>{data.level}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>NEURO-LEVEL</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Star size={18} color={colors.accent} />
                    <Text style={{ color: colors.text, fontWeight: '900', fontSize: 20, marginTop: 4 }}>{data.xp}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>COREG XP</Text>
                </View>
            </View>
        </View>

        {/* The Map */}
        <View style={styles.mapArea}>
            {/* SVG Connections */}
            <Svg height="450" width={width} style={styles.svg}>
                <G>
                    {/* Paths: Memory to Attention/Executive */}
                    <Path d={`M ${width/2} 35 L ${width/2 - 90} 120`} stroke={colors.border} strokeWidth="2" strokeDasharray="5,5" />
                    <Path d={`M ${width/2} 35 L ${width/2 + 90} 120`} stroke={colors.border} strokeWidth="2" strokeDasharray="5,5" />
                    
                    {/* Attention to Language */}
                    <Path d={`M ${width/2 - 90} 155 L ${width/2} 240`} stroke={colors.border} strokeWidth="2" strokeDasharray="5,5" />
                    {/* Executive to Language */}
                    <Path d={`M ${width/2 + 90} 155 L ${width/2} 240`} stroke={colors.border} strokeWidth="2" strokeDasharray="5,5" />
                    
                    {/* Language to Spatial/Motor */}
                    <Path d={`M ${width/2} 275 L ${width/2 - 90} 360`} stroke={colors.border} strokeWidth="2" strokeDasharray="5,5" />
                    <Path d={`M ${width/2} 275 L ${width/2 + 90} 360`} stroke={colors.border} strokeWidth="2" strokeDasharray="5,5" />

                    {/* Nodes backgrounds (SVG part) */}
                    {NODES.map(n => (
                        <Circle 
                            key={`c-${n.id}`} 
                            cx={width/2 + n.x} 
                            cy={n.y + 35} 
                            r="35" 
                            fill={colors.surface} 
                            stroke={colors.border} 
                            strokeWidth="1" 
                        />
                    ))}
                </G>
            </Svg>

            {/* Interactive Nodes */}
            {NODES.map(node => <Node key={node.id} node={node} />)}
        </View>

        <View style={styles.footer}>
            <View style={[styles.infoCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
                <Info size={16} color={colors.primary} />
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 12, flex: 1, lineHeight: 17 }}>
                    Your Neuro-Map evolves based on training performance. Reach LVL 5 in any domain to unlock "Cyber-Clinical" variant games.
                </Text>
            </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 60 },
  treeOverview: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  mapArea: { height: 450, marginTop: 20, width: width },
  svg: { position: 'absolute', top: 0, left: 0 },
  nodeContainer: { position: 'absolute', alignItems: 'center', width: 70 },
  nodeCircle: { 
    width: 70, height: 70, borderRadius: 35, 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 10,
    elevation: 6
  },
  nodeInfo: { alignItems: 'center', marginTop: 10 },
  lvlBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
  footer: { paddingHorizontal: 24, marginTop: 40 },
  infoCard: { flexDirection: 'row', padding: 18, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
});

export default SkillTreeScreen;
