import { supabase } from '../lib/supabase';

export interface ComplianceEvent {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  complianceStandard: string;
  violationDetails: Record<string, any>;
  resolutionStatus: string;
}

export interface ComplianceMetrics {
  totalEvents: number;
  criticalEvents: number;
  unresolvedEvents: number;
  resolutionRate: number;
  avgResolutionTime: number;
  standardCoverage: Map<string, number>;
}

export interface ComplianceDashboardData {
  metrics: ComplianceMetrics;
  recentEvents: ComplianceEvent[];
  violationTrends: any[];
  thresholdCompliance: any[];
}

export class ComplianceTracker {
  private complianceStandards = [
    'PCI-DSS',
    'GDPR',
    'AML-KYC',
    'SOX',
    'HIPAA',
    'CCPA'
  ];

  async logComplianceEvent(
    transaction: Record<string, any>,
    fraudScore: number,
    riskLevel: string
  ): Promise<void> {
    const events = this.identifyCompllianceViolations(
      transaction,
      fraudScore,
      riskLevel
    );

    for (const event of events) {
      const { error } = await supabase
        .from('compliance_events')
        .insert({
          event_type: event.eventType,
          severity: event.severity,
          transaction_id: transaction.id,
          compliance_standard: event.complianceStandard,
          violation_details: event.violationDetails,
          resolution_status: 'pending'
        });

      if (error) {
        console.error('Error logging compliance event:', error);
      }
    }
  }

  private identifyCompllianceViolations(
    transaction: Record<string, any>,
    fraudScore: number,
    riskLevel: string
  ): ComplianceEvent[] {
    const events: ComplianceEvent[] = [];
    const amount = parseFloat(transaction.amount) || 0;

    if (fraudScore > 0.7) {
      events.push({
        eventType: 'fraud_detection_threshold_exceeded',
        severity: 'high',
        complianceStandard: 'AML-KYC',
        violationDetails: {
          fraudScore,
          threshold: 0.7,
          description: 'Transaction exceeds fraud detection threshold'
        },
        resolutionStatus: 'pending'
      });
    }

    if (amount > 10000) {
      events.push({
        eventType: 'high_value_transaction',
        severity: amount > 50000 ? 'critical' : 'high',
        complianceStandard: 'AML-KYC',
        violationDetails: {
          amount,
          limit: 10000,
          description: 'High-value transaction requires enhanced monitoring'
        },
        resolutionStatus: 'pending'
      });
    }

    if (!transaction.location || !transaction.device_info) {
      events.push({
        eventType: 'incomplete_transaction_data',
        severity: 'medium',
        complianceStandard: 'PCI-DSS',
        violationDetails: {
          missingFields: [
            !transaction.location && 'location',
            !transaction.device_info && 'device_info'
          ].filter(Boolean),
          description: 'Required transaction data is incomplete'
        },
        resolutionStatus: 'pending'
      });
    }

    if (riskLevel === 'critical' || riskLevel === 'high') {
      events.push({
        eventType: 'high_risk_transaction_detected',
        severity: riskLevel === 'critical' ? 'critical' : 'high',
        complianceStandard: 'GDPR',
        violationDetails: {
          riskLevel,
          merchantCategory: transaction.merchant_category,
          description: `Transaction classified as ${riskLevel} risk`
        },
        resolutionStatus: 'pending'
      });
    }

    const hour = new Date(transaction.timestamp).getHours();
    if (hour < 6 || hour > 23) {
      events.push({
        eventType: 'unusual_transaction_time',
        severity: 'low',
        complianceStandard: 'AML-KYC',
        violationDetails: {
          transactionHour: hour,
          normalBusinessHours: '6-23',
          description: 'Transaction outside normal business hours'
        },
        resolutionStatus: 'pending'
      });
    }

    return events;
  }

