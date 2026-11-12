import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Crypto from 'expo-crypto';
import { backendConfigured, signOut, subscribeToSession } from '../engine/BackendClient';
import { loadAccount, saveAccount, eraseAccountData } from '../engine/AccountStorage';
import { createPlan, normalizeMeasurement, summarizeAttempt, recommendTraining, gameKey, calculateStreak } from '../engine/AssessmentWorkflow';
import { removeReminderRegistration } from '../engine/PushNotifications';
import { PredictiveEngine, CareIntegrationEngine } from '../engine/PredictiveEngine';
import { IntegrationLayer } from '../engine/IntegrationLayer';

const DataContext = createContext();


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
  assessmentAttempt: null,
  accessibilityCompleted: false,

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

const freshData = () => JSON.parse(JSON.stringify(defaultUserData));

function mergeChanges(base, update, latest) {
  if (Object.is(base, update)) return latest;
  if (!update || typeof update !== 'object' || Array.isArray(update) || !base) return update;
  const result = { ...latest };
  Object.keys(update).forEach(key => {
    if (!Object.is(base[key], update[key])) result[key] = mergeChanges(base[key], update[key], latest?.[key]);
  });
  return result;
}

export const DataProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [data, setData] = useState({ user: null, ...freshData() });
  const [loaded, setLoaded] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [reload, setReload] = useState(0);
  const active = useRef(null);
  const uid = session?.user?.id ?? null;

  useEffect(() => subscribeToSession(setSession), []);

  const queueSave = (account, state) => {
    const { user: _identity, ...payload } = state;
    account.queue = account.queue.then(async () => {
      account.revision = await saveAccount(account.uid, payload, account.revision);
      if (active.current === account) setSyncError(null);
    }).catch(error => {
      if (active.current === account) setSyncError(error.message || 'Progress could not sync.');
    });
    return account.queue;
  };

  useEffect(() => {
    if (session === undefined) return undefined;
    let canceled = false;
    active.current = null;
    setLoaded(false);
    setAccountError(null);
    setSyncError(null);
    if (!uid) {
      setData({ ...freshData(), user: null });
      setLoaded(true);
      return undefined;
    }
    loadAccount(uid).then(record => {
      if (canceled) return;
      const { user: _savedIdentity, ...saved } = record.state ?? {};
      const defaults = freshData();
      const snapshot = {
        ...defaults,
        ...saved,
        adaptivePrefs: { ...defaults.adaptivePrefs, ...saved.adaptivePrefs },
        consent: { ...defaults.consent, ...saved.consent },
        security: { ...defaults.security, ...saved.security, lastAuth: null },
        user: {
          uid,
          email: session.user.email,
          name: session.user.name || session.user.email?.split('@')[0] || 'User',
        },
      };
      const account = { uid, state: snapshot, queue: Promise.resolve(), revision: record.revision };
      active.current = account;
      setData(snapshot);
      setLoaded(true);
      if (record.pending && !record.conflict) queueSave(account, snapshot);
      if (record.conflict) setSyncError('Your progress changed on another device. This device kept its local copy.');
    }).catch(error => {
      if (!canceled) {
        setAccountError(error.message || 'Could not load your account data.');
        setLoaded(true);
      }
    });
    return () => { canceled = true; };
  }, [uid, session === undefined, reload]);

  const persist = update => {
    const account = active.current;
    if (!account || account.uid !== uid || account.erasing || account.signingOut) return Promise.resolve();
    const next = typeof update === 'function' ? update(account.state) : mergeChanges(data, update, account.state);
    if (next === account.state) return Promise.resolve();
    account.state = next;
    setData(next);
    return queueSave(account, next);
  };

  const logout = async () => {
    const account = active.current;
    if (account) {
      account.signingOut = true;
      await account.queue;
      await removeReminderRegistration(account.uid).catch(() => {});
    }
    try {
      await signOut();
    } catch (error) {
      if (account) account.signingOut = false;
      throw error;
    }
  };

  const eraseProgress = async () => {
    const account = active.current;
    if (!account || account.uid !== uid) throw new Error('Sign in before erasing progress.');
    account.erasing = true;
    try {
      await account.queue;
      await eraseAccountData(uid);
      const state = { ...freshData(), user: account.state.user };
      account.revision = 0;
      account.state = state;
      setData(state);
      setSyncError(null);
    } finally {
      account.erasing = false;
    }
  };

  const startAssessment = ({ hasHistory = false, background = {}, current = {}, answers = {} } = {}) => {
    const plan = createPlan({ hasHistory, background, current });
    const attempt = { id: Crypto.randomUUID(), plan, scores: {}, words: null, startedAt: new Date().toISOString(), answers };
    persist(previous => ({
      ...previous, assessmentAttempt: attempt, riskAssessment: plan, assessmentScores: {},
      assessmentCompleted: false, questionnaireCompleted: true, questionnaireAnswers: answers,
    }));
    return plan;
  };

  const saveAssessmentWords = (attemptId, words) => persist(previous => {
    const attempt = previous.assessmentAttempt;
    if (!attempt || attempt.id !== attemptId || attempt.finishedAt || attempt.words) return previous;
    return { ...previous, assessmentAttempt: { ...attempt, words, presentedAt: new Date().toISOString() } };
  });

  const finishAssessment = attemptId => persist(previous => {
    const attempt = previous.assessmentAttempt;
    if (!attempt || attempt.id !== attemptId || attempt.finishedAt) return previous;
    const summary = summarizeAttempt(attempt);
    if (!summary) return previous;
    const date = new Date().toISOString();
    const record = {
      id: attempt.id, date, ...summary, mode: attempt.plan.mode,
      reactionAvg: attempt.scores.reaction?.rawScore ?? null,
      patternScore: attempt.scores.pattern?.score == null ? null : attempt.scores.pattern.score / 25,
      recallScore: attempt.scores.recall.rawScore,
      clockScore: attempt.scores.clock?.score ?? null,
      testIds: Object.keys(attempt.scores).sort(),
    };
    return {
      ...previous, assessmentCompleted: true,
      assessmentAttempt: { ...attempt, finishedAt: date, summary },
      sessions: [...previous.sessions, record],
      baselineSet: true, baseline: previous.baselineSet ? previous.baseline : record,
      assignedGames: recommendTraining(attempt.plan, summary.domainScores),
      lastSessionDate: new Date().toDateString(),
    };
  });

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
  const saveGameResult = game => {
    if (!Number.isFinite(game.score)) return;
    const now = new Date();
    const today = now.toDateString();
    persist(previous => {
      const key = gameKey(game.gameId);
      const history = previous.gameHistory || [];
      const plays = history.filter(entry => gameKey(entry.gameId) === key).length;
      const assignment = previous.assignedGames.find(item => gameKey(item.id) === key);
      const category = assignment?.domain || game.category;
      const score = Math.max(0, Math.min(100, Math.round(game.score)));
      const correction = Math.min(0.15, plays * 0.02);
      const gameHistory = [...history, {
        ...game, category, score, rawScore: score, adjustedScore: Math.round(score * (1 - correction)),
        practiceCorrection: Math.round(correction * 100), date: now.toISOString(),
      }];
      const progress = previous.streakProgress[today] || { categories: [], gamesPlayed: 0 };
      const todayProgress = { categories: [...new Set([...progress.categories, category])], gamesPlayed: progress.gamesPlayed + 1 };
      const streakProgress = { ...previous.streakProgress, [today]: todayProgress };
      const streak = calculateStreak(streakProgress, now);
      const weakest = previous.assignedGames.find(item => item.status === 'mandatory')?.domain;
      const missions = previous.dailyMissions?.date === today ? previous.dailyMissions.tasks : defaultUserData.dailyMissions.tasks;
      let xpAward = 15;
      const tasks = missions.map(task => {
        if (task.completed) return task;
        const completed = (task.id === '3games' && todayProgress.gamesPlayed >= 3)
          || (task.id === 'weakest' && weakest === category)
          || (task.id === 'perfect' && score === 100);
        if (completed) xpAward += task.xp;
        return { ...task, completed };
      });
      const xp = previous.xp + xpAward;
      const skillTrees = { ...previous.skillTrees };
      if (skillTrees[category]) {
        const domainXP = skillTrees[category].xp + 15;
        skillTrees[category] = { ...skillTrees[category], xp: domainXP, level: Math.floor(domainXP / 200) + 1 };
      }
      return {
        ...previous, gameHistory, streakProgress, streak, xp, skillTrees,
        level: Math.floor(xp / 100) + 1, lastSessionDate: today,
        dailyMissions: { date: today, tasks },
        streaks: { ...previous.streaks, daily: streak, lastActivity: now.toISOString() },
        assignedGames: previous.assignedGames.map(item => gameKey(item.id) === key
          ? { ...item, completed: true, completedDate: today }
          : item),
      };
    });
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
    const latest = data.sessions.at(-1);
    const baseline = data.sessions.find(session => session.mode === latest?.mode
      && session.testIds?.join() === latest?.testIds?.join());
    if (!baseline || baseline === latest || !Number.isFinite(latest.overall) || !Number.isFinite(baseline.overall)) {
      return { hasDrift: false, overall: 0, details: {} };
    }
    const overall = Math.max(0, baseline.overall - latest.overall);
    return { hasDrift: overall >= 10, overall, details: {} };
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

  const saveAssessmentScore = (testId, rawScore, details = {}) => {
    const score = normalizeMeasurement(testId, rawScore);
    if (score === null) return Promise.resolve();
    return persist(previous => {
      const attempt = previous.assessmentAttempt;
      if (!attempt || attempt.finishedAt || !attempt.plan.mandatoryTests.some(test => test.id === testId)) return previous;
      if (details.attemptId && details.attemptId !== attempt.id) return previous;
      const { attemptId: _attemptId, ...metadata } = details;
      const scores = { ...attempt.scores, [testId]: { ...metadata, rawScore, score, date: new Date().toISOString() } };
      return { ...previous, assessmentScores: scores, assessmentAttempt: { ...attempt, scores } };
    });
  };

  const markAssessmentCompleted = () => finishAssessment(data.assessmentAttempt?.id);
  const getAssessmentProgress = () => {
    const attempt = data.assessmentAttempt;
    const tests = attempt?.plan.mandatoryTests || [];
    const scores = attempt?.scores || {};
    const completed = tests.filter(test => test.id === 'words' ? attempt.words : scores[test.id] != null).length;
    return { total: tests.length, completed, tests, scores };
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
    let score = 90; // Heuristic session conditions indicator
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
            title: 'FOCUSED PRACTICE',
            steps: ['Review your assessment results', 'Practice the recommended activities'],
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

  const updateConsent = saveConsent;

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
    return { syncing: false, error: syncError, backendConfigured };
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
      domainScores: { tag: 'Experimental', validated: false },
      driftDetection: { tag: 'Experimental', validated: false },
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
  const logMedication = (medId, taken) => {
    const now = new Date();
    const date = now.toDateString();
    persist(previous => {
      if (!previous.medication.schedules.some(medicine => medicine.id === medId)) return previous;
      const history = [
        ...previous.medication.history.filter(entry => entry.medId !== medId
          || new Date(entry.timestamp).toDateString() !== date),
        { medId, timestamp: now.toISOString(), taken },
      ];
      const missedCount = history.filter(entry => !entry.taken).length;
      return {
        ...previous,
        medication: {
          ...previous.medication, history, missedCount,
          adherenceScore: Math.round((history.length - missedCount) * 100 / history.length),
        },
      };
    });
  };
  const logMedicationTaken = medId => logMedication(medId, true);
  const logMedicationMissed = medId => logMedication(medId, false);

  const submitCheckIn = response => {
    const now = new Date();
    const today = now.toDateString();
    const status = response === 'ok' ? 'ok' : response === 'not_ok' ? 'concern' : 'neutral';
    persist(previous => {
      const records = previous.dailyCheckIns.filter(item => new Date(item.date).toDateString() !== today);
      const dailyCheckIns = [...records, { date: now.toISOString(), response, status }];
      const days = new Set(dailyCheckIns.map(item => new Date(item.date).toDateString()));
      const date = new Date(now);
      let checkInStreak = 0;
      while (days.has(date.toDateString())) {
        checkInStreak++;
        date.setDate(date.getDate() - 1);
      }
      const first = new Date(dailyCheckIns[0].date);
      first.setHours(0, 0, 0, 0);
      const check = new Date(now);
      check.setHours(0, 0, 0, 0);
      let measuredDays = 0;
      let answeredDays = 0;
      while (measuredDays < 7 && check >= first) {
        measuredDays++;
        if (days.has(check.toDateString())) answeredDays++;
        check.setDate(check.getDate() - 1);
      }
      const responseReliability = Math.round(answeredDays * 100 / Math.max(1, measuredDays));
      const nonResponseRisk = responseReliability < 50 ? 'high' : responseReliability < 75 ? 'moderate' : 'low';
      return {
        ...previous, dailyCheckIns,
        welfare: { ...previous.welfare, lastCheckIn: now.toISOString(), checkInStreak, responseReliability, nonResponseRisk, status },
      };
    });
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
      data, loaded: loaded && (uid === data.user?.uid || (!uid && !data.user) || !!accountError), session, accountError, syncError, retryAccount: () => setReload(v => v + 1), persist, logout, eraseProgress, startAssessment, saveAssessmentWords, finishAssessment, saveSession, getDrift, getRecovery, getLatestSession,
      saveGameResult, getTodayStreakProgress, getGameRecommendations,
      addFamilyMember, removeFamilyMember, generateWeeklyReport,
      markQuestionnaireCompleted,
      saveSelectedConditions, saveQuestionnaireAnswers, saveRiskAssessment,
      saveAssessmentScore, markAssessmentCompleted, getAssessmentProgress,
      addXP, assignGamesFromResults, getCurrentStreak: () => calculateStreak(data.streakProgress),
      updateDifficulty, generateMicroGoals, logMetaCognitive, dismissDecayAlert,
      saveConfounders, calculateSignalReliability, getActionPathway, calculateWhatIfSimulation,
      calculateReadiness, monitorPerformance, adjustScore, saveOnboarding, saveConsent,
      logTypingRhythm, learnOptimalWindow, calculateDeepInsights,
      verifyAccess, logSecurityEvent, confirmSecurityAuth,
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
