import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { AlertCircle, ChevronRight, CheckCircle2, ShieldCheck, Activity, Brain, Eye, Zap, MessageSquare, Move, AlertTriangle } from 'lucide-react-native';

const DOMAIN_ICONS = {
  memory: Brain,
  attention: Eye,
  executive: Zap,
  language: MessageSquare,
  visuospatial: Move,
  motor: Activity,
};

const RiskAssessmentScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const assessment = route.params?.assessment;

  if (!assessment) return null;

  const { domains, mandatoryTests } = assessment;

  const handleStartTests = () => {
    navigation.navigate('ReadinessCheck', { game: { id: 'TestHub' }, isMandatoryFlow: true });
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return colors.error;
      case 'moderate': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textDisabled;
    }
  };

  const domainList = Object.keys(domains).map(key => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    risk: domains[key],
    Icon: DOMAIN_ICONS[key] || Activity,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginLeft: 6 }}>EVALUATION COMPLETE</Text>
          </View>
          <Text style={[Typography.h1, { color: colors.text, marginTop: 12 }]}>RISK{'\n'}ASSESSMENT</Text>
        </View>

        {/* Risk Summary */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>COGNITIVE DOMAIN STATUS</Text>
          <View style={styles.domainGrid}>
            {domainList.map((domain) => {
              const Icon = domain.Icon;
              const riskColor = getRiskColor(domain.risk);
              return (
                <View key={domain.id} style={[styles.domainItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Icon size={18} color={riskColor} />
                  <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700', marginTop: 8 }}>{domain.label}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: riskColor + '15' }]}>
                    <Text style={{ color: riskColor, fontSize: 8, fontWeight: '900' }}>{domain.risk.toUpperCase()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Mandatory Tests */}
        <View style={{ marginTop: 24 }}>
          <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>REQUIRED TESTS ({mandatoryTests.length})</Text>
          {mandatoryTests.map((test, index) => (
            <View key={test.id} style={[styles.testRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.testIcon, { backgroundColor: getRiskColor(test.risk) + '15' }]}>
                    <Text style={{ color: getRiskColor(test.risk), fontWeight: '900', fontSize: 12 }}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{test.label}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>Target: {test.domain.toUpperCase()} · Risk: {test.risk}</Text>
                </View>
                <AlertCircle size={16} color={colors.textDisabled} />
            </View>
          ))}
        </View>

        {/* Clinical Neutrality Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.error + '05', borderColor: colors.error + '20' }]}>
            <AlertTriangle size={16} color={colors.error} />
            <Text style={{ color: colors.textSecondary, fontSize: 11, lineHeight: 17, marginLeft: 10, flex: 1 }}>
                This assessment is for screening purposes only and does not constitute a medical diagnosis. Please consult a healthcare professional for clinical evaluation.
            </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: colors.primary }]}
          onPress={handleStartTests}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1.5, marginRight: 8 }}>
            PROCEED TO TESTING
          </Text>
          <ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  infoCard: { padding: 20, borderRadius: 20, borderWidth: 1 },
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  domainItem: { width: '30%', paddingVertical: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1 },
  riskBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  testRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  testIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  disclaimer: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 24 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 36 },
  continueBtn: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default RiskAssessmentScreen;
