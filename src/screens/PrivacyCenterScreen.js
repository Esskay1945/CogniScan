import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { 
    ShieldCheck, Lock, Eye, Trash2, Download, 
    FileKey, Bell, ChevronRight, Info, Fingerprint, ChevronLeft
} from 'lucide-react-native';

const PrivacyCenterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, persist, logSecurityEvent } = useData();
  const [biometrics, setBiometrics] = useState(data.security.biometricsActive);

  const toggleBiometrics = (val) => {
    setBiometrics(val);
    persist({ ...data, security: { ...data.security, biometricsActive: val } });
    logSecurityEvent('SECURITY_SETTING_CHANGED', { biometrics: val });
  };

  const menuItems = [
    { 
        title: 'Who Can See My Data', 
        desc: 'Review how your data is organized and stored.', 
        icon: Eye, 
        color: colors.primary 
    },
    { 
        title: 'Authorized Caregivers', 
        desc: 'Manage who in your family can see your health alerts.', 
        icon: Bell, 
        color: colors.accent 
    },
    { 
        title: 'Doctor Access', 
        desc: 'Create a secure link to share results with your doctor.', 
        icon: FileKey, 
        color: colors.success 
    },
    { 
        title: 'Export My Data', 
        desc: 'Download all your results in a file.', 
        icon: Download, 
        color: colors.textSecondary 
    },
    { 
        title: 'Permanent Data Erasure', 
        desc: 'Permanently delete all your data. This cannot be undone.', 
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
                Your data is protected and fully under your control.
            </Text>
        </View>

        {/* Biometric Toggle */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                <Fingerprint size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Biometric Re-Auth</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Require FaceID for sensitive reports</Text>
            </View>
            <Switch 
                value={biometrics} 
                onValueChange={toggleBiometrics}
                trackColor={{ false: colors.border, true: colors.primary }}
            />
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
                <TouchableOpacity key={i} style={[styles.menuItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                        if (item.title === 'Permanent Data Erasure') {
                            Alert.alert('Delete All Data?', 'This will permanently erase all your data. This cannot be undone.', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => {
                                    persist({ ...data, sessions: [], gameHistory: [], assessmentCompleted: false, questionnaireCompleted: false });
                                    logSecurityEvent('DATA_ERASED', { method: 'user_request' });
                                    Alert.alert('Done', 'All your data has been erased.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
                                }}
                            ]);
                        } else if (item.title === 'Export My Data') {
                            Alert.alert('Export Ready', 'Go to your Profile and tap "Download My Report" to save a full copy of your data.');
                        } else if (item.title === 'Authorized Caregivers') {
                            navigation.navigate('CaregiverDashboard');
                        } else if (item.title === 'Doctor Access') {
                            navigation.navigate('ClinicalReport');
                        } else {
                            Alert.alert(item.title, 'Your data is stored only on this device. We never share it without your permission. All data is protected.');
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
