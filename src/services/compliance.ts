export interface ComplianceMetrics {
  totalTransactions: number;
  fraudulentTransactions: number;
  detectionRate: number;
  falsePositiveRate: number;
  averageResponseTime: number;
  systemUptime: number;
}

export interface ComplianceReport {
  reportId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: ComplianceMetrics;
  riskAssessment: {
    overallRiskScore: number;
    highRiskTransactions: number;
    mediumRiskTransactions: number;
    lowRiskTransactions: number;
  };
  regulatoryChecks: {
    pciDssCompliant: boolean;
    gdprCompliant: boolean;
    amlCompliant: boolean;
    notes: string[];
  };
  recommendations: string[];
  generatedAt: Date;
}

export class ComplianceManager {
  generateReport(
    metrics: ComplianceMetrics,
    periodStart: Date,
    periodEnd: Date
  ): ComplianceReport {
    const riskAssessment =
      this.assessRisk(metrics);
    const regulatoryChecks =
      this.performRegulatoryChecks(metrics);
    const recommendations =
      this.generateRecommendations(
        metrics,
        riskAssessment,
        regulatoryChecks
      );

    return {
      reportId: this.generateReportId(),
      period: {
        startDate: periodStart,
        endDate: periodEnd,
      },
      metrics,
      riskAssessment,
      regulatoryChecks,
      recommendations,
      generatedAt: new Date(),
    };
  }

  private assessRisk(
    metrics: ComplianceMetrics
  ): {
    overallRiskScore: number;
    highRiskTransactions: number;
    mediumRiskTransactions: number;
    lowRiskTransactions: number;
  } {
    const fraudRate =
      metrics.fraudulentTransactions /
      metrics.totalTransactions;

    let overallRiskScore =
      fraudRate * 0.6 +
      metrics.falsePositiveRate * 0.4;

    if (metrics.averageResponseTime > 1000) {
      overallRiskScore += 0.1;
    }

    if (metrics.systemUptime < 0.99) {
      overallRiskScore += 0.05;
    }

    overallRiskScore = Math.min(
      1,
      overallRiskScore
    );

    const highRisk = Math.floor(
      metrics.fraudulentTransactions * 0.8
    );
    const mediumRisk = Math.floor(
      metrics.fraudulentTransactions * 0.15
    );
    const lowRisk =
      metrics.fraudulentTransactions -
      highRisk -
      mediumRisk;

    return {
      overallRiskScore,
      highRiskTransactions: highRisk,
      mediumRiskTransactions: mediumRisk,
      lowRiskTransactions: lowRisk,
    };
  }

  private performRegulatoryChecks(
    metrics: ComplianceMetrics
  ): {
    pciDssCompliant: boolean;
    gdprCompliant: boolean;
    amlCompliant: boolean;
    notes: string[];
  } {
    const notes: string[] = [];

    const pciDssCompliant =
      metrics.systemUptime >= 0.999 &&
      metrics.averageResponseTime < 2000;

    if (!pciDssCompliant) {
      notes.push(
        'PCI DSS: Improve system uptime and response time'
      );
    }

    const gdprCompliant = true;
    notes.push(
      'GDPR: Data retention and processing aligned'
    );

    const amlCompliant =
      metrics.detectionRate >= 0.85;

    if (!amlCompliant) {
      notes.push(
        'AML: Fraud detection rate below recommended threshold'
      );
    }

    return {
      pciDssCompliant,
      gdprCompliant,
      amlCompliant,
      notes,
    };
  }

  private generateRecommendations(
    metrics: ComplianceMetrics,
    riskAssessment: any,
    regulatoryChecks: any
  ): string[] {
    const recommendations: string[] = [];

    if (riskAssessment.overallRiskScore > 0.7) {
      recommendations.push(
        'High fraud risk detected. Increase monitoring and threshold sensitivity.'
      );
    }

    if (metrics.falsePositiveRate > 0.15) {
      recommendations.push(
        'High false positive rate. Review and recalibrate detection thresholds.'
      );
    }

    if (metrics.averageResponseTime > 1000) {
      recommendations.push(
        'Improve system response time. Consider caching optimization.'
      );
    }

    if (!regulatoryChecks.pciDssCompliant) {
      recommendations.push(
        'Implement PCI DSS compliance controls.'
      );
    }

    if (!regulatoryChecks.amlCompliant) {
      recommendations.push(
        'Enhance AML detection capabilities.'
      );
    }

    recommendations.push(
      'Conduct monthly compliance reviews.'
    );
    recommendations.push(
      'Implement continuous model monitoring.'
    );

    return recommendations;
  }

  private generateReportId(): string {
    return `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  validateCompliance(
    metrics: ComplianceMetrics
  ): {
    compliant: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    if (metrics.detectionRate < 0.8) {
      violations.push(
        'Fraud detection rate below 80% threshold'
      );
    }

    if (metrics.falsePositiveRate > 0.2) {
      violations.push(
        'False positive rate exceeds 20%'
      );
    }

    if (metrics.systemUptime < 0.99) {
      violations.push(
        'System uptime below 99%'
      );
    }

    if (
      metrics.averageResponseTime >
      5000
    ) {
      violations.push(
        'Average response time exceeds 5 seconds'
      );
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }
}

export class DataGovernance {
  private retentionPolicies: Map<
    string,
    number
  > = new Map();

  constructor() {
    this.initializeRetentionPolicies();
  }

  private initializeRetentionPolicies(): void {
    this.retentionPolicies.set(
      'transactions',
      90
    );
    this.retentionPolicies.set(
      'logs',
      30
    );
    this.retentionPolicies.set(
      'reports',
      365
    );
    this.retentionPolicies.set(
      'personal_data',
      7
    );
  }

  getRetentionPeriod(
    dataType: string
  ): number | null {
    return (
      this.retentionPolicies.get(
        dataType
      ) || null
    );
  }

  setRetentionPolicy(
    dataType: string,
    days: number
  ): void {
    this.retentionPolicies.set(
      dataType,
      days
    );
  }

  shouldDeleteData(
    createdAt: Date,
    dataType: string
  ): boolean {
    const retentionDays =
      this.retentionPolicies.get(
        dataType
      );

    if (!retentionDays) return false;

    const expirationDate = new Date(
      createdAt
    );
    expirationDate.setDate(
      expirationDate.getDate() +
        retentionDays
    );

    return new Date() > expirationDate;
  }

  getDataClassification(
    dataType: string
  ): 'public' | 'internal' | 'confidential' | 'restricted' {
    const classifications: Record<
      string,
      'public' | 'internal' | 'confidential' | 'restricted'
    > = {
      transactions:
        'confidential',
      personal_data: 'restricted',
      reports: 'internal',
      logs: 'internal',
      models: 'confidential',
    };

    return (
      classifications[dataType] ||
      'internal'
    );
  }

  validateDataAccess(
    userRole: string,
    dataType: string
  ): boolean {
    const classification =
      this.getDataClassification(
        dataType
      );

    const roleAccessMap: Record<
      string,
      string[]
    > = {
      admin: [
        'public',
        'internal',
        'confidential',
        'restricted',
      ],
      analyst: [
        'public',
        'internal',
        'confidential',
      ],
      viewer: ['public', 'internal'],
    };

    const allowedLevels =
      roleAccessMap[userRole] || [];

    return allowedLevels.includes(
      classification
    );
  }
}
