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
        { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); navigation.replace('Login'); } },
      ]
    );
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const recallPct = latest?.recallScore != null ? Math.round((latest.recallScore / 3) * 100) : 'N/A';
      const reactionAvg = latest?.reactionAvg || 'N/A';
      const patternPct = latest?.patternScore != null ? Math.round((latest.patternScore / 4) * 100) : 'N/A';
      const clockPct = latest?.clockScore || 'N/A';
      const speechPct = latest?.speechScore || 'N/A';

      // Calculate overall
      const scores = [recallPct, patternPct, clockPct, speechPct].filter(v => v !== 'N/A');
      const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 'N/A';

      const getStatus = (s) => {
        if (s === 'N/A') return 'Not Assessed';
        if (s >= 85) return 'Normal';
        if (s >= 65) return 'Mild Impairment';
        if (s >= 45) return 'Moderate Impairment';
        return 'Significant Impairment';
      };

      const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const mentalHistory = data.user?.mentalHealthHistory || [];
      const questionnaireResults = data.user?.questionnaireResults || null;

      const reportContent = `
================================================================================
                     COGNISCAN™ BRAIN HEALTH REPORT
================================================================================

                           CONFIDENTIAL MEDICAL DOCUMENT
                        For Authorized Medical Personnel Only

================================================================================
REPORT ID:      CS-${Date.now().toString(36).toUpperCase()}
DATE:           ${currentDate}
TIME:           ${currentTime}
FACILITY:       CogniScan Brain Health Platform
PROTOCOL:       Standard Neuro-Cognitive Assessment Battery v2.0
================================================================================

PATIENT INFORMATION
────────────────────────────────────────────────────────────────────────────────
Full Name:          ${(data.user?.name || 'Unknown').toUpperCase()}
Email:              ${data.user?.email || 'Not provided'}
Age:                ${data.user?.age || 'Not provided'}
Assessment Count:   ${data.sessions.length}
Current Streak:     ${data.streak || 0} days
================================================================================

CLINICAL HISTORY
────────────────────────────────────────────────────────────────────────────────
Previous Mental Health Conditions: ${mentalHistory.length > 0 ? 'YES' : 'NO'}
${mentalHistory.length > 0 ? `Reported Conditions: ${mentalHistory.join(', ')}` : 'No prior mental health conditions reported.'}

${questionnaireResults ? `Pre-Assessment Questionnaire:
  History Risk Score:       ${questionnaireResults.historyRiskScore}/100
  Questionnaire Risk Score: ${questionnaireResults.questionnaireRiskScore}/100
  Combined Risk Score:      ${questionnaireResults.overallRisk}/100
  Weighting:                History 70% | Questionnaire 30%
