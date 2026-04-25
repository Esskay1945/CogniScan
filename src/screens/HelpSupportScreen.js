import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, HelpCircle, PhoneCall, MessageCircle, FileText, Users, AlertCircle, Info, Heart } from 'lucide-react-native';

const HelpSupportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data } = useData();

  const options = [
    { icon: MessageCircle, title: 'Explain My Results', desc: 'Get a plain-language breakdown of your latest cognitive scores', color: colors.primary, action: () => navigation.navigate('Main', { screen: 'InsightsTab' }) },
    { icon: FileText, title: 'View Clinical Report', desc: 'See your full structured report for sharing with professionals', color: colors.accent, action: () => navigation.navigate('ClinicalReport') },
    { icon: Users, title: 'Contact Caregiver', desc: data.caregiver?.linked ? `Reach out to your linked caregiver` : 'Link a caregiver in the Caregiver Dashboard', color: '#9B7BFF', action: () => navigation.navigate('CaregiverDashboard') },
    { icon: PhoneCall, title: 'Talk to Someone', desc: 'Connect with AASRA Helpline: 9820466726 (24/7)', color: colors.success, action: () => { Linking.openURL('tel:9820466726').catch(() => Alert.alert('Unable to open dialer', 'Please dial 9820466726 for AASRA Helpline (available 24/7).')); } },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>HELP &{'\n'}SUPPORT</Text>
          </View>
          <HelpCircle size={24} color={colors.primary} />
        </View>

        {/* Reassurance Banner */}
        <View style={[styles.banner, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
          <Heart size={24} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>You're Not Alone</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 18 }}>
              Whenever you need help understanding your results or just want to talk, we're here. Your well-being matters most.
            </Text>
          </View>
        </View>

        {/* Support Options */}
        {options.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <TouchableOpacity key={i} style={[styles.optCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={opt.action} activeOpacity={opt.action ? 0.7 : 1}>
              <View style={[styles.optIcon, { backgroundColor: opt.color + '15' }]}><Icon size={22} color={opt.color} /></View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{opt.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3, lineHeight: 18 }}>{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Emergency */}
        <View style={[styles.emergencyCard, { backgroundColor: colors.error + '08', borderColor: colors.error + '25' }]}>
          <AlertCircle size={20} color={colors.error} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: colors.error, fontWeight: '800', fontSize: 14 }}>Need Immediate Help?</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 18 }}>
              If you or someone you know is in crisis, please call AASRA at 9820466726 or Vandrevala Foundation at 1860-2662-345 (24/7, free).
            </Text>
          </View>
        </View>

        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceElevated || colors.surface }]}>
          <Info size={14} color={colors.textDisabled} />
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 8, flex: 1 }}>
            CogniScan is not a substitute for professional medical advice. Always consult a healthcare professional for clinical concerns.
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
  banner: { flexDirection: 'row', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 24, alignItems: 'center' },
  optCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, borderWidth: 1, marginBottom: 10 },
  optIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  emergencyCard: { flexDirection: 'row', padding: 18, borderRadius: 20, borderWidth: 1, marginTop: 16, alignItems: 'center' },
  disclaimer: { padding: 14, borderRadius: 12, flexDirection: 'row', marginTop: 20 },
});
export default HelpSupportScreen;
