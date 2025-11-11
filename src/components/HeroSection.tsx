import { Shield, Zap, Brain, TrendingUp } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 animate-pulse"></div>
              <Shield className="w-20 h-20 text-emerald-400 relative z-10" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI-Powered Fraud Detection
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Protect your financial transactions with cutting-edge artificial intelligence.
            Detect fraudulent activity in real-time with high accuracy and explainable AI insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-400/40 transition-all">
              <div className="bg-emerald-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Detection</h3>
              <p className="text-slate-400 text-sm">
                Instant analysis and alerts for suspicious transactions as they happen
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-400/40 transition-all">
              <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">High Accuracy</h3>
              <p className="text-slate-400 text-sm">
                Advanced ML algorithms achieving superior fraud detection rates
              </p>
            </div>

            <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6 hover:border-violet-400/40 transition-all">
              <div className="bg-violet-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Explainable AI</h3>
              <p className="text-slate-400 text-sm">
                Transparent insights showing why transactions were flagged as fraudulent
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}