import { X, AlertTriangle, CheckCircle, Shield, Phone, Lock, CreditCard, Bell, FileText, ExternalLink } from 'lucide-react';

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

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionDetail({ transaction, onClose }: TransactionDetailProps) {
  const immediateActions = [
    {
      icon: Phone,
      title: 'Contact Your Bank Immediately',
      description: 'Call the fraud department of your financial institution using the number on the back of your card.',
      priority: 'critical'
    },
    {
      icon: CreditCard,
      title: 'Freeze Your Card',
      description: 'Use your banking app or call to temporarily freeze the affected card to prevent further unauthorized transactions.',
      priority: 'critical'
    },
    {
      icon: Lock,
      title: 'Change All Passwords',
      description: 'Update passwords for your banking accounts, email, and any linked payment services immediately.',
      priority: 'high'
    },
    {
      icon: Bell,
      title: 'Set Up Transaction Alerts',
      description: 'Enable real-time SMS or email notifications for all future transactions on your accounts.',
      priority: 'high'
    }
  ];

  const followUpSteps = [
    {
      icon: FileText,
      title: 'File a Fraud Report',
      description: 'Report the incident to the Federal Trade Commission at IdentityTheft.gov and keep a copy of the report.',
      link: 'https://www.identitytheft.gov/'
    },
    {
      icon: Shield,
      title: 'Monitor Your Credit Report',
      description: 'Check your credit reports from all three bureaus for any unauthorized accounts or inquiries.',
      link: 'https://www.annualcreditreport.com/'
    },
    {
      icon: Lock,
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to all your financial accounts with 2FA.',
      link: 'https://www.cisa.gov/mfa'
    },
    {
      icon: AlertTriangle,
      title: 'Place a Fraud Alert',
      description: 'Contact one of the three credit bureaus to place a fraud alert on your credit file.',
      link: 'https://www.consumer.ftc.gov/articles/what-know-about-credit-freezes-and-fraud-alerts'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Transaction Details & Action Plan</h2>
            <p className="text-slate-400 text-sm mt-1">ID: {transaction.transaction_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`rounded-xl p-6 ${
            transaction.is_fraudulent
              ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30'
              : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30'
          }`}>
            <div className="flex items-start space-x-4">
              {transaction.is_fraudulent ? (
                <AlertTriangle className="w-12 h-12 text-red-400 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-12 h-12 text-emerald-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {transaction.is_fraudulent ? 'Fraudulent Transaction Detected' : 'Safe Transaction'}
                </h3>
                <p className="text-slate-300 mb-4">{transaction.detection_reason}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Amount</p>
                    <p className="text-lg font-bold text-white">${transaction.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Risk Score</p>
                    <p className="text-lg font-bold text-white">{(transaction.fraud_score * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Merchant</p>
                    <p className="text-sm font-semibold text-white truncate">{transaction.merchant}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Location</p>
                    <p className="text-sm font-semibold text-white truncate">{transaction.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {transaction.is_fraudulent && (
            <>
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
                  Immediate Actions Required
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {immediateActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <div
                        key={index}
                        className={`rounded-xl p-4 ${
                          action.priority === 'critical'
                            ? 'bg-red-500/10 border border-red-500/30'
                            : 'bg-amber-500/10 border border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                            action.priority === 'critical' ? 'bg-red-500/20' : 'bg-amber-500/20'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              action.priority === 'critical' ? 'text-red-400' : 'text-amber-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-white text-sm">{action.title}</h4>
                              {action.priority === 'critical' && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">URGENT</span>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-blue-400 mr-2" />
                  Follow-Up Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followUpSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={index}
                        className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-blue-500/40 transition-colors group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm mb-1">{step.title}</h4>
                            <p className="text-slate-400 text-xs leading-relaxed mb-2">{step.description}</p>
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:underline"
                            >
                              <span>Learn More</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                  <Bell className="w-5 h-5 text-orange-400 mr-2" />
                  Important Contacts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">FTC Identity Theft Hotline</p>
                    <p className="text-white font-semibold">1-877-438-4338</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Credit Bureau Fraud Alert</p>
                    <p className="text-white font-semibold">Contact any bureau</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Local Police (if needed)</p>
                    <p className="text-white font-semibold">911 or local station</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {!transaction.is_fraudulent && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                This Transaction Appears Safe
              </h3>
              <p className="text-slate-400 mb-4">
                Our AI analysis indicates this transaction follows normal patterns. However, if you don't recognize this transaction, please take immediate action.
              </p>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors">
                Report as Fraudulent
              </button>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}