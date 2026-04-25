import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeSecurity, SecureStorage, Auth, RBAC, AuditLogger, Encryption } from '../engine/SecurityEngine';
import { Sync } from '../engine/SyncEngine';
import { initializeFirebase, isFirebaseConfigured, FirebaseAuth } from '../engine/FirebaseBackend';
import { PredictiveEngine, CareIntegrationEngine } from '../engine/PredictiveEngine';
import { IntegrationLayer } from '../engine/IntegrationLayer';

const DataContext = createContext();

const USERS_INDEX_KEY = '@cogniscan_users';
const ACTIVE_USER_KEY = '@cogniscan_active_user';

const defaultUserData = {
  sessions: [],
  streak: 0,
  lastSessionDate: null,
  baselineSet: false,
  baseline: {
    reactionAvg: null,
    patternScore: null,
    recallScore: null,
    clockScore: null,
    speechScore: null,
  },
  gameHistory: [],        // { date, gameId, category, score, duration }
  streakProgress: {},     // { [dateString]: { categories: Set serialized, gamesPlayed: n } }
  familyMembers: [],      // { id, name, email, linkedDate }
  weeklyReports: [],      // { weekStart, scores, drift, gamesPlayed, sentTo }
  questionnaireCompleted: false,
  
  // Risk assessment engine data
  selectedConditions: [],
  questionnaireAnswers: {},  // { conditionId: { questionId: true/false } }
  riskAssessment: null,      // { domains: { memory: 'low'|'moderate'|'high', ... }, mandatoryTests: [], date }
  assessmentScores: {},      // { testId: { score, date, details } }
  assessmentCompleted: false,

  // ─── NEW: Gamification & Retention Engine ───
  xp: 0,
  level: 1,
  skillTrees: {
    memory: { xp: 0, level: 1, unlockedGames: ['MemoryMatch'] },
    attention: { xp: 0, level: 1, unlockedGames: ['FocusFlow'] },
    executive: { xp: 0, level: 1, unlockedGames: ['TowerSort'] },
    language: { xp: 0, level: 1, unlockedGames: ['WordScramble'] },
    visuospatial: { xp: 0, level: 1, unlockedGames: ['PatternMatrix'] },
    motor: { xp: 0, level: 1, unlockedGames: ['ReflexTap'] },
  },
  dailyMissions: {
    date: null,
    tasks: [
      { id: '3games', label: 'Complete 3 games', completed: false, xp: 50 },
      { id: 'weakest', label: 'Train weakest domain', completed: false, xp: 50 },
      { id: 'perfect', label: 'Get 100% in any game', completed: false, xp: 100 },
    ]
  },
  streaks: {
    daily: 0,
    recovery: 0,
    accuracy: 0,
    lastActivity: null,
  },
  assignedGames: [], // { id, domain, status: 'mandatory'|'optional', completed: bool }

  // ─── NEW: Adaptation & Meta-Cognitive Engine ───
  difficulties: {},       // { [gameId]: 1..10 }
  microGoals: [],         // { id, label, target, current, domain, completed }
  metaCognitive: {
    hesitationIndex: 0,   // Avg ms delay before action
    errorClusters: [],    // [{ date, domain, frequency }]
    attentionSpan: 30,    // seconds
    lastUpdate: null,
  },
  // Improvement Engine
  improvement: {
    baseline: {},         // Snapshot after first assessment
    current: {},          // Latest assessment results
    delta: {},            // % improvement
  },
  lastDecayCheck: null,

  // ─── CORE ORCHESTRATION ENGINE (Steps 1-24) ───
  consent: {
    passiveTracking: false,
    caregiverSharing: false,
    researchData: false,
    baselineConsent: false,
    lastConsentDate: null,
    dataRetention: '1year',
  },
  onboarding: {
    ageBand: null,       // 18-35, 36-55, 55-70, 70+
    education: null,     // Primary, Secondary, Higher, Specialized
    language: 'English',
    deviceFamiliarity: 3,// 1-5
    visionIssues: false,
    hearingIssues: false,
    completed: false,
  },
  readiness: {
    score: 0,
    consequence: 'continue', // continue, retest, caution
  },
  fatigue: {
    index: 0,
    lastDetected: null,
    isFatigued: false,
  },
  caregiver: {
    linked: false,
    email: null,
    alertThreshold: 'moderate',
  },
  passiveSignals: {
    typingDrift: 0,
    navigationHesitation: 0,
    sessionDropRate: 0,
    rhythmicIntervals: [], // [avgIntervalInMs]
    learningBaseline: null,
  },
  deepIntelligence: {
    bestTimeWindow: null, // "morning", "afternoon", "evening"
    optimalDifficultyZone: 5,
    awarenessHistory: [], // { date, mismatchValue, biasType }
    sufficiency: 0,       // 0-100%
  },
  
  // ─── SECURITY & TRUST ENGINE (Modules 1-18) ───
  security: {
    level: 3, // Current session sensitivity
    biometricsActive: true,
    lastAuth: null,
    anomaliesDetectedDevice: false,
    auditLogs: [],
  },
  accessControl: {
    role: 'USER', // USER, CLINICIAN, CAREGIVER
    permissions: ['READ_SELF', 'WRITE_SELF', 'EXPORT_REPORT'],
  },
  pii: {
    userId: 'USER_8829',
    email: 'private@secure.com',
    token: 'KJZ-9982-AXT', // Tokenized link to cognitive data
  },

  // ─── ADVANCED COGNITIVE ENGINE (Modules 1-9) ───
  confounders: {
    sleep: 3,            // 1-5
    stress: 3,           // 1-5
    energy: 3,           // 1-5
    noise: 1,            // 1-5
    lastUpdated: null,
  },
  metaPredictions: {},    // { [gameId/testId]: { expected: number, actual: number } }
  confidenceProfile: {
    score: 0,            // 0-100
    level: 'low',        // low, medium, high
    factors: [],
  },
  adaptivePrefs: {
    fontSizeScale: 1.0,
    oneTaskMode: false,
    voiceGuidance: false,
    clutterFree: false,
  },

  // ─── PINNACLE INTELLIGENCE LAYER ───
  psychometrics: {
    testRetestReliability: 0,
    practiceEffectMagnitude: 0,
    scoreConsistency: 0,
    dropOffPatterns: [],
    calibrationAdjustments: {},
  },
  fairness: {
    adjustmentFactor: 1.0,
    biasRiskIndicator: 'low',
    normGroup: 'general',
  },
  governance: {
    featureTags: {},
    retentionPolicy: '1year',
    researchOptIn: false,
    lastAudit: null,
  },
  trajectory: {
    projected30d: null,
    projected90d: null,
    classification: 'Stable',
    criticalPath: null,
    topInterventions: [],
  },

  // ─── REAL-WORLD CARE & SAFETY LAYER ───
  medication: {
    schedules: [],
    history: [],
    adherenceScore: 100,
    missedCount: 0,
    consistencyTrend: 'stable',
  },
  welfare: {
    lastCheckIn: null,
    checkInStreak: 0,
    responseReliability: 100,
    nonResponseRisk: 'low',
    status: 'ok',
  },
  scamProtection: {
    protectedMode: false,
    knownContacts: [],
    riskyActionCount: 0,
    lastAlert: null,
  },
  careMode: {
    enabled: false,
    lockdown: false,
    caregiverConfigured: false,
  },
  outcomes: {
    dailyReports: [],
    lifeImpactScore: 0,
    functionalTrend: 'stable',
    caregiverObservations: [],
  },
  dailyCheckIns: [],
};

