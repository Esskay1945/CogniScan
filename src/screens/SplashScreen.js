import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
// Theme colors come from useTheme context
import Svg, { Path, Circle as SvgCircle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const { data } = useData();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // Logo fade in + scale
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // Title fade in
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Subtitle fade in
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Hold for a moment
      Animated.delay(1200),
      // Fade out everything
      Animated.timing(fadeOut, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      // Decide where to go based on session history and questionnaire
      const sessions = data.sessions || [];
      const questionnaireCompleted = data.questionnaireCompleted || false;
      const riskAssessment = data.riskAssessment || null;
      const assessmentCompleted = data.assessmentCompleted || false;
      const onboardingCompleted = data.onboarding?.completed || false;
      const isLoggedIn = !!data.user?.email;

      // Guard: must be logged in first
      if (!isLoggedIn) {
        navigation.replace('Login');
      // Guard: onboarding must be completed first
      } else if (!onboardingCompleted) {
        navigation.replace('Onboarding');
      } else if (sessions.length > 0) {
        // User has previous sessions — check how long ago
        const lastSession = sessions[sessions.length - 1];
        const lastDate = new Date(lastSession.date);
        const now = new Date();
        const daysSinceLast = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLast < 7) {
          // Less than a week — go straight to dashboard
          navigation.replace('Main');
        } else {
          // A week or more — do a quick readiness check then go to dashboard
          navigation.replace('ReadinessCheck', { game: { id: 'Main' } });
        }
      } else if (!questionnaireCompleted) {
        // First time — full flow: questionnaire first
        navigation.replace('EntryQuestion');
      } else if (riskAssessment && !assessmentCompleted) {
        // Questionnaire done, but brain tests pending
        navigation.replace('ReadinessCheck', { game: { id: 'TestHub' }, isMandatoryFlow: true });
      } else if (!riskAssessment) {
        // Safety: should have had a risk assessment if questionnaire done
        navigation.replace('EntryQuestion');
      } else {
        // Everything done, just no sessions yet
        const lastSessionDate = data.lastSessionDate;
        const today = new Date().toDateString();
        if (lastSessionDate !== today) {
          navigation.replace('ReadinessCheck', { game: { id: 'Main' } });
        } else {
          navigation.replace('Main');
        }
      }
    });
  }, []);

  // Custom brain-scan icon colors based on theme
  const primaryColor = isDark ? '#0066FF' : '#0055DD';
  const accentColor = isDark ? '#00F0FF' : '#00C8D2';
  const glowColor = isDark ? 'rgba(0, 102, 255, 0.25)' : 'rgba(0, 85, 221, 0.12)';

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeOut }]}>
      {/* Background grid pattern */}
      <View style={styles.gridOverlay}>
        {[...Array(6)].map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, styles.gridHorizontal, { top: `${(i + 1) * 15}%`, backgroundColor: colors.border + '20' }]} />
        ))}
        {[...Array(4)].map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLine, styles.gridVertical, { left: `${(i + 1) * 25}%`, backgroundColor: colors.border + '20' }]} />
        ))}
      </View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        {/* Glow ring */}
        <View style={[styles.glowRing, { backgroundColor: glowColor }]} />
        <View style={[styles.glowRingInner, { backgroundColor: glowColor }]} />

        {/* Brain Icon */}
        <View style={styles.iconCircle}>
          <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
            <Defs>
              <LinearGradient id="brainGrad" x1="0" y1="0" x2="24" y2="24">
                <Stop offset="0" stopColor={primaryColor} />
                <Stop offset="1" stopColor={accentColor} />
              </LinearGradient>
            </Defs>
            <Path
              d="M12 2C10.5 2 9.1 2.5 8 3.3C6.9 2.5 5.5 2 4 2C2.9 2 2 2.9 2 4c0 1.1.9 2 2 2c-.5.7-.8 1.5-.9 2.3C2.4 9.3 2 10.6 2 12c0 2.5 1.2 4.7 3 6.2V22h4v-2h2v2h4v-3.8c1.8-1.5 3-3.7 3-6.2 0-1.4-.4-2.7-1.1-3.7-.1-.8-.4-1.6-.9-2.3 1.1 0 2-.9 2-2s-.9-2-2-2c-1.5 0-2.9.5-4 1.3C14.9 2.5 13.5 2 12 2z"
              stroke="url(#brainGrad)"
              strokeWidth={1.5}
              fill="none"
            />
            {/* Neural network dots */}
            <SvgCircle cx="8" cy="10" r="1.5" fill={primaryColor} />
            <SvgCircle cx="16" cy="10" r="1.5" fill={accentColor} />
            <SvgCircle cx="12" cy="14" r="1.5" fill={primaryColor} />
            <SvgCircle cx="10" cy="8" r="1" fill={accentColor} opacity="0.6" />
            <SvgCircle cx="14" cy="8" r="1" fill={primaryColor} opacity="0.6" />
            <SvgCircle cx="10" cy="16" r="1" fill={accentColor} opacity="0.6" />
            <SvgCircle cx="14" cy="16" r="1" fill={primaryColor} opacity="0.6" />
          </Svg>
        </View>

        {/* Scanning line effect */}
        <View style={[styles.scanLine, { backgroundColor: accentColor + '40' }]} />
      </Animated.View>

      {/* Title */}
      <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
        <Text style={[styles.title, { color: colors.text }]}>COGNISCAN</Text>
        <View style={[styles.versionBadge, { backgroundColor: primaryColor + '15', borderColor: primaryColor }]}>
          <Text style={{ color: primaryColor, fontSize: 9, fontWeight: '900', letterSpacing: 1 }}>v2.0</Text>
        </View>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={[styles.subtitleContainer, { opacity: subtitleOpacity }]}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {(() => {
            const sessions = data.sessions || [];
            if (sessions.length > 0) {
              const lastDate = new Date(sessions[sessions.length - 1].date);
              const days = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
              if (days < 7) return 'Welcome back! Loading your cognitive dashboard...';
              return 'Time for your weekly check-up — getting things ready...';
            }
            return 'Setting up your brain health check...';
          })()}
        </Text>

        {/* Loading dots */}
        <View style={styles.loadingRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.loadingDot, { backgroundColor: primaryColor, opacity: 0.3 + (i * 0.2) }]} />
          ))}
        </View>
      </Animated.View>

      {/* Bottom branding */}
      <View style={styles.bottomBranding}>
        <View style={[styles.brandLine, { backgroundColor: colors.border }]} />
        <Text style={{ color: colors.textDisabled, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginTop: 12 }}>
          {isDark ? '◆ DARK MODE' : '◇ LIGHT MODE'} · SECURE · HIPAA COMPLIANT
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gridOverlay: { ...StyleSheet.absoluteFillObject },
  gridLine: { position: 'absolute' },
  gridHorizontal: { left: 0, right: 0, height: 1 },
  gridVertical: { top: 0, bottom: 0, width: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  glowRing: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
  },
  glowRingInner: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60, opacity: 0.5,
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0066FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  scanLine: {
    position: 'absolute', width: 120, height: 2, borderRadius: 1, top: '50%',
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: {
    fontSize: 36, fontWeight: '900', letterSpacing: 4,
  },
  versionBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  subtitleContainer: { alignItems: 'center', paddingHorizontal: 48 },
  subtitle: {
    fontSize: 14, textAlign: 'center', lineHeight: 22,
  },
  loadingRow: { flexDirection: 'row', gap: 6, marginTop: 20 },
  loadingDot: { width: 8, height: 8, borderRadius: 4 },
  bottomBranding: {
    position: 'absolute', bottom: 48, alignItems: 'center',
  },
  brandLine: { width: 40, height: 1 },
});

export default SplashScreen;
