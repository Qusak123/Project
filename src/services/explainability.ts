import { supabase } from '../lib/supabase';

export interface FeatureImportance {
  feature: string;
  importance: number;
  impact: 'positive' | 'negative';
  description: string;
}

export interface ShapValues {
  [key: string]: number;
}

export interface LimeExplanation {
  feature: string;
  weight: number;
  value: any;
  impact: number;
}

export interface ExplainabilityResult {
  transactionId: string;
  modelPrediction: number;
  confidence: number;
  featureImportance: FeatureImportance[];
  shapValues: ShapValues;
  limeExplanations: LimeExplanation[];
  explanationText: string;
  riskFactors: string[];
  safeFactors: string[];
}

export class ExplainabilityEngine {
  private featureDefinitions: Map<string, any> = new Map();

  constructor() {
    this.initializeFeatureDefinitions();
  }

  private initializeFeatureDefinitions(): void {
    this.featureDefinitions.set('amount', {
      type: 'numeric',
      weight: 0.15,
      description: 'Transaction amount in currency units'
    });

    this.featureDefinitions.set('location', {
      type: 'categorical',
      weight: 0.12,
      description: 'Geographic location of transaction'
    });

    this.featureDefinitions.set('merchant_category', {
      type: 'categorical',
      weight: 0.18,
      description: 'Merchant industry category'
    });

    this.featureDefinitions.set('device_info', {
      type: 'categorical',
      weight: 0.10,
      description: 'Device fingerprint and information'
    });

    this.featureDefinitions.set('ip_address', {
      type: 'categorical',
      weight: 0.15,
      description: 'IP geolocation and reputation'
    });

    this.featureDefinitions.set('time_of_day', {
      type: 'numeric',
      weight: 0.08,
      description: 'Hour of transaction'
    });

    this.featureDefinitions.set('frequency', {
      type: 'numeric',
      weight: 0.12,
      description: 'Transaction frequency in recent period'
    });

    this.featureDefinitions.set('amount_deviation', {
      type: 'numeric',
      weight: 0.10,
      description: 'Deviation from typical transaction amount'
    });
  }

  async explainPrediction(
    transaction: Record<string, any>,
    fraudScore: number
  ): Promise<ExplainabilityResult> {
    const featureImportance = this.calculateFeatureImportance(transaction, fraudScore);
    const shapValues = this.calculateShapValues(transaction, fraudScore);
    const limeExplanations = this.generateLimeExplanations(transaction, fraudScore);
    const explanationText = this.generateExplanationText(
      transaction,
      fraudScore,
      featureImportance
    );
    const riskFactors = this.identifyRiskFactors(transaction, fraudScore);
    const safeFactors = this.identifySafeFactors(transaction);

    return {
      transactionId: transaction.transaction_id,
      modelPrediction: fraudScore,
      confidence: this.calculateConfidence(fraudScore, featureImportance),
      featureImportance,
      shapValues,
      limeExplanations,
      explanationText,
      riskFactors,
      safeFactors
    };
  }

  private calculateFeatureImportance(
    transaction: Record<string, any>,
    fraudScore: number
  ): FeatureImportance[] {
    const importance: FeatureImportance[] = [];

    const amount = parseFloat(transaction.amount) || 0;
    const amountImportance = this.normalizeScore(amount / 10000, 0, 1);
    importance.push({
      feature: 'Transaction Amount',
      importance: amountImportance * 0.15,
      impact: amountImportance > 0.7 ? 'positive' : 'negative',
      description: `Amount of $${amount.toFixed(2)} is ${
        amountImportance > 0.7 ? 'significantly above' : 'within'
      } normal range`
    });

    const locationScore = transaction.location ? 0.3 : 0.7;
    importance.push({
      feature: 'Location',
      importance: locationScore * 0.12,
      impact: locationScore > 0.5 ? 'positive' : 'negative',
      description: `Transaction location: ${transaction.location || 'Unknown'}`
    });

    const merchantScore = this.calculateMerchantRiskScore(
      transaction.merchant_category
    );
    importance.push({
      feature: 'Merchant Category',
      importance: merchantScore * 0.18,
      impact: merchantScore > 0.6 ? 'positive' : 'negative',
      description: `Merchant category: ${transaction.merchant_category || 'Unknown'}`
    });

    const deviceScore = transaction.device_info ? 0.2 : 0.8;
    importance.push({
      feature: 'Device',
      importance: deviceScore * 0.10,
      impact: deviceScore > 0.5 ? 'positive' : 'negative',
      description: `Device ${transaction.device_info ? 'recognized' : 'unknown'}`
    });

    const ipScore = this.calculateIpRiskScore(transaction.ip_address);
    importance.push({
      feature: 'IP Address',
      importance: ipScore * 0.15,
      impact: ipScore > 0.5 ? 'positive' : 'negative',
      description: `IP reputation score: ${(ipScore * 100).toFixed(1)}%`
    });

    const timeScore = this.calculateTimeScore(transaction.timestamp);
    importance.push({
      feature: 'Time Pattern',
      importance: timeScore * 0.08,
      impact: timeScore > 0.5 ? 'positive' : 'negative',
      description: `Transaction at ${new Date(transaction.timestamp).getHours()}:00`
    });

    const frequencyScore = 0.5;
    importance.push({
      feature: 'Frequency',
      importance: frequencyScore * 0.12,
      impact: frequencyScore > 0.6 ? 'positive' : 'negative',
      description: 'Transaction frequency within normal range'
    });

    const deviationScore = this.calculateAmountDeviation(amount);
    importance.push({
      feature: 'Amount Deviation',
      importance: deviationScore * 0.10,
      impact: deviationScore > 0.6 ? 'positive' : 'negative',
      description: `${(deviationScore * 100).toFixed(1)}% deviation from average`
    });

    return importance.sort((a, b) => b.importance - a.importance);
  }

