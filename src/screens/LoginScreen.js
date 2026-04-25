import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Brain, Mail, Lock, Sun, Moon, ShieldCheck, Activity } from 'lucide-react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { isDark, toggle, colors } = useTheme();
  const { setUser, data } = useData();

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Please enter your email';
    else if (!validateEmail(email)) errs.email = 'Please enter a valid email';
    if (!password) errs.password = 'Please enter your password';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      // Authenticate with Firebase
      const { initializeFirebase, FirebaseAuth } = require('../engine/FirebaseBackend');
      initializeFirebase();
      const result = await FirebaseAuth.signIn(email, password);

      if (!result.success) {
        setErrors({ email: result.error });
        setLoading(false);
        return;
      }

      // Set user locally with Firebase UID and route
      setUser({ email: email.toLowerCase(), name: email.split('@')[0], uid: result.user.uid });
      setLoading(false);
      navigation.replace('Splash');
    } catch (e) {
      setErrors({ email: e.message || 'Login failed' });
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">



          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Brain size={48} color={colors.primary} strokeWidth={1.5} />
              <View style={[styles.logoGlow, { backgroundColor: colors.glow }]} />
            </View>
            <Text style={[Typography.h1, { color: colors.text, marginTop: 24, fontSize: 36 }]}>COGNISCAN</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { borderColor: colors.primary }]}>
                <ShieldCheck size={12} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>SECURE</Text>
              </View>
              <View style={[styles.badge, { borderColor: colors.accent }]}>
                <Activity size={12} color={colors.accent} />
                <Text style={[styles.badgeText, { color: colors.accent }]}>REAL-TIME</Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>Email Address</Text>
              <View style={[styles.inputWrapper, { borderColor: errors.email ? colors.error : colors.border, backgroundColor: colors.surface }]}>
                <Mail size={18} color={colors.textDisabled} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textDisabled}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }}
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={[styles.errText, { color: colors.error }]}>{errors.email}</Text>}
            </View>

            <View style={[styles.inputGroup, { marginTop: 20 }]}>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>Password</Text>
              <View style={[styles.inputWrapper, { borderColor: errors.password ? colors.error : colors.border, backgroundColor: colors.surface }]}>
                <Lock size={18} color={colors.textDisabled} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textDisabled}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
                  secureTextEntry
                />
              </View>
              {errors.password && <Text style={[styles.errText, { color: colors.error }]}>{errors.password}</Text>}
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading ? 0.7 : 1 }]} 
              onPress={handleLogin} 
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.btnText}>SIGN IN</Text>
                  <View style={styles.btnGlow} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Don't have an account? </Text>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Create One</Text>
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
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, gap: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  errText: { fontSize: 11, marginTop: 6, fontWeight: '600', textTransform: 'uppercase' },
  primaryBtn: { height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 32, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 2, fontSize: 15 },
  btnGlow: { position: 'absolute', width: '100%', height: '100%', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  secondaryBtn: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});

export default LoginScreen;
