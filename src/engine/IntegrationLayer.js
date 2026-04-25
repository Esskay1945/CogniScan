// ─── COGNISCAN SYSTEM INTEGRATION LAYER ───
// Ensures all engines communicate correctly
// No module operates in isolation — all signals cross-inform

import { PredictiveEngine, CareIntegrationEngine } from './PredictiveEngine';

export class IntegrationLayer {

  // ══════════════════════════════════════════════
  // MASTER INTERPRETATION PIPELINE
  // ══════════════════════════════════════════════
  // DATA FLOW:
  // Tests + Passive Signals + Care Signals + Confounders + History
  //   → Domain Scores → Confidence → Prediction → Game Assignment → Care Actions

  static computeFullInterpretation(data) {
    // Step 1: Raw Domain Scores
    const domainScores = data.assessmentScores || {};

    // Step 2: Signal Reliability (confidence)
    const confounders = data.confounders || {};
    let baseConfidence = 70;
    if ((confounders.sleep || 3) < 3) baseConfidence -= 15;
    if ((confounders.stress || 3) > 3) baseConfidence -= 10;
    if ((confounders.noise || 1) > 3) baseConfidence -= 10;
    if ((data.gameHistory || []).length < 5) baseConfidence -= 20;
    baseConfidence = Math.max(0, Math.min(100, baseConfidence));

    // Step 3: Care-adjusted confidence
    const adjustedConfidence = CareIntegrationEngine.calculateCareAdjustedConfidence(
      baseConfidence, data
    );

    // Step 4: Multi-factor prediction
    const prediction = PredictiveEngine.predict(data);

    // Step 5: Care-adjusted risk levels
    const riskDomains = data.riskAssessment?.domains || {};
    const adjustedRisk = {};
    Object.keys(riskDomains).forEach(domain => {
      adjustedRisk[domain] = CareIntegrationEngine.adjustRiskForAdherence(
        riskDomains[domain], data.medication
      );
    });

    // Step 6: Drift detection
    const drift = this._computeDrift(data);

    // Step 7: Caregiver escalation check
    const escalation = CareIntegrationEngine.shouldEscalateToCaregiver(
      data.welfare, drift
    );

    // Step 8: Scam vulnerability
    const scamRisk = CareIntegrationEngine.assessScamVulnerability(
      data.scamProtection, data.passiveSignals, data.riskAssessment
    );

    // Step 9: Consistency validation
    const consistency = this._validateConsistency(
      domainScores, adjustedConfidence, prediction, adjustedRisk
    );

    return {
      domainScores,
      confidence: {
        raw: baseConfidence,
        adjusted: adjustedConfidence,
        level: adjustedConfidence > 80 ? 'High' : adjustedConfidence > 50 ? 'Medium' : 'Low',
      },
      prediction,
      risk: adjustedRisk,
      drift,
      escalation,
      scamRisk,
      consistency,
      context: {
        sessionsCompleted: (data.sessions || []).length,
        gamesPlayed: (data.gameHistory || []).length,
        streak: data.streak || 0,
        careMode: data.careMode?.enabled || false,
        medicationAdherence: data.medication?.adherenceScore ?? 100,
        welfareStatus: data.welfare?.status || 'unknown',
      },
      generatedAt: new Date().toISOString(),
    };
  }

  // ══════════════════════════════════════════════
  // ENRICHED SCORE (every score gets context)
  // ══════════════════════════════════════════════

  static enrichScore(rawScore, data, gameId, category) {
    const confounders = data.confounders || {};
    const fatigue = data.fatigue || {};
    const careMode = data.careMode?.enabled || false;

    // Base confidence
    let confidence = 70;
    if ((confounders.sleep || 3) < 3) confidence -= 15;
    if ((confounders.stress || 3) > 3) confidence -= 10;
    if (fatigue.isFatigued) confidence -= 15;
    confidence = CareIntegrationEngine.calculateCareAdjustedConfidence(confidence, data);

    // Practice correction
    const priorPlays = (data.gameHistory || []).filter(g => g.gameId === gameId).length;
    const practiceEffect = Math.min(0.15, priorPlays * 0.02);
    const adjustedScore = Math.max(0, Math.round(rawScore * (1 - practiceEffect)));

    // Care mode scoring accommodation
    const careModeAdjustment = careMode ? 1.15 : 1.0;
    const finalAdjusted = Math.min(100, Math.round(adjustedScore * careModeAdjustment));

    // Explanation
    const explanations = [];
    if (practiceEffect > 0) explanations.push(`Practice effect: -${Math.round(practiceEffect * 100)}%`);
    if (careMode) explanations.push('Care mode: +15% accommodation');
    if (fatigue.isFatigued) explanations.push('Fatigue detected: confidence reduced');
    if ((confounders.sleep || 3) < 3) explanations.push('Poor sleep: confidence reduced');

    return {
      raw: rawScore,
      adjusted: finalAdjusted,
      confidence,
      confidenceLevel: confidence > 80 ? 'High' : confidence > 50 ? 'Medium' : 'Low',
      context: {
        practiceCorrection: Math.round(practiceEffect * 100),
        careModeActive: careMode,
        fatigueDetected: !!fatigue.isFatigued,
        confounderImpact: confidence < 60 ? 'significant' : confidence < 80 ? 'moderate' : 'minimal',
      },
      explanations,
    };
  }

  // ══════════════════════════════════════════════
  // GAME ASSIGNMENT (informed by all signals)
  // ══════════════════════════════════════════════

