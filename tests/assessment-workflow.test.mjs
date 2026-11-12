import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createPlan, normalizeMeasurement, summarizeAttempt, recommendTraining, FULL_TESTS, calculateStreak } from '../src/engine/AssessmentWorkflow.js';

const app = readFileSync(new URL('../App.js', import.meta.url), 'utf8');

test('no history always uses the full battery and recall is last', () => {
  const plan = createPlan({ hasHistory: false, current: { memory: 1, motor: 1 } });
  const ids = plan.mandatoryTests.map(test => test.id);
  assert.deepEqual(ids, FULL_TESTS);
  assert.equal(ids.length, 16);
  assert.equal(ids[0], 'words');
  assert.equal(ids.at(-1), 'recall');
  assert.equal(new Set(ids).size, ids.length);
});

test('past answers and current concerns add targeted tests independently', () => {
  const baseline = createPlan({ hasHistory: true }).mandatoryTests.map(test => test.id);
  const history = createPlan({ hasHistory: true, background: { language: 2 } }).mandatoryTests.map(test => test.id);
  const current = createPlan({ hasHistory: true, current: { executive: 2 } }).mandatoryTests.map(test => test.id);
  assert.ok(!baseline.includes('objectNaming'));
  assert.ok(history.includes('objectNaming'));
  assert.ok(history.includes('comprehension'));
  assert.ok(current.includes('taskSwitch'));
  assert.ok(current.includes('planning'));
  assert.ok(!history.includes('planning'));
  assert.equal(history.at(-1), 'recall');
  for (const item of createPlan({
    hasHistory: true,
    background: { memory: 2, attention: 2, executive: 2, language: 2, visuospatial: 2, motor: 2 },
  }).mandatoryTests) {
    assert.ok(app.includes(`name="${item.route}"`), `Missing route ${item.route}`);
  }
});

test('final score requires every measured test including delayed recall and preserves zero', () => {
  const plan = createPlan({ hasHistory: true });
  const scores = Object.fromEntries(plan.mandatoryTests.filter(test => test.id !== 'words' && test.id !== 'recall')
    .map(test => [test.id, { score: 70 }]));
  const attempt = { plan, scores, words: ['one', 'two', 'three'] };
  assert.equal(summarizeAttempt(attempt), null);
  scores.recall = { score: normalizeMeasurement('recall', 0) };
  assert.equal(summarizeAttempt(attempt).domainScores.memory, 0);
  assert.equal(normalizeMeasurement('recall', 3), 100);
  assert.equal(normalizeMeasurement('reaction', 300), 80);
  assert.equal(normalizeMeasurement('clock', undefined), null);
});

test('training recommendations respond to score and questionnaire priority', () => {
  const plan = createPlan({ hasHistory: true, current: { attention: 2 } });
  const assignments = recommendTraining(plan, { memory: 20, attention: 55, motor: 90 });
  assert.deepEqual(assignments.filter(game => game.status === 'mandatory').map(game => game.domain), ['memory', 'attention']);
  for (const game of assignments) assert.ok(app.includes(`name="${game.id}"`), `Missing game ${game.id}`);
});

test('streak remains active until the next day is missed', () => {
  const yesterday = new Date(2026, 10, 11);
  const today = new Date(2026, 10, 12);
  const tomorrow = new Date(2026, 10, 13);
  const progress = { [yesterday.toDateString()]: { gamesPlayed: 6, categories: [] } };
  assert.equal(calculateStreak(progress, today), 1);
  assert.equal(calculateStreak(progress, tomorrow), 0);
  progress[today.toDateString()] = { gamesPlayed: 4, categories: ['memory', 'attention', 'executive', 'language'] };
  assert.equal(calculateStreak(progress, today), 2);
});
