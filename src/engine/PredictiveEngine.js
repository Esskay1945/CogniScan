// ─── COGNISCAN PREDICTIVE INTELLIGENCE ENGINE ───
// Multi-factor cognitive trajectory prediction with confidence intervals
// Replaces simple trend calculation with integrated model

export class PredictiveEngine {

  // ══════════════════════════════════════════════
  // MULTI-FACTOR PREDICTION MODEL
  // ══════════════════════════════════════════════

  static predict(data) {
    const history = data.gameHistory || [];
    const sessions = data.sessions || [];
    const confounders = data.confounders || {};
    const fatigue = data.fatigue || {};
    const medication = data.medication || {};
    const passiveSignals = data.passiveSignals || {};
    const welfare = data.welfare || {};

    if (history.length < 5) {
      return {
        projected30d: null,
        projected90d: null,
        classification: 'Insufficient Data',
        confidence: 0,
        confidenceInterval: null,
        declineProbability: 0,
        improvementProbability: 0,
        recommendation: 'Complete more sessions to enable prediction',
        factors: [],
        interventions: ['Play 3+ games daily', 'Focus on weakest domain'],
      };
    }

    // ── Factor 1: Domain Score Trends ──
    const domainTrend = this._computeDomainTrend(history);

    // ── Factor 2: Passive Signal Drift ──
    const driftFactor = this._computeDriftFactor(passiveSignals);

    // ── Factor 3: Medication Adherence ──
    const adherenceFactor = this._computeAdherenceFactor(medication);

    // ── Factor 4: Fatigue Impact ──
    const fatigueFactor = this._computeFatigueFactor(fatigue, history);

    // ── Factor 5: Confounder Weight ──
    const confounderFactor = this._computeConfounderFactor(confounders);

    // ── Factor 6: Historical Variance ──
    const varianceFactor = this._computeVarianceFactor(history);

    // ── Factor 7: Welfare/Care Signals ──
    const welfareFactor = this._computeWelfareFactor(welfare);

    // ── Weighted Composite Score ──
    const weights = {
      domainTrend: 0.35,
      drift: 0.10,
      adherence: 0.15,
      fatigue: 0.10,
      confounders: 0.10,
      variance: 0.10,
      welfare: 0.10,
    };

    const compositeScore = 
      domainTrend.score * weights.domainTrend +
      driftFactor.score * weights.drift +
      adherenceFactor.score * weights.adherence +
      fatigueFactor.score * weights.fatigue +
      confounderFactor.score * weights.confounders +
      varianceFactor.score * weights.variance +
      welfareFactor.score * weights.welfare;

    // ── Projection ──
    const currentAvg = history.slice(-10).reduce((a, g) => a + g.score, 0) / Math.min(10, history.length);
    const monthlyRate = compositeScore * 1.5;
    const projected30d = Math.round(Math.min(100, Math.max(0, currentAvg + monthlyRate)));
    const projected90d = Math.round(Math.min(100, Math.max(0, currentAvg + monthlyRate * 3)));

    // ── Confidence Interval ──
    const uncertainty = varianceFactor.stdDev * (1 + (1 - (history.length / 50)));
    const confidenceInterval = {
      lower30d: Math.round(Math.max(0, projected30d - uncertainty)),
      upper30d: Math.round(Math.min(100, projected30d + uncertainty)),
      lower90d: Math.round(Math.max(0, projected90d - uncertainty * 1.5)),
      upper90d: Math.round(Math.min(100, projected90d + uncertainty * 1.5)),
    };

    // ── Classification ──
    let classification = 'Stable';
    if (compositeScore > 3) classification = 'Improving';
    else if (compositeScore > 1) classification = 'Trending Up';
    else if (compositeScore < -3) classification = 'Declining';
    else if (compositeScore < -1) classification = 'Trending Down';
    
    if (varianceFactor.score < -5) classification = 'Uncertain';

    // ── Probabilities ──
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const declineProbability = Math.round(sigmoid(-compositeScore * 0.5) * 100);
    const improvementProbability = Math.round(sigmoid(compositeScore * 0.5) * 100);

    // ── Confidence ──
    const dataSufficiency = Math.min(100, (history.length / 30) * 100);
    const confidence = Math.round(
      dataSufficiency * 0.4 +
      (100 - Math.min(100, uncertainty * 2)) * 0.3 +
      (adherenceFactor.score > -2 ? 80 : 40) * 0.15 +
      (confounderFactor.score > -3 ? 85 : 50) * 0.15
    );

    // ── Collect all influence factors ──
    const factors = [
      domainTrend, driftFactor, adherenceFactor,
      fatigueFactor, confounderFactor, varianceFactor, welfareFactor,
    ].filter(f => Math.abs(f.score) > 0.5);

    // ── Interventions ──
    const interventions = this._generateInterventions(factors, data);

    // ── Recommendation ──
    const recommendation = this._generateRecommendation(classification, factors);

    return {
      projected30d,
      projected90d,
      classification,
      confidence,
      confidenceInterval,
      declineProbability,
      improvementProbability,
      recommendation,
      factors: factors.map(f => ({ name: f.name, impact: f.score > 0 ? 'positive' : 'negative', magnitude: Math.abs(f.score) })),
      interventions,
      compositeScore: Math.round(compositeScore * 10) / 10,
      currentAvg: Math.round(currentAvg),
    };
  }

