import { DollarSign, Clock, MapPin, Store, Zap, Smartphone, ExternalLink } from 'lucide-react';

export default function DetectionCriteria() {
  const algorithmLinks: Record<string, string> = {
    'Random Forest': 'https://en.wikipedia.org/wiki/Random_forest',
    'XGBoost': 'https://en.wikipedia.org/wiki/XGBoost',
    'Logistic Regression': 'https://en.wikipedia.org/wiki/Logistic_regression',
    'Decision Trees': 'https://en.wikipedia.org/wiki/Decision_tree',
    'Neural Networks': 'https://en.wikipedia.org/wiki/Neural_network_(machine_learning)',
    'Autoencoders': 'https://en.wikipedia.org/wiki/Autoencoder',
    'Deep Learning': 'https://en.wikipedia.org/wiki/Deep_learning'
  };

  const criteria = [
    {
      icon: DollarSign,
      color: 'emerald',
      title: 'Unusual Transaction Amounts',
      description: 'Transaction amount significantly deviates from user\'s normal spending pattern',
      algorithms: ['Random Forest', 'XGBoost'],
      recommendation: 'Contact your bank to verify the transaction, Set transaction limits, Enable alerts for large transactions'
    },
    {
      icon: Clock,
      color: 'blue',
      title: 'Abnormal Transaction Timing',
      description: 'Transactions occur at odd hours (e.g., midnight to 4 AM)',
      algorithms: ['Logistic Regression', 'Decision Trees'],
      recommendation: 'Review recent activity, Change account password, Enable time-based transaction restrictions (if supported)'
    },
    {
      icon: MapPin,
      color: 'violet',
      title: 'Location and IP Mismatches',
      description: 'Transaction originates from a location or IP not associated with the user',
      algorithms: ['Neural Networks', 'Autoencoders'],
      recommendation: 'Log out of all sessions, Enable two-factor authentication (2FA), Report suspicious access to your bank'
    },
    {
      icon: Store,
      color: 'amber',
      title: 'High-Risk Merchant Categories',
      description: 'Transactions with merchants in categories like gambling, luxury goods, etc.',
      algorithms: ['Random Forest', 'XGBoost'],
      recommendation: 'Verify merchant legitimacy, Report unknown merchants, Temporarily block or freeze card'
    },
    {
      icon: Zap,
      color: 'red',
      title: 'Transaction Frequency Patterns',
      description: 'Access from new or unrecognized devices, unusual user behavior',
      algorithms: ['Autoencoders', 'Neural Networks'],
      recommendation: 'Temporarily disable online transactions, Contact customer support, Monitor account for further activity'
    },
    {
      icon: Smartphone,
      color: 'cyan',
      title: 'Device and Behaviour',
      description: 'Access from new or unrecognized devices, unusual user behavior',
      algorithms: ['Deep Learning', 'XGBoost'],
      recommendation: 'Revoke access to unknown devices, Update security questions and passwords, Enable device-based login alerts'
    }
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
    emerald: { bg: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
    blue: { bg: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-500/20', icon: 'text-blue-400' },
    violet: { bg: 'from-violet-500/10 to-violet-600/5', border: 'border-violet-500/20', icon: 'text-violet-400' },
    amber: { bg: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/20', icon: 'text-amber-400' },
    red: { bg: 'from-red-500/10 to-red-600/5', border: 'border-red-500/20', icon: 'text-red-400' },
    cyan: { bg: 'from-cyan-500/10 to-cyan-600/5', border: 'border-cyan-500/20', icon: 'text-cyan-400' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Detection Criteria</h2>
        <p className="text-slate-400">Key anomaly types our AI system monitors to identify fraudulent transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {criteria.map((item, index) => {
          const Icon = item.icon;
          const colors = colorClasses[item.color];

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl p-6 hover:scale-105 transition-transform`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-400">Detected by:</span>
                    {item.algorithms.map((algo, algoIdx) => (
                      <a
                        key={algoIdx}
                        href={algorithmLinks[algo]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 ${colors.icon} border border-slate-700 hover:border-${item.color}-500/60 transition-all hover:scale-105 group`}
                      >
                        🤖 {algo}
                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-300 mb-2">Recommendations:</p>
                    <ul className="text-xs text-slate-400 space-y-1">
                      {item.recommendation.split(',').map((rec, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-emerald-400 mr-2">•</span>
                          <span>{rec.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}