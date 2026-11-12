import React, { useState } from 'react';
import { registerTrainingReminder, removeReminderRegistration } from '../engine/PushNotifications';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { AdaptiveText as Text, AccessibleTouchable as TouchableOpacity } from '../components/AccessibilityProvider';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { 
    ShieldCheck, Lock, Eye, Trash2, Download, 
    FileKey, Bell, ChevronRight, Info, Fingerprint, ChevronLeft
} from 'lucide-react-native';

const PrivacyCenterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, eraseProgress } = useData();
  const [busy, setBusy] = useState(false);
  const run = async action => {
    setBusy(true);
    try { await action(); }
    catch (error) { Alert.alert('Action failed', error.message || 'Please try again.'); }
    finally { setBusy(false); }
  };

  const menuItems = [
    { 
        title: 'Who Can See My Data', 
        desc: 'Review how your data is organized and stored.', 
        icon: Eye, 
        color: colors.primary 
    },
    { 
        title: 'Enable Training Reminder',
        desc: 'Receive one generic Android reminder each day at 7 pm.',
        icon: Bell,
        color: colors.accent
    },
    {
        title: 'Disable Training Reminder',
        desc: 'Stop reminders on this device.',
        icon: Bell,
        color: colors.textSecondary
    },
    {
        title: 'Permanent Data Erasure', 
        desc: 'Delete your CogniScan progress from this device and your account.',
        icon: Trash2, 
        color: colors.error 
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
            <ShieldCheck size={32} color={colors.success} />
            <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>PRIVACY{'\n'}SETTINGS</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>
                Progress syncs to your signed-in CogniScan account.
            </Text>
        </View>

        {/* Data Access Logs */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>SECURITY STATUS</Text>
            <View style={[styles.auditCard, { backgroundColor: colors.surfaceElevated }]}>
                {(data.security.auditLogs || []).slice(0, 3).map(log => (
                    <View key={log.id} style={styles.logItem}>
                        <View style={[styles.logDot, { backgroundColor: log.eventType.includes('ACCESS') ? colors.error : colors.success }]} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{log.eventType.replace(/_/g, ' ')}</Text>
                            <Text style={{ color: colors.textDisabled, fontSize: 10 }}>{new Date(log.timestamp).toLocaleString()}</Text>
                        </View>
                    </View>
                ))}
                {(!data.security.auditLogs || data.security.auditLogs.length === 0) && (
                    <Text style={{ color: colors.textDisabled, fontSize: 11, textAlign: 'center' }}>No security events logged in last 30 days.</Text>
                )}
            </View>
        </View>

        {/* Action Menu */}
        <View style={styles.section}>
            <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12 }]}>YOUR DATA CONTROLS</Text>
            {menuItems.map((item, i) => (
                <TouchableOpacity key={i} disabled={busy} style={[styles.menuItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                        if (item.title === 'Permanent Data Erasure') {
                            Alert.alert('Erase CogniScan progress?', 'This removes your progress. Your login remains available.', [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Erase', style: 'destructive', onPress: () => run(async () => {
                                await eraseProgress();
                                navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
                              }) },
                            ]);
                        } else if (item.title === 'Enable Training Reminder') {
                            run(async () => {
                              await registerTrainingReminder(data.user.uid);
                              Alert.alert('Reminder enabled', 'You will receive a daily training reminder on this device.');
                            });
                        } else if (item.title === 'Disable Training Reminder') {
                            run(async () => {
                              await removeReminderRegistration(data.user.uid);
                              Alert.alert('Reminder disabled');
                            });
                        } else {
                            Alert.alert(item.title, 'Your progress is linked to your own CogniScan account. The mobile app keeps an encrypted device copy for recovery when offline.');
                        }
                    }}
                >
                    <View style={[styles.smallIconBox, { backgroundColor: item.color + '10' }]}>
                        <item.icon size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{item.title}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{item.desc}</Text>
                    </View>
                    <ChevronRight size={16} color={colors.textDisabled} />
                </TouchableOpacity>
            ))}
        </View>

        <View style={[styles.safetyNotice, { borderColor: colors.warning + '30' }]}>
            <Info size={16} color={colors.warning} />
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 12, flex: 1, lineHeight: 18 }}>
                Emergency Clinical Red-Flag detection is always active. If stroke or seizure patterns are detected, the system will provide immediate guidance regardless of privacy level.
            </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  section: { marginTop: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1.5 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  auditCard: { padding: 20, borderRadius: 24, gap: 16 },
  logItem: { flexDirection: 'row', alignItems: 'center' },
  logDot: { width: 6, height: 6, borderRadius: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  smallIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  safetyNotice: { flexDirection: 'row', padding: 18, borderRadius: 20, borderWidth: 1.5, marginTop: 40, borderStyle: 'dotted' },
});

export default PrivacyCenterScreen;
