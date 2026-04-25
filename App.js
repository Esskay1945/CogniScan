import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DataProvider as AppDataProvider } from './src/context/DataContext';
import { AccessibilityProvider } from './src/components/AccessibilityProvider';

// Onboarding & Auth
import FontSizeScreen from './src/screens/FontSizeScreen';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Clinical Screening
import MentalHealthHistoryScreen from './src/screens/MentalHealthHistoryScreen';
import ConditionSelectScreen from './src/screens/ConditionSelectScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import SymptomFlowScreen from './src/screens/SymptomFlowScreen';
import RiskAssessmentScreen from './src/screens/RiskAssessmentScreen';

// Diagnostic Testing Hub
import TestHubScreen from './src/screens/TestHubScreen';
import WordPresentationScreen from './src/screens/WordPresentationScreen';
import ReactionTestScreen from './src/screens/ReactionTestScreen';
import PatternTestScreen from './src/screens/PatternTestScreen';
import ClockTestScreen from './src/screens/ClockTestScreen';
import SpeechTestScreen from './src/screens/SpeechTestScreen';
import DelayedRecallScreen from './src/screens/DelayedRecallScreen';

// Clinical Test Modules
import PairedAssociateScreen from './src/screens/PairedAssociateScreen';
import StoryRecallScreen from './src/screens/StoryRecallScreen';
import VisualMemoryScreen from './src/screens/VisualMemoryScreen';
import RecognitionMemoryScreen from './src/screens/RecognitionMemoryScreen';
import ObjectNamingScreen from './src/screens/ObjectNamingScreen';
import SentenceRepetitionScreen from './src/screens/SentenceRepetitionScreen';
import ComprehensionScreen from './src/screens/ComprehensionScreen';
import MentalRotationScreen from './src/screens/MentalRotationScreen';
import FingerTappingScreen from './src/screens/FingerTappingScreen';

// Results & Game Assignment
import ResultsScreen from './src/screens/ResultsScreen';
import AssessmentResultsScreen from './src/screens/AssessmentResultsScreen';
import GameAssignmentScreen from './src/screens/GameAssignmentScreen';

// Neuro-Lab & Gamification
import DailyTrainingScreen from './src/screens/DailyTrainingScreen';
import PreTrainingCheckScreen from './src/screens/PreTrainingCheckScreen';
import SkillTreeScreen from './src/screens/SkillTreeScreen';

// Dashboard Tabs
import Dashboard from './src/screens/Dashboard';
import GamesScreen from './src/screens/GamesScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ConsentScreen from './src/screens/ConsentScreen';
import AccessibilitySetupScreen from './src/screens/AccessibilitySetupScreen';
import EntryQuestionScreen from './src/screens/EntryQuestionScreen';
import ReadinessCheckScreen from './src/screens/ReadinessCheckScreen';
import PrivacyCenterScreen from './src/screens/PrivacyCenterScreen';
import IdentityReAuthScreen from './src/screens/IdentityReAuthScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SimulatorScreen from './src/screens/SimulatorScreen';
import RealLifeSimulatorScreen from './src/screens/RealLifeSimulatorScreen';

// Extras
import FamilyReportsScreen from './src/screens/FamilyReportsScreen';
import CalibrationGame from './src/screens/CalibrationGame';
import CaregiverDashboardScreen from './src/screens/CaregiverDashboardScreen';
import ImprovementScreen from './src/screens/ImprovementScreen';

// Care & Safety Layer
import MedicationScreen from './src/screens/MedicationScreen';
import DailyCheckInScreen from './src/screens/DailyCheckInScreen';
import SafetyCenterScreen from './src/screens/SafetyCenterScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import OutcomeTrackingScreen from './src/screens/OutcomeTrackingScreen';
import PsychometricsScreen from './src/screens/PsychometricsScreen';
import ClinicalReportScreen from './src/screens/ClinicalReportScreen';

