import { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { ExplainabilityEngine, type ExplainabilityResult } from '../services/explainability';
import { DynamicThresholdingEngine } from '../services/dynamicThresholding';
import { ComplianceTracker } from '../services/complianceTracking';

interface Transaction {
  id: string;
  transaction_id: string;
  amount: number;
  timestamp: string;
  location: string;
  merchant: string;
  merchant_category: string;
  device_info: string;
  ip_address: string;
  fraud_score: number;
  is_fraudulent: boolean;
  detection_reason: string;
}

interface DashboardProps {
  transaction?: Transaction;
}

export default function ExplainabilityDashboard({ transaction }: DashboardProps) {
  const [expandedSection, setExpandedSection] = useState<string>('explanation');
  const [explanation, setExplanation] = useState<ExplainabilityResult | null>(null);
  const [thresholdStats, setThresholdStats] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      loadExplanations();
    }
  }, [transaction]);

  const loadExplanations = async () => {
    if (!transaction) return;

    setLoading(true);
    try {
      const explainEngine = new ExplainabilityEngine();
      const thresholdEngine = new DynamicThresholdingEngine();
      const complianceTracker = new ComplianceTracker();

      await thresholdEngine.loadThresholdsFromDatabase();

      const explanation = await explainEngine.explainPrediction(
        transaction,
        transaction.fraud_score
      );
      setExplanation(explanation);

      const stats = thresholdEngine.getThresholdStats(transaction.merchant_category);
      setThresholdStats(stats);

      const compliance = await complianceTracker.getDashboardData();
      setComplianceData(compliance);

      await explainEngine.saveExplanation(explanation);
    } catch (error) {
      console.error('Error loading explanations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 text-center">
          <p className="text-slate-300">Select a transaction to view explainability analysis</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 text-center">
          <p className="text-slate-300">Loading explanations...</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score > 0.7) return 'bg-red-900/20 border-red-700';
    if (score > 0.4) return 'bg-yellow-900/20 border-yellow-700';
    return 'bg-green-900/20 border-green-700';
  };

  const getRiskBadge = (score: number) => {
    if (score > 0.7) return { text: 'HIGH RISK', color: 'text-red-400' };
    if (score > 0.4) return { text: 'MEDIUM RISK', color: 'text-yellow-400' };
    return { text: 'LOW RISK', color: 'text-green-400' };
  };

  const riskBadge = getRiskBadge(transaction.fraud_score);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className={`rounded-lg border p-6 ${getRiskColor(transaction.fraud_score)}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {transaction.merchant || 'Unknown Merchant'}
              </h3>
              <p className="text-slate-400">ID: {transaction.transaction_id}</p>
            </div>
            <span className={`text-lg font-bold ${riskBadge.color}`}>{riskBadge.text}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Amount</p>
              <p className="text-white font-semibold">${transaction.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Fraud Score</p>
              <p className="text-white font-semibold">{(transaction.fraud_score * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Location</p>
              <p className="text-white font-semibold">{transaction.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Time</p>
              <p className="text-white font-semibold">
                {new Date(transaction.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'explanation' ? '' : 'explanation')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">AI Explanation (SHAP/LIME)</h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform ${
                expandedSection === 'explanation' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'explanation' && explanation && (
            <div className="px-6 py-4 border-t border-slate-700 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Model Prediction</h4>
                <p className="text-white font-semibold">
                  {(explanation.modelPrediction * 100).toFixed(1)}% Confidence: {(explanation.confidence * 100).toFixed(1)}%
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Top Risk Factors</h4>
                <div className="space-y-2">
                  {explanation.riskFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start space-x-2 bg-red-900/10 p-3 rounded border border-red-800/30">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Positive Factors</h4>
                <div className="space-y-2">
                  {explanation.safeFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start space-x-2 bg-green-900/10 p-3 rounded border border-green-800/30">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Feature Importance</h4>
                <div className="space-y-3">
                  {explanation.featureImportance.map((feature, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-400">{feature.feature}</span>
                        <span className="text-sm font-semibold text-white">
                          {(feature.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            feature.impact === 'positive' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(feature.importance * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-700/30 rounded p-4 border border-slate-600">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Explanation</h4>
                <p className="text-sm text-slate-400 whitespace-pre-wrap">{explanation.explanationText}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'thresholds' ? '' : 'thresholds')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Dynamic Thresholding</h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform ${
                expandedSection === 'thresholds' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'thresholds' && thresholdStats && (
            <div className="px-6 py-4 border-t border-slate-700 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded p-3">
                  <p className="text-slate-400 text-xs">Current Threshold</p>
                  <p className="text-white font-semibold text-lg">
                    {(thresholdStats.current * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded p-3">
                  <p className="text-slate-400 text-xs">Min Threshold</p>
                  <p className="text-white font-semibold text-lg">
                    {(thresholdStats.min * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded p-3">
                  <p className="text-slate-400 text-xs">Max Threshold</p>
                  <p className="text-white font-semibold text-lg">
                    {(thresholdStats.max * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded p-3">
                  <p className="text-slate-400 text-xs">Range</p>
                  <p className="text-white font-semibold text-lg">
                    {(thresholdStats.range * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Threshold Range Visualization</h4>
                <div className="relative h-12 bg-slate-700 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className="absolute h-full bg-gradient-to-r from-emerald-900 to-emerald-700/50"
                      style={{
                        left: `${thresholdStats.min * 100}%`,
                        right: `${(1 - thresholdStats.max) * 100}%`
                      }}
                    />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-yellow-400"
                    style={{ left: `${thresholdStats.current * 100}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-blue-400"
                    style={{ left: `${transaction.fraud_score * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <span className="text-xs text-slate-300">0%</span>
                    <span className="text-xs text-slate-300">100%</span>
                  </div>
                </div>
                <div className="flex justify-center space-x-4 mt-2 text-xs">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span className="text-slate-400">Current Threshold</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="text-slate-400">Transaction Score</span>
                  </span>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded p-3">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Classification:</span>{' '}
                  <span className={`font-semibold ${transaction.fraud_score > thresholdStats.current ? 'text-red-400' : 'text-green-400'}`}>
                    {transaction.fraud_score > thresholdStats.current ? 'FLAGGED AS FRAUD' : 'CLASSIFIED AS LEGITIMATE'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {complianceData && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'compliance' ? '' : 'compliance')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Compliance & Regulatory</h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  expandedSection === 'compliance' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'compliance' && (
              <div className="px-6 py-4 border-t border-slate-700 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-700/30 rounded p-3">
                    <p className="text-slate-400 text-xs">Total Events (90d)</p>
                    <p className="text-white font-semibold text-lg">{complianceData.metrics.totalEvents}</p>
                  </div>
                  <div className="bg-red-900/20 rounded p-3">
                    <p className="text-slate-400 text-xs">Critical Events</p>
                    <p className="text-red-400 font-semibold text-lg">{complianceData.metrics.criticalEvents}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded p-3">
                    <p className="text-slate-400 text-xs">Unresolved</p>
                    <p className="text-white font-semibold text-lg">{complianceData.metrics.unresolvedEvents}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded p-3">
                    <p className="text-slate-400 text-xs">Resolution Rate</p>
                    <p className="text-white font-semibold text-lg">
                      {(complianceData.metrics.resolutionRate * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Compliance Coverage</h4>
                  <div className="space-y-2">
                    {Array.from(complianceData.metrics.standardCoverage).map(([standard, count]) => (
                      <div key={standard} className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">{standard}</span>
                        <span className="text-sm font-semibold text-white">{count} events</span>
                      </div>
                    ))}
                  </div>
                </div>

                {complianceData.recentEvents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Recent Events</h4>
                    <div className="space-y-2">
                      {complianceData.recentEvents.slice(0, 5).map((event: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-700/20 p-2 rounded text-sm">
                          <span className="text-slate-400">{event.eventType}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              event.severity === 'critical'
                                ? 'bg-red-900/30 text-red-400'
                                : event.severity === 'high'
                                ? 'bg-orange-900/30 text-orange-400'
                                : 'bg-slate-700/30 text-slate-400'
                            }`}
                          >
                            {event.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
