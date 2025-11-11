import { Shield, Lock, Bell, CreditCard, Eye, AlertCircle, ExternalLink } from 'lucide-react';

export default function SecurityRecommendations() {
  const recommendations = [
    {
      icon: CreditCard,
      color: 'emerald',
      title: 'Set Transaction Limits',
      description: 'Configure daily and per-transaction limits to prevent unauthorized large transactions.'
    },
    {
      icon: Bell,
      color: 'blue',
      title: 'Enable Real-Time Alerts',
      description: 'Receive instant notifications for all transactions to quickly identify suspicious activity.'
    },
    {
      icon: Lock,
      color: 'violet',
      title: 'Use Two-Factor Authentication',
      description: 'Add an extra layer of security by requiring a second form of verification for account access.'
    },
    {
      icon: Eye,
      color: 'amber',
      title: 'Monitor Account Regularly',
      description: 'Review your transaction history frequently to spot and report unauthorized activities early.'
    },
    {
      icon: Shield,
      color: 'red',
      title: 'Report Suspicious Activity',
      description: 'Immediately contact your financial institution if you notice any unusual transactions or access.'
    },
    {
      icon: AlertCircle,
      color: 'cyan',
      title: 'Freeze Card When Not in Use',
      description: 'Temporarily freeze your card through your banking app when traveling or during suspicious activity.'
    }
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string; iconBg: string }> = {
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20'
    },
    blue: {
      bg: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
      iconBg: 'bg-blue-500/20'
    },
    violet: {
      bg: 'from-violet-500/10 to-violet-600/5',
      border: 'border-violet-500/20',
      icon: 'text-violet-400',
      iconBg: 'bg-violet-500/20'
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20',
      icon: 'text-amber-400',
      iconBg: 'bg-amber-500/20'
    },
    red: {
      bg: 'from-red-500/10 to-red-600/5',
      border: 'border-red-500/20',
      icon: 'text-red-400',
      iconBg: 'bg-red-500/20'
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-600/5',
      border: 'border-cyan-500/20',
      icon: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20'
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Security Recommendations</h2>
        <p className="text-slate-400">Protect yourself from fraud with these essential security measures</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((item, index) => {
          const Icon = item.icon;
          const colors = colorClasses[item.color];

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl p-6 hover:border-${item.color}-400/40 transition-all group`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm border border-orange-500/20 rounded-xl p-8">
        <div className="flex items-start space-x-4">
          <AlertCircle className="w-8 h-8 text-orange-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Important Notice</h3>
            <p className="text-slate-300 mb-4">
              If you suspect fraudulent activity on your account, take immediate action:
            </p>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-start">
                <span className="text-orange-400 mr-2">1.</span>
                <span>Contact your bank or financial institution immediately</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-2">2.</span>
                <span>Change all passwords and security questions</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-2">3.</span>
                <span>File a report with the Federal Trade Commission at IdentityTheft.gov</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-2">4.</span>
                <span>Monitor your credit reports for any unauthorized activity</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}