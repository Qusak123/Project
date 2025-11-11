import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import HeroSection from './components/HeroSection';
import AnalyzeSection from './components/AnalyzeSection';
import TransactionHistory from './components/TransactionHistory';
import SecurityRecommendations from './components/SecurityRecommendations';
import HowItWorks from './components/HowItWorks';
import DetectionCriteria from './components/DetectionCriteria';
import { supabase } from './lib/supabase';

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

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && !error) {
      setTransactions(data);
    }
  };

  const handleTransactionsAnalyzed = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...newTransactions, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">FraudGuard AI</span>
            </div>
            <div className="flex space-x-6">
              <a href="#analyze" className="text-slate-300 hover:text-emerald-400 transition-colors">Analyze</a>
              <a href="#history" className="text-slate-300 hover:text-emerald-400 transition-colors">History</a>
              <a href="#security" className="text-slate-300 hover:text-emerald-400 transition-colors">Security</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-emerald-400 transition-colors">How It Works</a>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />

      <section id="analyze" className="py-16">
        <AnalyzeSection onTransactionsAnalyzed={handleTransactionsAnalyzed} />
      </section>

      <section id="history" className="py-16 bg-slate-900/50">
        <TransactionHistory transactions={transactions} />
      </section>

      <section id="criteria" className="py-16">
        <DetectionCriteria />
      </section>

      <section id="security" className="py-16 bg-slate-900/50">
        <SecurityRecommendations />
      </section>

      <section id="how-it-works" className="py-16">
        <HowItWorks />
      </section>

      <footer className="bg-slate-900 border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>AI-Powered Fraud Detection System | Research by Vrinda Vashistha & Vishesh Baber</p>
          <p className="text-sm mt-2">Manipal University, Jaipur</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