` : 'Pre-assessment questionnaire not completed.'}
================================================================================

COGNITIVE ASSESSMENT RESULTS
────────────────────────────────────────────────────────────────────────────────

Overall Brain Score:  ${overallScore}${overallScore !== 'N/A' ? '%' : ''}
Clinical Status:           ${getStatus(overallScore)}
Assessment Duration:       ${latest?.elapsed ? Math.round(latest.elapsed / 60) : 'N/A'} minutes

Detailed Module Results:
────────────────────────────────────────────────────────────────────────────────

1. WORKING MEMORY (Word Recall)
   Score:           ${recallPct}${recallPct !== 'N/A' ? '%' : ''}
   Raw Score:       ${latest?.recallScore || 'N/A'}/3 words recalled
   Clinical Status: ${getStatus(recallPct)}
   Assessment:      Delayed word recall after interference tasks
   Interpretation:  ${recallPct !== 'N/A' && recallPct >= 80 ? 'Working memory function within normal limits.' : recallPct !== 'N/A' ? 'Possible working memory deficit detected. Further evaluation recommended.' : 'Not assessed.'}

2. PROCESSING SPEED (Reaction Time)
   Average Time:    ${reactionAvg}${reactionAvg !== 'N/A' ? 'ms' : ''}
   Clinical Status: ${reactionAvg !== 'N/A' ? (reactionAvg < 350 ? 'Normal' : reactionAvg < 500 ? 'Mild Delay' : 'Significant Delay') : 'Not Assessed'}
   Assessment:      Simple reaction time measurement
   Interpretation:  ${reactionAvg !== 'N/A' && reactionAvg < 400 ? 'Processing speed within expected range.' : reactionAvg !== 'N/A' ? 'Slower than expected processing speed. May indicate cognitive slowing.' : 'Not assessed.'}

3. VISUAL-SPATIAL FUNCTION (Pattern Recognition)
   Score:           ${patternPct}${patternPct !== 'N/A' ? '%' : ''}
   Raw Score:       ${latest?.patternScore || 'N/A'}/4 patterns
   Clinical Status: ${getStatus(patternPct)}
   Assessment:      Sequential pattern recognition and reproduction
   Interpretation:  ${patternPct !== 'N/A' && patternPct >= 75 ? 'Visual-spatial processing intact.' : patternPct !== 'N/A' ? 'Possible visual-spatial processing deficit.' : 'Not assessed.'}

4. CONSTRUCTIONAL PRAXIS (Clock Drawing)
   Score:           ${clockPct}${clockPct !== 'N/A' ? '%' : ''}
   Clinical Status: ${getStatus(clockPct)}
   Assessment:      Clock drawing and spatial organization
   Interpretation:  ${clockPct !== 'N/A' && clockPct >= 75 ? 'Constructional abilities preserved.' : clockPct !== 'N/A' ? 'Possible constructional apraxia. Further neurological evaluation advised.' : 'Not assessed.'}

5. SPEECH & LANGUAGE (Speech Rhythm Analysis)
   Score:           ${speechPct}${speechPct !== 'N/A' ? '%' : ''}
   Clinical Status: ${getStatus(speechPct)}
   Assessment:      Speech rhythm, fluency, clarity, and pattern analysis
   Interpretation:  ${speechPct !== 'N/A' && speechPct >= 75 ? 'Speech patterns within normal parameters.' : speechPct !== 'N/A' ? 'Possible speech irregularities detected. Consider speech-language pathology referral.' : 'Not assessed.'}

================================================================================

COGNITIVE DRIFT ANALYSIS
────────────────────────────────────────────────────────────────────────────────
Baseline Status:    ${data.baselineSet ? 'ESTABLISHED' : 'PENDING'}
Total Sessions:     ${data.sessions.length}
Drift Detected:     ${drift.hasDrift ? 'YES — ' + drift.overall + '% deviation' : 'NO — Within normal variation'}

${drift.hasDrift ? `Drift Details:
  Memory Drift:     ${drift.details?.recall || 0}%
  Pattern Drift:    ${drift.details?.pattern || 0}%
  Reaction Drift:   ${drift.details?.reaction || 0}%
` : ''}
================================================================================

CLINICAL IMPRESSION
────────────────────────────────────────────────────────────────────────────────
${overallScore !== 'N/A' && overallScore >= 85 
  ? 'Cognitive function is within normal limits across all assessed domains. No significant impairment detected. Recommend continued periodic monitoring.'
  : overallScore !== 'N/A' && overallScore >= 65
  ? 'Mild cognitive changes detected in one or more domains. These findings may warrant clinical follow-up and repeat assessment in 3-6 months. Consider lifestyle modifications and cognitive training exercises.'
  : overallScore !== 'N/A' && overallScore >= 45
  ? 'Moderate cognitive impairment detected across multiple domains. Clinical follow-up is strongly recommended. Consider comprehensive neuropsychological evaluation and potential neuroimaging studies.'
  : overallScore !== 'N/A'
  ? 'Significant cognitive impairment detected. Urgent clinical evaluation recommended. Refer to neurology or neuropsychology for comprehensive assessment. Consider neuroimaging and additional diagnostic workup.'
  : 'Insufficient data for clinical impression. Complete assessment recommended.'}

================================================================================

RECOMMENDATIONS
────────────────────────────────────────────────────────────────────────────────
1. ${overallScore !== 'N/A' && overallScore < 65 ? 'Schedule follow-up with neurologist within 2-4 weeks' : 'Continue periodic cognitive monitoring'}
2. ${drift.hasDrift ? 'Monitor cognitive drift trends closely' : 'Maintain current monitoring schedule'}
3. Engage in recommended brain training games via CogniScan
4. Maintain healthy sleep, exercise, and nutrition habits
5. ${data.sessions.length < 3 ? 'Complete additional assessments to establish reliable baseline' : 'Review longitudinal trends at next assessment'}

================================================================================

DISCLAIMER
────────────────────────────────────────────────────────────────────────────────
This report is generated by CogniScan™ Brain Health Platform and is
intended as a screening tool only. It does not constitute a medical diagnosis.
All findings should be interpreted by a qualified healthcare professional in
the context of the patient's complete medical history and clinical presentation.

Report generated by: CogniScan™ Neuro-Cognitive Assessment Platform v2.0
For questions: support@cogniscan.ai

================================================================================
                         END OF CONFIDENTIAL REPORT
================================================================================
`;

      // Write to file system
      const fileName = `CogniScan_Report_${data.user?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, reportContent);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: 'CogniScan Diagnostic Report',
          UTI: 'public.plain-text',
        });
      } else {
        Alert.alert('Report Generated', `Report saved to:\n${filePath}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report. Please try again.');
      console.error('Report generation error:', error);
    } finally {
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
