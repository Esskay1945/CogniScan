import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Typography, Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-5
};

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const strengthColors = ['#FF5252', '#FF5252', '#FBBF24', '#FBBF24', '#22C55E', '#22C55E'];

const RegisterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { setUser } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const strength = getStrength(password);

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Minimum 8 characters';
    if (!age.trim()) errs.age = 'Age is required';
    else if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) errs.age = 'Enter a valid age';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      // 1. Create account in Firebase Auth
      const { initializeFirebase, FirebaseAuth } = require('../engine/FirebaseBackend');
      initializeFirebase();
      const result = await FirebaseAuth.signUp(email, password);

      if (!result.success) {
        setErrors({ email: result.error });
        setLoading(false);
        return;
      }

      const ageNum = Number(age);
      let ageBand = '18-35';
      if (ageNum > 70) ageBand = '70+';
      else if (ageNum > 55) ageBand = '55-70';
      else if (ageNum > 35) ageBand = '36-55';

      // 2. Save locally with Firebase UID
      setUser({ 
        name, 
        email: email.toLowerCase(), 
        age: ageNum,
        uid: result.user.uid,
        onboarding: { ageBand, completed: false } 
      });
      
      setLoading(false);
      // First-time users go through onboarding chain: Onboarding → Consent → Accessibility → Splash
      navigation.replace('Onboarding');
    } catch (e) {
      setErrors({ email: e.message || 'Registration failed' });
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[Typography.h1, { color: colors.text }]}>Create Account</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4, marginBottom: 28 }}>Begin your cognitive health journey</Text>

          {/* Name */}
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.name ? colors.error : colors.border }]}
            placeholder="John Doe" placeholderTextColor={colors.textDisabled} value={name}
            onChangeText={(v) => { setName(v); setErrors(e => ({ ...e, name: undefined })); }} />
          {errors.name && <Text style={[styles.err, { color: colors.error }]}>{errors.name}</Text>}

          {/* Email */}
          <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Email</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.email ? colors.error : colors.border }]}
            placeholder="you@example.com" placeholderTextColor={colors.textDisabled} value={email}
            onChangeText={(v) => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }} autoCapitalize="none" keyboardType="email-address" />
          {errors.email && <Text style={[styles.err, { color: colors.error }]}>{errors.email}</Text>}

          {/* Password */}
          <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Password</Text>
          <View style={[styles.pwRow, { backgroundColor: colors.surface, borderColor: errors.password ? colors.error : colors.border }]}>
            <TextInput style={[styles.pwInput, { color: colors.text }]}
              placeholder="Min 8 characters" placeholderTextColor={colors.textDisabled} value={password}
              onChangeText={(v) => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
              secureTextEntry={!showPw} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 8 }}>
              {showPw ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={[styles.err, { color: colors.error }]}>{errors.password}</Text>}

          {/* Password Strength */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBars}>
                {[0, 1, 2, 3, 4].map(i => (
                  <View key={i} style={[styles.strengthBar, { backgroundColor: i < strength ? strengthColors[strength] : colors.border }]} />
                ))}
              </View>
              <Text style={{ color: strengthColors[strength], fontSize: 11, fontWeight: '600', marginLeft: 8 }}>
                {strengthLabels[strength]}
              </Text>
            </View>
          )}

          {/* Age */}
          <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Age</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.age ? colors.error : colors.border }]}
            placeholder="25" placeholderTextColor={colors.textDisabled} value={age}
            onChangeText={(v) => { setAge(v); setErrors(e => ({ ...e, age: undefined })); }} keyboardType="numeric" />
          {errors.age && <Text style={[styles.err, { color: colors.error }]}>{errors.age}</Text>}

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary, marginTop: 28, opacity: loading ? 0.7 : 1 }]} 
            onPress={handleRegister} 
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Begin Assessment</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Already have an account? </Text>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Sign In</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 50, paddingBottom: 40 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', marginBottom: 16 },
  label: { fontWeight: '600', fontSize: 14, marginBottom: 6 },
  input: { height: 54, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 15 },
  err: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  pwRow: { flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12 },
  pwInput: { flex: 1, fontSize: 15 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  strengthBars: { flexDirection: 'row', gap: 4 },
  strengthBar: { width: 36, height: 4, borderRadius: 2 },
  btn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});

export default RegisterScreen;
