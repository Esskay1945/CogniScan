import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, FileText, Shield, Check, AlertTriangle, Eye, TrendingUp, Activity, Layers, Info, Share2 } from 'lucide-react-native';

const ClinicalReportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { generateClinicalReport, data } = useData();
  const report = generateClinicalReport();

  const sectionColor = (tag) => tag === 'Production' ? colors.success : tag === 'Pilot' ? colors.warning : colors.accent;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>CLINICAL{'\n'}REPORT</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Generated {new Date(report.generatedAt).toLocaleDateString()}</Text>
          </View>
          <FileText size={24} color={colors.primary} />
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimerTop, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}>
          <AlertTriangle size={16} color={colors.warning} />
          <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600', marginLeft: 10, flex: 1, lineHeight: 16 }}>
            {report.disclaimer}
          </Text>
        </View>

        {/* Domain Scores */}
        <SectionTitle icon={Activity} title="DOMAIN SCORES" tag="Production" colors={colors} sectionColor={sectionColor} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {Object.entries(report.domainScores || {}).length > 0
            ? Object.entries(report.domainScores).map(([key, val]) => (
              <View key={key} style={styles.row}>
                <Text style={{ color: colors.text, fontWeight: '600', flex: 1, fontSize: 13 }}>{key}</Text>
                <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 15 }}>{val?.score ?? '—'}</Text>
              </View>
            ))
            : <Text style={{ color: colors.textDisabled, fontSize: 12, textAlign: 'center' }}>No domain score data available yet</Text>
          }
        </View>

        {/* Confidence & Reliability */}
        <SectionTitle icon={Shield} title="CONFIDENCE & RELIABILITY" tag="Production" colors={colors} sectionColor={sectionColor} />
        <View style={styles.metricsRow}>
          <MetricBox label="RELIABILITY" value={`${report.reliability}%`} color={report.reliability > 70 ? colors.success : colors.warning} colors={colors} />
          <MetricBox label="DATA SUFFICIENCY" value={`${report.dataSufficiency}%`} color={report.dataSufficiency > 50 ? colors.success : colors.warning} colors={colors} />
          <MetricBox label="PRACTICE EFX" value={`${report.practiceAdjusted > 0 ? '+' : ''}${report.practiceAdjusted}%`} color={Math.abs(report.practiceAdjusted) > 10 ? colors.warning : colors.success} colors={colors} />
        </View>

        {/* Confounders */}
        <SectionTitle icon={Eye} title="CONFOUNDER HISTORY" tag="Production" colors={colors} sectionColor={sectionColor} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { label: 'Sleep Quality', value: report.confounderHistory.sleep, max: 5 },
            { label: 'Stress Level', value: report.confounderHistory.stress, max: 5 },
            { label: 'Energy Level', value: report.confounderHistory.energy, max: 5 },
            { label: 'Noise Environment', value: report.confounderHistory.noise, max: 5 },
          ].map((c, i) => (
            <View key={i} style={styles.confRow}>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600', flex: 1 }}>{c.label}</Text>
              <View style={[styles.confBar, { backgroundColor: colors.border }]}>
                <View style={[styles.confFill, { width: `${(c.value / c.max) * 100}%`, backgroundColor: c.value <= 2 ? colors.error : c.value >= 4 ? colors.success : colors.warning }]} />
              </View>
              <Text style={{ color: colors.textDisabled, fontSize: 11, marginLeft: 8, width: 20 }}>{c.value}</Text>
            </View>
          ))}
        </View>

        {/* Passive Signals */}
        <SectionTitle icon={Layers} title="PASSIVE SIGNAL SUMMARY" tag="Pilot" colors={colors} sectionColor={sectionColor} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { label: 'Typing Drift', value: report.passiveSignals.typingDrift },
            { label: 'Navigation Hesitation', value: report.passiveSignals.navigationHesitation },
            { label: 'Session Drop Rate', value: report.passiveSignals.sessionDropRate },
          ].map((s, i) => (
            <View key={i} style={styles.row}>
              <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>{s.label}</Text>
              <Text style={{ color: colors.textSecondary, fontWeight: '800' }}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Trajectory */}
        <SectionTitle icon={TrendingUp} title="TRAJECTORY" tag="Experimental" colors={colors} sectionColor={sectionColor} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>30-Day Projection</Text>
            <Text style={{ color: colors.primary, fontWeight: '900' }}>{report.trajectory.projected30d ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>90-Day Projection</Text>
            <Text style={{ color: colors.accent, fontWeight: '900' }}>{report.trajectory.projected90d ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>Classification</Text>
            <Text style={{ color: colors.text, fontWeight: '900' }}>{report.trajectory.classification}</Text>
          </View>
        </View>

        {/* Fairness */}
        <SectionTitle icon={Shield} title="FAIRNESS ADJUSTMENT" tag="Pilot" colors={colors} sectionColor={sectionColor} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>Adjustment Factor</Text>
            <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 16 }}>×{report.fairnessAdjustment}</Text>
          </View>
        </View>

        {/* Transfer / Life Impact */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12 }]}>
          <View style={styles.row}>
            <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>Real-Life Transfer Score</Text>
            <Text style={{ color: colors.transferPerformance > 50 ? colors.success : colors.warning, fontWeight: '900', fontSize: 16 }}>{report.transferPerformance}%</Text>
          </View>
        </View>

        {/* Share */}
        <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.primary }]} onPress={() => Alert.alert('Export', 'Clinical report ready for sharing with your healthcare professional.')}>
          <Share2 size={18} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '900', marginLeft: 10, fontSize: 14 }}>SHARE WITH CLINICIAN</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const SectionTitle = ({ icon: Icon, title, tag, colors, sectionColor }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon size={14} color={colors.textDisabled} />
      <Text style={[Typography.caption, { color: colors.textDisabled, marginLeft: 6 }]}>{title}</Text>
    </View>
    <View style={{ backgroundColor: sectionColor(tag) + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
      <Text style={{ color: sectionColor(tag), fontSize: 8, fontWeight: '900' }}>{tag.toUpperCase()}</Text>
    </View>
  </View>
);

const MetricBox = ({ label, value, color, colors }) => (
  <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
    <Text style={{ color, fontSize: 20, fontWeight: '900' }}>{value}</Text>
    <Text style={{ color: colors.textDisabled, fontSize: 8, fontWeight: '700', textAlign: 'center', marginTop: 4 }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  disclaimerTop: { flexDirection: 'row', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8, alignItems: 'center' },
  card: { padding: 16, borderRadius: 20, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  confRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  confBar: { width: 60, height: 6, borderRadius: 3, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 3 },
  shareBtn: { height: 52, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
});
export default ClinicalReportScreen;