// Games Library
import MemoryHeistGame from './src/screens/MemoryHeistGame';
import ReflexTapGame from './src/screens/ReflexTapGame';
import FlashRecallGame from './src/screens/FlashRecallGame';
import RapidStoryGame from './src/screens/RapidStoryGame';
import PatternMatrixGame from './src/screens/PatternMatrixGame';
import ColorMatchGame from './src/screens/ColorMatchGame';
import WordScrambleGame from './src/screens/WordScrambleGame';
import SpeedSortGame from './src/screens/SpeedSortGame';
import FocusFlowGame from './src/screens/FocusFlowGame';
import SequenceMemoryGame from './src/screens/SequenceMemoryGame';
import MathBlitzGame from './src/screens/MathBlitzGame';
import DualNBackGame from './src/screens/DualNBackGame';
import VerbalFluencyGame from './src/screens/VerbalFluencyGame';
import MemoryMatchGame from './src/screens/MemoryMatchGame';
import SpatialRecallGame from './src/screens/SpatialRecallGame';
import TrailMakingGame from './src/screens/TrailMakingGame';
import CategorySortGame from './src/screens/CategorySortGame';
import StroopChallengeGame from './src/screens/StroopChallengeGame';
import NumberSpanGame from './src/screens/NumberSpanGame';
import VisualSearchGame from './src/screens/VisualSearchGame';
import GoNoGoGame from './src/screens/GoNoGoGame';
import WordAssociationGame from './src/screens/WordAssociationGame';
import DigitSymbolGame from './src/screens/DigitSymbolGame';
import MazeRunnerGame from './src/screens/MazeRunnerGame';
import ChunkingGame from './src/screens/ChunkingGame';
import TowerSortGame from './src/screens/TowerSortGame';

// New Games (Audit Completion)
import ContextRecallGame from './src/screens/ContextRecallGame';
import FaceNameMatchGame from './src/screens/FaceNameMatchGame';
import InterferenceMemoryGame from './src/screens/InterferenceMemoryGame';
import FlankerTaskGame from './src/screens/FlankerTaskGame';
import OddballDetectionGame from './src/screens/OddballDetectionGame';
import DistractionFilterGame from './src/screens/DistractionFilterGame';
import RapidNamingGame from './src/screens/RapidNamingGame';
import RuleSwitchGame from './src/screens/RuleSwitchGame';
import MultiStepPlannerGame from './src/screens/MultiStepPlannerGame';
import DecisionGridGame from './src/screens/DecisionGridGame';
import SentenceLogicGame from './src/screens/SentenceLogicGame';
import ContextMeaningGame from './src/screens/ContextMeaningGame';
import Rotation3DGame from './src/screens/Rotation3DGame';
import MirrorPatternGame from './src/screens/MirrorPatternGame';
import PathPredictionGame from './src/screens/PathPredictionGame';
import PrecisionHoldGame from './src/screens/PrecisionHoldGame';
import StabilityTapGame from './src/screens/StabilityTapGame';
import MotionTrackingGame from './src/screens/MotionTrackingGame';
import ConfidenceMeterGame from './src/screens/ConfidenceMeterGame';
import ErrorAwarenessGame from './src/screens/ErrorAwarenessGame';

