import { supabase } from '../lib/supabase';

export interface ThresholdConfig {
  merchantCategory: string;
  fraudThreshold: number;
  dynamicAdjustment: boolean;
  minThreshold: number;
  maxThreshold: number;
  adaptationRate: number;
  sampleSizeMinimum: number;
}

export interface ThresholdAdjustment {
  merchantCategory: string;
  oldThreshold: number;
  newThreshold: number;
  reason: string;
  adjustmentFactor: number;
  timestamp: Date;
}

export class DynamicThresholdingEngine {
  private thresholdCache: Map<string, ThresholdConfig> = new Map();
  private performanceMetrics: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultThresholds();
  }

  private initializeDefaultThresholds(): void {
    const defaultThresholds: ThresholdConfig[] = [
      {
        merchantCategory: 'grocery',
        fraudThreshold: 0.45,
        dynamicAdjustment: true,
        minThreshold: 0.35,
        maxThreshold: 0.65,
        adaptationRate: 0.08,
        sampleSizeMinimum: 100
      },
      {
        merchantCategory: 'online_retail',
        fraudThreshold: 0.50,
        dynamicAdjustment: true,
        minThreshold: 0.40,
        maxThreshold: 0.70,
        adaptationRate: 0.10,
        sampleSizeMinimum: 150
      },
      {
        merchantCategory: 'travel_agencies',
        fraudThreshold: 0.55,
        dynamicAdjustment: true,
        minThreshold: 0.45,
        maxThreshold: 0.75,
        adaptationRate: 0.12,
        sampleSizeMinimum: 80
      },
      {
        merchantCategory: 'money_transfer',
        fraudThreshold: 0.65,
        dynamicAdjustment: true,
        minThreshold: 0.55,
        maxThreshold: 0.85,
        adaptationRate: 0.15,
        sampleSizeMinimum: 50
      },
      {
        merchantCategory: 'crypto',
        fraudThreshold: 0.70,
        dynamicAdjustment: true,
        minThreshold: 0.60,
        maxThreshold: 0.90,
        adaptationRate: 0.15,
        sampleSizeMinimum: 60
      },
      {
        merchantCategory: 'entertainment',
        fraudThreshold: 0.48,
        dynamicAdjustment: true,
        minThreshold: 0.38,
        maxThreshold: 0.68,
        adaptationRate: 0.09,
        sampleSizeMinimum: 120
      },
      {
        merchantCategory: 'default',
        fraudThreshold: 0.50,
        dynamicAdjustment: true,
        minThreshold: 0.35,
        maxThreshold: 0.75,
        adaptationRate: 0.10,
        sampleSizeMinimum: 100
      }
    ];

    defaultThresholds.forEach(config => {
      this.thresholdCache.set(config.merchantCategory, config);
    });
  }

  async loadThresholdsFromDatabase(): Promise<void> {
    const { data, error } = await supabase
      .from('threshold_configs')
      .select('*');

    if (data && !error) {
      data.forEach(config => {
        this.thresholdCache.set(config.merchant_category, {
          merchantCategory: config.merchant_category,
          fraudThreshold: config.fraud_threshold,
          dynamicAdjustment: config.dynamic_adjustment,
          minThreshold: config.min_threshold,
          maxThreshold: config.max_threshold,
          adaptationRate: config.adaptation_rate,
          sampleSizeMinimum: config.sample_size_minimum
        });
      });
    }
  }

  getThreshold(merchantCategory?: string): number {
    let config = merchantCategory
      ? this.thresholdCache.get(merchantCategory.toLowerCase())
      : undefined;

    if (!config) {
      config = this.thresholdCache.get('default')!;
    }

    return config.fraudThreshold;
  }

  getFullConfig(merchantCategory?: string): ThresholdConfig {
    let config = merchantCategory
      ? this.thresholdCache.get(merchantCategory.toLowerCase())
      : undefined;

    if (!config) {
      config = this.thresholdCache.get('default')!;
    }

    return config;
  }

  async adjustThresholdsBasedOnPerformance(): Promise<ThresholdAdjustment[]> {
    const adjustments: ThresholdAdjustment[] = [];

    for (const [category, config] of this.thresholdCache) {
      const metrics = await this.calculateCategoryMetrics(category);

      if (metrics.sampleCount < config.sampleSizeMinimum) {
        continue;
      }

      const adjustment = this.calculateOptimalThreshold(metrics, config);

      if (adjustment && Math.abs(adjustment.adjustmentFactor) > 0.02) {
        adjustments.push(adjustment);
        await this.updateThreshold(category, adjustment.newThreshold);
      }
    }

    return adjustments;
  }

  private async calculateCategoryMetrics(
    merchantCategory: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from('transactions')
      .select('fraud_score, is_fraudulent')
      .eq('merchant_category', merchantCategory)
      .gte('created_at', this.get30DaysAgo());

    if (error || !data) {
      return {
        sampleCount: 0,
        falsePositiveRate: 0,
        falseNegativeRate: 0,
        detectionAccuracy: 0
      };
    }

    const threshold = this.getThreshold(merchantCategory);
    let falsePositives = 0;
    let falseNegatives = 0;
    let truePositives = 0;
    let trueNegatives = 0;

    data.forEach(tx => {
      const predicted = tx.fraud_score > threshold;
      const actual = tx.is_fraudulent;

      if (predicted && !actual) falsePositives++;
      else if (!predicted && actual) falseNegatives++;
      else if (predicted && actual) truePositives++;
      else trueNegatives++;
    });

    const totalPositives = truePositives + falseNegatives;
    const totalNegatives = trueNegatives + falsePositives;

    return {
      sampleCount: data.length,
      falsePositiveRate: totalNegatives > 0 ? falsePositives / totalNegatives : 0,
      falseNegativeRate: totalPositives > 0 ? falseNegatives / totalPositives : 0,
      detectionAccuracy:
        (truePositives + trueNegatives) / Math.max(data.length, 1),
      precision:
        truePositives + falsePositives > 0
          ? truePositives / (truePositives + falsePositives)
          : 0,
      recall:
        truePositives + falseNegatives > 0
          ? truePositives / (truePositives + falseNegatives)
          : 0
    };
  }

  private calculateOptimalThreshold(
    metrics: any,
    config: ThresholdConfig
  ): ThresholdAdjustment | null {
    let newThreshold = config.fraudThreshold;
    let adjustmentFactor = 0;

    if (metrics.falsePositiveRate > 0.15) {
      const increase =
        config.adaptationRate * (metrics.falsePositiveRate - 0.10);
      newThreshold += increase;
      adjustmentFactor = increase;
    } else if (metrics.falseNegativeRate > 0.10) {
      const decrease =
        config.adaptationRate * (0.10 - metrics.falseNegativeRate);
      newThreshold -= decrease;
      adjustmentFactor = -decrease;
    }

    newThreshold = Math.max(
      config.minThreshold,
      Math.min(newThreshold, config.maxThreshold)
    );

    if (Math.abs(adjustmentFactor) > 0.001) {
      return {
        merchantCategory: config.merchantCategory,
        oldThreshold: config.fraudThreshold,
        newThreshold,
        reason: this.generateAdjustmentReason(metrics),
        adjustmentFactor,
        timestamp: new Date()
      };
    }

    return null;
  }

  private generateAdjustmentReason(metrics: any): string {
    if (metrics.falsePositiveRate > 0.15) {
      return `High false positive rate (${(metrics.falsePositiveRate * 100).toFixed(1)}%) - increasing threshold`;
    }

    if (metrics.falseNegativeRate > 0.10) {
      return `High false negative rate (${(metrics.falseNegativeRate * 100).toFixed(1)}%) - decreasing threshold`;
    }

    return 'Performance-based adjustment';
  }

  private async updateThreshold(
    merchantCategory: string,
    newThreshold: number
  ): Promise<void> {
    const config = this.thresholdCache.get(merchantCategory);
    if (!config) return;

    config.fraudThreshold = newThreshold;
    this.thresholdCache.set(merchantCategory, config);

    const { error } = await supabase
      .from('threshold_configs')
      .update({
        fraud_threshold: newThreshold,
        updated_at: new Date().toISOString()
      })
      .eq('merchant_category', merchantCategory);

    if (error) {
      console.error('Error updating threshold:', error);
    }
  }

  async createThresholdConfig(
    config: ThresholdConfig
  ): Promise<void> {
    this.thresholdCache.set(config.merchantCategory, config);

    const { error } = await supabase
      .from('threshold_configs')
      .insert({
        merchant_category: config.merchantCategory,
        fraud_threshold: config.fraudThreshold,
        dynamic_adjustment: config.dynamicAdjustment,
        min_threshold: config.minThreshold,
        max_threshold: config.maxThreshold,
        adaptation_rate: config.adaptationRate,
        sample_size_minimum: config.sampleSizeMinimum
      });

    if (error) {
      console.error('Error creating threshold config:', error);
    }
  }

  getThresholdStats(merchantCategory?: string): {
    current: number;
    min: number;
    max: number;
    range: number;
  } {
    const config = this.getFullConfig(merchantCategory);

    return {
      current: config.fraudThreshold,
      min: config.minThreshold,
      max: config.maxThreshold,
      range: config.maxThreshold - config.minThreshold
    };
  }

  isTransactionFraudulent(
    fraudScore: number,
    merchantCategory?: string
  ): boolean {
    const threshold = this.getThreshold(merchantCategory);
    return fraudScore > threshold;
  }

  calculateRiskLevel(
    fraudScore: number,
    merchantCategory?: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const threshold = this.getThreshold(merchantCategory);
    const distance = fraudScore - threshold;

    if (fraudScore <= threshold) {
      return 'low';
    }

    if (distance < 0.1) {
      return 'medium';
    }

    if (distance < 0.25) {
      return 'high';
    }

    return 'critical';
  }

  getAllConfigs(): ThresholdConfig[] {
    return Array.from(this.thresholdCache.values());
  }

  private get30DaysAgo(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }
}
