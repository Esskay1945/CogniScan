import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Typography } from '../theme';
import { ChevronLeft, Users, Plus, Trash2, Send, TrendingUp, TrendingDown, Activity, ChevronRight } from 'lucide-react-native';

const FamilyReportsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, addFamilyMember, removeFamilyMember, generateWeeklyReport } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const handleAddMember = () => {
    if (!memberName.trim() || !memberEmail.trim()) {
      Alert.alert('Error', 'Please fill in both name and email');
      return;
    }
    addFamilyMember({ name: memberName, email: memberEmail });
    setMemberName('');
    setMemberEmail('');
    setShowAddForm(false);
    Alert.alert('Success', `${memberName} has been added as a family contact!`);
  };

  const handleRemoveMember = (id, name) => {
    Alert.alert('Remove Contact', `Remove ${name} from family contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFamilyMember(id) },
    ]);
  };

  const handleSendReport = () => {
    if (!data.familyMembers || data.familyMembers.length === 0) {
      Alert.alert('No Contacts', 'Add family members first to send reports');
      return;
    }
    const report = generateWeeklyReport();
    Alert.alert(
      'Report Generated',
      `Weekly report generated!\n\nSessions: ${report.sessionsCompleted}\nGames: ${report.gamesPlayed}\nTrend: ${report.trend}\nStreak: ${report.currentStreak} days\n\nIn a production app, this would be sent to ${data.familyMembers.map(m => m.name).join(', ')}.`
    );
  };

  const members = data.familyMembers || [];
  const reports = data.weeklyReports || [];
  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[Typography.h1, { color: colors.text, fontSize: 22 }]}>FAMILY REPORTS</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Weekly cognitive health updates</Text>
            </View>
            <Users size={24} color={colors.primary} />
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>📋 ABOUT FAMILY REPORTS</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
              Add family members to receive weekly progress reports. Reports include cognitive scores, trends, game activity, and personalized recommendations.
            </Text>
          </View>

          {/* Family Members */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <Text style={[Typography.caption, { color: colors.textDisabled }]}>LINKED CONTACTS ({members.length})</Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={() => setShowAddForm(!showAddForm)}
            >
              <Plus size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800', marginLeft: 4 }}>ADD</Text>
            </TouchableOpacity>
          </View>

          {/* Add Form */}
          {showAddForm && (
            <View style={[styles.addForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Family member name"
                placeholderTextColor={colors.textDisabled}
                value={memberName}
                onChangeText={setMemberName}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Email address"
                placeholderTextColor={colors.textDisabled}
                value={memberEmail}
                onChangeText={setMemberEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={[styles.formBtn, { backgroundColor: colors.surfaceElevated, flex: 1 }]} onPress={() => setShowAddForm(false)}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.formBtn, { backgroundColor: colors.primary, flex: 1 }]} onPress={handleAddMember}>
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>Add Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Member Cards */}
          {members.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Users size={28} color={colors.textDisabled} />
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                No family members linked yet.{'\n'}Add contacts to share weekly reports.
              </Text>
            </View>
          ) : (
            members.map((member) => (
              <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18 }}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{member.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{member.email}</Text>
                  <Text style={{ color: colors.textDisabled, fontSize: 9, marginTop: 2 }}>
                    Linked {new Date(member.linkedDate).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveMember(member.id, member.name)}>
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Send Report */}
          <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 24, marginBottom: 12 }]}>WEEKLY REPORT</Text>
          <TouchableOpacity 
            style={[styles.sendCard, { backgroundColor: colors.primary, }]}
            onPress={handleSendReport}
          >
            <Send size={20} color="#FFF" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>Generate & Send Report</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>
                Send this week's progress to {members.length} contact{members.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>

          {/* Latest Report Preview */}
          {latestReport && (
            <>
              <Text style={[Typography.caption, { color: colors.textDisabled, marginTop: 24, marginBottom: 12 }]}>LATEST REPORT PREVIEW</Text>
              <View style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.reportRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Week of</Text>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>
                    {new Date(latestReport.weekStart).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.reportDivider, { backgroundColor: colors.border }]} />
                <View style={styles.reportRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Sessions</Text>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>{latestReport.sessionsCompleted}</Text>
                </View>
                <View style={[styles.reportDivider, { backgroundColor: colors.border }]} />
                <View style={styles.reportRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Games Played</Text>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>{latestReport.gamesPlayed}</Text>
                </View>
                <View style={[styles.reportDivider, { backgroundColor: colors.border }]} />
                <View style={styles.reportRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Trend</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {latestReport.trend === 'improving' 
                      ? <TrendingUp size={14} color={colors.success} />
                      : latestReport.trend === 'declining'
                      ? <TrendingDown size={14} color={colors.error} />
                      : <Activity size={14} color={colors.textSecondary} />
                    }
                    <Text style={{ color: latestReport.trend === 'improving' ? colors.success : latestReport.trend === 'declining' ? colors.error : colors.textSecondary, fontWeight: '700', fontSize: 12, marginLeft: 6 }}>
                      {latestReport.trend.charAt(0).toUpperCase() + latestReport.trend.slice(1).replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <View style={[styles.reportDivider, { backgroundColor: colors.border }]} />
                <View style={styles.reportRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Streak</Text>
                  <Text style={{ color: colors.warning, fontWeight: '700', fontSize: 12 }}>🔥 {latestReport.currentStreak} days</Text>
                </View>
              </View>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  infoCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addForm: { padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 12 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, marginBottom: 10 },
  formBtn: { height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyCard: { padding: 32, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, alignItems: 'center', marginTop: 12 },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16 },
  reportCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  reportDivider: { height: 1 },
});

export default FamilyReportsScreen;
