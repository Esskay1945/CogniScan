import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { ShieldCheck, Database, UserPlus, Lock, RefreshCcw } from 'lucide-react-native';

const ReConsentModal = ({ visible, onDismiss }) => {
  const { colors } = useTheme();
  const { data, updateConsent } = useData();
  const [flags, setFlags] = React.useState({
    passiveTracking: data.consent.passiveTracking,
    caregiverSharing: data.consent.caregiverSharing,
    researchData: data.consent.researchData,
  });

  const handleConfirm = () => {
    updateConsent(flags);
    onDismiss();
  };

  const handleWithdraw = () => {
    updateConsent({ passiveTracking: false, caregiverSharing: false, researchData: false });
    onDismiss();
  };

  const ConsentItem = ({ id, title, desc, icon: Icon }) => (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Icon size={18} color={colors.primary} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{desc}</Text>
      </View>
      <Switch
        value={flags[id]}
        onValueChange={(val) => setFlags({...flags, [id]: val})}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFF"
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.iconRow}>
              <RefreshCcw size={28} color={colors.warning} />
            </View>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 20, textAlign: 'center', marginTop: 16 }}>
              CONSENT RENEWAL
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
              Your consent preferences expire every 30 days for your protection. Please review and confirm your choices.
            </Text>

            <ConsentItem id="passiveTracking" title="Passive Signal Analysis" desc="Background typing & navigation tracking" icon={Database} />
            <ConsentItem id="caregiverSharing" title="Caregiver Proxy" desc="Allow family to receive drift alerts" icon={UserPlus} />
            <ConsentItem id="researchData" title="Anonymized Research" desc="Contribute pseudonymized data to research" icon={Lock} />

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
              <ShieldCheck size={20} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14, marginLeft: 10 }}>CONFIRM CONSENT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
              <Text style={{ color: colors.error, fontWeight: '700', fontSize: 13 }}>Withdraw All Consent</Text>
            </TouchableOpacity>

            <Text style={{ color: colors.textDisabled, fontSize: 9, textAlign: 'center', marginTop: 16 }}>
              Module 6 Advanced: Re-consent required every 30 days for sensitive data processing.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: 44, maxHeight: '85%' },
  iconRow: { alignItems: 'center', marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
  confirmBtn: { height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  withdrawBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
});

export default ReConsentModal;
