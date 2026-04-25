import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, Heart, ThumbsUp, ThumbsDown, HelpCircle, PhoneCall, Info, Smile, Frown, Meh } from 'lucide-react-native';

const DailyCheckInScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, submitCheckIn } = useData();
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);

  const welfare = data.welfare || {};

  const handleResponse = (resp) => {
    setResponse(resp);
    submitCheckIn(resp);
    setSubmitted(true);
  };

  if (submitted) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Text style={{ fontSize: 64 }}>{response === 'ok' ? '😊' : response === 'not_ok' ? '💙' : '🤗'}</Text>
        <Text style={[Typography.h1, { color: colors.text, marginTop: 20, textAlign: 'center' }]}>
          {response === 'ok' ? 'GLAD TO HEAR!' : 'WE\'RE HERE FOR YOU'}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 12, paddingHorizontal: 32, lineHeight: 22 }}>
          {response === 'ok'
            ? 'Keep up the great work! Your consistent check-ins help us monitor your well-being.'
            : 'It\'s okay to have tough days. Consider reaching out to your support network or talking with someone.'}
        </Text>
        {response === 'not_ok' && (
          <TouchableOpacity style={[styles.supportBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('HelpSupport')}>
            <PhoneCall size={18} color="#FFF" /><Text style={{ color: '#FFF', fontWeight: '900', marginLeft: 10 }}>TALK TO SOMEONE</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.center}>
          <Heart size={40} color={colors.primary} />
          <Text style={[Typography.h1, { color: colors.text, marginTop: 20, textAlign: 'center' }]}>HOW ARE YOU{'\n'}FEELING TODAY?</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 12 }}>Your daily check-in helps us support you better</Text>

          {/* Check-in stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 22 }}>{welfare.checkInStreak || 0}</Text>
              <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '700' }}>STREAK</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.success, fontWeight: '900', fontSize: 22 }}>{welfare.responseReliability || 100}%</Text>
              <Text style={{ color: colors.textDisabled, fontSize: 9, fontWeight: '700' }}>RELIABILITY</Text>
            </View>
          </View>

          {/* Response Options */}
          <View style={styles.responseGrid}>
            <TouchableOpacity style={[styles.responseCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]} onPress={() => handleResponse('ok')}>
              <Smile size={40} color={colors.success} />
              <Text style={{ color: colors.success, fontWeight: '800', fontSize: 16, marginTop: 12 }}>I'm Doing Well</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>Feeling good today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.responseCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]} onPress={() => handleResponse('meh')}>
              <Meh size={40} color={colors.warning} />
              <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 16, marginTop: 12 }}>Just Okay</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>Not great, not bad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.responseCard, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]} onPress={() => handleResponse('not_ok')}>
              <Frown size={40} color={colors.error} />
              <Text style={{ color: colors.error, fontWeight: '800', fontSize: 16, marginTop: 12 }}>Not So Good</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>Could use some support</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.disclaimer, { backgroundColor: colors.surfaceElevated || colors.surface }]}>
            <Info size={14} color={colors.textDisabled} />
            <Text style={{ color: colors.textDisabled, fontSize: 10, marginLeft: 8, flex: 1, lineHeight: 16 }}>
              Your responses are private and help us personalize your experience. We never share welfare data without your consent.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { padding: 24, paddingTop: 56 }, back: { marginBottom: 20 },
  center: { alignItems: 'center', paddingTop: 40 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 32, marginBottom: 32 },
  statBox: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  responseGrid: { width: '100%', gap: 12 },
  responseCard: { padding: 24, borderRadius: 24, borderWidth: 1.5, alignItems: 'center' },
  btn: { height: 52, width: '80%', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  supportBtn: { height: 52, width: '80%', borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  disclaimer: { padding: 14, borderRadius: 12, flexDirection: 'row', marginTop: 32, alignItems: 'center' },
});
export default DailyCheckInScreen;
