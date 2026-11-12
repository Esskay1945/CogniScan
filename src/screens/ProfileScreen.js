import * as LocalAuthentication from 'expo-local-authentication';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { 
  UserCircle2, 
  ChevronRight,
  ShieldCheck, 
  RotateCcw,
  FileText,
  Download,
  Sun,
  Moon,
  Pill,
  Heart,
  Shield,
  HelpCircle,
  Activity,
  BarChart3,
  Brain,
  Eye,
  Type,
} from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
  const { isDark, toggle, colors } = useTheme();
  const { data, logout, getLatestSession, getDrift } = useData();
  const [generating, setGenerating] = useState(false);
  const latest = getLatestSession();
  const drift = getDrift();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout().catch(() => Alert.alert('Sign-out failed', 'Please try again.')) },
      ]
    );
  };

  const generateReport = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Download unavailable', 'Use the mobile app to download a report.');
      return;
    }
    setGenerating(true);
    let temporaryFile;
    try {
      const auth = await LocalAuthentication.authenticateAsync({ promptMessage: 'Verify identity to share your report' });
      if (!auth.success) return;
      if (!(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable.');

      const domainScores = Object.entries(latest?.domainScores || {}).map(([domain, score]) => `${domain}: ${score}%`);
      const reportContent = [
        'COGNISCAN ACTIVITY REPORT',
        `Generated: ${new Date().toLocaleString()}`,
        `Name: ${data.user?.name || 'Unknown'}`,
        `Completed assessments: ${data.sessions.length}`,
        `Latest task score: ${latest?.overall == null ? 'Unavailable' : latest.overall + '%'}`,
        `Words recalled: ${latest?.recallScore == null ? 'Unavailable' : latest.recallScore + ' / 3'}`,
        ...domainScores,
        '',
        'These scores summarize performance on CogniScan activities.',
      ].join('\n');

      temporaryFile = `${FileSystem.cacheDirectory}cogniscan-report-${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(temporaryFile, reportContent);
      await Sharing.shareAsync(temporaryFile, { mimeType: 'text/plain', dialogTitle: 'CogniScan activity report', UTI: 'public.plain-text' });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report. Please try again.');
      console.error('Report generation error:', error);
    } finally {
      if (temporaryFile) await FileSystem.deleteAsync(temporaryFile, { idempotent: true }).catch(() => {});
      setGenerating(false);
    }
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, color = colors.primary, loading = false }) => (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} disabled={loading}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
          {loading ? 'Generating report...' : subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.textDisabled} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <UserCircle2 size={80} color={colors.primary} strokeWidth={1} />
            <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.background }]} />
          </View>
          <Text style={[Typography.h1, { color: colors.text, marginTop: 16 }]}>
            {data.user?.name?.toUpperCase() || 'USER_ALPHA'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>{data.user?.email || 'unlinked_profile'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 20 }}>{data.sessions.length}</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, fontSize: 9, marginTop: 4 }]}>SCANS</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.accent, fontWeight: '900', fontSize: 20 }}>{data.streak || 0}</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, fontSize: 9, marginTop: 4 }]}>STREAK</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.success, fontWeight: '900', fontSize: 20 }}>2.0</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, fontSize: 9, marginTop: 4 }]}>VER.</Text>
          </View>
        </View>

        <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12, marginTop: 24 }]}>SETTINGS</Text>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={toggle}>
          <View style={[styles.iconWrapper, { backgroundColor: (isDark ? '#FFD600' : '#1A237E') + '15' }]}>
            {isDark ? <Sun size={20} color="#FFD600" /> : <Moon size={20} color="#1A237E" />}
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Theme Mode</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{isDark ? 'Dark Mode Active' : 'Light Mode Active'}</Text>
          </View>
          <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.primary + '15' }]}>
            <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 10 }}>{isDark ? 'DARK' : 'LIGHT'}</Text>
          </View>
        </TouchableOpacity>
        <MenuItem 
          icon={FileText} 
          title="Download My Report" 
          subtitle="Save your results as a text file"
          color={colors.primary}
          onPress={generateReport}
          loading={generating}
        />
        <MenuItem 
          icon={ShieldCheck} 
          title="Privacy Settings" 
          subtitle="Manage your data and what you share"
          color={colors.success}
          onPress={() => navigation.navigate('PrivacyCenter')}
        />
        <MenuItem 
          icon={Eye} 
          title="Accessibility Settings" 
          subtitle="Bigger text, simpler view, read aloud"
          color="#00BFA5"
          onPress={() => navigation.navigate('AccessibilitySetup')}
        />
        <MenuItem 
          icon={Type} 
          title="Text Size" 
          subtitle="Adjust how big text appears"
          color="#FF9800"
          onPress={() => navigation.navigate('FontSize')}
        />

        <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12, marginTop: 16 }]}>CARE & SAFETY</Text>
        <MenuItem 
          icon={Heart} 
          title="Daily Check-In" 
          subtitle="How are you feeling today?"
          color={colors.error}
          onPress={() => navigation.navigate('DailyCheckIn')}
        />
        <MenuItem 
          icon={Pill} 
          title="Medication Tracker" 
          subtitle={`Adherence: ${data.medication?.adherenceScore ?? 100}%`}
          color="#FF6B35"
          onPress={() => navigation.navigate('Medication')}
        />
        <MenuItem 
          icon={Shield} 
          title="Safety & Care Center" 
          subtitle="Care Mode · Protected Mode · Lockdown"
          color={colors.warning}
          onPress={() => navigation.navigate('SafetyCenter')}
        />
        <MenuItem 
          icon={HelpCircle} 
          title="Help & Support" 
          subtitle="Get help understanding your results"
          color="#9B7BFF"
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <MenuItem 
          icon={Activity} 
          title="Life Impact Tracking" 
          subtitle={`Impact Score: ${data.outcomes?.lifeImpactScore ?? 0}%`}
          color={colors.accent}
          onPress={() => navigation.navigate('OutcomeTracking')}
        />

        <Text style={[Typography.caption, { color: colors.textDisabled, marginBottom: 12, marginTop: 16 }]}>ADVANCED</Text>
        <MenuItem 
          icon={Brain} 
          title="Detailed Analysis" 
          subtitle="Score trends and fairness checks"
          color={colors.primary}
          onPress={() => navigation.navigate('Psychometrics')}
        />
        <MenuItem 
          icon={BarChart3} 
          title="Full Report for Doctor" 
          subtitle="A detailed report to share with your doctor"
          color={colors.success}
          onPress={() => navigation.navigate('ClinicalReport')}
        />

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error + '40' }]} onPress={handleLogout}>
          <RotateCcw size={20} color={colors.error} />
          <Text style={{ color: colors.error, fontWeight: '900', fontSize: 13, marginLeft: 12, letterSpacing: 1.5 }}>
            SIGN OUT
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatarWrapper: { position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 16, borderWidth: 1, marginTop: 24 },
});

export default ProfileScreen;
