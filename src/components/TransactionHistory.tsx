import { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import TransactionDetail from './TransactionDetail';

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

interface TransactionHistoryProps {
  transactions: Transaction[];
  onSelectTransaction?: (transaction: Transaction) => void;
}

export default function TransactionHistory({ transactions, onSelectTransaction }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'fraudulent' | 'safe'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    onSelectTransaction?.(transaction);
  };

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    if (filter === 'fraudulent') return transactions.filter(t => t.is_fraudulent);
    return transactions.filter(t => !t.is_fraudulent);
  }, [transactions, filter]);

  const stats = useMemo(() => {
    const total = transactions.length;
    const fraudulent = transactions.filter(t => t.is_fraudulent).length;
    const safe = total - fraudulent;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const fraudAmount = transactions.filter(t => t.is_fraudulent).reduce((sum, t) => sum + t.amount, 0);

    return { total, fraudulent, safe, totalAmount, fraudAmount };
  }, [transactions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Transaction History</h2>
        <p className="text-slate-400">Monitor and analyze all detected transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Transactions</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-3xl font-bold text-white">{stats.fraudulent}</span>
          </div>
          <p className="text-slate-400 text-sm">Fraudulent</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <span className="text-3xl font-bold text-white">{stats.safe}</span>
          </div>
          <p className="text-slate-400 text-sm">Safe</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-amber-400" />
            <span className="text-3xl font-bold text-white">{stats.fraudAmount.toFixed(0)}</span>
          </div>
          <p className="text-slate-400 text-sm">Fraud Amount ($)</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6">Fraud Detection Overview</h3>
        <div className="h-64 flex items-end justify-around space-x-4">
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all"
              style={{ height: `${stats.total > 0 ? (stats.safe / stats.total) * 100 : 0}%`, minHeight: '20px' }}
            ></div>
            <p className="text-emerald-400 font-semibold mt-3">{stats.safe}</p>
            <p className="text-slate-400 text-sm">Safe</p>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all"
              style={{ height: `${stats.total > 0 ? (stats.fraudulent / stats.total) * 100 : 0}%`, minHeight: '20px' }}
            ></div>
            <p className="text-red-400 font-semibold mt-3">{stats.fraudulent}</p>
            <p className="text-slate-400 text-sm">Fraudulent</p>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all"
              style={{ height: `${stats.total > 0 ? 100 : 0}%`, minHeight: '20px' }}
            ></div>
            <p className="text-blue-400 font-semibold mt-3">{stats.total}</p>
            <p className="text-slate-400 text-sm">Total</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white">Transactions</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('fraudulent')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'fraudulent'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              Fraudulent
            </button>
            <button
              onClick={() => setFilter('safe')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'safe'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              Safe
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No transactions to display</p>
              <p className="text-slate-500 text-sm mt-2">Upload or enter transaction data to see results</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Merchant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Risk Score</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    onClick={() => handleSelectTransaction(transaction)}
                    className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                      {transaction.transaction_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <div>{transaction.merchant}</div>
                      <div className="text-xs text-slate-500">{transaction.merchant_category}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {transaction.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 w-24">
                          <div
                            className={`h-2 rounded-full ${
                              transaction.fraud_score > 0.7
                                ? 'bg-red-500'
                                : transaction.fraud_score > 0.4
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${transaction.fraud_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-400">{(transaction.fraud_score * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {transaction.is_fraudulent ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Fraudulent
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Safe
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                      {transaction.detection_reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}