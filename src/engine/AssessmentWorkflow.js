const tests = {
  words: ['WordPresentation', 'Memorize three words', 'memory'],
  reaction: ['ReactionTest', 'Reaction speed', 'motor'],
  pattern: ['PatternTest', 'Pattern memory', 'visuospatial'],
  clock: ['ClockTest', 'Clock drawing', 'visuospatial'],
  pairedAssociate: ['PairedAssociate', 'Paired association', 'memory'],
  storyRecall: ['StoryRecall', 'Story recall', 'memory'],
  visualMemory: ['VisualMemory', 'Visual memory', 'visuospatial'],
  recognitionMemory: ['RecognitionMemory', 'Recognition memory', 'memory'],
  objectNaming: ['ObjectNaming', 'Object naming', 'language'],
  sentenceRep: ['SentenceRepetition', 'Written sentence repetition', 'language'],
  comprehension: ['Comprehension', 'Comprehension', 'language'],
  mentalRotation: ['MentalRotation', 'Mental rotation', 'visuospatial'],
  fingerTap: ['FingerTapping', 'Finger tapping', 'motor'],
  digitSpan: ['NumberSpan', 'Digit span', 'attention'],
  goNoGo: ['GoNoGo', 'Go / No-Go', 'attention'],
  visualSearch: ['VisualSearch', 'Visual search', 'attention'],
  stroop: ['StroopChallenge', 'Interference task', 'executive'],
  taskSwitch: ['RuleSwitch', 'Task switching', 'executive'],
  planning: ['MultiStepPlanner', 'Planning', 'executive'],
  dragPrecision: ['PrecisionHold', 'Hold precision', 'motor'],
  recall: ['DelayedRecall', 'Recall the three words', 'memory'],
};

export const FULL_TESTS = [
  'words', 'reaction', 'pattern', 'clock', 'pairedAssociate', 'storyRecall',
  'recognitionMemory', 'objectNaming', 'sentenceRep', 'comprehension',
  'mentalRotation', 'fingerTap', 'digitSpan', 'goNoGo', 'stroop', 'recall',
];

const targets = {
  memory: ['pairedAssociate', 'recognitionMemory', 'storyRecall'],
  attention: ['digitSpan', 'goNoGo', 'visualSearch'],
  executive: ['stroop', 'taskSwitch', 'planning'],
  language: ['objectNaming', 'sentenceRep', 'comprehension'],
  visuospatial: ['clock', 'mentalRotation', 'visualMemory'],
  motor: ['fingerTap', 'dragPrecision', 'reaction'],
};

const training = {
  memory: ['MemoryMatch', 'FlashRecall', 'SequenceMemory'],
  attention: ['GoNoGo', 'VisualSearch', 'FocusFlow'],
  executive: ['StroopChallenge', 'RuleSwitch', 'MultiStepPlanner'],
  language: ['WordScramble', 'VerbalFluency', 'WordAssociation'],
  visuospatial: ['PatternMatrix', 'MentalRotation', 'MirrorPattern'],
  motor: ['ReflexTap', 'PrecisionHold', 'SpeedSort'],
};

export function createPlan({ hasHistory, background = {}, current = {} }) {
  const priority = Object.fromEntries(Object.keys(targets).map(domain => [
    domain, Math.min(2, Math.max(0, background[domain] || 0) + (current[domain] || 0)),
  ]));
  const selected = new Set(['reaction', 'pattern', 'goNoGo']);
  if (hasHistory) {
    Object.entries(priority).forEach(([domain, value]) => {
      if (value) targets[domain].slice(0, value + 1).forEach(id => selected.add(id));
    });
  }
  const ids = hasHistory ? ['words', ...selected, 'recall'] : FULL_TESTS;
  return {
    mode: hasHistory ? 'targeted' : 'full',
    priority,
    domains: Object.fromEntries(Object.entries(priority).map(([id, value]) => [id, ['low', 'moderate', 'high'][value]])),
    mandatoryTests: ids.map(id => {
      const [route, label, domain] = tests[id];
      return { id, route, label, domain };
    }),
  };
}

export function normalizeMeasurement(id, rawScore) {
  if (!Number.isFinite(rawScore)) return null;
  if (id === 'recall') return Math.round(Math.min(3, Math.max(0, rawScore)) * 100 / 3);
  if (id === 'reaction') return Math.round(Math.min(100, Math.max(0, 100 - (rawScore - 200) / 5)));
  return Math.round(Math.min(100, Math.max(0, rawScore)));
}

export function summarizeAttempt(attempt) {
  if (!attempt?.words?.length) return null;
  const required = attempt.plan.mandatoryTests.filter(test => test.id !== 'words');
  if (!required.length || required.some(test => !Number.isFinite(attempt.scores[test.id]?.score))) return null;
  const domains = {};
  required.forEach(({ id, domain }) => {
    (domains[domain] ??= []).push(attempt.scores[id].score);
  });
  const domainScores = Object.fromEntries(Object.entries(domains).map(([domain, scores]) => [
    domain, Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
  ]));
  const values = Object.values(domainScores);
  const overall = Math.round(values.reduce((sum, score) => sum + score, 0) / values.length);
  return { domainScores, overall };
}

export function recommendTraining(plan, domainScores) {
  const order = Object.keys(training).sort((a, b) => {
    const need = id => (Number.isFinite(domainScores[id]) ? 100 - domainScores[id] : 0) + (plan.priority[id] || 0) * 15;
    return need(b) - need(a);
  });
  return order.flatMap((domain, rank) => training[domain].slice(0, rank < 2 ? 2 : 1).map((id, index) => ({
    id, domain, status: rank < 2 && index === 0 ? 'mandatory' : 'optional', completed: false,
  })));
}

export const gameKey = id => String(id || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function calculateStreak(progress, now = new Date()) {
  const categories = ['memory', 'attention', 'executive', 'language'];
  const qualifies = date => {
    const entry = progress[date.toDateString()];
    return entry && (entry.gamesPlayed >= 6 || categories.every(category => entry.categories.includes(category)));
  };
  const date = new Date(now);
  if (!qualifies(date)) date.setDate(date.getDate() - 1);
  let streak = 0;
  while (qualifies(date)) {
    streak++;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}