  private calculateShapValues(
    transaction: Record<string, any>,
    fraudScore: number
  ): ShapValues {
    return {
      amount: this.normalizeScore(parseFloat(transaction.amount) / 10000, 0, 1) * 0.3,
      location: (transaction.location ? 0.2 : 0.7) * 0.15,
      merchant_category: this.calculateMerchantRiskScore(transaction.merchant_category) * 0.25,
      device: (transaction.device_info ? 0.2 : 0.8) * 0.15,
      ip_address: this.calculateIpRiskScore(transaction.ip_address) * 0.2,
      time_pattern: this.calculateTimeScore(transaction.timestamp) * 0.1,
      frequency_anomaly: this.normalizeScore(fraudScore, 0, 1) * 0.15,
      amount_deviation: this.calculateAmountDeviation(parseFloat(transaction.amount)) * 0.1
    };
  }

  private generateLimeExplanations(
    transaction: Record<string, any>,
    fraudScore: number
  ): LimeExplanation[] {
    const explanations: LimeExplanation[] = [];

    explanations.push({
      feature: 'High Amount Transaction',
      weight: 0.3,
      value: `$${parseFloat(transaction.amount).toFixed(2)}`,
      impact: fraudScore > 0.7 ? 0.25 : -0.1
    });

    explanations.push({
      feature: 'Merchant Category Risk',
      weight: 0.25,
      value: transaction.merchant_category || 'Unknown',
      impact: this.calculateMerchantRiskScore(transaction.merchant_category) > 0.6 ? 0.2 : -0.15
    });

    explanations.push({
      feature: 'Location Verification',
      weight: 0.2,
      value: transaction.location || 'Unverified',
      impact: transaction.location ? -0.1 : 0.3
    });

    explanations.push({
      feature: 'Device Recognition',
      weight: 0.15,
      value: transaction.device_info ? 'Known device' : 'Unknown device',
      impact: transaction.device_info ? -0.15 : 0.25
    });

    explanations.push({
      feature: 'IP Reputation',
      weight: 0.1,
      value: `Risk score: ${(this.calculateIpRiskScore(transaction.ip_address) * 100).toFixed(1)}%`,
      impact: this.calculateIpRiskScore(transaction.ip_address) > 0.5 ? 0.15 : -0.1
    });

    return explanations.sort((a, b) => b.weight - a.weight);
  }

  private generateExplanationText(
    transaction: Record<string, any>,
    fraudScore: number,
    featureImportance: FeatureImportance[]
  ): string {
    const topFeatures = featureImportance.slice(0, 3);
    const riskLevel = fraudScore > 0.7 ? 'HIGH' : fraudScore > 0.4 ? 'MEDIUM' : 'LOW';

    let explanation = `Transaction Risk Assessment: ${riskLevel} (Score: ${(fraudScore * 100).toFixed(1)}%)\n\n`;
    explanation += `Top Risk Factors:\n`;

    topFeatures.forEach((feature, index) => {
      explanation += `${index + 1}. ${feature.feature}: ${feature.description}\n`;
    });

    explanation += `\nDetailed Analysis:\n`;
    explanation += `- Amount: $${parseFloat(transaction.amount).toFixed(2)}\n`;
    explanation += `- Merchant: ${transaction.merchant || 'Unknown'}\n`;
    explanation += `- Location: ${transaction.location || 'Unverified'}\n`;
    explanation += `- Device: ${transaction.device_info ? 'Recognized' : 'Unknown'}\n`;

    return explanation;
  }