  // ──────────────────────────────────
  // FACTOR COMPUTATIONS
  // ──────────────────────────────────

  static _computeDomainTrend(history) {
    const recent = history.slice(-10);
    const older = history.slice(-20, -10);
    const recentAvg = recent.reduce((a, g) => a + g.score, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, g) => a + g.score, 0) / older.length : recentAvg;
    const trend = recentAvg - olderAvg;
    return { name: 'Domain Performance', score: trend, recentAvg, olderAvg };
  }

  static _computeDriftFactor(passiveSignals) {
    const drift = passiveSignals.typingDrift || 0;
    // Negative drift (slowing down) is bad
    const score = drift > 0.2 ? -3 : drift > 0.1 ? -1 : drift < -0.1 ? 1 : 0;
    return { name: 'Passive Signal Drift', score, drift };
  }

  static _computeAdherenceFactor(medication) {
    const adherence = medication.adherenceScore ?? 100;
    const score = adherence >= 90 ? 2 : adherence >= 70 ? 0 : adherence >= 50 ? -2 : -4;
    return { name: 'Medication Adherence', score, adherence };
  }

  static _computeFatigueFactor(fatigue, history) {
    let score = 0;
    if (fatigue.isFatigued) score -= 3;
    // Check if last 3 games show declining speed
    const recent = history.slice(-3);
    if (recent.length >= 3) {
      const scoreDecline = recent[0].score > recent[2].score;
      if (scoreDecline) score -= 1;
    }
    return { name: 'Cognitive Fatigue', score, isFatigued: !!fatigue.isFatigued };
  }

  static _computeConfounderFactor(confounders) {
    let score = 0;
    if ((confounders.sleep || 3) < 3) score -= 2;
    if ((confounders.stress || 3) > 3) score -= 2;
    if ((confounders.noise || 1) > 3) score -= 1;
    if ((confounders.sleep || 3) >= 4 && (confounders.stress || 3) <= 2) score += 2;
    return { name: 'Environmental Confounders', score };
  }

  static _computeVarianceFactor(history) {
    const scores = history.map(g => g.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    // High variance = unreliable → negative score
    const score = stdDev > 25 ? -3 : stdDev > 15 ? -1 : 1;
    return { name: 'Score Consistency', score, stdDev, mean };
  }

  static _computeWelfareFactor(welfare) {
    let score = 0;
    if (welfare.nonResponseRisk === 'high') score -= 3;
    else if (welfare.nonResponseRisk === 'moderate') score -= 1;
    if (welfare.status === 'concern') score -= 2;
    if ((welfare.checkInStreak || 0) > 7) score += 1;
    return { name: 'Welfare Signals', score };
  }

  // ──────────────────────────────────
  // INTERVENTION GENERATOR
  // ──────────────────────────────────

  static _generateInterventions(factors, data) {
    const interventions = [];
    
    factors.forEach(f => {
      if (f.name === 'Medication Adherence' && f.score < 0) {
        interventions.push('Improve medication adherence — track daily compliance');
      }
      if (f.name === 'Cognitive Fatigue' && f.score < -2) {
        interventions.push('Take breaks between sessions — cognitive fatigue detected');
      }
      if (f.name === 'Environmental Confounders' && f.score < -1) {
        interventions.push('Optimize test conditions — better sleep, lower stress environment');
      }
      if (f.name === 'Score Consistency' && f.score < -1) {
        interventions.push('Regular practice for score stabilization');
      }
      if (f.name === 'Passive Signal Drift' && f.score < -1) {
        interventions.push('Motor rhythm changes detected — consider neurological check-up');
      }
      if (f.name === 'Welfare Signals' && f.score < -1) {
        interventions.push('Engage caregiver support — welfare signals show concern');
      }
    });

    if (interventions.length === 0) {
      interventions.push('Maintain current training frequency');
      interventions.push('Continue with assigned games daily');
    }

    return interventions.slice(0, 4);
  }

  static _generateRecommendation(classification, factors) {
    const negativeFactors = factors.filter(f => f.score < -1).map(f => f.name);
    
    if (classification === 'Declining') {
      return `Declining trajectory detected. Key contributors: ${negativeFactors.join(', ') || 'cumulative trend'}. Please consult a healthcare professional.`;
    }
    if (classification === 'Uncertain') {
      return 'Score variance is too high for reliable prediction. Continue consistent training to improve data quality.';
    }
    if (classification === 'Improving') {
      return 'Positive trajectory confirmed. Current training regimen is effective. Maintain consistency for continued improvement.';
    }
    return 'Cognitive trajectory is stable. Continue regular training to monitor for changes.';
  }
}

