import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { Lock, Fingerprint, Key, ChevronRight, ShieldAlert } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const IdentityReAuthScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { confirmSecurityAuth, logSecurityEvent } = useData();
  const { onSucess, target } = route.params || {};

  const handleAuth = () => {
    confirmSecurityAuth();
    logSecurityEvent('SECURITY_AUTH_SUCCESS', { target });
    navigation.goBack();
    if (onSucess) onSucess();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.shieldBox, { backgroundColor: colors.primary + '10' }]}>
            <Lock size={40} color={colors.primary} />
        </View>
        <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: 32 }]}>SECURITY{'\n'}VERIFICATION</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 32 }}>
            Accessing <Text style={{ color: colors.primary, fontWeight: '800' }}>LEVEL 3 SENSITIVE DATA</Text>. Please verify your identity to continue.
        </Text>

        <TouchableOpacity style={[styles.authBtn, { backgroundColor: colors.primary }]} onPress={handleAuth}>
            <Fingerprint size={24} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16, marginLeft: 16 }}>VERIFY IDENTITY</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.passcodeBtn} onPress={handleAuth}>
            <Key size={18} color={colors.textDisabled} />
            <Text style={{ color: colors.textDisabled, fontWeight: '700', fontSize: 14, marginLeft: 12 }}>USE SECURE PASSCODE</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.disclaimer, { backgroundColor: colors.surface }]}>
        <ShieldAlert size={16} color={colors.textDisabled} />
        <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 12, flex: 1 }}>
            Your data is kept safe on your device. No personal information leaves this device.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  content: { alignItems: 'center', marginBottom: 60 },
  shieldBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  authBtn: { height: 64, width: '100%', borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 48 },
  passcodeBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 24, padding: 12 },
  disclaimer: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, position: 'absolute', bottom: 40, left: 24, right: 24 },
});

export default IdentityReAuthScreen;
