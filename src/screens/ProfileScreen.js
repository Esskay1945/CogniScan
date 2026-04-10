import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { 
  UserCircle2, 
  ChevronRight,
  ShieldCheck, 
  RotateCcw,
  Shield, 
  Cpu,
  Zap
} from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
  const { isDark, toggle, colors } = useTheme();
  const { data, logout } = useData();

  const handleLogout = () => {
    Alert.alert(
      'SYSTEM TERMINATION',
      'Are you sure you want to terminate the current session? Local diagnostic baseline will be preserved.',
      [
        { text: 'ABORT', style: 'cancel' },
        { text: 'TERMINATE', style: 'destructive', onPress: () => { logout(); navigation.replace('Login'); } },
      ]
    );
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, color = Colors.dark.primary }) => (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }]} onPress={onPress}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ color: Colors.dark.text, fontWeight: '700', fontSize: 15 }}>{title}</Text>
        <Text style={{ color: Colors.dark.textSecondary, fontSize: 11, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={Colors.dark.textDisabled} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <UserCircle2 size={80} color={Colors.dark.primary} strokeWidth={1} />
            <View style={styles.onlineDot} />
          </View>
          <Text style={[Typography.h1, { color: Colors.dark.text, marginTop: 16 }]}>
            {data.user?.name?.toUpperCase() || 'USER_ALPHA'}
          </Text>
          <Text style={{ color: Colors.dark.textSecondary, fontSize: 13, marginTop: 4 }}>{data.user?.email || 'unlinked_profile'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.dark.surface }]}>
            <Text style={{ color: Colors.dark.primary, fontWeight: '900', fontSize: 20 }}>{data.sessions.length}</Text>
            <Text style={[Typography.caption, { color: Colors.dark.textSecondary, fontSize: 9, marginTop: 4 }]}>SCANS</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.dark.surface }]}>
            <Text style={{ color: colors.accent, fontWeight: '900', fontSize: 20 }}>{data.streak || 0}</Text>
            <Text style={[Typography.caption, { color: Colors.dark.textSecondary, fontSize: 9, marginTop: 4 }]}>STREAK</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.dark.surface }]}>
            <Text style={{ color: colors.success, fontWeight: '900', fontSize: 20 }}>1.0</Text>
            <Text style={[Typography.caption, { color: Colors.dark.textSecondary, fontSize: 9, marginTop: 4 }]}>VER.</Text>
          </View>
        </View>

        <Text style={[Typography.caption, { color: Colors.dark.textDisabled, marginBottom: 12, marginTop: 24 }]}>NODE CONFIGURATION</Text>
        <MenuItem 
          icon={Shield} 
          title="Diagnostic Export" 
          subtitle="Generate PDF report for medical review"
          onPress={() => Alert.alert('GENERATE REPORT', 'Compiling longitudinal data into medical format...')}
        />
        <MenuItem 
          icon={Zap} 
          title="Family Link" 
          subtitle="Sync with secondary observers"
          color={colors.accent}
          onPress={() => Alert.alert('FAMILY LINK', 'Secure link generation active. Waiting for handoff...')}
        />
        <MenuItem 
          icon={Cpu} 
          title="Security Protocols" 
          subtitle="Manage encryption and access logs"
          onPress={() => {}}
        />

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <RotateCcw size={20} color={colors.error} />
          <Text style={{ color: colors.error, fontWeight: '900', fontSize: 13, marginLeft: 12, letterSpacing: 1.5 }}>
            TERMINATE SESSION
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
  onlineDot: { position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.dark.success, borderWidth: 2, borderColor: Colors.dark.background },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.error + '40', marginTop: 24 },
});

export default ProfileScreen;
