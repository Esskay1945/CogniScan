import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataContext = createContext();

const STORAGE_KEY = '@cogniscan_data';

const defaultData = {
  user: null,
  sessions: [],        // Array of test session results
  streak: 0,
  lastSessionDate: null,
  baselineSet: false,
  baseline: {           // Cognitive Twin baseline
    reactionAvg: null,
    patternScore: null,
    recallScore: null,
    clockScore: null,
  },
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(defaultData);
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setData(JSON.parse(raw));
      } catch (e) { /* first run */ }
      setLoaded(true);
    })();
  }, []);

  // Save to storage on every change
  const persist = async (newData) => {
    setData(newData);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData)); } catch (e) {}
  };

  const setUser = (user) => persist({ ...data, user });

  const logout = async () => {
    setData(defaultData);
    try { await AsyncStorage.removeItem(STORAGE_KEY); } catch (e) {}
  };

  // Save a full test session and update cognitive twin baseline
  const saveSession = (session) => {
    // session = { date, reactionAvg, patternScore, recallScore, clockScore, reactionTimes, elapsed }
    const newSessions = [...data.sessions, { ...session, date: new Date().toISOString() }];
    
    let newBaseline = { ...data.baseline };
    let baselineSet = data.baselineSet;
    
    // First session becomes the baseline (Cognitive Twin initialization)
    if (!data.baselineSet) {
      newBaseline = {
        reactionAvg: session.reactionAvg,
        patternScore: session.patternScore,
        recallScore: session.recallScore,
        clockScore: session.clockScore,
      };
      baselineSet = true;
    }

    // Streak logic
    const today = new Date().toDateString();
    const lastDate = data.lastSessionDate;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let streak = data.streak;
    if (lastDate === today) {
      // Same day, keep streak
    } else if (lastDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }

    persist({
      ...data,
      sessions: newSessions,
      baseline: newBaseline,
      baselineSet,
      streak,
      lastSessionDate: today,
    });
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

  return (
    <DataContext.Provider value={{
      data, loaded, setUser, logout, saveSession, getDrift, getRecovery, getLatestSession,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