  static computeGameAssignment(data) {
    const risk = data.riskAssessment?.domains || {};
    const history = data.gameHistory || [];
    const careMode = data.careMode?.enabled || false;

    // Domain → game catalog
    const DOMAIN_GAMES = {
      memory: ['MemoryMatch', 'FlashRecall', 'SequenceMemory', 'ContextRecall', 'InterferenceMemory'],
      attention: ['FocusFlow', 'DistractionFilter', 'OddballDetection', 'FlankerTask', 'VisualSearch'],
      executive: ['TowerSort', 'RuleSwitch', 'DecisionGrid', 'MultiStepPlanner', 'CategorySort'],
      language: ['WordScramble', 'SentenceLogic', 'RapidNaming', 'WordAssociation', 'ContextMeaning'],
      visuospatial: ['MazeRunner', 'MirrorPattern', 'Rotation3D', 'PathPrediction', 'PatternMatrix'],
      motor: ['ReflexTap', 'PrecisionHold', 'StabilityTap', 'MotionTracking', 'SpeedSort'],
    };

    const assignments = [];
    Object.keys(risk).forEach(domain => {
      const riskLevel = CareIntegrationEngine.adjustRiskForAdherence(risk[domain], data.medication);
      const games = DOMAIN_GAMES[domain] || [];
      
      if (riskLevel === 'high') {
        games.forEach(g => assignments.push({ gameId: g, domain, priority: 'mandatory', riskLevel }));
      } else if (riskLevel === 'moderate') {
        games.slice(0, careMode ? 1 : 2).forEach(g => assignments.push({ gameId: g, domain, priority: 'mandatory', riskLevel }));
      } else {
        games.slice(0, 1).forEach(g => assignments.push({ gameId: g, domain, priority: 'optional', riskLevel }));
      }
    });

    // Care mode: limit total games
    if (careMode && assignments.length > 8) {
      return assignments.filter(a => a.priority === 'mandatory').slice(0, 8);
    }

    return assignments;
  }

  // ══════════════════════════════════════════════
  // CARE ACTIONS (triggered by combined signals)
  // ══════════════════════════════════════════════

  static computeCareActions(data) {
    const actions = [];
    const prediction = PredictiveEngine.predict(data);
    const escalation = CareIntegrationEngine.shouldEscalateToCaregiver(
      data.welfare,
      this._computeDrift(data)
    );
    const scamRisk = CareIntegrationEngine.assessScamVulnerability(
      data.scamProtection, data.passiveSignals, data.riskAssessment
    );

    // Action 1: Caregiver alert
    if (escalation.shouldEscalate) {
      actions.push({
        type: 'CAREGIVER_ALERT',
        urgency: escalation.urgency,
        reasons: escalation.reasons,
        action: 'Notify linked caregiver immediately',
      });
    }

    // Action 2: Scam protection
    if (scamRisk.shouldSuggestProtectedMode) {
      actions.push({
        type: 'ENABLE_PROTECTION',
        urgency: scamRisk.level === 'HIGH' ? 'HIGH' : 'MODERATE',
        action: 'Suggest enabling Protected Mode',
        score: scamRisk.vulnerabilityScore,
      });
    }

    // Action 3: Clinical referral
    if (prediction.declineProbability > 70) {
      actions.push({
        type: 'CLINICAL_REFERRAL',
        urgency: 'HIGH',
        action: 'Recommend clinical evaluation',
        probability: prediction.declineProbability,
      });
    }

    // Action 4: Training adjustment
    if (data.fatigue?.isFatigued) {
      actions.push({
        type: 'REDUCE_TRAINING',
        urgency: 'MODERATE',
        action: 'Reduce daily training load — cognitive fatigue detected',
      });
    }

    // Action 5: Medication reminder
    if ((data.medication?.adherenceScore ?? 100) < 60) {
      actions.push({
        type: 'MEDICATION_ALERT',
        urgency: 'MODERATE',
        action: 'Medication adherence is critically low',
        adherence: data.medication?.adherenceScore,
      });
    }

    return actions;
  }

  // ──────────────────────────────────
  // INTERNAL
  // ──────────────────────────────────

  static _computeDrift(data) {
    const sessions = data.sessions || [];
    if (sessions.length < 2) return { hasDrift: false, overall: 0 };
    const recent = sessions.slice(-3);
    const older = sessions.slice(-6, -3);
    if (older.length === 0) return { hasDrift: false, overall: 0 };

    const recentAvg = recent.reduce((a, s) => a + (s.recallScore || 0), 0) / recent.length;
    const olderAvg = older.reduce((a, s) => a + (s.recallScore || 0), 0) / older.length;
    const overall = Math.round(Math.abs(recentAvg - olderAvg) * 33);
    return { hasDrift: overall > 10, overall, direction: recentAvg < olderAvg ? 'declining' : 'improving' };
  }

  static _validateConsistency(scores, confidence, prediction, risk) {
    const issues = [];

    // Check: high risk + high confidence = contradiction
    const hasHighRisk = Object.values(risk).some(v => v === 'high');
    if (hasHighRisk && confidence > 85) {
      issues.push('Warning: High risk detected but confidence is also high — verify test conditions');
    }

    // Check: prediction improving but risk is high
    if (prediction.classification === 'Improving' && hasHighRisk) {
      issues.push('Note: Trajectory is improving but baseline risk remains high — continue monitoring');
    }

    // Check: undefined states
    if (prediction.confidence === 0 && Object.keys(scores).length > 0) {
      issues.push('Insufficient data for reliable prediction despite existing scores');
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      validatedAt: new Date().toISOString(),
    };
  }
}