const getUserStorageKey = (userId) => `@cogniscan_user_${userId}`;

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({ user: null, ...defaultUserData });
  const [loaded, setLoaded] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Load active user on mount + initialize security/sync
  useEffect(() => {
    (async () => {
      try {
        // Initialize security engine (encryption keys, audit logs)
        await initializeSecurity();
        // Initialize backend (Firebase)
        initializeFirebase();
        // Initialize sync engine (restore queue, monitor network)
        await Sync.initialize();

        const activeUserId = await AsyncStorage.getItem(ACTIVE_USER_KEY);
        const usersRaw = await AsyncStorage.getItem(USERS_INDEX_KEY);
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        setAllUsers(users);

        if (activeUserId) {
          // Try encrypted storage first, fallback to legacy
          let parsed = await SecureStorage.load(getUserStorageKey(activeUserId));
          if (!parsed) {
            const raw = await AsyncStorage.getItem(getUserStorageKey(activeUserId));
            if (raw) {
              parsed = JSON.parse(raw);
              // Migrate to encrypted storage
              await SecureStorage.save(getUserStorageKey(activeUserId), parsed);
            }
          }
          if (parsed) {
            setData({ ...defaultUserData, ...parsed });
            Auth.createSession(activeUserId, parsed.user?.email);
          }
        }
      } catch (e) { console.warn('[DataContext] Init error:', e.message); }
      setLoaded(true);
    })();

    return () => { Sync.destroy(); };
  }, []);

  // Save user data — encrypted at rest + queued for sync
  const persist = async (newData) => {
    // ─── COGNITIVE DECAY LOGIC ───
    const now = new Date();
    if (newData.streaks?.lastActivity) {
        const last = new Date(newData.streaks.lastActivity);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        
        // Decay check once per day
        if (diffDays >= 1 && newData.lastDecayCheck !== now.toDateString()) {
            let decayFactor = 1;
            if (diffDays >= 7) decayFactor = 0.90; // -10% strong decay
            else if (diffDays >= 3) decayFactor = 0.95; // -5% moderate
            else if (diffDays >= 1) decayFactor = 0.98; // -2% minor
            
            if (decayFactor < 1) {
                newData.xp = Math.max(0, Math.floor((newData.xp || 0) * decayFactor));
                newData.lastDecayCheck = now.toDateString();
                // Flag to show alert on next load
                newData.decayAlertPending = true;
            }
        }
    }

    setData(newData);
    if (newData.user?.email) {
      const userId = newData.user.email.toLowerCase();
      try {
        // Encrypted storage at rest
        await SecureStorage.save(getUserStorageKey(userId), newData);
        // Also save to plain AsyncStorage as backup for data resilience
        await AsyncStorage.setItem(getUserStorageKey(userId), JSON.stringify(newData));
        await AsyncStorage.setItem(ACTIVE_USER_KEY, userId);
        // Queue for server sync
        Sync.syncState(userId, newData).catch(() => {});
      } catch (e) {
        console.warn('[DataContext] Persist error:', e.message);
      }
    }
  };

  const setUser = async (user) => {
    const userId = user.email?.toLowerCase();
    if (!userId) {
      await persist({ ...data, user });
      return;
    }

    // Check if user exists in the index
    let users = [...allUsers];
    const existingIdx = users.findIndex(u => u.email?.toLowerCase() === userId);
    
    if (existingIdx === -1) {
      // New user - add to index
      users.push({ email: user.email, name: user.name, createdAt: new Date().toISOString() });
      setAllUsers(users);
      try { await AsyncStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users)); } catch (e) {}
      // Initialize with defaults
      await persist({ ...defaultUserData, user });
    } else {
      // Existing user - load their data (try encrypted storage first, then legacy)
      try {
        let parsed = await SecureStorage.load(getUserStorageKey(userId));
        if (!parsed) {
          const raw = await AsyncStorage.getItem(getUserStorageKey(userId));
          if (raw) {
            parsed = JSON.parse(raw);
            // Migrate to encrypted storage
            await SecureStorage.save(getUserStorageKey(userId), parsed);
          }
        }
        if (parsed) {
          await persist({ ...defaultUserData, ...parsed, user: { ...parsed.user, ...user } });
        } else {
          await persist({ ...defaultUserData, user });
        }
      } catch (e) {
        await persist({ ...defaultUserData, user });
      }
    }
  };

  const logout = async () => {
    // Save current state before logout
    if (data.user?.email) {
      const userId = data.user.email.toLowerCase();
      try {
        await SecureStorage.save(getUserStorageKey(userId), data);
        await AsyncStorage.setItem(getUserStorageKey(userId), JSON.stringify(data));
      } catch (e) {}
    }
    try { await AsyncStorage.removeItem(ACTIVE_USER_KEY); } catch (e) {}
    setData({ user: null, ...defaultUserData });
  };

  // Save a full test session and update cognitive twin baseline
  const saveSession = (session) => {
    // Extract batch overrides if present (used to consolidate multiple persist calls)
    const { _batchOverrides, ...sessionData } = session;
    
    const newSessions = [...data.sessions, { ...sessionData, date: new Date().toISOString() }];
    
    let newBaseline = { ...data.baseline };
    let baselineSet = data.baselineSet;
    
    // First session becomes the baseline
    if (!data.baselineSet) {
      newBaseline = {
        reactionAvg: sessionData.reactionAvg,
        patternScore: sessionData.patternScore,
        recallScore: sessionData.recallScore,
        clockScore: sessionData.clockScore,
        speechScore: sessionData.speechScore,
      };
      baselineSet = true;
    }

    // Merge batch overrides (riskAssessment, assessmentCompleted, etc.) into single persist
    const overrides = _batchOverrides || {};

    persist({
      ...data,
      sessions: newSessions,
      baseline: overrides.baseline || newBaseline,
      baselineSet: overrides.baselineSet ?? baselineSet,
      ...overrides,
    });
  };

  // ─── Game Tracking ───
  const saveGameResult = (gameResult) => {
    // gameResult: { gameId, category, score, duration }
    // Apply practice effect correction inline
    const priorPlays = (data.gameHistory || []).filter(g => g.gameId === gameResult.gameId).length;
    const practiceEffect = Math.min(0.15, priorPlays * 0.02);
    const adjustedScore = Math.max(0, Math.round(gameResult.score * (1 - practiceEffect)));

    const entry = {
      ...gameResult,
      rawScore: gameResult.score,
      adjustedScore,
      practiceCorrection: Math.round(practiceEffect * 100),
      date: new Date().toISOString(),
    };
    const newGameHistory = [...(data.gameHistory || []), entry];

    // Inline XP calculation (avoid calling addXP which has a separate persist)
    const xpAmount = 15;
    const newXP = (data.xp || 0) + xpAmount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const newTrees = { ...data.skillTrees };
    if (gameResult.category && newTrees[gameResult.category]) {
      newTrees[gameResult.category].xp += xpAmount;
      newTrees[gameResult.category].level = Math.floor(newTrees[gameResult.category].xp / 200) + 1;
    }

    // Update streak progress for today
    const today = new Date().toDateString();
    const streakProgress = { ...(data.streakProgress || {}) };
    if (!streakProgress[today]) {
      streakProgress[today] = { categories: [], gamesPlayed: 0 };
    }
    streakProgress[today].gamesPlayed += 1;
    if (!streakProgress[today].categories.includes(gameResult.category)) {
      streakProgress[today].categories.push(gameResult.category);
    }

    // Recalculate streak
    const newStreak = calculateStreak(streakProgress);

    // Inline learnOptimalWindow computation (avoid separate persist)
    let deepIntelligenceUpdate = data.deepIntelligence || {};
    if (newGameHistory.length >= 10 && newGameHistory.length % 10 === 0) {
      const times = { morning: [], afternoon: [], evening: [] };
      newGameHistory.forEach(g => {
        const hour = new Date(g.date).getHours();
        const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
        times[period].push(g.score);
      });
      const avgs = Object.keys(times).map(p => ({
        period: p,
        avg: times[p].length > 0 ? times[p].reduce((a, b) => a + b, 0) / times[p].length : 0
      }));
      const best = avgs.reduce((a, b) => a.avg > b.avg ? a : b).period;
      deepIntelligenceUpdate = { ...deepIntelligenceUpdate, bestTimeWindow: best };
    }

    persist({
      ...data,
      gameHistory: newGameHistory,
      streakProgress,
      streak: newStreak,
      lastSessionDate: today,
      xp: newXP,
      level: newLevel,
      skillTrees: newTrees,
      deepIntelligence: deepIntelligenceUpdate,
    });
  };

  // Streak: user must play at least 1 game from each category OR 6 total games
  const calculateStreak = (progress) => {
    const REQUIRED_CATEGORIES = ['memory', 'attention', 'executive', 'language'];
    const MIN_GAMES = 6;
    let streak = 0;
    let checkDate = new Date();

    while (true) {
      const dateStr = checkDate.toDateString();
      const dayProgress = progress[dateStr];

      if (!dayProgress) break;

      const allCategoriesMet = REQUIRED_CATEGORIES.every(
        cat => dayProgress.categories.includes(cat)
      );
      const enoughGames = dayProgress.gamesPlayed >= MIN_GAMES;

      if (allCategoriesMet || enoughGames) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Get today's streak progress
  const getTodayStreakProgress = () => {
    const today = new Date().toDateString();
    const raw = data.streakProgress?.[today] || {};
    const progress = { categories: raw.categories || [], gamesPlayed: raw.gamesPlayed || 0 };
    const REQUIRED_CATEGORIES = ['memory', 'attention', 'executive', 'language'];
    
    const categoriesCompleted = REQUIRED_CATEGORIES.filter(
      cat => progress.categories.includes(cat)
    ).length;

    return {
      gamesPlayed: progress.gamesPlayed,
      categoriesCompleted,
      totalCategories: REQUIRED_CATEGORIES.length,
      isComplete: categoriesCompleted === REQUIRED_CATEGORIES.length || progress.gamesPlayed >= 6,
      categoryDetails: REQUIRED_CATEGORIES.map(cat => ({
        id: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        completed: progress.categories.includes(cat),
      })),
    };
  };

  // Get game recommendations based on test scores
  const getGameRecommendations = () => {
    const latest = getLatestSession();
    if (!latest) return [];

    const weakAreas = [];
    const recallPct = latest.recallScore != null ? Math.round((latest.recallScore / 3) * 100) : null;
    const reactionAvg = latest.reactionAvg || null;
    const patternPct = latest.patternScore != null ? Math.round((latest.patternScore / 4) * 100) : null;
    const clockPct = latest.clockScore || null;
    const speechPct = latest.speechScore || null;
    const reactionPct = reactionAvg ? Math.max(0, Math.min(100, Math.round(100 - ((reactionAvg - 200) / 6)))) : null;

    if (recallPct !== null && recallPct < 80) weakAreas.push({ area: 'memory', score: recallPct, label: 'Word Recall' });
    if (reactionPct !== null && reactionPct < 80) weakAreas.push({ area: 'motor', score: reactionPct, label: 'Reaction Speed' });
    if (patternPct !== null && patternPct < 80) weakAreas.push({ area: 'attention', score: patternPct, label: 'Pattern Memory' });
    if (clockPct !== null && clockPct < 80) weakAreas.push({ area: 'visuospatial', score: clockPct, label: 'Clock Drawing' });
    if (speechPct !== null && speechPct < 80) weakAreas.push({ area: 'language', score: speechPct, label: 'Speech Rhythm' });

    weakAreas.sort((a, b) => a.score - b.score);
    return weakAreas;
  };

  // Family member management
  const addFamilyMember = (member) => {
    const newMembers = [...(data.familyMembers || []), {
      ...member,
      id: Date.now().toString(36),
      linkedDate: new Date().toISOString(),
    }];
    persist({ ...data, familyMembers: newMembers });
  };

  const removeFamilyMember = (id) => {
    const newMembers = (data.familyMembers || []).filter(m => m.id !== id);
    persist({ ...data, familyMembers: newMembers });
  };

  // Generate weekly report
  const generateWeeklyReport = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    
    const weekSessions = data.sessions.filter(s => new Date(s.date) >= weekAgo);
    const weekGames = (data.gameHistory || []).filter(g => new Date(g.date) >= weekAgo);

    const latest = getLatestSession();
    const drift = getDrift();

    // Average scores from the week
    const avgScores = {};
    if (weekSessions.length > 0) {
      avgScores.recall = Math.round(weekSessions.reduce((a, s) => a + (s.recallScore || 0), 0) / weekSessions.length);
      avgScores.reaction = Math.round(weekSessions.reduce((a, s) => a + (s.reactionAvg || 0), 0) / weekSessions.length);
      avgScores.pattern = Math.round(weekSessions.reduce((a, s) => a + (s.patternScore || 0), 0) / weekSessions.length);
      avgScores.clock = Math.round(weekSessions.reduce((a, s) => a + (s.clockScore || 0), 0) / weekSessions.length);
      avgScores.speech = Math.round(weekSessions.reduce((a, s) => a + (s.speechScore || 0), 0) / weekSessions.length);
    }

    const report = {
      weekStart: weekAgo.toISOString(),
      weekEnd: now.toISOString(),
      sessionsCompleted: weekSessions.length,
      gamesPlayed: weekGames.length,
      currentStreak: data.streak,
      avgScores,
      drift: drift,
      trend: weekSessions.length >= 2 ?
        (weekSessions[weekSessions.length - 1]?.recallScore > weekSessions[0]?.recallScore ? 'improving' : 'declining') :
        'insufficient_data',
      generatedAt: now.toISOString(),
    };

    const newReports = [...(data.weeklyReports || []), report];
    persist({ ...data, weeklyReports: newReports });
    return report;
  };

  // Calculate drift between latest session and baseline
  const getDrift = () => {
    if (!data.baselineSet || data.sessions.length < 2) {
      return { hasDrift: false, overall: 0, details: {} };
    }
    const latest = data.sessions[data.sessions.length - 1];
    const b = data.baseline;

    const reactionDrift = b.reactionAvg ? ((latest.reactionAvg - b.reactionAvg) / b.reactionAvg) * 100 : 0;
    const recallDrift = b.recallScore != null ? ((b.recallScore - latest.recallScore) / Math.max(b.recallScore, 1)) * 100 : 0;
    const patternDrift = b.patternScore != null ? ((b.patternScore - latest.patternScore) / Math.max(b.patternScore, 1)) * 100 : 0;

    const overall = (Math.abs(reactionDrift) + Math.abs(recallDrift) + Math.abs(patternDrift)) / 3;

    return {
      hasDrift: overall > 10,
      overall: Math.round(overall * 10) / 10,
      details: {
        reaction: Math.round(reactionDrift * 10) / 10,
        recall: Math.round(recallDrift * 10) / 10,
        pattern: Math.round(patternDrift * 10) / 10,
      }
    };
  };

  // Recovery score based on recent trend
  const getRecovery = () => {
    if (data.sessions.length < 2) return { score: 0, trend: 'neutral' };
    const recent = data.sessions.slice(-3);
    const scores = recent.map(s => {
      const r = s.recallScore != null ? (s.recallScore / 3) * 100 : 0;
      const p = s.patternScore != null ? (s.patternScore / 4) * 100 : 0;
      return (r + p) / 2;
    });
    const trend = scores[scores.length - 1] > scores[0] ? 'improving' : scores[scores.length - 1] < scores[0] ? 'declining' : 'stable';
    const change = scores.length > 1 ? Math.round(scores[scores.length - 1] - scores[0]) : 0;
    return { score: change, trend };
  };

  const getLatestSession = () => data.sessions.length > 0 ? data.sessions[data.sessions.length - 1] : null;

  const markQuestionnaireCompleted = () => {
    persist({ ...data, questionnaireCompleted: true });
  };

  // ─── Risk Assessment Engine ───
  const saveSelectedConditions = (conditions) => {
    persist({ ...data, selectedConditions: conditions });
  };

  const saveQuestionnaireAnswers = (answers) => {
    persist({ ...data, questionnaireAnswers: answers });
  };

  const saveRiskAssessment = (assessment) => {
    persist({
      ...data,
      riskAssessment: { ...assessment, date: new Date().toISOString() },
      questionnaireCompleted: true,
    });
  };

  const saveAssessmentScore = (testId, score, details = {}) => {
    const newScores = {
      ...(data.assessmentScores || {}),
      [testId]: { score, date: new Date().toISOString(), ...details },
    };
    persist({ ...data, assessmentScores: newScores });
  };

  const markAssessmentCompleted = () => {
    persist({ ...data, assessmentCompleted: true, lastSessionDate: new Date().toDateString() });
  };

  const getAssessmentProgress = () => {
    const assessment = data.riskAssessment;
    if (!assessment) return { total: 0, completed: 0, tests: [] };
    const mandatory = assessment.mandatoryTests || [];
    const scores = data.assessmentScores || {};
    const completed = mandatory.filter(t => scores[t.id] != null);
    return { total: mandatory.length, completed: completed.length, tests: mandatory, scores };
  };

  // ─── Gamification & Progression ───
  const addXP = (amount, domain = null) => {
    let newXP = (data.xp || 0) + amount;
    let newLevel = Math.floor(newXP / 100) + 1;
    
    const newTrees = { ...data.skillTrees };
    if (domain && newTrees[domain]) {
      newTrees[domain].xp += amount;
      newTrees[domain].level = Math.floor(newTrees[domain].xp / 200) + 1;
    }

    persist({ ...data, xp: newXP, level: newLevel, skillTrees: newTrees });
  };

  const assignGamesFromResults = () => {
    if (!data.riskAssessment || (data.assignedGames && data.assignedGames.length > 0)) return;
    const { domains } = data.riskAssessment;
    const assignments = [];

    // Map domains to games (simplification for logic)
    const domainGames = {
      memory: ['MemoryHeist', 'FlashRecall', 'SequenceMemory', 'SpatialRecall'],
      attention: ['FocusFlow', 'GoNoGo', 'VisualSearch'],
      executive: ['TowerSort', 'MazeRunner', 'TrailMaking'],
      language: ['VerbalFluency', 'WordScramble', 'WordAssociation'],
      visuospatial: ['PatternMatrix', 'ColorMatch'],
      motor: ['ReflexTap', 'SpeedSort'],
    };

    Object.keys(domains).forEach(domain => {
      const risk = domains[domain];
      const games = domainGames[domain] || [];
      
      if (risk === 'high') {
        // High -> All games mandatory
        games.forEach(g => assignments.push({ id: g, domain, status: 'mandatory', completed: false }));
      } else if (risk === 'moderate') {
        // Moderate -> 2 games mandatory
        games.slice(0, 2).forEach(g => assignments.push({ id: g, domain, status: 'mandatory', completed: false }));
        games.slice(2).forEach(g => assignments.push({ id: g, domain, status: 'optional', completed: false }));
      } else {
        // Low -> All optional
        games.forEach(g => assignments.push({ id: g, domain, status: 'optional', completed: false }));
      }
    });

    persist({ ...data, assignedGames: assignments });
  };

  const completeAssignedGame = (gameId) => {
    const assignments = data.assignedGames.map(g => 
      g.id === gameId ? { ...g, completed: true, completedDate: new Date().toDateString() } : g
    );
    
    // Check missions
    const today = new Date().toDateString();
    let missions = data.dailyMissions || { tasks: [] };
    if (missions.date !== today) {
        missions = { date: today, tasks: defaultUserData.dailyMissions.tasks.map(t => ({ ...t, completed: false })) };
    }
    
    // Count only games completed TODAY, not all-time
    const gamesToday = assignments.filter(g => g.completedDate === today).length;
    missions.tasks = missions.tasks.map(t => {
        if (t.id === '3games' && gamesToday >= 3) return { ...t, completed: true };
        return t;
    });

    // ─── VARIABLE REWARD SYSTEM ───
    const rand = Math.random();
    let bonusXP = 30;
    if (rand < 0.1) bonusXP *= 2; 

    const newXp = (data.xp || 0) + bonusXP;
    const newLevel = Math.floor(newXp / 100) + 1;

    persist({ 
      ...data, 
      assignedGames: assignments, 
      dailyMissions: missions, 
      lastSessionDate: today, 
      streaks: { ...data.streaks, lastActivity: new Date().toISOString() },
      xp: newXp,
      level: newLevel
    });
  };

  const updateDifficulty = (gameId, performance) => {
    const current = data.difficulties[gameId] || 1;
    let next = current;
    if (performance >= 0.85) next = Math.min(10, current + 1);
    else if (performance < 0.50) next = Math.max(1, current - 1);
    
    persist({ ...data, difficulties: { ...data.difficulties, [gameId]: next } });
  };

  const generateMicroGoals = () => {
    if (!data.riskAssessment) return;
    const weakest = Object.keys(data.riskAssessment.domains).find(d => data.riskAssessment.domains[d] === 'high') || 'memory';
    
    const goals = [
      { id: '1', label: `Improve ${weakest} recall by 5%`, target: 5, current: 0, domain: weakest, completed: false },
      { id: '2', label: 'Complete 3 tasks without error', target: 3, current: 0, domain: 'accuracy', completed: false },
      { id: '3', label: 'Reduce average reaction latency', target: 50, current: 0, domain: 'motor', completed: false },
    ];
    persist({ ...data, microGoals: goals });
  };

  const logMetaCognitive = (metrics) => {
    // metrics: { hesitation, clusters, span, gameId, prediction, actual }
    const mc = { ...data.metaCognitive };
    
    // Only track passive metrics if consent is given
    if (data.consent?.passiveTracking) {
        if (metrics.hesitation) mc.hesitationIndex = (mc.hesitationIndex * 0.7) + (metrics.hesitation * 0.3);
        if (metrics.span) mc.attentionSpan = (mc.attentionSpan * 0.7) + (metrics.span * 0.3);
    }
    
    // Track Meta-Predictions (Module 4)
    const predictions = { ...data.metaPredictions };
    const awarenessHistory = [...(data.deepIntelligence?.awarenessHistory || [])];
    
    if (metrics.gameId && metrics.prediction != null && metrics.actual != null) {
        predictions[metrics.gameId] = { expected: metrics.prediction, actual: metrics.actual };
        
        // Compute mismatch and classify bias
        const mismatch = metrics.prediction - metrics.actual;
        let biasType = 'Stable';
        if (mismatch > 15) biasType = 'Over-optimistic';
        else if (mismatch < -15) biasType = 'Under-confident';
        
        awarenessHistory.push({
          date: new Date().toISOString(),
          mismatchValue: mismatch,
          biasType,
          gameId: metrics.gameId,
        });
        // Keep only last 50 entries
        if (awarenessHistory.length > 50) awarenessHistory.splice(0, awarenessHistory.length - 50);
    }

    // Inline adaptive UI triggers (avoid separate persist race condition)
    let adaptivePrefs = { ...data.adaptivePrefs };
    let adaptiveChanged = false;
    if (metrics.hesitation > 1000) {
        adaptivePrefs.voiceGuidance = true;
        adaptiveChanged = true;
    }
    if (metrics.misTaps > 5) {
        adaptivePrefs.oneTaskMode = true;
        adaptivePrefs.fontSizeScale = 1.2;
        adaptiveChanged = true;
    }

    persist({ 
      ...data, 
      metaCognitive: mc, 
      metaPredictions: predictions,
      deepIntelligence: {
        ...data.deepIntelligence,
        awarenessHistory,
      },
      ...(adaptiveChanged ? { adaptivePrefs } : {}),
    });
  };

  const saveConfounders = (metrics) => {
    persist({ ...data, confounders: { ...metrics, lastUpdated: new Date().toISOString() } });
  };

  // Module 2: Calculate Confidence
  const calculateSignalReliability = () => {
    const c = data.confounders || {};
    let score = 70; // Base confidence
    const factors = [];

    if ((c.sleep || 3) < 3) { score -= 15; factors.push('Poor sleep'); }
    if ((c.stress || 3) > 3) { score -= 10; factors.push('High stress'); }
    if ((c.noise || 1) > 3) { score -= 10; factors.push('Environmental noise'); }
    if (data.gameHistory.length < 5) { score -= 20; factors.push('Limited data history'); }
    
    const level = score > 80 ? 'High' : score > 50 ? 'Medium' : 'Low';
    return { score, level, factors };
  };

  // Module 5: Action Pathway
  const getActionPathway = () => {
    const risk = data.riskAssessment?.domains || {};
    const rel = calculateSignalReliability();
    const domains = Object.keys(risk);
    const hasHighRisk = domains.some(d => risk[d] === 'high');
    const hasModRisk = domains.some(d => risk[d] === 'moderate');

    if (hasHighRisk) {
        return {
            title: 'CLINICAL ACTION PATHWAY',
            steps: ['Generate clinician report', 'Schedule neurology check-up', 'Notify family/caregiver'],
            urgency: 'High',
            color: '#FF3B30'
        };
    }
    if (hasModRisk) {
        return {
            title: 'TARGETED INTERVENTION',
            steps: ['Start domain-specific training', 'Weekly progress review', 'Consult specialist if drift continues'],
            urgency: 'Moderate',
            color: '#FF9500'
        };
    }
    if (rel.level === 'Low') {
        return {
            title: 'CALIBRATION PATHWAY',
            steps: ['Retest in optimal environment', 'Ensure 7+ hours of sleep', 'Stabilize daily routine'],
            urgency: 'Medium',
            color: '#007AFF'
        };
    }
    return {
        title: 'WELLNESS PROTOCOL',
        steps: ['Continue maintenance training', 'Monitor for monthly drift', 'Baseline maintenance'],
        urgency: 'Low',
        color: '#34C759'
    };
  };

  // Module 6: What-If Brain Simulator
  const calculateWhatIfSimulation = () => {
    const sessions = data.sessions || [];
    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    const currentScore = lastSession ? (lastSession.recallScore / (lastSession.recallTotal || 3) * 100) : 70;
    const streak = data.streak || 0;
    const sleep = data.confounders?.sleep || 3;

    return {
        projectionAction: Math.min(95, currentScore + (streak * 0.5) + (sleep * 2)),
        projectionNone: Math.max(0, currentScore - 10),
        message: streak > 5 ? "Your brain trajectory is trending upward based on training frequency." : "Consistency is key to halting eventual drift."
    };
  };

  // ─── ORCHESTRATION ENGINE METHODS ───

  // Step 3: Readiness Engine
  const calculateReadiness = (metrics) => {
    // metrics: { sleep, stress, noise, energy }
    const { sleep, stress, noise, energy } = metrics;
    let score = (sleep * 20) + (energy * 20) - (stress * 10) - (noise * 5);
    score = Math.max(0, Math.min(100, score));
    
    let consequence = 'continue';
    if (score < 30) consequence = 'retest';
    else if (score < 55) consequence = 'caution';

    persist({ ...data, readiness: { score, consequence }, confounders: { ...data.confounders, ...metrics } });
    return { score, consequence };
  };

  // Step 7: Fatigue Engine
  const monitorPerformance = (gameId, speedTrail, errorHistory) => {
    // Simple heuristic: if last 3 speeds are 40% slower than avg -> Fatigue
    if (speedTrail.length < 5) return false;
    const recent = speedTrail.slice(-3);
    const avg = speedTrail.reduce((a, b) => a + b, 0) / speedTrail.length;
    const recentAvg = recent.reduce((a, b) => a + b, 0) / 3;

    if (recentAvg > avg * 1.4 || errorHistory.filter(e => e).length > 3) {
      persist({ ...data, fatigue: { index: 0.8, isFatigued: true, lastDetected: new Date().toISOString() } });
      return true;
    }
    return false;
  };

  // Step 9: Practice Effect Correction
  const adjustScore = (rawScore, gameId) => {
    const count = data.gameHistory.filter(g => g.gameId === gameId).length;
    // Every replay adds ~2% artificial gain (practice effect)
    const practiceEffect = Math.min(0.15, count * 0.02); 
    const adjusted = Math.max(0, rawScore * (1 - practiceEffect));
    return { raw: rawScore, adjusted: Math.round(adjusted) };
  };

  // Step 1: Onboarding
  const saveOnboarding = (profile) => {
    persist({ ...data, onboarding: { ...profile, completed: true } });
  };

  // Step 2: Consent
  const saveConsent = (flags) => {
    const newConsent = { 
      ...(data.consent || {}), 
      ...flags, 
      baselineConsent: true,
      lastConsentDate: new Date().toISOString()
    };

    // If passiveTracking was revoked, purge collected passive data
    const wasTracking = data.consent?.passiveTracking;
    const nowTracking = newConsent.passiveTracking;
    let passiveSignals = data.passiveSignals;
    if (wasTracking && !nowTracking) {
      passiveSignals = {
        typingDrift: 0,
        navigationHesitation: 0,
        sessionDropRate: 0,
        rhythmicIntervals: [],
        learningBaseline: null,
      };
    }

    // If caregiverSharing revoked, clear linked caregiver data
    let caregiver = data.caregiver;
    if (data.consent?.caregiverSharing && !newConsent.caregiverSharing) {
      caregiver = { ...caregiver, linkedDate: null, email: null };
    }

    persist({ 
      ...data, 
      consent: newConsent, 
      passiveSignals,
      caregiver,
    });
  };

  // ─── DEEP INTELLIGENCE ENGINE (Steps 1-6) ───

  // Step 1: Passive Rhythm Analysis
  const logTypingRhythm = (interval) => {
    if (!data.consent?.passiveTracking) return;
    const intervals = [...(data.passiveSignals?.rhythmicIntervals || [])].slice(-50);
    intervals.push(interval);
    
    let drift = 0;
    let baseline = data.passiveSignals?.learningBaseline;

    // Phase 1: Baseline Formation — freeze after 20 samples
    if (!baseline && intervals.length >= 20) {
      baseline = {
        avg: intervals.reduce((a, b) => a + b, 0) / intervals.length,
        stdDev: Math.sqrt(intervals.reduce((a, b) => a + Math.pow(b - (intervals.reduce((s, v) => s + v, 0) / intervals.length), 2), 0) / intervals.length),
        formedAt: new Date().toISOString(),
        sampleCount: intervals.length,
      };
    }

    // Phase 2: Drift Detection — use windowed average (last 5) vs frozen baseline
    if (baseline && intervals.length >= 5) {
      const recentWindow = intervals.slice(-5);
      const recentAvg = recentWindow.reduce((a, b) => a + b, 0) / recentWindow.length;
      const rawDrift = (recentAvg - baseline.avg) / Math.max(baseline.avg, 1);
      // Clamp drift to [-1, 1] to prevent outlier explosion
      drift = Math.max(-1, Math.min(1, rawDrift));
    }

    persist({ 
        ...data, 
        passiveSignals: { 
            ...data.passiveSignals, 
            rhythmicIntervals: intervals,
            typingDrift: drift,
            learningBaseline: baseline || data.passiveSignals?.learningBaseline || null,
        } 
    });
  };

  // Step 2: Personalization & Best Time
  const learnOptimalWindow = () => {
    if (data.gameHistory.length < 10) return;
    const times = { morning: [], afternoon: [], evening: [] };
    
    data.gameHistory.forEach(g => {
        const hour = new Date(g.date).getHours();
        const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
        times[period].push(g.score);
    });

    const avgs = Object.keys(times).map(p => ({
        period: p,
        avg: times[p].length > 0 ? times[p].reduce((a,b)=>a+b,0)/times[p].length : 0
    }));

    const best = avgs.reduce((a, b) => a.avg > b.avg ? a : b).period;
    persist({ ...data, deepIntelligence: { ...data.deepIntelligence, bestTimeWindow: best } });
  };

  // Step 6: Data Sufficiency
  const getDataSufficiency = () => {
    const sessionCount = data.sessions.length;
    const gameCount = data.gameHistory.length;
    // Need 5 assessments and 20 games for "High" sufficiency
    let score = (Math.min(5, sessionCount) * 10) + (Math.min(20, gameCount) * 2.5);
    return Math.min(100, score);
  };

  const calculateDeepInsights = () => {
    const rel = calculateSignalReliability();
    const sufficiency = getDataSufficiency();
    const bias = data.deepIntelligence.awarenessHistory || [];
    
    // Detect bias: trend of mismatch
    let biasType = 'Stable';
    if (bias.length > 3) {
        const last = bias.slice(-3).map(b => b.mismatchValue);
        const avgMismatch = last.reduce((a,b)=>a+b,0)/3;
        if (avgMismatch > 1) biasType = 'Over-optimistic';
        if (avgMismatch < -1) biasType = 'Under-confident';
    }

    return {
        reliabilityScore: Math.round(rel.score * (sufficiency/100)),
        sufficiency,
        biasType,
        personalizedMessage: getPredictiveAdvice()
    };
  };

  const getPredictiveAdvice = () => {
    const risk = data.riskAssessment?.domains || {};
    const sleep = data.confounders?.sleep || 3;
    const drift = data.passiveSignals?.typingDrift || 0;

    if (risk.memory === 'high' && sleep < 3) {
        return "Critical Path: Memory training + Sleep hygiene focus required to prevent trajectory decay.";
    }
    if (drift > 0.2) {
        return "Caution: Passive behavioral drift detected. Suggest 48-hour recovery cycle.";
    }
    return "Status Stable: Optimal training frequency maintaining cognitive reserve.";
  };

  // ─── SECURITY & TRUST METHODS ───

  // Module 1: Data Classification & RBAC
  const verifyAccess = (requiredLevel, action) => {
    const rolePermissions = {
        USER: ['READ_SELF', 'WRITE_SELF', 'EXPORT_REPORT', 'LINK_CAREGIVER'],
        CLINICIAN: ['READ_REPORTS', 'EXPORT_REPORTS'],
        CAREGIVER: ['READ_INSIGHTS_SUMMARY', 'RECEIVE_ALERTS']
    };

    const hasPermission = rolePermissions[data.accessControl.role].includes(action);
    if (!hasPermission) {
        logSecurityEvent('ACCESS_DENIED', { action, requiredLevel });
        return false;
    }

    // Level 3 requirement (Sensitive Data)
    if (requiredLevel === 3) {
        const lastAuth = data.security.lastAuth ? new Date(data.security.lastAuth) : null;
        const now = new Date();
        // Require re-auth if > 5 mins
        if (!lastAuth || (now - lastAuth) > 300000) {
            return 'RE_AUTH_REQUIRED';
        }
    }

    return true;
  };

  const logSecurityEvent = (eventType, metadata) => {
    const log = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        eventType,
        metadata
    };
    persist({ ...data, security: { ...data.security, auditLogs: [log, ...(data.security.auditLogs || [])].slice(0, 100) } });
  };

  // Module 8: Anonymization
  const getAnonymizedContainer = (payload) => {
    // Decouple PII from Cognitive Metadata
    return {
        _token: data.pii.token,
        _timestamp: new Date().toISOString(),
        _data: payload
    };
  };

  const confirmSecurityAuth = () => {
    persist({ ...data, security: { ...data.security, lastAuth: new Date().toISOString() } });
  };

  const dismissDecayAlert = () => {
    persist({ ...data, decayAlertPending: false });
  };

  // ─── RE-CONSENT ENGINE (Security Module 6 Advanced) ───
  const isReConsentNeeded = () => {
    if (!data.consent.lastConsentDate) return data.consent.baselineConsent;
    const last = new Date(data.consent.lastConsentDate);
    const now = new Date();
    const daysSince = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    return daysSince >= 30;
  };

  const updateConsent = (flags) => {
    persist({ ...data, consent: { ...data.consent, ...flags, lastConsentDate: new Date().toISOString() } });
  };

  // ─── ANOMALY DETECTION (Security Module 10) ───
  const detectAnomalies = () => {
    const flags = [];
    const logs = data.security.auditLogs || [];
    const now = new Date();
    const recentLogs = logs.filter(l => (now - new Date(l.timestamp)) < 60000);
    if (recentLogs.length > 10) flags.push({ type: 'RAPID_ACTIONS', severity: 'high', message: 'Unusual burst of activity detected' });
    const hour = now.getHours();
    if (hour >= 3 && hour <= 5) flags.push({ type: 'ODD_HOURS', severity: 'medium', message: 'Access at unusual hours' });
    const authFails = logs.filter(l => l.eventType === 'ACCESS_DENIED' && (now - new Date(l.timestamp)) < 3600000);
    if (authFails.length >= 3) flags.push({ type: 'AUTH_FAILURES', severity: 'high', message: 'Multiple access denials detected' });
    if (flags.some(f => f.severity === 'high')) {
      persist({ ...data, security: { ...data.security, anomaliesDetectedDevice: true } });
    }
    return flags;
  };

  // ─── META-COGNITIVE INSIGHTS GENERATOR ───
  const generateMetaInsights = () => {
    const insights = [];
    const mc = data.metaCognitive;
    const history = data.gameHistory || [];
    if (mc.hesitationIndex > 800) insights.push({ icon: '⏸️', text: 'You hesitate more in recall-intensive tasks', domain: 'memory', severity: 'moderate' });
    if (mc.attentionSpan < 20) insights.push({ icon: '👁️', text: 'Your attention drops after ~20 seconds of sustained focus', domain: 'attention', severity: 'moderate' });
    const morningGames = history.filter(g => new Date(g.date).getHours() < 12);
    const eveningGames = history.filter(g => new Date(g.date).getHours() >= 17);
    if (morningGames.length > 5 && eveningGames.length > 5) {
      const mornAvg = morningGames.reduce((a, g) => a + g.score, 0) / morningGames.length;
      const eveAvg = eveningGames.reduce((a, g) => a + g.score, 0) / eveningGames.length;
      if (mornAvg > eveAvg + 10) insights.push({ icon: '🌅', text: 'You perform better in morning sessions', domain: 'general', severity: 'info' });
      else if (eveAvg > mornAvg + 10) insights.push({ icon: '🌙', text: 'Your cognitive peak is in the evening', domain: 'general', severity: 'info' });
    }
    const errorDomains = {};
    history.filter(g => g.score < 50).forEach(g => { errorDomains[g.category] = (errorDomains[g.category] || 0) + 1; });
    Object.keys(errorDomains).forEach(domain => {
      if (errorDomains[domain] >= 3) insights.push({ icon: '⚠️', text: `Frequent errors in ${domain} tasks`, domain, severity: 'warning' });
    });
    const preds = data.metaPredictions || {};
    const predKeys = Object.keys(preds);
    if (predKeys.length >= 3) {
      const mismatches = predKeys.map(k => Math.abs(preds[k].expected - preds[k].actual));
      const avgMismatch = mismatches.reduce((a, b) => a + b, 0) / mismatches.length;
      if (avgMismatch > 20) insights.push({ icon: '🎯', text: 'Self-awareness gap detected — confidence misaligns with actual results', domain: 'meta', severity: 'moderate' });
    }
    if (insights.length === 0) insights.push({ icon: '✅', text: 'No significant behavioral patterns detected yet. Keep training!', domain: 'general', severity: 'info' });
    return insights;
  };

  // ─── IMPROVEMENT DATA (Before vs After) ───
  const getImprovementData = () => {
    if (data.sessions.length < 2) return null;
    const first = data.sessions[0];
    const latest = data.sessions[data.sessions.length - 1];
    const metrics = [
      { label: 'Word Recall', baseline: first.recallScore != null ? Math.round((first.recallScore / 3) * 100) : null, current: latest.recallScore != null ? Math.round((latest.recallScore / 3) * 100) : null },
      { label: 'Reaction Speed', baseline: first.reactionAvg, current: latest.reactionAvg, inverse: true, unit: 'ms' },
      { label: 'Pattern Memory', baseline: first.patternScore != null ? Math.round((first.patternScore / 4) * 100) : null, current: latest.patternScore != null ? Math.round((latest.patternScore / 4) * 100) : null },
      { label: 'Clock Drawing', baseline: first.clockScore, current: latest.clockScore },
      { label: 'Speech Rhythm', baseline: first.speechScore, current: latest.speechScore },
    ].filter(m => m.baseline != null && m.current != null);
    return {
      sessions: data.sessions.length,
      firstDate: first.date,
      latestDate: latest.date,
      metrics: metrics.map(m => ({ ...m, delta: m.inverse ? m.baseline - m.current : m.current - m.baseline, deltaPct: m.inverse ? Math.round(((m.baseline - m.current) / Math.max(m.baseline, 1)) * 100) : Math.round(((m.current - m.baseline) / Math.max(m.baseline, 1)) * 100) })),
    };
  };

  // ─── PER-DOMAIN EXPLAINABILITY (Step 19) ───
  const getDomainExplanation = (domain) => {
    const history = data.gameHistory?.filter(g => g.category === domain) || [];
    const c = data.confounders || {};
    const reasons = [];
    if (history.length < 3) { reasons.push('Limited data — only ' + history.length + ' sessions for this domain'); }
    else {
      const recent = history.slice(-3);
      const older = history.slice(-6, -3);
      if (older.length > 0) {
        const recentAvg = recent.reduce((a, g) => a + g.score, 0) / recent.length;
        const olderAvg = older.reduce((a, g) => a + g.score, 0) / older.length;
        const diff = recentAvg - olderAvg;
        if (diff > 10) reasons.push('Score improved by ' + Math.round(diff) + '% due to consistent training');
        else if (diff < -10) reasons.push('Score dropped by ' + Math.round(Math.abs(diff)) + '% — possible fatigue or environmental factors');
        else reasons.push('Score has been stable across recent sessions');
      }
    }
    if ((c.sleep || 3) < 3) reasons.push('Poor sleep quality may be affecting results');
    if ((c.stress || 3) > 3) reasons.push('Elevated stress levels can impair ' + domain + ' performance');
    if ((c.noise || 1) > 3) reasons.push('Environmental noise reducing signal reliability');
    return reasons;
  };

  // ─── CAREGIVER DATA (Step 21) ───
  const getCaregiverData = () => {
    const drift = getDrift();
    const pathway = getActionPathway();
    const latestDate = data.sessions.length > 0 ? data.sessions[data.sessions.length - 1].date : null;
    const alerts = [];
    if (drift.hasDrift && drift.overall > 15) alerts.push({ type: 'DRIFT', message: 'Significant cognitive drift detected (' + drift.overall + '% deviation)', severity: 'high' });
    if (data.fatigue?.isFatigued) alerts.push({ type: 'FATIGUE', message: 'User experiencing cognitive fatigue during sessions', severity: 'moderate' });
    if (data.streak === 0 && data.sessions.length > 3) alerts.push({ type: 'ENGAGEMENT', message: 'Training streak broken — no recent activity', severity: 'low' });
    return { overallTrend: drift.hasDrift ? 'declining' : 'stable', lastActivity: latestDate, streak: data.streak, sessionsTotal: data.sessions.length, gamesPlayed: data.gameHistory?.length || 0, pathway: pathway.title, urgency: pathway.urgency, alerts };
  };

  // ─── PINNACLE: PREDICTIVE TRAJECTORY ENGINE (Module 2) ───
  const calculateTrajectory = () => {
    return PredictiveEngine.predict(data);
  };

  // ─── SYSTEM INTEGRATION: Full Interpretation Pipeline ───
  const getFullInterpretation = () => {
    return IntegrationLayer.computeFullInterpretation(data);
  };

  const getEnrichedScore = (rawScore, gameId, category) => {
    return IntegrationLayer.enrichScore(rawScore, data, gameId, category);
  };

  const getCareActions = () => {
    return IntegrationLayer.computeCareActions(data);
  };

  const getSyncStatus = () => {
    return Sync.getStatus();
  };

  // ─── PINNACLE: PSYCHOMETRICS (Module 8) ───
  const calculatePsychometrics = () => {
    const history = data.gameHistory || [];
    if (history.length < 4) return { reliability: 0, practiceEffect: 0, consistency: 0, calibration: {} };
    const grouped = {};
    history.forEach(g => { grouped[g.gameId] = (grouped[g.gameId] || []).concat(g.score); });
    let totalReliability = 0, count = 0;
    Object.values(grouped).forEach(scores => {
      if (scores.length >= 2) {
        const pairs = scores.slice(0, -1).map((s, i) => Math.abs(s - scores[i + 1]));
        totalReliability += 100 - (pairs.reduce((a, b) => a + b, 0) / pairs.length);
        count++;
      }
    });
    const reliability = count > 0 ? Math.round(totalReliability / count) : 0;
    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));
    const firstAvg = firstHalf.reduce((a, g) => a + g.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, g) => a + g.score, 0) / secondHalf.length;
    const practiceEffect = Math.round(secondAvg - firstAvg);
    const allScores = history.map(g => g.score);
    const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const variance = allScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allScores.length;
    const consistency = Math.round(100 - Math.sqrt(variance));
    const onb = data.onboarding || {};
    const calibration = {};
    if (onb.ageBand === '70+') calibration.age = 1.15;
    else if (onb.ageBand === '55-70') calibration.age = 1.08;
    else calibration.age = 1.0;
    if (onb.education === 'Primary') calibration.education = 1.12;
    else if (onb.education === 'Secondary') calibration.education = 1.05;
    else calibration.education = 1.0;
    if (onb.deviceFamiliarity <= 2) calibration.device = 1.1;
    else calibration.device = 1.0;
    return { reliability, practiceEffect, consistency, calibration };
  };

  // ─── PINNACLE: FAIRNESS ENGINE (Module 9) ───
  const calculateFairness = () => {
    const onb = data.onboarding || {};
    let factor = 1.0;
    let risks = [];
    if (onb.ageBand === '70+') { factor *= 1.12; risks.push('Age-based scoring adjustment applied'); }
    if (onb.education === 'Primary') { factor *= 1.1; risks.push('Education-based adjustment applied'); }
    if (onb.deviceFamiliarity <= 2) { factor *= 1.08; risks.push('Low device familiarity compensation'); }
    if (onb.visionIssues) { factor *= 1.05; risks.push('Vision impairment accommodation'); }
    if (onb.hearingIssues) { factor *= 1.05; risks.push('Hearing impairment accommodation'); }
    return { adjustmentFactor: Math.round(factor * 100) / 100, biasRisk: risks.length > 2 ? 'high' : risks.length > 0 ? 'moderate' : 'low', risks };
  };

  // ─── PINNACLE: GOVERNANCE (Module 10) ───
  const getGovernanceTags = () => {
    return {
      domainScores: { tag: 'Production', validated: true },
      driftDetection: { tag: 'Production', validated: true },
      passiveSignals: { tag: 'Pilot', validated: false },
      metaCognitive: { tag: 'Experimental', validated: false },
      scamProtection: { tag: 'Pilot', validated: false },
      trajectory: { tag: 'Experimental', validated: false },
      fairnessAdjust: { tag: 'Pilot', validated: false },
      careMode: { tag: 'Production', validated: true },
    };
  };

  // ─── CARE: MEDICATION ADHERENCE (Module 2) ───
  const addMedication = (med) => {
    const meds = [...(data.medication.schedules || []), { id: Date.now().toString(), ...med, active: true }];
    persist({ ...data, medication: { ...data.medication, schedules: meds } });
  };
  const logMedicationTaken = (medId) => {
    const entry = { medId, timestamp: new Date().toISOString(), taken: true };
    const history = [...(data.medication.history || []), entry];
    const total = history.length;
    const taken = history.filter(h => h.taken).length;
    const adherence = Math.round((taken / Math.max(total, 1)) * 100);
    persist({ ...data, medication: { ...data.medication, history, adherenceScore: adherence } });
  };
  const logMedicationMissed = (medId) => {
    const entry = { medId, timestamp: new Date().toISOString(), taken: false };
    const history = [...(data.medication.history || []), entry];
    const missed = (data.medication?.missedCount || 0) + 1;
    const taken = history.filter(h => h.taken).length;
    const adherence = Math.round((taken / Math.max(history.length, 1)) * 100);
    persist({ ...data, medication: { ...data.medication, history, missedCount: missed, adherenceScore: adherence } });
  };

  // ─── CARE: DAILY CHECK-IN (Module 4) ───
  const submitCheckIn = (response) => {
    const entry = { date: new Date().toISOString(), response, status: response === 'ok' ? 'ok' : response === 'not_ok' ? 'concern' : 'no_response' };
    const checkIns = [...(data.dailyCheckIns || []), entry];
    const streak = response !== 'no_response' ? ((data.welfare?.checkInStreak || 0) + 1) : 0;
    const recent = checkIns.slice(-7);
    const responded = recent.filter(c => c.status !== 'no_response').length;
    const reliability = Math.round((responded / Math.max(recent.length, 1)) * 100);
    const nonResponseRisk = reliability < 50 ? 'high' : reliability < 75 ? 'moderate' : 'low';
    persist({ ...data, dailyCheckIns: checkIns, welfare: { ...data.welfare, lastCheckIn: entry.date, checkInStreak: streak, responseReliability: reliability, nonResponseRisk, status: entry.status } });
  };

  // ─── CARE: SCAM PROTECTION (Module 1) ───
  const logRiskyAction = (action) => {
    const count = (data.scamProtection.riskyActionCount || 0) + 1;
    const shouldEscalate = count >= 3;
    persist({ ...data, scamProtection: { ...data.scamProtection, riskyActionCount: count, lastAlert: new Date().toISOString() } });
    return { escalate: shouldEscalate, count };
  };
  const toggleProtectedMode = (enabled) => {
    persist({ ...data, scamProtection: { ...data.scamProtection, protectedMode: enabled } });
  };
  const addKnownContact = (contact) => {
    const contacts = [...(data.scamProtection.knownContacts || []), contact];
    persist({ ...data, scamProtection: { ...data.scamProtection, knownContacts: contacts } });
  };

  // ─── CARE: CARE MODE (Module 3) ───
  const toggleCareMode = (enabled) => {
    // When turning OFF care mode, preserve the user's existing font scale preference
    const currentFontScale = data.adaptivePrefs?.fontSizeScale || 1.0;
    persist({ 
      ...data, 
      careMode: { ...data.careMode, enabled }, 
      adaptivePrefs: { 
        ...data.adaptivePrefs, 
        fontSizeScale: enabled ? Math.max(1.4, currentFontScale) : currentFontScale,
        oneTaskMode: enabled ? true : (data.adaptivePrefs?.oneTaskMode || false),
        clutterFree: enabled ? true : (data.adaptivePrefs?.clutterFree || false),
      } 
    });
  };
  const toggleLockdown = (enabled) => {
    persist({ ...data, careMode: { ...data.careMode, lockdown: enabled } });
  };

  // ─── CARE: OUTCOME TRACKING (Module 7) ───
  const submitDailyOutcome = (report) => {
    const entry = { date: new Date().toISOString(), ...report };
    const reports = [...(data.outcomes.dailyReports || []), entry];
    const positive = reports.filter(r => r.dayEasier === true).length;
    const lifeImpact = Math.round((positive / Math.max(reports.length, 1)) * 100);
    const trend = reports.length >= 3 ? (positive / reports.length > 0.6 ? 'improving' : positive / reports.length < 0.4 ? 'declining' : 'stable') : 'stable';
    persist({ ...data, outcomes: { ...data.outcomes, dailyReports: reports, lifeImpactScore: lifeImpact, functionalTrend: trend } });
  };
  const addCaregiverObservation = (obs) => {
    const observations = [...(data.outcomes.caregiverObservations || []), { date: new Date().toISOString(), text: obs }];
    persist({ ...data, outcomes: { ...data.outcomes, caregiverObservations: observations } });
  };

  // ─── PINNACLE: CLINICIAN REPORT (Module 7) ───
  const generateClinicalReport = () => {
    const psycho = calculatePsychometrics();
    const fair = calculateFairness();
    const traj = calculateTrajectory();
    const gov = getGovernanceTags();
    const drift = getDrift();
    const reliability = calculateSignalReliability();
    return {
      domainScores: data.assessmentScores,
      confidenceLevels: data.confidenceProfile,
      confounderHistory: data.confounders,
      passiveSignals: data.passiveSignals,
      transferPerformance: data.outcomes?.lifeImpactScore || 0,
      practiceAdjusted: psycho.practiceEffect,
      dataSufficiency: data.deepIntelligence?.sufficiency || 0,
      reliability: psycho.reliability,
      fairnessAdjustment: fair.adjustmentFactor,
      trajectory: traj,
      drift,
      governanceTags: gov,
      generatedAt: new Date().toISOString(),
      disclaimer: 'This report does not constitute a medical diagnosis. Please consult a healthcare professional for clinical interpretation.',
    };
  };

  return (
    <DataContext.Provider value={{
      data, loaded, persist, setUser, logout, saveSession, getDrift, getRecovery, getLatestSession,
      saveGameResult, getTodayStreakProgress, getGameRecommendations,
      addFamilyMember, removeFamilyMember, generateWeeklyReport,
      markQuestionnaireCompleted, allUsers,
      saveSelectedConditions, saveQuestionnaireAnswers, saveRiskAssessment,
      saveAssessmentScore, markAssessmentCompleted, getAssessmentProgress,
      addXP, assignGamesFromResults, completeAssignedGame,
      updateDifficulty, generateMicroGoals, logMetaCognitive, dismissDecayAlert,
      saveConfounders, calculateSignalReliability, getActionPathway, calculateWhatIfSimulation,
      calculateReadiness, monitorPerformance, adjustScore, saveOnboarding, saveConsent,
      logTypingRhythm, learnOptimalWindow, calculateDeepInsights,
      verifyAccess, logSecurityEvent, getAnonymizedContainer, confirmSecurityAuth,
      isReConsentNeeded, updateConsent, detectAnomalies, generateMetaInsights,
      getImprovementData, getDomainExplanation, getCaregiverData,
      calculateTrajectory, calculatePsychometrics, calculateFairness, getGovernanceTags,
      addMedication, logMedicationTaken, logMedicationMissed,
      submitCheckIn, logRiskyAction, toggleProtectedMode, addKnownContact,
      toggleCareMode, toggleLockdown,
      submitDailyOutcome, addCaregiverObservation, generateClinicalReport,
      getFullInterpretation, getEnrichedScore, getCareActions, getSyncStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