  async getComplianceMetrics(): Promise<ComplianceMetrics> {
    const { data: allEvents } = await supabase
      .from('compliance_events')
      .select('*')
      .gte('created_at', this.get90DaysAgo());

    if (!allEvents) {
      return {
        totalEvents: 0,
        criticalEvents: 0,
        unresolvedEvents: 0,
        resolutionRate: 0,
        avgResolutionTime: 0,
        standardCoverage: new Map()
      };
    }

    const criticalEvents = allEvents.filter(e => e.severity === 'critical').length;
    const unresolvedEvents = allEvents.filter(
      e => e.resolution_status === 'pending'
    ).length;
    const resolvedEvents = allEvents.filter(
      e => e.resolution_status === 'resolved'
    );

    const resolutionTimes = resolvedEvents
      .map(e => {
        if (e.resolved_at && e.created_at) {
          return (
            new Date(e.resolved_at).getTime() -
            new Date(e.created_at).getTime()
          );
        }
        return 0;
      })
      .filter(t => t > 0);

    const standardCoverage = new Map<string, number>();
    this.complianceStandards.forEach(standard => {
      const count = allEvents.filter(
        e => e.compliance_standard === standard
      ).length;
      standardCoverage.set(standard, count);
    });

    return {
      totalEvents: allEvents.length,
      criticalEvents,
      unresolvedEvents,
      resolutionRate:
        allEvents.length > 0
          ? resolvedEvents.length / allEvents.length
          : 0,
      avgResolutionTime:
        resolutionTimes.length > 0
          ? resolutionTimes.reduce((a, b) => a + b, 0) /
            resolutionTimes.length /
            (1000 * 60 * 60)
          : 0,
      standardCoverage
    };
  }

  async getDashboardData(): Promise<ComplianceDashboardData> {
    const metrics = await this.getComplianceMetrics();

    const { data: recentEvents } = await supabase
      .from('compliance_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: allEvents } = await supabase
      .from('compliance_events')
      .select('*')
      .gte('created_at', this.get30DaysAgo());

    const violationTrends = this.calculateViolationTrends(allEvents || []);
    const thresholdCompliance = await this.getThresholdCompliance();

    return {
      metrics,
      recentEvents: (recentEvents || []).map(e => ({
        eventType: e.event_type,
        severity: e.severity,
        complianceStandard: e.compliance_standard,
        violationDetails: e.violation_details,
        resolutionStatus: e.resolution_status
      })),
      violationTrends,
      thresholdCompliance
    };
  }

  private calculateViolationTrends(events: any[]): any[] {
    const trends: Record<string, number> = {};

    events.forEach(event => {
      const date = new Date(event.created_at).toLocaleDateString();
      trends[date] = (trends[date] || 0) + 1;
    });

    return Object.entries(trends).map(([date, count]) => ({
      date,
      violations: count
    }));
  }

  private async getThresholdCompliance(): Promise<any[]> {
    const { data: thresholds } = await supabase
      .from('threshold_configs')
      .select('*');

    if (!thresholds) return [];

    return thresholds.map(t => ({
      merchantCategory: t.merchant_category,
      currentThreshold: t.fraud_threshold,
      minThreshold: t.min_threshold,
      maxThreshold: t.max_threshold,
      lastUpdated: t.updated_at,
      isCompliant:
        t.fraud_threshold >= t.min_threshold &&
        t.fraud_threshold <= t.max_threshold
    }));
  }

  async markEventAsResolved(
    eventId: string,
    resolutionNotes: string
  ): Promise<void> {
    const { error } = await supabase
      .from('compliance_events')
      .update({
        resolution_status: 'resolved',
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (error) {
      console.error('Error resolving compliance event:', error);
    }
  }

  async getComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    const { data: events } = await supabase
      .from('compliance_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (!events) {
      return { error: 'No data available' };
    }

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const eventsByStandard: Record<string, number> = {};

    events.forEach(event => {
      eventsByType[event.event_type] =
        (eventsByType[event.event_type] || 0) + 1;
      eventsBySeverity[event.severity] =
        (eventsBySeverity[event.severity] || 0) + 1;
      eventsByStandard[event.compliance_standard] =
        (eventsByStandard[event.compliance_standard] || 0) + 1;
    });

    return {
      period: { startDate, endDate },
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      eventsByStandard,
      generatedAt: new Date()
    };
  }

  async exportComplianceAuditLog(): Promise<string> {
    const { data: events } = await supabase
      .from('compliance_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (!events) return '';

    const headers = [
      'Event Type',
      'Severity',
      'Compliance Standard',
      'Status',
      'Created At',
      'Resolved At'
    ];

    const rows = events.map(e => [
      e.event_type,
      e.severity,
      e.compliance_standard,
      e.resolution_status,
      new Date(e.created_at).toLocaleString(),
      e.resolved_at ? new Date(e.resolved_at).toLocaleString() : 'N/A'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    return csv;
  }

  private get30DaysAgo(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }

  private get90DaysAgo(): string {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString();
  }
}