// ─── CARE INTEGRATION LAYER ───
// Connects medication, welfare, scam protection to scoring/prediction

export class CareIntegrationEngine {

  // Module 1: Medication ↔ Cognition
  static adjustConfidenceForAdherence(confidence, medication) {
    const adherence = medication?.adherenceScore ?? 100;
    if (adherence < 60) return Math.round(confidence * 0.7);
    if (adherence < 80) return Math.round(confidence * 0.85);
    return confidence;
  }

  static adjustRiskForAdherence(riskLevel, medication) {
    const adherence = medication?.adherenceScore ?? 100;
    if (adherence < 50 && riskLevel === 'moderate') return 'high';
    if (adherence < 70 && riskLevel === 'low') return 'moderate';
    return riskLevel;
  }

  // Module 2: Welfare Check ↔ Risk Engine
  static shouldEscalateToCaregiver(welfare, drift) {
    const reasons = [];
    if (welfare?.nonResponseRisk === 'high') {
      reasons.push('Non-response risk is HIGH — user not checking in');
    }
    if (drift?.hasDrift && drift?.overall > 20) {
      reasons.push('Significant cognitive drift detected (' + drift.overall + '%)');
    }
    if (welfare?.status === 'concern') {
      reasons.push('User reported NOT OK in daily check-in');
    }
    return {
      shouldEscalate: reasons.length >= 1,
      urgency: reasons.length >= 2 ? 'HIGH' : 'MODERATE',
      reasons,
    };
  }

  // Module 3: Scam Protection ↔ Behavioral Drift
  static assessScamVulnerability(scamProtection, passiveSignals, riskAssessment) {
    let score = 0;
    if ((scamProtection?.riskyActionCount || 0) >= 2) score += 30;
    if ((passiveSignals?.typingDrift || 0) > 0.15) score += 20;
    if (riskAssessment?.domains?.executive === 'high') score += 25;
    if (riskAssessment?.domains?.attention === 'high') score += 15;
    if (riskAssessment?.domains?.memory === 'high') score += 10;

    return {
      vulnerabilityScore: Math.min(100, score),
      level: score >= 60 ? 'HIGH' : score >= 30 ? 'MODERATE' : 'LOW',
      shouldSuggestProtectedMode: score >= 40,
      shouldTriggerAlert: score >= 60,
    };
  }

  // Module 4: Care Mode ↔ Testing
  static adjustTestForCareMode(careMode, testConfig) {
    if (!careMode?.enabled) return testConfig;
    
    return {
      ...testConfig,
      // Simplify: fewer rounds, longer timeouts, clearer instructions
      maxRounds: Math.min(testConfig.maxRounds || 10, 5),
      timeoutMs: (testConfig.timeoutMs || 5000) * 1.5,
      showHints: true,
      reducedComplexity: true,
      // Adjust scoring expectations
      scoringAdjustment: 1.15, // 15% accommodation
    };
  }

  // Combined care-informed confidence
  static calculateCareAdjustedConfidence(baseConfidence, data) {
    let adjusted = baseConfidence;
    
    // Medication impact
    adjusted = this.adjustConfidenceForAdherence(adjusted, data.medication);
    
    // Welfare impact
    if (data.welfare?.nonResponseRisk === 'high') {
      adjusted = Math.round(adjusted * 0.8);
    }
    
    // Fatigue impact
    if (data.fatigue?.isFatigued) {
      adjusted = Math.round(adjusted * 0.85);
    }

    return Math.max(0, Math.min(100, adjusted));
  }
}