import { LayoutDashboard, BrainCircuit, Activity, Zap, UserCircle2, Cpu } from 'lucide-react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          borderTopWidth: 1,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tab.Screen name="HomeTab" component={Dashboard}
        options={{ tabBarLabel: 'HOME', tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} /> }} />
      <Tab.Screen name="TrainingTab" component={DailyTrainingScreen}
        options={{ tabBarLabel: 'TRAINING', tabBarIcon: ({ color }) => <Zap size={20} color={color} /> }} />
      <Tab.Screen name="GamesTab" component={GamesScreen}
        options={{ tabBarLabel: 'GAMES', tabBarIcon: ({ color }) => <BrainCircuit size={20} color={color} /> }} />
      <Tab.Screen name="InsightsTab" component={InsightsScreen}
        options={{ tabBarLabel: 'INSIGHTS', tabBarIcon: ({ color }) => <Activity size={20} color={color} /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen}
        options={{ tabBarLabel: 'PROFILE', tabBarIcon: ({ color }) => <UserCircle2 size={20} color={color} /> }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isDark, colors, fontLoaded } = useTheme();

  if (!fontLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer
        onUnhandledAction={(action) => {
          // Silently ignore GO_BACK when there's nothing to go back to
          if (__DEV__) console.log('[Nav] Unhandled action:', action.type);
        }}
      >
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background },
            animationEnabled: true,
          }}
        >
          {/* Onboarding & Flow Orchestration */}
          <Stack.Screen name="FontSize" component={FontSizeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Consent" component={ConsentScreen} />
          <Stack.Screen name="AccessibilitySetup" component={AccessibilitySetupScreen} />
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* Screening & Entry */}
          <Stack.Screen name="EntryQuestion" component={EntryQuestionScreen} />
          <Stack.Screen name="ReadinessCheck" component={ReadinessCheckScreen} />
          <Stack.Screen name="MentalHealthHistory" component={MentalHealthHistoryScreen} />
          <Stack.Screen name="ConditionSelect" component={ConditionSelectScreen} />
          <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
          <Stack.Screen name="SymptomFlow" component={SymptomFlowScreen} />
          <Stack.Screen name="RiskAssessment" component={RiskAssessmentScreen} />
          
          {/* Assessment Protocol */}
          <Stack.Screen name="TestHub" component={TestHubScreen} />
          <Stack.Screen name="WordPresentation" component={WordPresentationScreen} />
          <Stack.Screen name="ReactionTest" component={ReactionTestScreen} />
          <Stack.Screen name="PatternTest" component={PatternTestScreen} />
          <Stack.Screen name="ClockTest" component={ClockTestScreen} />
          <Stack.Screen name="SpeechTest" component={SpeechTestScreen} />
          <Stack.Screen name="DelayedRecall" component={DelayedRecallScreen} />
          <Stack.Screen name="PairedAssociate" component={PairedAssociateScreen} />
          <Stack.Screen name="StoryRecall" component={StoryRecallScreen} />
          <Stack.Screen name="VisualMemory" component={VisualMemoryScreen} />
          <Stack.Screen name="RecognitionMemory" component={RecognitionMemoryScreen} />
          <Stack.Screen name="ObjectNaming" component={ObjectNamingScreen} />
          <Stack.Screen name="SentenceRepetition" component={SentenceRepetitionScreen} />
          <Stack.Screen name="Comprehension" component={ComprehensionScreen} />
          <Stack.Screen name="MentalRotation" component={MentalRotationScreen} />
          <Stack.Screen name="FingerTapping" component={FingerTappingScreen} />

          {/* Results & Mapping */}
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="AssessmentResults" component={AssessmentResultsScreen} />
          <Stack.Screen name="GameAssignment" component={GameAssignmentScreen} />

          {/* Main Flow */}
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="DailyTraining" component={DailyTrainingScreen} />
          <Stack.Screen name="PreTrainingCheck" component={PreTrainingCheckScreen} />
          <Stack.Screen name="RealLifeSimulator" component={RealLifeSimulatorScreen} />
          <Stack.Screen name="PrivacyCenter" component={PrivacyCenterScreen} />
          <Stack.Screen name="IdentityReAuth" component={IdentityReAuthScreen} />
          <Stack.Screen name="SkillTree" component={SkillTreeScreen} />
          
          {/* Supplementary */}
          <Stack.Screen name="FamilyReports" component={FamilyReportsScreen} />
          <Stack.Screen name="Simulator" component={SimulatorScreen} />
          <Stack.Screen name="Calibration" component={CalibrationGame} />
          <Stack.Screen name="CaregiverDashboard" component={CaregiverDashboardScreen} />
          <Stack.Screen name="Improvement" component={ImprovementScreen} />

          {/* Care & Safety Layer */}
          <Stack.Screen name="Medication" component={MedicationScreen} />
          <Stack.Screen name="DailyCheckIn" component={DailyCheckInScreen} />
          <Stack.Screen name="SafetyCenter" component={SafetyCenterScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="OutcomeTracking" component={OutcomeTrackingScreen} />
          <Stack.Screen name="Psychometrics" component={PsychometricsScreen} />
          <Stack.Screen name="ClinicalReport" component={ClinicalReportScreen} />

          {/* Games Library */}
          <Stack.Screen name="MemoryHeist" component={MemoryHeistGame} />
          <Stack.Screen name="ReflexTap" component={ReflexTapGame} />
          <Stack.Screen name="FlashRecall" component={FlashRecallGame} />
          <Stack.Screen name="RapidStory" component={RapidStoryGame} />
          <Stack.Screen name="PatternMatrix" component={PatternMatrixGame} />
          <Stack.Screen name="ColorMatch" component={ColorMatchGame} />
          <Stack.Screen name="WordScramble" component={WordScrambleGame} />
          <Stack.Screen name="SpeedSort" component={SpeedSortGame} />
          <Stack.Screen name="FocusFlow" component={FocusFlowGame} />
          <Stack.Screen name="SequenceMemory" component={SequenceMemoryGame} />
          <Stack.Screen name="MathBlitz" component={MathBlitzGame} />
          <Stack.Screen name="DualNBack" component={DualNBackGame} />
          <Stack.Screen name="VerbalFluency" component={VerbalFluencyGame} />
          <Stack.Screen name="MemoryMatch" component={MemoryMatchGame} />
          <Stack.Screen name="SpatialRecall" component={SpatialRecallGame} />
          <Stack.Screen name="TrailMaking" component={TrailMakingGame} />
          <Stack.Screen name="CategorySort" component={CategorySortGame} />
          <Stack.Screen name="StroopChallenge" component={StroopChallengeGame} />
          <Stack.Screen name="NumberSpan" component={NumberSpanGame} />
          <Stack.Screen name="VisualSearch" component={VisualSearchGame} />
          <Stack.Screen name="GoNoGo" component={GoNoGoGame} />
          <Stack.Screen name="WordAssociation" component={WordAssociationGame} />
          <Stack.Screen name="DigitSymbol" component={DigitSymbolGame} />
          <Stack.Screen name="MazeRunner" component={MazeRunnerGame} />
          <Stack.Screen name="Chunking" component={ChunkingGame} />
          <Stack.Screen name="TowerSort" component={TowerSortGame} />

          {/* New Games - Audit Completion */}
          <Stack.Screen name="ContextRecall" component={ContextRecallGame} />
          <Stack.Screen name="FaceNameMatch" component={FaceNameMatchGame} />
          <Stack.Screen name="InterferenceMemory" component={InterferenceMemoryGame} />
          <Stack.Screen name="FlankerTask" component={FlankerTaskGame} />
          <Stack.Screen name="OddballDetection" component={OddballDetectionGame} />
          <Stack.Screen name="DistractionFilter" component={DistractionFilterGame} />
          <Stack.Screen name="RapidNaming" component={RapidNamingGame} />
          <Stack.Screen name="RuleSwitch" component={RuleSwitchGame} />
          <Stack.Screen name="MultiStepPlanner" component={MultiStepPlannerGame} />
          <Stack.Screen name="DecisionGrid" component={DecisionGridGame} />
          <Stack.Screen name="SentenceLogic" component={SentenceLogicGame} />
          <Stack.Screen name="ContextMeaning" component={ContextMeaningGame} />
          <Stack.Screen name="Rotation3D" component={Rotation3DGame} />
          <Stack.Screen name="MirrorPattern" component={MirrorPatternGame} />
          <Stack.Screen name="PathPrediction" component={PathPredictionGame} />
          <Stack.Screen name="PrecisionHold" component={PrecisionHoldGame} />
          <Stack.Screen name="StabilityTap" component={StabilityTapGame} />
          <Stack.Screen name="MotionTracking" component={MotionTrackingGame} />
          <Stack.Screen name="ConfidenceMeter" component={ConfidenceMeterGame} />
          <Stack.Screen name="ErrorAwareness" component={ErrorAwarenessGame} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <AccessibilityProvider>
          <AppNavigator />
        </AccessibilityProvider>
      </AppDataProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
