import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain, Mail, Lock, Sun, Moon, ShieldCheck, Activity } from 'lucide-react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { isDark, toggle, colors } = useTheme();
  const { setUser } = useData();

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Identifier required';
    else if (!validateEmail(email)) errs.email = 'Invalid diagnostic mail';
    if (!password) errs.password = 'Auth code required';
    else if (password.length < 8) errs.password = 'Security protocol: 8+ chars';
    
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setUser({ email, name: email.split('@')[0] });
    navigation.replace('Main');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.themeBtn} onPress={toggle}>
            <View style={[styles.statusIndicator, { backgroundColor: Colors.dark.success }]} />
            <Text style={[Typography.caption, { color: Colors.dark.textSecondary, marginLeft: 8 }]}>SYSTEM ACTIVE</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Brain size={48} color={Colors.dark.primary} strokeWidth={1.5} />
              <View style={[styles.logoGlow, { backgroundColor: Colors.dark.glow }]} />
            </View>
            <Text style={[Typography.h1, { color: Colors.dark.text, marginTop: 24, fontSize: 36 }]}>COGNISCAN</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { borderColor: Colors.dark.primary }]}>
                <ShieldCheck size={12} color={Colors.dark.primary} />
                <Text style={[styles.badgeText, { color: Colors.dark.primary }]}>SECURE</Text>
              </View>
              <View style={[styles.badge, { borderColor: Colors.dark.accent }]}>
                <Activity size={12} color={colors.accent} />
                <Text style={[styles.badgeText, { color: colors.accent }]}>REAL-TIME</Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[Typography.caption, { color: Colors.dark.textSecondary, marginBottom: 8 }]}>Diagnostics Identity</Text>
              <View style={[styles.inputWrapper, { borderColor: errors.email ? colors.error : Colors.dark.border, backgroundColor: Colors.dark.surface }]}>
                <Mail size={18} color={Colors.dark.textDisabled} />
                <TextInput
                  style={[styles.input, { color: Colors.dark.text }]}
                  placeholder="diagnostics@cogniscan.ai"
                  placeholderTextColor={Colors.dark.textDisabled}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }}
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={[styles.errText, { color: colors.error }]}>{errors.email}</Text>}
            </View>

            <View style={[styles.inputGroup, { marginTop: 20 }]}>
              <Text style={[Typography.caption, { color: Colors.dark.textSecondary, marginBottom: 8 }]}>Security Protocol</Text>
              <View style={[styles.inputWrapper, { borderColor: errors.password ? colors.error : Colors.dark.border, backgroundColor: Colors.dark.surface }]}>
                <Lock size={18} color={Colors.dark.textDisabled} />
                <TextInput
                  style={[styles.input, { color: Colors.dark.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.dark.textDisabled}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
                  secureTextEntry
                />
              </View>
              {errors.password && <Text style={[styles.errText, { color: colors.error }]}>{errors.password}</Text>}
            </View>

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Colors.dark.primary, shadowColor: Colors.dark.primary }]} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.btnText}>INITIALIZE INTERFACE</Text>
              <View style={styles.btnGlow} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: Colors.dark.textSecondary, fontSize: 13 }}>Identity missing? </Text>
              <Text style={{ color: Colors.dark.primary, fontWeight: '700', fontSize: 13 }}>GENERATE PROFILE</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 32 },
  themeBtn: { position: 'absolute', top: 50, right: 32, flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  header: { alignItems: 'center', marginBottom: 60 },
  logoContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  logoGlow: { position: 'absolute', width: 60, height: 60, borderRadius: 30, zIndex: -1, opacity: 0.5 },
  badgeRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, gap: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  form: { width: '100%' },
  inputGroup: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, gap: 12, backgroundColor: Colors.dark.surface },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  errText: { fontSize: 11, marginTop: 6, fontWeight: '600', textTransform: 'uppercase' },
  primaryBtn: { height: 60, borderRadius: 12, backgroundColor: Colors.dark.primary, justifyContent: 'center', alignItems: 'center', marginTop: 32, shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 2, fontSize: 15 },
  btnGlow: { position: 'absolute', width: '100%', height: '100%', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  secondaryBtn: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});

export default LoginScreen;
