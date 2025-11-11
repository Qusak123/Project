import { Brain, Layers, Cog, Zap, ExternalLink } from 'lucide-react';

export default function HowItWorks() {
  const features = [
    {
      icon: Brain,
      color: 'emerald',
      title: 'Machine Learning',
      description: 'Random Forest and XGBoost algorithms analyze transaction patterns to identify fraudulent behavior with high precision and recall.',
      link: 'https://en.wikipedia.org/wiki/Machine_learning'
    },
    {
      icon: Layers,
      color: 'blue',
      title: 'Deep Learning',
      description: 'Neural Networks and Autoencoders detect complex, non-linear patterns in user behavior that traditional methods miss.',
      link: 'https://en.wikipedia.org/wiki/Deep_learning'
    },
    {
      icon: Cog,
      color: 'violet',
      title: 'Feature Engineering',
      description: 'Advanced feature extraction from transaction amount, time, location, merchant details, and device information for accurate predictions.',
      link: 'https://en.wikipedia.org/wiki/Feature_engineering'
    },
    {
      icon: Zap,
      color: 'amber',
      title: 'Real-Time Processing',
      description: 'Instant fraud probability scoring (0-1) enables immediate alerts and preventive actions to stop fraudulent transactions.',
      link: 'https://www.featureform.com/post/breaking-down-real-time-machine-learning-systems-mlops?utm_source=chatgpt.com'
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
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-slate-400">Our AI-powered system combines multiple advanced technologies for superior fraud detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((item, index) => {
          const Icon = item.icon;
          const colors = colorClasses[item.color];

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl p-8 hover:scale-105 transition-transform group`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">{item.description}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-2 text-sm ${colors.icon} hover:underline group-hover:translate-x-1 transition-transform`}
                  >
                    <span>Learn More</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 overflow-hidden">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">Detection Workflow</h3>

        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 via-violet-500 via-amber-500 to-red-500 opacity-20 hidden md:block"></div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                  📥
                </div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-4 w-full group-hover:border-emerald-500/60 transition-colors">
                <h4 className="font-bold text-white mb-2 text-emerald-400">Data Ingestion</h4>
                <p className="text-slate-400 text-xs leading-relaxed">CSV/Excel upload or manual entry with validation checks</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                  🔄
                </div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 w-full group-hover:border-blue-500/60 transition-colors">
                <h4 className="font-bold text-white mb-2 text-blue-400">Data Processing</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Normalization, encoding, and feature extraction pipeline</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-violet-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                  🧠
                </div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-sm border border-violet-500/30 rounded-lg p-4 w-full group-hover:border-violet-500/60 transition-colors">
                <h4 className="font-bold text-white mb-2 text-violet-400">AI Engine</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Ensemble ML/DL models analyze behavioral patterns</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                  🎯
                </div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 w-full group-hover:border-amber-500/60 transition-colors">
                <h4 className="font-bold text-white mb-2 text-amber-400">Risk Scoring</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Probability-based fraud score from 0.0 to 1.0</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                  🚨
                </div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 w-full group-hover:border-red-500/60 transition-colors">
                <h4 className="font-bold text-white mb-2 text-red-400">Alert System</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Real-time notifications with detailed insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Explainable AI</h3>
          <p className="text-slate-400 text-sm max-w-3xl mx-auto">
            Our system uses SHAP and LIME techniques to provide transparent explanations for fraud predictions, helping you understand which features contributed most to flagging a transaction as suspicious.
          </p>
        </div>
      </div>
    </div>
  );
}