import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Activity, Flame, Users, Clock, Info, Bell } from 'lucide-react-native';

const CaregiverDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { getCaregiverData, data } = useData();
  const cg = getCaregiverData();

  const getSeverityColor = (s) => s === 'high' ? colors.error : s === 'moderate' ? colors.warning : colors.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>CAREGIVER{'\n'}DASHBOARD</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Limited view — no raw cognitive data exposed</Text>
          </View>
          <Users size={24} color={colors.primary} />
        </View>

        {/* Safety Banner */}
        <View style={[styles.safety, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
          <ShieldCheck size={18} color={colors.success} />
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 12, flex: 1 }}>
            Caregivers can see summaries and alerts only. No raw data is accessible.
          </Text>
        </View>

        {/* Status Overview */}
        <View style={styles.section}>
          <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>OVERALL STATUS</Text>
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: cg.overallTrend === 'stable' ? colors.success : colors.warning }]}>
            <View style={styles.statusRow}>
              {cg.overallTrend === 'stable' 
                ? <TrendingUp size={28} color={colors.success} />
                : <TrendingDown size={28} color={colors.warning} />}
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '900', fontSize: 20 }}>{cg.overallTrend === 'stable' ? 'STABLE' : 'NEEDS ATTENTION'}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>Current recommended pathway: {cg.pathway}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Activity size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 22, marginTop: 4 }}>{cg.sessionsTotal}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '700' }}>SESSIONS</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Flame size={18} color={colors.warning} />
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 22, marginTop: 4 }}>{cg.streak}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '700' }}>STREAK</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Clock size={18} color={colors.accent} />
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 22, marginTop: 4 }}>{cg.gamesPlayed}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '700' }}>GAMES</Text>
          </View>
        </View>

        {/* Last Activity */}
        <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 12 }}>
            Last activity: {cg.lastActivity ? new Date(cg.lastActivity).toLocaleDateString() : 'No sessions yet'}
          </Text>
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>ACTIVE ALERTS</Text>
          {cg.alerts.length > 0 ? cg.alerts.map((alert, i) => (
            <View key={i} style={[styles.alertCard, { backgroundColor: getSeverityColor(alert.severity) + '08', borderColor: getSeverityColor(alert.severity) + '30' }]}>
              <AlertTriangle size={18} color={getSeverityColor(alert.severity)} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{alert.type}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{alert.message}</Text>
              </View>
            </View>
          )) : (
            <View style={[styles.emptyAlert, { backgroundColor: colors.surface }]}>
              <Bell size={24} color={colors.textDisabled} />
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>No active alerts. The user is on track.</Text>
            </View>
          )}
        </View>

        {/* Observer Input */}
        <View style={styles.section}>
          <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>OBSERVER NOTES</Text>
          <TouchableOpacity style={[styles.observerBtn, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>+ Add Observer Observation</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>Report behavioral changes you've noticed</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceElevated }]}>
          <Info size={14} color={colors.textDisabled} />
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 8, flex: 1, lineHeight: 16 }}>
            This dashboard provides limited cognitive health summaries. For detailed reports, the user must grant explicit L3 access. CogniScan does not diagnose medical conditions.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  safety: { flexDirection: 'row', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 24, alignItems: 'center' },
  section: { marginBottom: 24 },
  statusCard: { padding: 20, borderRadius: 24, borderWidth: 1.5, borderLeftWidth: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  activityCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  alertCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
  emptyAlert: { padding: 32, borderRadius: 20, alignItems: 'center' },
  observerBtn: { padding: 20, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  disclaimer: { padding: 14, borderRadius: 12, flexDirection: 'row', marginTop: 16 },
});

export default CaregiverDashboardScreen;
