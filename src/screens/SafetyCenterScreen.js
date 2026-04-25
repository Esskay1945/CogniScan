import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { Typography } from '../theme';
import { ChevronLeft, Shield, ShieldAlert, Eye, Lock, Phone, UserCheck, Volume2, ZoomIn, Hand, AlertTriangle, Info, Settings } from 'lucide-react-native';

const SafetyCenterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, toggleProtectedMode, toggleCareMode, toggleLockdown, persist } = useData();
  const { prefs } = useAdaptiveUI();

  const scam = data.scamProtection || {};
  const care = data.careMode || {};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>SAFETY &{'\n'}CARE CENTER</Text>
          </View>
          <Shield size={24} color={colors.primary} />
        </View>

        {/* Care Mode Toggle */}
        <View style={[styles.card, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '30' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Hand size={22} color={colors.primary} />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Care Mode</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Larger buttons, simpler UI, voice guidance</Text>
              </View>
            </View>
            <Switch value={care.enabled} onValueChange={toggleCareMode} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFF" />
          </View>
          {care.enabled && (
            <View style={[styles.subCard, { backgroundColor: colors.background, marginTop: 14 }]}>
              <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>CARE MODE FEATURES</Text>
              {['✓ Large tap targets', '✓ One-task-per-screen', '✓ Simplified navigation', '✓ Font scale × 1.4'].map(f => (
                <Text key={f} style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{f}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Protected Mode */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <ShieldAlert size={22} color={colors.warning} />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>Protected Mode</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Warns you about suspicious activity</Text>
              </View>
            </View>
            <Switch value={scam.protectedMode} onValueChange={(val) => {
              toggleProtectedMode(val);
              Alert.alert(val ? 'Protected Mode ON' : 'Protected Mode OFF', 
                val ? 'You will be warned about suspicious links and unknown contacts.' : 'Protection warnings have been turned off.');
            }} trackColor={{ false: colors.border, true: colors.warning }} thumbColor="#FFF" />
          </View>
          {scam.protectedMode && (
            <View style={[styles.subCard, { backgroundColor: colors.background, marginTop: 14 }]}>
              <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>PROTECTION FEATURES</Text>
              {['✓ Warns about unknown contacts', '✓ Flags suspicious links', '✓ Logs risky actions for review'].map(f => (
                <Text key={f} style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{f}</Text>
              ))}
            </View>
          )}
          {scam.riskyActionCount > 0 && (
            <View style={[styles.alertRow, { backgroundColor: colors.error + '10', marginTop: 12 }]}>
              <AlertTriangle size={14} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: 11, fontWeight: '700', marginLeft: 8 }}>{scam.riskyActionCount} risky action(s) detected</Text>
            </View>
          )}
        </View>

        {/* Lockdown Mode */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Lock size={22} color={colors.error} />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>Lockdown Mode</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Restrict to essential features only</Text>
              </View>
            </View>
            <Switch value={care.lockdown} onValueChange={(val) => {
              toggleLockdown(val);
              Alert.alert(val ? 'Lockdown Mode ON' : 'Lockdown Mode OFF',
                val ? 'Only essential features (Dashboard, Tests, Safety) are accessible. Advanced settings are locked.' : 'All features are now accessible again.');
            }} trackColor={{ false: colors.border, true: colors.error }} thumbColor="#FFF" />
          </View>
          {care.lockdown && (
            <View style={[styles.subCard, { backgroundColor: colors.error + '08', marginTop: 14 }]}>
              <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>LOCKDOWN ACTIVE</Text>
              {['✓ Only Dashboard, Tests & Safety accessible', '✓ Data export & deletion locked', '✓ Settings changes require confirmation'].map(f => (
                <Text key={f} style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{f}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Quick Links */}
        <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 24, marginBottom: 12 }]}>SAFETY TOOLS</Text>
        {[
          { icon: Phone, title: 'Known Contacts', desc: `${(scam.knownContacts || []).length} contacts saved`, color: colors.success, 
            action: () => Alert.alert('Known Contacts', `You have ${(scam.knownContacts || []).length} trusted contacts saved. Add more from your phone contacts to help CogniScan identify safe callers.`) },
          { icon: Eye, title: 'Accessibility Settings', desc: 'Font size, voice, contrast', color: colors.primary, 
            action: () => navigation.navigate('AccessibilitySetup') },
          { icon: Volume2, title: 'Voice Guidance', desc: prefs.voiceGuidance ? 'Enabled — tap to turn off' : 'Disabled — tap to turn on', color: colors.accent, 
            action: () => {
              const newVal = !prefs.voiceGuidance;
              persist({ ...data, adaptivePrefs: { ...data.adaptivePrefs, voiceGuidance: newVal } });
              Alert.alert('Voice Guidance', newVal ? 'Voice guidance is now ON. The app will read instructions aloud.' : 'Voice guidance is now OFF.');
            }},
          { icon: UserCheck, title: 'Caregiver Settings', desc: data.caregiver?.linked ? 'Linked' : 'Not linked — tap to set up', color: '#9B7BFF', 
            action: () => navigation.navigate('CaregiverDashboard') },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity key={i} style={[styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={item.action}>
              <View style={[styles.linkIcon, { backgroundColor: item.color + '15' }]}><Icon size={18} color={item.color} /></View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{item.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceElevated || colors.surface }]}>
          <Info size={14} color={colors.textDisabled} />
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 8, flex: 1, lineHeight: 16 }}>
            Safety features are designed to protect vulnerable users. Care Mode and Protected Mode can be configured remotely by linked caregivers.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  subCard: { padding: 14, borderRadius: 14 },
  alertRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12 },
  linkCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 8 },
  linkIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  disclaimer: { padding: 14, borderRadius: 12, flexDirection: 'row', marginTop: 24 },
});
export default SafetyCenterScreen;