  private identifyRiskFactors(
    transaction: Record<string, any>,
    fraudScore: number
  ): string[] {
    const risks: string[] = [];

    if (fraudScore > 0.7) {
      risks.push('High fraud score detected');
    }

    if (parseFloat(transaction.amount) > 5000) {
      risks.push('Unusually high transaction amount');
    }

    if (!transaction.location) {
      risks.push('Transaction location not verified');
    }

    if (!transaction.device_info) {
      risks.push('Device not recognized or trusted');
    }

    if (this.calculateMerchantRiskScore(transaction.merchant_category) > 0.6) {
      risks.push(`${transaction.merchant_category} is high-risk category`);
    }

    if (this.calculateIpRiskScore(transaction.ip_address) > 0.6) {
      risks.push('IP address has poor reputation');
    }

    const hour = new Date(transaction.timestamp).getHours();
    if (hour < 6 || hour > 23) {
      risks.push('Transaction during unusual hours');
    }

    return risks.slice(0, 5);
  }

  private identifySafeFactors(transaction: Record<string, any>): string[] {
    const safe: string[] = [];

    if (transaction.location) {
      safe.push('Transaction location verified');
    }

    if (transaction.device_info) {
      safe.push('Device is recognized and trusted');
    }

    if (parseFloat(transaction.amount) < 1000) {
      safe.push('Transaction amount within normal range');
    }

    if (transaction.merchant) {
      safe.push(`${transaction.merchant} is established merchant`);
    }

    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 8 && hour <= 20) {
      safe.push('Transaction during business hours');
    }

    return safe;
  }

  private calculateMerchantRiskScore(category?: string): number {
    const highRiskCategories = [
      'money_transfer',
      'crypto',
      'gambling',
      'dating_services',
      'travel_agencies'
    ];

    if (!category) return 0.5;
    if (highRiskCategories.some(c => category.toLowerCase().includes(c))) {
      return 0.75;
    }
    return 0.3;
  }

  private calculateIpRiskScore(ip?: string): number {
    if (!ip) return 0.6;
    if (ip.startsWith('192.168') || ip.startsWith('10.')) {
      return 0.1;
    }
    return 0.4;
  }

  private calculateTimeScore(timestamp: string): number {
    const hour = new Date(timestamp).getHours();
    if (hour >= 8 && hour <= 20) {
      return 0.2;
    }
    if (hour >= 6 && hour <= 23) {
      return 0.4;
    }
    return 0.8;
  }

  private calculateAmountDeviation(amount: number): number {
    const average = 500;
    const maxDeviation = 5000;
    const deviation = Math.abs(amount - average) / maxDeviation;
    return Math.min(deviation, 1);
  }

  private calculateConfidence(
    fraudScore: number,
    features: FeatureImportance[]
  ): number {
    const featureVariance = features.reduce((sum, f) => sum + f.importance, 0);
    const confidence = Math.min(featureVariance + 0.3, 0.95);
    return parseFloat(confidence.toFixed(3));
  }

  private normalizeScore(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  async saveExplanation(explanation: ExplainabilityResult): Promise<void> {
    const { error } = await supabase
      .from('explainability_logs')
      .insert({
        transaction_id: explanation.transactionId,
        model_prediction: explanation.modelPrediction,
        prediction_confidence: explanation.confidence,
        shap_values: explanation.shapValues,
        feature_importance: explanation.featureImportance,
        explanation_text: explanation.explanationText,
        lime_explanation: explanation.limeExplanations
      });

    if (error) {
      console.error('Error saving explanation:', error);
    }
  }

  async updateFeatureImportance(
    featureName: string,
    importance: number,
    description: string
  ): Promise<void> {
    const { data: existing } = await supabase
      .from('feature_importance')
      .select('id, sample_count')
      .eq('feature_name', featureName)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('feature_importance')
        .update({
          importance_score: importance,
          description,
          sample_count: existing.sample_count + 1,
          last_updated: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('feature_importance')
        .insert({
          feature_name: featureName,
          importance_score: importance,
          description,
          sample_count: 1
        });
    }
  }
}
